import { NextResponse } from "next/server"
import { getMySQLPool } from "@/lib/db"
import { recordAuditLog } from "@/lib/mongodb"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const pool = getMySQLPool()
  const connection = await pool.getConnection()

  try {
    const { id } = await params
    const bookingId = parseInt(id, 10)

    if (isNaN(bookingId)) {
      connection.release()
      return NextResponse.json({ success: false, error: "Invalid booking ID" }, { status: 400 })
    }

    // 1. Fetch booking details
    const [bookingRows] = await connection.execute<any[]>(
      "SELECT * FROM bookings WHERE id = ?",
      [bookingId]
    )

    if (!bookingRows || bookingRows.length === 0) {
      connection.release()
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 })
    }

    const booking = bookingRows[0]

    if (booking.status === "cancelled") {
      connection.release()
      return NextResponse.json(
        { success: false, error: "Booking is already cancelled" },
        { status: 400 }
      )
    }

    const refundAmount = Number(booking.total_amount)
    const userId = booking.user_id

    // 2. Fetch user & account details
    const [userRows] = await connection.execute<any[]>(
      "SELECT first_name, last_name, email FROM users WHERE id = ?",
      [userId]
    )
    const user = userRows && userRows.length > 0 ? userRows[0] : null

    const [accountRows] = await connection.execute<any[]>(
      "SELECT id FROM accounts WHERE user_id = ?",
      [userId]
    )

    if (!accountRows || accountRows.length === 0) {
      connection.release()
      return NextResponse.json({ success: false, error: "User wallet account not found" }, { status: 404 })
    }

    const accountId = accountRows[0].id
    const today = new Date().toISOString().split("T")[0]
    const refundRef = `REFUND-${booking.booking_reference}`

    await connection.beginTransaction()

    // Update booking status
    await connection.execute(
      "UPDATE bookings SET status = 'cancelled' WHERE id = ?",
      [bookingId]
    )

    // Credit user's wallet
    await connection.execute(
      "UPDATE accounts SET balance = balance + ? WHERE id = ?",
      [refundAmount, accountId]
    )

    // Insert transaction credit entry
    await connection.execute(
      `INSERT INTO transactions 
        (reference, description, category, account_id, type, amount, status, transaction_date)
      VALUES (?, ?, ?, ?, 'credit', ?, 'completed', ?)`,
      [
        refundRef,
        `Refund for Cancelled Flight (${booking.booking_reference})`,
        "Flight Cancellation Refund",
        accountId,
        refundAmount,
        today,
      ]
    )

    await connection.commit()

    // Record audit log to MongoDB
    await recordAuditLog({
      event: "Flight Booking Cancelled",
      actor: user ? `${user.first_name} ${user.last_name} (${user.email})` : `User #${userId}`,
      status: "success",
      metadata: {
        bookingId,
        bookingReference: booking.booking_reference,
        refundAmount,
      },
    })

    connection.release()

    return NextResponse.json({
      success: true,
      message: `Booking ${booking.booking_reference} has been cancelled. $${refundAmount.toFixed(2)} has been refunded to your wallet.`,
      data: {
        bookingId,
        status: "cancelled",
        refundAmount,
      },
    })
  } catch (error) {
    await connection.rollback()
    connection.release()
    console.error("Booking cancellation error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to cancel booking: " + (error as Error).message },
      { status: 500 }
    )
  }
}
