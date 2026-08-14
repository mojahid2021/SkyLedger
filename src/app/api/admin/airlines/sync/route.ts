import { NextResponse } from "next/server"
import { query, getMySQLPool } from "@/lib/db"
import { recordAuditLog } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const apiKey = process.env.AIRLABS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "AIRLABS_API_KEY is required for the AirLabs API." },
        { status: 500 }
      )
    }

    const apiUrl = `https://airlabs.co/api/v9/airlines?api_key=${apiKey}`
    const airLabsRes = await fetch(apiUrl, {
      headers: { "User-Agent": "SkyLedger-App/1.0" },
      cache: "no-store",
    })

    if (!airLabsRes.ok) {
      const errText = await airLabsRes.text()
      return NextResponse.json(
        { success: false, error: `AirLabs API request failed with status ${airLabsRes.status}: ${errText}` },
        { status: 502 }
      )
    }

    const json = await airLabsRes.json()

    if (json.error) {
      return NextResponse.json(
        { success: false, error: `AirLabs API error: ${json.error.message || JSON.stringify(json.error)}` },
        { status: 400 }
      )
    }

    const airlinesData: any[] = json.response || []

    if (!Array.isArray(airlinesData) || airlinesData.length === 0) {
      return NextResponse.json(
        { success: false, error: "No airline records returned from AirLabs API" },
        { status: 404 }
      )
    }

    const pool = getMySQLPool()

    const CHUNK_SIZE = 500
    let insertedTotal = 0

    for (let i = 0; i < airlinesData.length; i += CHUNK_SIZE) {
      const chunk = airlinesData.slice(i, i + CHUNK_SIZE)
      const valueTuples: string[] = []
      const params: any[] = []

      for (const item of chunk) {
        if (!item.name) continue

        valueTuples.push("(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        params.push(
          item.name.substring(0, 255),
          item.iata_code ? String(item.iata_code).substring(0, 10) : null,
          item.iata_prefix ? String(item.iata_prefix).substring(0, 10) : null,
          item.iata_accounting ? String(item.iata_accounting).substring(0, 10) : null,
          item.icao_code ? String(item.icao_code).substring(0, 10) : null,
          item.callsign ? String(item.callsign).substring(0, 50) : null,
          item.country_code ? String(item.country_code).substring(0, 10) : null,
          item.iosa_registered !== undefined ? Number(item.iosa_registered) : 0,
          item.is_scheduled !== undefined ? Number(item.is_scheduled) : 0,
          item.is_passenger !== undefined ? Number(item.is_passenger) : 0,
          item.is_cargo !== undefined ? Number(item.is_cargo) : 0,
          item.is_international !== undefined ? Number(item.is_international) : 0,
          item.total_aircrafts !== undefined ? Number(item.total_aircrafts) : 0,
          item.average_fleet_age !== undefined ? parseFloat(item.average_fleet_age) : null,
          item.accidents_last_5y !== undefined ? Number(item.accidents_last_5y) : 0,
          item.crashes_last_5y !== undefined ? Number(item.crashes_last_5y) : 0,
          item.website ? String(item.website).substring(0, 255) : null,
          item.facebook ? String(item.facebook).substring(0, 255) : null,
          item.twitter ? String(item.twitter).substring(0, 255) : null,
          item.instagram ? String(item.instagram).substring(0, 255) : null,
          item.linkedin ? String(item.linkedin).substring(0, 255) : null,
          item.slug ? String(item.slug).substring(0, 255) : null
        )
      }

      if (valueTuples.length > 0) {
        const sql = `INSERT IGNORE INTO airlines (name, iata_code, iata_prefix, iata_accounting, icao_code, callsign, country_code, iosa_registered, is_scheduled, is_passenger, is_cargo, is_international, total_aircrafts, average_fleet_age, accidents_last_5y, crashes_last_5y, website, facebook, twitter, instagram, linkedin, slug) VALUES ${valueTuples.join(", ")}`
        const [result] = await pool.query(sql, params) as any
        insertedTotal += (result as any).affectedRows
      }
    }

    await recordAuditLog({
      event: "Airlines Database Synced via API",
      actor: request.headers.get("x-actor") || "System Admin",
      status: "success",
      metadata: { totalSynced: insertedTotal, apiVersion: "v9" },
    })

    return NextResponse.json({
      success: true,
      count: insertedTotal,
      message: `Successfully synchronized ${insertedTotal} airlines into MariaDB!`,
    })
  } catch (error) {
    console.error("POST /api/admin/airlines/sync error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to sync airlines: " + (error as Error).message },
      { status: 500 }
    )
  }
}