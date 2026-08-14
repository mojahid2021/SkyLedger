import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const sql = `
      SELECT 
        fd.flight_id,
        fd.tag,
        f.flight_number,
        f.price,
        f.flight_type,
        orig.name as origin_name,
        orig.iata_code as origin_iata,
        dest.name as destination_name,
        dest.iata_code as destination_iata
      FROM flight_deals fd
      INNER JOIN flights f ON fd.flight_id = f.id
      INNER JOIN airports orig ON f.origin_airport_id = orig.id
      INNER JOIN airports dest ON f.destination_airport_id = dest.id
      ORDER BY fd.created_at DESC
      LIMIT 20
    `
    const deals = await query<any[]>(sql)
    return NextResponse.json({ success: true, deals: deals || [] })
  } catch (error) {
    console.error("GET /api/flights/deals error:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
