import { NextResponse } from "next/server"
import { getMySQLPool, query } from "@/lib/db"
import { recordAuditLog } from "@/lib/mongodb"

function generatePNR(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let pnr = "SKL-"
  for (let i = 0; i < 5; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pnr
}

function generateTicketNumber(): string {
  const digits = Math.floor(1000000000 + Math.random() * 9000000000).toString()
  return `006-${digits}`
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userIdStr = searchParams.get("userId")

    if (!userIdStr) {
      return NextResponse.json({ success: false, error: "userId parameter is required" }, { status: 400 })
    }

    const userId = parseInt(userIdStr, 10)

    const bookings = await query<any[]>(
      `SELECT 
        b.id,
        b.booking_reference,
        b.user_id,
        b.duffel_offer_id,
        b.origin_code,
        b.destination_code,
        b.departure_date,
        b.return_date,
        b.cabin_class,
        b.total_amount,
        b.currency,
        b.status,
        b.created_at,
        (SELECT COUNT(*) FROM booking_passengers bp WHERE bp.booking_id = b.id) as passenger_count,
        (SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'ticketNumber', bt.ticket_number,
              'flightNumber', bt.flight_number,
              'airlineName', bt.airline_name,
              'seatDesignator', bt.seat_designator,
              'segmentType', bt.segment_type
            )
          ) FROM booking_tickets bt WHERE bt.booking_id = b.id
        ) as tickets
      FROM bookings b
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC`,
      [userId]
    )

    // Format results
    const formattedBookings = (bookings || []).map((b) => ({
      ...b,
      total_amount: Number(b.total_amount),
      tickets: typeof b.tickets === "string" ? JSON.parse(b.tickets) : (b.tickets || []),
    }))

    return NextResponse.json({ success: true, data: formattedBookings })
  } catch (error) {
    console.error("Fetch bookings error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings: " + (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const pool = getMySQLPool()
  const connection = await pool.getConnection()

  try {
    const body = await request.json()
    const {
      userId,
      duffelOfferId,
      originCode,
      destinationCode,
      departureDate,
      returnDate,
      cabinClass = "economy",
      totalAmount,
      currency = "USD",
      flightNumber = "SKL-101",
      airlineCode = "DL",
      airlineName = "Delta Air Lines",
      passengers = [],
    } = body

    if (!userId || !originCode || !destinationCode || !departureDate || !totalAmount) {
      connection.release()
      return NextResponse.json({ success: false, error: "Missing required booking details" }, { status: 400 })
    }

    if (!passengers || passengers.length === 0) {
      connection.release()
      return NextResponse.json({ success: false, error: "At least one passenger is required" }, { status: 400 })
    }

    // 1. Verify user & wallet account balance
    const [userRows] = await connection.execute<any[]>(
      "SELECT id, first_name, last_name, email FROM users WHERE id = ?",
      [userId]
    )
    if (!userRows || userRows.length === 0) {
      connection.release()
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }
    const user = userRows[0]

    const [accountRows] = await connection.execute<any[]>(
      "SELECT id, balance FROM accounts WHERE user_id = ?",
      [userId]
    )
    if (!accountRows || accountRows.length === 0) {
      connection.release()
      return NextResponse.json({ success: false, error: "User ledger wallet account not found" }, { status: 404 })
    }
    const account = accountRows[0]
    const walletBalance = Number(account.balance)
    const bookingCost = Number(totalAmount)

    if (walletBalance < bookingCost) {
      connection.release()
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient wallet balance. Required: $${bookingCost.toFixed(2)}, Available: $${walletBalance.toFixed(2)}`,
        },
        { status: 400 }
      )
    }

    // 2. Generate PNR & start database transaction
    const bookingReference = generatePNR()
    const today = new Date().toISOString().split("T")[0]

    await connection.beginTransaction()

    // Deduct wallet balance
    await connection.execute(
      "UPDATE accounts SET balance = balance - ? WHERE id = ?",
      [bookingCost, account.id]
    )

    // Record ledger transaction
    await connection.execute(
      `INSERT INTO transactions 
        (reference, description, category, account_id, type, amount, status, transaction_date) 
      VALUES (?, ?, ?, ?, 'debit', ?, 'completed', ?)`,
      [
        bookingReference,
        `Flight Ticket Reservation (${originCode} -> ${destinationCode})`,
        "Flight Reservation",
        account.id,
        bookingCost,
        today,
      ]
    )

    // Insert booking
    const [bookingResult] = await connection.execute<any>(
      `INSERT INTO bookings 
        (booking_reference, user_id, duffel_offer_id, origin_code, destination_code, departure_date, return_date, cabin_class, total_amount, currency, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
      [
        bookingReference,
        userId,
        duffelOfferId || null,
        originCode,
        destinationCode,
        departureDate,
        returnDate || null,
        cabinClass,
        bookingCost,
        currency,
      ]
    )
    const bookingId = bookingResult.insertId

    // Insert passengers & tickets
    for (const p of passengers) {
      const [passengerResult] = await connection.execute<any>(
        `INSERT INTO booking_passengers
          (booking_id, first_name, last_name, email, phone, date_of_birth, passport_number, passenger_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bookingId,
          p.firstName,
          p.lastName,
          p.email || user.email,
          p.phone || null,
          p.dateOfBirth || null,
          p.passportNumber || null,
          p.passengerType || "adult",
        ]
      )
      const passengerId = passengerResult.insertId

      // Outbound ticket
      const outboundTicketNumber = generateTicketNumber()
      await connection.execute(
        `INSERT INTO booking_tickets
          (booking_id, passenger_id, segment_type, flight_number, airline_code, airline_name, seat_designator, seat_price, ticket_number)
        VALUES (?, ?, 'outbound', ?, ?, ?, ?, ?, ?)`,
        [
          bookingId,
          passengerId,
          p.outboundFlightNumber || flightNumber,
          airlineCode,
          airlineName,
          p.outboundSeat || null,
          p.outboundSeatPrice || 0.0,
          outboundTicketNumber,
        ]
      )

      // Return ticket if applicable
      if (returnDate || p.returnSeat) {
        const returnTicketNumber = generateTicketNumber()
        await connection.execute(
          `INSERT INTO booking_tickets
            (booking_id, passenger_id, segment_type, flight_number, airline_code, airline_name, seat_designator, seat_price, ticket_number)
          VALUES (?, ?, 'return', ?, ?, ?, ?, ?, ?)`,
          [
            bookingId,
            passengerId,
            p.returnFlightNumber || flightNumber,
            airlineCode,
            airlineName,
            p.returnSeat || null,
            p.returnSeatPrice || 0.0,
            returnTicketNumber,
          ]
        )
      }
    }

    await connection.commit()

    // 3. Audit log to MongoDB
    await recordAuditLog({
      event: "Flight Ticket Booked",
      actor: `${user.first_name} ${user.last_name} (${user.email})`,
      status: "success",
      metadata: {
        bookingId,
        bookingReference,
        originCode,
        destinationCode,
        totalAmount: bookingCost,
        passengersCount: passengers.length,
      },
    })

    connection.release()

    return NextResponse.json({
      success: true,
      message: "Flight ticket successfully booked and confirmed.",
      data: {
        bookingId,
        bookingReference,
        totalAmount: bookingCost,
        status: "confirmed",
      },
    })
  } catch (error) {
    await connection.rollback()
    connection.release()
    console.error("Booking creation failed:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process booking: " + (error as Error).message },
      { status: 500 }
    )
  }
}
