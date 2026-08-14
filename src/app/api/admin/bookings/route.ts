import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get("search") || ""

    let sql = `
      SELECT 
        b.id,
        b.booking_reference,
        b.origin_code,
        b.destination_code,
        b.departure_date,
        b.cabin_class,
        b.total_amount,
        b.currency,
        b.status,
        b.created_at,
        u.first_name,
        u.last_name,
        u.email,
        f.flight_number
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN flights f ON b.flight_id = f.id
    `
    const params: any[] = []

    if (search) {
      sql += ` WHERE b.booking_reference LIKE ? OR u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?`
      const term = `%${search}%`
      params.push(term, term, term, term)
    }

    sql += ` ORDER BY b.created_at DESC LIMIT 100`

    const rows = await query<any[]>(sql, params)

    return NextResponse.json({ success: true, bookings: rows })
  } catch (error: any) {
    console.error("Failed to fetch admin bookings:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
