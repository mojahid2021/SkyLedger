import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { generateSeatMapForFlight, countTotalSeats } from "@/lib/seat-generator"

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
        f.tax_percentage,
        f.seat_selection_fee,
        f.total_seats,
        f.status,
        DATE_FORMAT(f.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
        a.name as airline_name,
        a.iata_code as airline_iata,
        orig.name as origin_name,
        orig.iata_code as origin_iata,
        dest.name as destination_name,
        dest.iata_code as destination_iata,
        ac.model as aircraft_model,
        ac.reg_number as aircraft_reg,
        fd.tag as deal_tag,
        (CASE WHEN fd.flight_id IS NOT NULL THEN 1 ELSE 0 END) as is_deal,
        (SELECT COUNT(bp.id) FROM bookings b JOIN booking_passengers bp ON bp.booking_id = b.id WHERE b.flight_id = f.id AND b.status = 'confirmed') as booked_seats
      FROM flights f
      INNER JOIN airlines a ON f.airline_id = a.id
      INNER JOIN airports orig ON f.origin_airport_id = orig.id
      INNER JOIN airports dest ON f.destination_airport_id = dest.id
      LEFT JOIN aircraft ac ON f.aircraft_id = ac.id
      LEFT JOIN flight_deals fd ON f.id = fd.flight_id
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
      tax_percentage,
      seat_selection_fee,
      total_seats,
    } = await request.json()

    if (!flight_number || !airline_id || !origin_airport_id || !destination_airport_id || !departure_time || !arrival_time || !price) {
      return NextResponse.json({ success: false, error: "Missing required flight scheduling fields" }, { status: 400 })
    }

    // Convert ISO 8601 string (e.g. 2026-08-14T16:30) to standard SQL format (2026-08-14 16:30:00)
    const formatMySQLDatetime = (isoStr: string) => {
      if (!isoStr) return null
      let clean = isoStr.replace("T", " ")
      if (clean.length === 16) {
        clean += ":00"
      }
      return clean
    }

    const formattedDeparture = formatMySQLDatetime(departure_time)
    const formattedArrival = formatMySQLDatetime(arrival_time)

    // Coerce values to integers/float for database schema compatibility
    const parsedAirlineId = parseInt(airline_id, 10)
    const parsedOriginId = parseInt(origin_airport_id, 10)
    const parsedDestinationId = parseInt(destination_airport_id, 10)
    const parsedAircraftId = aircraft_id ? parseInt(aircraft_id, 10) : null
    const parsedPrice = parseFloat(price)
    const parsedTaxPercentage = tax_percentage ? parseFloat(tax_percentage) : 0.0
    const parsedSeatFee = seat_selection_fee ? parseFloat(seat_selection_fee) : 0.0
    const parsedTotalSeats = total_seats ? parseInt(total_seats, 10) : 0
    await query(
      "INSERT INTO flights (flight_number, airline_id, origin_airport_id, destination_airport_id, aircraft_id, is_direct, flight_type, layover_cities, departure_time, arrival_time, price, tax_percentage, seat_selection_fee, total_seats) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        flight_number,
        parsedAirlineId,
        parsedOriginId,
        parsedDestinationId,
        parsedAircraftId,
        is_direct ? 1 : 0,
        flight_type || "direct",
        layover_cities || null,
        formattedDeparture,
        formattedArrival,
        parsedPrice,
        parsedTaxPercentage,
        parsedSeatFee,
        parsedTotalSeats,
      ]
    )

    return NextResponse.json({ success: true, message: "Flight created successfully!" })
  } catch (error) {
    console.error("POST /api/admin/flights error:", error)
    return NextResponse.json({ success: false, error: "Failed to create flight: " + (error as Error).message }, { status: 500 })
  }
}

// DELETE /api/admin/flights — Delete a scheduled flight
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Flight ID is required" },
        { status: 400 }
      )
    }

    await query("DELETE FROM flights WHERE id = ?", [id])

    return NextResponse.json({
      success: true,
      message: `Flight #${id} deleted successfully`,
    })
  } catch (error) {
    console.error("DELETE /api/admin/flights error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete flight: " + (error as Error).message },
      { status: 500 }
    )
  }
}
