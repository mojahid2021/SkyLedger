import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const airlines = await query<any[]>(
      "SELECT iata_code, name FROM airlines WHERE iata_code IS NOT NULL AND iata_code != ''"
    )

    const map: Record<string, string> = {}
    if (airlines) {
      airlines.forEach((row) => {
        if (row.iata_code) {
          map[row.iata_code.toUpperCase()] = row.name
        }
      })
    }

    return NextResponse.json({ success: true, data: map })
  } catch (error) {
    console.error("Failed to load airlines list:", error)
    return NextResponse.json(
      { success: false, error: "Failed to load airlines: " + (error as Error).message },
      { status: 500 }
    )
  }
}
