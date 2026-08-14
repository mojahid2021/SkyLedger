import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    // Basic counts
    const usersRes = await query<{c: number}[]>("SELECT COUNT(*) as c FROM users")
    const flightsRes = await query<{c: number}[]>("SELECT COUNT(*) as c FROM flights")
    const airportsRes = await query<{c: number}[]>("SELECT COUNT(*) as c FROM airports")
    const airlinesRes = await query<{c: number}[]>("SELECT COUNT(*) as c FROM airlines")
    const bookingsRes = await query<{c: number, rev: number}[]>("SELECT COUNT(*) as c, SUM(total_amount) as rev FROM bookings WHERE status = 'confirmed'")

    // Audit logs for recent activity
    const recentAudits = await query<any[]>("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 5")

    return NextResponse.json({
      success: true,
      data: {
        usersCount: usersRes[0]?.c || 0,
        flightsCount: flightsRes[0]?.c || 0,
        airportsCount: airportsRes[0]?.c || 0,
        airlinesCount: airlinesRes[0]?.c || 0,
        bookingsCount: bookingsRes[0]?.c || 0,
        totalRevenue: bookingsRes[0]?.rev || 0,
        recentAudits
      }
    })
  } catch (error: any) {
    console.error("Failed to load overview data:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
