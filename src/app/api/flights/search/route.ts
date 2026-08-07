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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rawOrigin = searchParams.get("origin")
    const rawDestination = searchParams.get("destination")
    const departure_at = searchParams.get("departure_at") 
    const return_at = searchParams.get("return_at")
    const one_way = searchParams.get("one_way") ?? "true"
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

    // Duffel strictly prefers IATA codes for best coverage.
    const origin = o.iata_code || o.icao_code
    const destination = d.iata_code || d.icao_code

    const DUFFEL_API_KEY = process.env.DUFFEL_API_KEY || process.env.TRAVELPAYOUTS_API_KEY || "duffel_test_key"
    
    const slices = [{ origin, destination, departure_date: departure_at }]
    if (return_at && one_way === "false") {
      slices.push({ origin: destination, destination: origin, departure_date: return_at })
    }

    const passengers = Array.from({ length: passengersCount }).map(() => ({ type: "adult" }))

    const bodyPayload = {
      data: {
        slices,
        passengers,
        cabin_class: cabin
      }
    }

    const res = await fetch("https://api.duffel.com/air/offer_requests?return_offers=true", {
      method: "POST",
      headers: {
        "Accept-Encoding": "gzip",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Duffel-Version": "v2",
        "Authorization": `Bearer ${DUFFEL_API_KEY}`
      },
      body: JSON.stringify(bodyPayload)
    })

    const duffelData = await res.json()

    if (!duffelData.data || !duffelData.data.offers) {
      console.warn("Duffel API returned no offers or error:", JSON.stringify(duffelData, null, 2))
      return NextResponse.json({ success: false, error: "Failed to fetch from Duffel API", details: duffelData.errors }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      data: duffelData.data.offers, 
      originCode: origin, 
      destinationCode: destination 
    })
  } catch (error) {
    console.error("Route error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch data" }, { status: 500 })
  }
}
