import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { flight_number, airline_id, origin_airport_id, destination_airport_id, departure_time, arrival_time } = await request.json()

    const result = await query(
      "INSERT INTO flights (flight_number, airline_id, origin_airport_id, destination_airport_id, departure_time, arrival_time) VALUES (?, ?, ?, ?, ?, ?)",
      [flight_number, airline_id, origin_airport_id, destination_airport_id, departure_time, arrival_time]
    )

    return NextResponse.json({ success: true, message: "Flight created successfully!" })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create flight" }, { status: 500 })
  }
}
