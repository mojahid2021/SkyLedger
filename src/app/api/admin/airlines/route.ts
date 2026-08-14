import { NextResponse } from "next/server"
import { query, getMySQLPool } from "@/lib/db"
import { recordAuditLog } from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "25", 10)
    const offset = (page - 1) * limit

    let countQuery = "SELECT COUNT(*) as total FROM airlines"
    let dataQuery = `SELECT id, name, iata_code, iata_prefix, iata_accounting, icao_code, callsign, country_code, iosa_registered, is_scheduled, is_passenger, is_cargo, is_international, total_aircrafts, average_fleet_age, accidents_last_5y, crashes_last_5y, website, facebook, twitter, instagram, linkedin, slug, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at FROM airlines`
    const params: any[] = []

    if (search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`
      const whereClause = " WHERE LOWER(name) LIKE ? OR LOWER(iata_code) LIKE ? OR LOWER(icao_code) LIKE ? OR LOWER(country_code) LIKE ? OR LOWER(callsign) LIKE ?"
      countQuery += whereClause
      dataQuery += whereClause
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm)
    }

    dataQuery += " ORDER BY name ASC LIMIT ? OFFSET ?"
    const dataParams = [...params, Number(limit), Number(offset)]

    const countResult = await query<any[]>(countQuery, params)
    const total = countResult?.[0]?.total || 0
    const airlines = await query<any[]>(dataQuery, dataParams)

    const statsResult = await query<any[]>(`
      SELECT 
        COUNT(*) as totalAirlines,
        COUNT(CASE WHEN iata_code IS NOT NULL AND iata_code != '' THEN 1 END) as iataCount,
        COUNT(DISTINCT country_code) as countriesCount,
        MAX(updated_at) as lastSynced
      FROM airlines
    `)
    const stats = statsResult?.[0] || { totalAirlines: 0, iataCount: 0, countriesCount: 0, lastSynced: null }

    return NextResponse.json({
      success: true,
      airlines: airlines || [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      stats,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const pool = getMySQLPool()
    await pool.query("TRUNCATE TABLE airlines")
    await recordAuditLog({
      event: "Airlines Database Cleared",
      actor: "admin@skyledger.io",
      status: "success",
      metadata: { action: "truncate_airlines" },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      name, iata_code, iata_prefix, iata_accounting, icao_code, callsign, country_code,
      iosa_registered, is_scheduled, is_passenger, is_cargo, is_international,
      total_aircrafts, average_fleet_age, accidents_last_5y, crashes_last_5y,
      website, facebook, twitter, instagram, linkedin, slug
    } = body

    if (!name) {
      return NextResponse.json({ success: false, error: "Airline Name is required" }, { status: 400 })
    }

    const pool = getMySQLPool()
    const [result] = await pool.query(
      `INSERT INTO airlines (
        name, iata_code, iata_prefix, iata_accounting, icao_code, callsign, country_code,
        iosa_registered, is_scheduled, is_passenger, is_cargo, is_international,
        total_aircrafts, average_fleet_age, accidents_last_5y, crashes_last_5y,
        website, facebook, twitter, instagram, linkedin, slug, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        name, iata_code || null, iata_prefix || null, iata_accounting || null, icao_code || null, callsign || null, country_code || null,
        iosa_registered ? 1 : 0, is_scheduled ? 1 : 0, is_passenger ? 1 : 0, is_cargo ? 1 : 0, is_international ? 1 : 0,
        total_aircrafts ? parseInt(total_aircrafts, 10) : 0, 
        average_fleet_age ? parseFloat(average_fleet_age) : null,
        accidents_last_5y ? parseInt(accidents_last_5y, 10) : 0,
        crashes_last_5y ? parseInt(crashes_last_5y, 10) : 0,
        website || null, facebook || null, twitter || null, instagram || null, linkedin || null, slug || null
      ]
    )

    await recordAuditLog({
      event: "Manual Airline Added",
      actor: "admin@skyledger.io",
      status: "success",
      metadata: { name, iata_code },
    })

    return NextResponse.json({ success: true, message: "Airline added successfully" })
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}