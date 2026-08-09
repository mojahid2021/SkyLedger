import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const bookingId = parseInt(id, 10)

    if (isNaN(bookingId)) {
      return NextResponse.json({ success: false, error: "Invalid booking ID" }, { status: 400 })
    }

    const bookings = await query<any[]>(
      `SELECT 
        b.*,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.id = ?`,
      [bookingId]
    )

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 })
    }

    const booking = bookings[0]

    // Fetch passengers
    const passengers = await query<any[]>(
      `SELECT * FROM booking_passengers WHERE booking_id = ?`,
      [bookingId]
    )

    // Fetch tickets
    const tickets = await query<any[]>(
      `SELECT * FROM booking_tickets WHERE booking_id = ?`,
      [bookingId]
    )

    // Format combined details
    const formattedPassengers = (passengers || []).map((p) => ({
      ...p,
      tickets: (tickets || []).filter((t) => t.passenger_id === p.id),
    }))

    return NextResponse.json({
      success: true,
      data: {
        ...booking,
        total_amount: Number(booking.total_amount),
        passengers: formattedPassengers,
      },
    })
  } catch (error) {
    console.error("Fetch booking detail error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch booking details: " + (error as Error).message },
      { status: 500 }
    )
  }
}
