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

    let countQuery = "SELECT COUNT(*) as total FROM aircraft"
    let dataQuery = `SELECT id, hex, reg_number, flag, airline_icao, airline_iata, seen, icao, iata, model, engine, engine_count, manufacturer, type, category, built, age, msn, line, lat, lng, alt, dir, speed, v_speed, squawk, last_seen, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at FROM aircraft`
    const params: any[] = []

    if (search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`
      const whereClause = " WHERE LOWER(reg_number) LIKE ? OR LOWER(hex) LIKE ? OR LOWER(airline_iata) LIKE ? OR LOWER(airline_icao) LIKE ? OR LOWER(model) LIKE ? OR LOWER(manufacturer) LIKE ? OR LOWER(flag) LIKE ? OR LOWER(icao) LIKE ?"
      countQuery += whereClause
      dataQuery += whereClause
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm)
    }

    dataQuery += " ORDER BY id DESC LIMIT ? OFFSET ?"
    const dataParams = [...params, Number(limit), Number(offset)]

    const countResult = await query<any[]>(countQuery, params)
    const total = countResult?.[0]?.total || 0
    const aircraft = await query<any[]>(dataQuery, dataParams)

    const statsResult = await query<any[]>(`
      SELECT 
        COUNT(*) as totalAircraft,
        COUNT(DISTINCT airline_iata) as airlinesCount,
        COUNT(DISTINCT manufacturer) as manufacturersCount,
        COUNT(DISTINCT flag) as countriesCount,
        MAX(updated_at) as lastSynced
      FROM aircraft
    `)
    const stats = statsResult?.[0] || {
      totalAircraft: 0,
      airlinesCount: 0,
      manufacturersCount: 0,
      countriesCount: 0,
      lastSynced: null,
    }

    return NextResponse.json({
      success: true,
      aircraft: aircraft || [],
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const pool = getMySQLPool()

    if (id) {
      await pool.query("DELETE FROM aircraft WHERE id = ?", [id])
      await recordAuditLog({
        event: "Single Aircraft Deleted",
        actor: "admin@skyledger.io",
        status: "success",
        metadata: { action: "delete_aircraft", aircraft_id: id },
      })
      return NextResponse.json({ success: true, message: "Aircraft deleted successfully." })
    } else {
      await pool.query("TRUNCATE TABLE aircraft")
      await recordAuditLog({
        event: "Aircraft Fleet Database Cleared",
        actor: "admin@skyledger.io",
        status: "success",
        metadata: { action: "truncate_aircraft" },
      })
      return NextResponse.json({ success: true, message: "Aircraft fleet directory cleared successfully." })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      hex, reg_number, flag, airline_icao, airline_iata, seen, icao, iata, model, engine, engine_count, 
      manufacturer, type, category, built, age, msn, line, lat, lng, alt, dir, speed, v_speed, squawk, last_seen
    } = body

    if (!model) {
      return NextResponse.json({ success: false, error: "Model is required" }, { status: 400 })
    }

    const pool = getMySQLPool()
    const [result] = await pool.query(
      `INSERT INTO aircraft (
        hex, reg_number, flag, airline_icao, airline_iata, seen, icao, iata, model, engine, engine_count, 
        manufacturer, type, category, built, age, msn, line, lat, lng, alt, dir, speed, v_speed, squawk, last_seen, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        hex || null, reg_number || null, flag || null, airline_icao || null, airline_iata || null,
        seen ? parseInt(seen, 10) : null,
        icao || null, iata || null, model, engine || null, engine_count || null, manufacturer || null,
        type || null, category || null,
        built ? parseInt(built, 10) : null,
        age ? parseFloat(age) : null,
        msn || null, line || null,
        lat ? parseFloat(lat) : null,
        lng ? parseFloat(lng) : null,
        alt ? parseInt(alt, 10) : null,
        dir ? parseInt(dir, 10) : null,
        speed ? parseInt(speed, 10) : null,
        v_speed ? parseInt(v_speed, 10) : null,
        squawk || null,
        last_seen || null
      ]
    )

    await recordAuditLog({
      event: "Manual Aircraft Added",
      actor: "admin@skyledger.io",
      status: "success",
      metadata: { model, iata },
    })

    return NextResponse.json({ success: true, message: "Aircraft added successfully" })
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
