import { NextResponse } from "next/server"
import { query } from "@/lib/db"

async function resolveAirport(input: string) {
  const trimmed = input.trim()
  if (!trimmed) return null
  const parenMatch = trimmed.match(/\(([A-Z0-9]{3,4})\)/i)
  const candidateCode = parenMatch ? parenMatch[1].toUpperCase() : trimmed.toUpperCase()
  try {
    const rows = await query<any[]>(`SELECT * FROM airports WHERE UPPER(iata_code) = ? OR UPPER(icao_code) = ? LIMIT 1`, [candidateCode, candidateCode])
    if (rows && rows.length > 0) return rows[0]
  } catch (err) {}
  return null
}

function mapLocalFlightToDuffelOffer(flight: any, passengersCount: number, cabinClass: string) {
  const departureDate = new Date(flight.departure_time)
  const arrivalDate = new Date(flight.arrival_time)
  
  // Calculate duration in minutes or ISO PT format
  const durationMs = arrivalDate.getTime() - departureDate.getTime()
  const durationMin = Math.round(durationMs / 60000)
  const hours = Math.floor(durationMin / 60)
  const minutes = durationMin % 60
  const durationStr = `PT${hours}H${minutes}M`

  const totalAmount = (parseFloat(flight.price) * passengersCount).toFixed(2)
  const baseAmount = (parseFloat(flight.price) * passengersCount * 0.9).toFixed(2)
  const taxAmount = (parseFloat(flight.price) * passengersCount * 0.1).toFixed(2)

  return {
    id: `local_off_${flight.id}`,
    total_amount: totalAmount,
    total_currency: "USD",
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
      refund_before_departure: { allowed: true, penalty_amount: "50.00", penalty_currency: "USD" },
      change_before_departure: { allowed: true, penalty_amount: "30.00", penalty_currency: "USD" },
    },
    passengers: Array.from({ length: passengersCount }).map((_, idx) => ({
      id: `local_pas_${idx + 1}`,
      type: "adult",
    })),
    slices: [
      {
        id: `local_slice_${flight.id}`,
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
            id: `local_seg_${flight.id}`,
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
            aircraft: {
              name: flight.aircraft_model || "Aircraft",
              iata_code: "738",
            },
          },
        ],
      },
    ],
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rawOrigin = searchParams.get("origin")
    const rawDestination = searchParams.get("destination")
    const departure_at = searchParams.get("departure_at") 
    const cabin = searchParams.get("cabin") || "economy"
    const passengersCount = parseInt(searchParams.get("passengers") || "1", 10)

    if (!rawOrigin || !rawDestination || !departure_at) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 })
    }

    const o = await resolveAirport(rawOrigin)
    const d = await resolveAirport(rawDestination)
    
    if (!o || !d) {
      return NextResponse.json({ success: false, error: "Airport not found in database to resolve code." }, { status: 404 })
    }

    const origin = o.iata_code || o.icao_code
    const destination = d.iata_code || d.icao_code

    // Query matching local flights from the MariaDB database
    let localFlights = await query<any[]>(`
      SELECT 
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
        f.created_at,
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
      WHERE f.origin_airport_id = ? 
        AND f.destination_airport_id = ?
        AND DATE(f.departure_time) = ?
    `, [o.id, d.id, departure_at])

    const localOffers = (localFlights || []).map(lf => mapLocalFlightToDuffelOffer(lf, passengersCount, cabin))

    return NextResponse.json({ 
      success: true, 
      data: localOffers, 
      originCode: origin, 
      destinationCode: destination 
    })
  } catch (error) {
    console.error("Route error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch data: " + (error as Error).message }, { status: 500 })
  }
}
