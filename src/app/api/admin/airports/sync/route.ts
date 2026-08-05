import { NextResponse } from "next/server"
import { query, getMySQLPool } from "@/lib/db"
import { recordAuditLog } from "@/lib/mongodb"

export async function POST(_request: Request) {
  try {
    const apiKey = process.env.AIRLABS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "AIRLABS_API_KEY is required for the AirLabs API." },
        { status: 500 }
      )
    }

    const apiUrl = `https://airlabs.co/api/v9/airports?api_key=${apiKey}`

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

    const airportsData: any[] = json.response || []

    if (!Array.isArray(airportsData) || airportsData.length === 0) {
      return NextResponse.json(
        { success: false, error: "No airport records returned from AirLabs API" },
        { status: 404 }
      )
    }

    const pool = getMySQLPool()

    // Use INSERT IGNORE to skip duplicates based on unique airport name or ICAO
    const CHUNK_SIZE = 500
    let insertedTotal = 0

    for (let i = 0; i < airportsData.length; i += CHUNK_SIZE) {
      const chunk = airportsData.slice(i, i + CHUNK_SIZE)
      const valueTuples: string[] = []
      const params: any[] = []

      for (const item of chunk) {
        if (!item.name) continue

        valueTuples.push("(?, ?, ?, ?, ?, ?)")
        params.push(
          item.name.substring(0, 255),
          item.iata_code ? String(item.iata_code).substring(0, 10) : null,
          item.icao_code ? String(item.icao_code).substring(0, 10) : null,
          typeof item.lat === "number" ? item.lat : parseFloat(item.lat) || null,
          typeof item.lng === "number" ? item.lng : parseFloat(item.lng) || null,
          item.country_code ? String(item.country_code).substring(0, 10) : null
        )
      }

      if (valueTuples.length > 0) {
        const sql = `INSERT IGNORE INTO airports (name, iata_code, icao_code, lat, lng, country_code) VALUES ${valueTuples.join(", ")}`
        const [result] = await pool.query(sql, params) as any
        insertedTotal += (result as any).affectedRows
      }
    }

    // Write MongoDB audit log
    await recordAuditLog({
      event: "Airports Synced from AirLabs",
      actor: "admin@skyledger.io",
      status: "success",
      metadata: { totalSynced: insertedTotal, apiVersion: "v9" },
    })

    return NextResponse.json({
      success: true,
      count: insertedTotal,
      message: `Successfully synchronized ${insertedTotal} airports into MariaDB!`,
    })
  } catch (error) {
    console.error("POST /api/admin/airports/sync error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to sync airports: " + (error as Error).message },
      { status: 500 }
    )
  }
}
