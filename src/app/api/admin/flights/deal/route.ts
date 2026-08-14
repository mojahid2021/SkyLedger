import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// POST /api/admin/flights/deal — Mark a flight as a homepage deal
export async function POST(request: Request) {
  try {
    const { flightId, tag } = await request.json()
    
    if (!flightId) {
      return NextResponse.json({ success: false, error: "Missing required flightId" }, { status: 400 })
    }

    const activeTag = tag || "Low fare"

    await query(
      "INSERT INTO flight_deals (flight_id, tag) VALUES (?, ?) ON DUPLICATE KEY UPDATE tag = VALUES(tag)",
      [flightId, activeTag]
    )

    return NextResponse.json({ success: true, message: "Flight added to deals successfully!" })
  } catch (error) {
    console.error("POST /api/admin/flights/deal error:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

// DELETE /api/admin/flights/deal — Remove a flight from homepage deals
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const flightId = searchParams.get("flightId")

    if (!flightId) {
      return NextResponse.json({ success: false, error: "Missing required flightId parameter" }, { status: 400 })
    }

    await query("DELETE FROM flight_deals WHERE flight_id = ?", [flightId])

    return NextResponse.json({ success: true, message: "Flight removed from deals successfully!" })
  } catch (error) {
    console.error("DELETE /api/admin/flights/deal error:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
