import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

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

    const passengersCount = 1
    const totalAmount = parseFloat(flight.price).toFixed(2)
    const baseAmount = (parseFloat(flight.price) * 0.9).toFixed(2)
    const taxAmount = (parseFloat(flight.price) * 0.1).toFixed(2)

    const offer = {
      id: flight.id,
      total_amount: totalAmount,
      total_currency: "BDT",
      base_amount: baseAmount,
      tax_amount: taxAmount,
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
          fare_brand_name: "Delta Choice Main",
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
