import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q")

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ success: true, data: [] })
    }

    const searchTerm = `%${q.trim()}%`

    // Authentic use of UNION to search across multiple tables
    const results = await query<any[]>(`
      SELECT 
        id, 
        name as title, 
        country_code as subtitle,
        'Airline' as entity_type,
        '/airlines/' as link_prefix
      FROM airlines
      WHERE name LIKE ? OR iata_code LIKE ?

      UNION ALL

      SELECT 
        id, 
        name as title, 
        iata_code as subtitle,
        'Airport' as entity_type,
        '/airports/' as link_prefix
      FROM airports
      WHERE name LIKE ? OR iata_code LIKE ? OR country_code LIKE ?

      UNION ALL

      SELECT 
        id, 
        name as title, 
        country_code as subtitle,
        'City' as entity_type,
        '/destinations/' as link_prefix
      FROM cities
      WHERE name LIKE ? OR city_code LIKE ?

      LIMIT 20
    `, [
      searchTerm, searchTerm, 
      searchTerm, searchTerm, searchTerm,
      searchTerm, searchTerm
    ])

    return NextResponse.json({ success: true, data: results })
  } catch (error: any) {
    console.error("Global search error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
