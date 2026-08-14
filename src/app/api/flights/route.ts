import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const sql = `
      SELECT 
        f.id,
        f.flight_number,
        f.price,
        f.flight_type,
        f.status,
        f.departure_time,
        f.arrival_time,
        a.name as airline_name,
        a.iata_code as airline_iata,
        orig.name as origin_name,
        orig.iata_code as origin_iata,
        dest.name as destination_name,
        dest.iata_code as destination_iata
      FROM flights f
      INNER JOIN airlines a ON f.airline_id = a.id
      INNER JOIN airports orig ON f.origin_airport_id = orig.id
      INNER JOIN airports dest ON f.destination_airport_id = dest.id
      WHERE DATE(f.departure_time) = CURDATE()
      ORDER BY f.departure_time ASC
      LIMIT 10
    `
    const flights = await query<any[]>(sql)
    return NextResponse.json({ success: true, flights: flights || [] })
  } catch (error) {
    console.error("GET /api/flights error:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
