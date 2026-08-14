import { NextResponse } from "next/server"
import { query } from "@/lib/db"

function getCabinPriceMultiplier(cabin: string): number {
  switch (cabin?.toLowerCase()) {
    case "premium_economy":
      return 1.35 // 35% mark up for Premium Economy
    case "business":
      return 2.20 // 120% mark up for Business Class
    case "first":
      return 3.00 // 200% mark up for First Class
    case "economy":
    default:
      return 1.00 // base price for Economy Class
  }
}

function getFareBrandName(cabin: string): string {
  switch (cabin?.toLowerCase()) {
    case "premium_economy":
      return "Premium Economy"
    case "business":
      return "Business Class"
    case "first":
      return "First Class"
    case "economy":
    default:
      return "Economy Class"
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const passengersParam = searchParams.get("passengers") || "1"
    const passengersCount = parseInt(passengersParam, 10) || 1
    const cabinClass = searchParams.get("cabin") || "economy"

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing required id parameter" }, { status: 400 })
    }

    const flightId = parseInt(id, 10)
    if (isNaN(flightId)) {
      return NextResponse.json({ success: false, error: "Invalid flight id" }, { status: 400 })
    }

    const flights = await query<any[]>(
      `SELECT 
        f.id,
        f.flight_number,
        f.airline_id,
        f.origin_airport_id,
        f.destination_airport_id,
        f.aircraft_id,
        f.is_direct,
        f.flight_type,
        f.layover_cities,
        f.departure_time,
        f.arrival_time,
        f.price,
        f.tax_percentage,
        f.seat_selection_fee,
        f.status,
        a.name as airline_name,
        a.iata_code as airline_iata,
        orig.name as origin_name,
        orig.iata_code as origin_iata,
        dest.name as destination_name,
        dest.iata_code as destination_iata,
        ac.model as aircraft_model,
        ac.reg_number as aircraft_reg
      FROM flights f
      INNER JOIN airlines a ON f.airline_id = a.id
      INNER JOIN airports orig ON f.origin_airport_id = orig.id
      INNER JOIN airports dest ON f.destination_airport_id = dest.id
      LEFT JOIN aircraft ac ON f.aircraft_id = ac.id
      WHERE f.id = ?`,
      [flightId]
    )

    if (!flights || flights.length === 0) {
      return NextResponse.json({ success: false, error: "Flight not found" }, { status: 404 })
    }

    const flight = flights[0]
    
    const departureDate = new Date(flight.departure_time)
    const arrivalDate = new Date(flight.arrival_time)
    const durationMs = arrivalDate.getTime() - departureDate.getTime()
    const durationMin = Math.round(durationMs / 60000)
    const hours = Math.floor(durationMin / 60)
    const minutes = durationMin % 60
    const durationStr = `PT${hours}H${minutes}M`

    const multiplier = getCabinPriceMultiplier(cabinClass)
    
    // Call the Stored Procedure to get dynamic pricing based on flight load
    await query("CALL CalculateDynamicPricing(?, ?, @final_price)", [flightId, passengersCount])
    const dynamicPriceRes = await query<any[]>("SELECT @final_price as final_price")
    
    // Fallback to static price if procedure fails
    const dbPrice = dynamicPriceRes[0]?.final_price 
      ? parseFloat(dynamicPriceRes[0].final_price) 
      : (parseFloat(flight.price) * passengersCount)

    const basePriceTotal = dbPrice * multiplier

    const taxPercentage = flight.tax_percentage ? parseFloat(flight.tax_percentage) : 0
    const seatFee = flight.seat_selection_fee ? parseFloat(flight.seat_selection_fee) : 0

    const baseAmount = basePriceTotal.toFixed(2)
    const taxAmount = (parseFloat(baseAmount) * (taxPercentage / 100)).toFixed(2)
    const totalAmount = (parseFloat(baseAmount) + parseFloat(taxAmount)).toFixed(2)

    const offer = {
      id: flight.id.toString(),
      total_amount: totalAmount,
      total_currency: "BDT",
      base_amount: baseAmount,
      tax_amount: taxAmount,
      tax_percentage: taxPercentage,
      seat_selection_fee: flight.seat_selection_fee,
      total_emissions_kg: "85",
      owner: {
        name: flight.airline_name,
        iata_code: flight.airline_iata,
        logo_symbol_url: flight.airline_iata ? `https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${flight.airline_iata}.svg` : null,
      },
      payment_requirements: {
        price_guarantee_expires_at: null,
        payment_required_by: null,
      },
      conditions: {
        refund_before_departure: { allowed: true, penalty_amount: "50.00", penalty_currency: "BDT" },
        change_before_departure: { allowed: true, penalty_amount: "30.00", penalty_currency: "BDT" },
      },
      passengers: Array.from({ length: passengersCount }).map((_, idx) => ({
        id: idx + 1,
        type: "adult",
      })),
      slices: [
        {
          id: flight.id,
          duration: durationStr,
          fare_brand_name: getFareBrandName(cabinClass),
          origin: {
            name: flight.origin_name,
            iata_code: flight.origin_iata,
          },
          destination: {
            name: flight.destination_name,
            iata_code: flight.destination_iata,
          },
          segments: [
            {
              id: flight.id,
              operating_carrier_flight_number: flight.flight_number.replace(/^[A-Z0-9]+\s*/i, ""),
              marketing_carrier_flight_number: flight.flight_number.replace(/^[A-Z0-9]+\s*/i, ""),
              operating_carrier: {
                name: flight.airline_name,
                iata_code: flight.airline_iata,
              },
              marketing_carrier: {
                name: flight.airline_name,
                iata_code: flight.airline_iata,
              },
              origin: {
                name: flight.origin_name,
                iata_code: flight.origin_iata,
              },
              destination: {
                name: flight.destination_name,
                iata_code: flight.destination_iata,
              },
              departing_at: flight.departure_time,
              arriving_at: flight.arrival_time,
              duration: durationStr,
            }
          ]
        }
      ]
    }

    return NextResponse.json({ success: true, offer })
  } catch (error) {
    console.error("GET /api/flights/offer error:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
