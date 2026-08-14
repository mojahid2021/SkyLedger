import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    // Basic counts
    const usersRes = await query<{c: number}[]>("SELECT COUNT(*) as c FROM users")
    const flightsRes = await query<{c: number}[]>("SELECT COUNT(*) as c FROM flights")
    const airportsRes = await query<{c: number}[]>("SELECT COUNT(*) as c FROM airports")
    const airlinesRes = await query<{c: number}[]>("SELECT COUNT(*) as c FROM airlines")
    const citiesRes = await query<{c: number}[]>("SELECT COUNT(*) as c FROM cities")
    const aircraftRes = await query<{c: number}[]>("SELECT COUNT(*) as c FROM aircraft")
    const bookingsRes = await query<{c: number, rev: number}[]>("SELECT COUNT(*) as c, SUM(total_amount) as rev FROM bookings WHERE status = 'confirmed'")

    // Booking ratio stats
    const flightsSeatsRes = await query<{total_seats: number}[]>("SELECT SUM(total_seats) as total_seats FROM flights")
    const bookedSeatsRes = await query<{booked: number}[]>(
      "SELECT COUNT(bp.id) as booked FROM bookings b JOIN booking_passengers bp ON b.id = bp.booking_id WHERE b.status = 'confirmed'"
    )
    
    // Booking trends (last 7 days)
    const trendsRes = await query<{date: string, count: number}[]>(`
      SELECT DATE(created_at) as date, COUNT(*) as count 
      FROM bookings 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) 
      GROUP BY DATE(created_at) 
      ORDER BY date ASC
    `)

    return NextResponse.json({
      success: true,
      data: {
        usersCount: usersRes[0]?.c || 0,
        flightsCount: flightsRes[0]?.c || 0,
        airportsCount: airportsRes[0]?.c || 0,
        airlinesCount: airlinesRes[0]?.c || 0,
        citiesCount: citiesRes[0]?.c || 0,
        aircraftCount: aircraftRes[0]?.c || 0,
        bookingsCount: bookingsRes[0]?.c || 0,
        totalRevenue: bookingsRes[0]?.rev || 0,
        totalSeats: flightsSeatsRes[0]?.total_seats || 0,
        bookedSeats: bookedSeatsRes[0]?.booked || 0,
        bookingTrend: trendsRes || []
      }
    })
  } catch (error: any) {
    console.error("Failed to load overview data:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
