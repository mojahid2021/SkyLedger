import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = (searchParams.get("q") || "").trim()

    if (!search || search.length < 2) {
      return NextResponse.json({ success: true, data: [] })
    }

    const searchTerm = `%${search.toLowerCase()}%`
    
    // We want to return airports.
    // If the user searches by name, iata_code or icao_code (from airport) -> return matching airports.
    // If the user searches by city name (from city) -> find airports matching that city's city_code (iata_code).
    const sql = `
      SELECT DISTINCT
        'airport' AS type,
        a.id,
        a.name,
        a.iata_code AS code,
        a.country_code
      FROM airports a
      LEFT JOIN cities c ON a.iata_code = c.city_code
      WHERE 
        LOWER(a.name) LIKE ? 
        OR LOWER(a.iata_code) LIKE ? 
        OR LOWER(a.icao_code) LIKE ?
        OR LOWER(c.name) LIKE ?
      ORDER BY 
        CASE 
          WHEN a.iata_code LIKE ? THEN 1
          WHEN a.name LIKE ? THEN 2
          ELSE 3
        END,
        a.name ASC
      LIMIT 20
    `

    const params = [
      searchTerm, searchTerm, searchTerm, searchTerm, // Match airports by name/code or cities by name
      `${search.toLowerCase()}%`, // Ordering rank 1
      `${search.toLowerCase()}%`  // Ordering rank 2
    ]

    const results = await query<any[]>(sql, params)

    return NextResponse.json({ success: true, data: results || [] })
  } catch (error) {
    console.error("GET /api/locations error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch locations", data: [] },
      { status: 500 }
    )
  }
}
