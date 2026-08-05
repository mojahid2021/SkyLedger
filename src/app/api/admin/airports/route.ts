import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "25", 10)
    const offset = (page - 1) * limit

    let countQuery = "SELECT COUNT(*) as total FROM airports"
    let dataQuery = `SELECT id, name, iata_code, icao_code, lat, lng, country_code, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at FROM airports`
    const params: any[] = []

    if (search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`
      const whereClause = " WHERE LOWER(name) LIKE ? OR LOWER(iata_code) LIKE ? OR LOWER(icao_code) LIKE ? OR LOWER(country_code) LIKE ?"
      countQuery += whereClause
      dataQuery += whereClause
      params.push(searchTerm, searchTerm, searchTerm, searchTerm)
    }

    dataQuery += " ORDER BY name ASC LIMIT ? OFFSET ?"
    
    // Convert limit and offset to numbers for mysql2 parameter binding
    const dataParams = [...params, Number(limit), Number(offset)]

    const countResult = await query<any[]>(countQuery, params)
    const total = countResult?.[0]?.total || 0

    const airports = await query<any[]>(dataQuery, dataParams)

    // Summary stats
    const statsResult = await query<any[]>(`
      SELECT 
        COUNT(*) as totalAirports,
        COUNT(CASE WHEN iata_code IS NOT NULL AND iata_code != '' THEN 1 END) as iataCount,
        COUNT(DISTINCT country_code) as countriesCount,
        MAX(updated_at) as lastSynced
      FROM airports
    `)

    const stats = statsResult?.[0] || {
      totalAirports: 0,
      iataCount: 0,
      countriesCount: 0,
      lastSynced: null,
    }

    return NextResponse.json({
      success: true,
      airports: airports || [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      stats,
    })
  } catch (error) {
    console.error("GET /api/admin/airports error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch airports: " + (error as Error).message, airports: [], total: 0 },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const { getMySQLPool } = require("@/lib/db")
    const pool = getMySQLPool()
    await pool.query("TRUNCATE TABLE airports")

    const { recordAuditLog } = require("@/lib/mongodb")
    await recordAuditLog({
      event: "Airports Database Cleared",
      actor: "admin@skyledger.io",
      status: "success",
      metadata: { action: "truncate_airports" },
    })

    return NextResponse.json({
      success: true,
      message: "Airports directory cleared successfully.",
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to clear airports: " + (error as Error).message },
      { status: 500 }
    )
  }
}
