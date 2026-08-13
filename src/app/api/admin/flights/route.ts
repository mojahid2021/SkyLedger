import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET /api/admin/flights — Fetch all scheduled flights with descriptive joins
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""

    let sql = `
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
        DATE_FORMAT(f.departure_time, '%Y-%m-%d %H:%i') as departure_time,
        DATE_FORMAT(f.arrival_time, '%Y-%m-%d %H:%i') as arrival_time,
        f.price,
        f.status,
        DATE_FORMAT(f.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
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
    `
    const params: any[] = []

    if (search.trim()) {
      sql += " WHERE LOWER(f.flight_number) LIKE ? OR LOWER(a.name) LIKE ? OR LOWER(orig.name) LIKE ? OR LOWER(dest.name) LIKE ?"
      const term = `%${search.trim().toLowerCase()}%`
      params.push(term, term, term, term)
    }

    sql += " ORDER BY f.created_at DESC"

    const flights = await query<any[]>(sql, params)
    return NextResponse.json({ success: true, flights: flights || [] })
  } catch (error) {
    console.error("GET /api/admin/flights error:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

// POST /api/admin/flights — Create/schedule a new flight
export async function POST(request: Request) {
  try {
    const {
      flight_number,
      airline_id,
      origin_airport_id,
      destination_airport_id,
      aircraft_id,
      is_direct,
      flight_type,
      layover_cities,
      departure_time,
      arrival_time,
      price,
    } = await request.json()

    if (!flight_number || !airline_id || !origin_airport_id || !destination_airport_id || !departure_time || !arrival_time || !price) {
      return NextResponse.json({ success: false, error: "Missing required flight scheduling fields" }, { status: 400 })
    }

    await query(
      "INSERT INTO flights (flight_number, airline_id, origin_airport_id, destination_airport_id, aircraft_id, is_direct, flight_type, layover_cities, departure_time, arrival_time, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        flight_number,
        airline_id,
        origin_airport_id,
        destination_airport_id,
        aircraft_id || null,
        is_direct ? 1 : 0,
        flight_type,
        layover_cities || null,
        departure_time,
        arrival_time,
        price,
      ]
    )

    return NextResponse.json({ success: true, message: "Flight created successfully!" })
  } catch (error) {
    console.error("POST /api/admin/flights error:", error)
    return NextResponse.json({ success: false, error: "Failed to create flight: " + (error as Error).message }, { status: 500 })
  }
}
