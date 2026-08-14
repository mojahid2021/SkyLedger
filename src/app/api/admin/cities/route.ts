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

    let countQuery = "SELECT COUNT(*) as total FROM cities"
    let dataQuery = `SELECT id, name, city_code, lat, lng, country_code, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at FROM cities`
    const params: any[] = []

    if (search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`
      const whereClause = " WHERE LOWER(name) LIKE ? OR LOWER(city_code) LIKE ? OR LOWER(country_code) LIKE ?"
      countQuery += whereClause
      dataQuery += whereClause
      params.push(searchTerm, searchTerm, searchTerm)
    }

    dataQuery += " ORDER BY name ASC LIMIT ? OFFSET ?"
    const dataParams = [...params, Number(limit), Number(offset)]

    const countResult = await query<any[]>(countQuery, params)
    const total = countResult?.[0]?.total || 0
    const cities = await query<any[]>(dataQuery, dataParams)

    const statsResult = await query<any[]>(`
      SELECT COUNT(*) as totalCities, COUNT(DISTINCT country_code) as countriesCount, MAX(updated_at) as lastSynced
      FROM cities
    `)
    const stats = statsResult?.[0] || { totalCities: 0, countriesCount: 0, lastSynced: null }

    return NextResponse.json({
      success: true,
      cities: cities || [],
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
      await pool.query("DELETE FROM cities WHERE id = ?", [id])
      await recordAuditLog({
        event: "Single City Deleted",
        actor: "admin@skyledger.io",
        status: "success",
        metadata: { action: "delete_city", city_id: id },
      })
      return NextResponse.json({ success: true, message: "City deleted successfully." })
    } else {
      await pool.query("TRUNCATE TABLE cities")
      await recordAuditLog({
        event: "Cities Database Cleared",
        actor: "admin@skyledger.io",
        status: "success",
        metadata: { action: "truncate_cities" },
      })
      return NextResponse.json({ success: true, message: "Cities directory cleared successfully." })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, city_code, country_code, lat, lng } = body

    if (!name) {
      return NextResponse.json({ success: false, error: "City Name is required" }, { status: 400 })
    }

    const pool = getMySQLPool()
    const [result] = await pool.query(
      `INSERT INTO cities (name, city_code, country_code, lat, lng, updated_at) 
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [name, city_code || null, country_code || null, lat || null, lng || null]
    )

    await recordAuditLog({
      event: "Manual City Added",
      actor: "admin@skyledger.io",
      status: "success",
      metadata: { name, city_code },
    })

    return NextResponse.json({ success: true, message: "City added successfully" })
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
