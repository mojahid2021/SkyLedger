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

    // AirLabs Fleet API — paginated fetch
    const limit = 500
    let allFleets: any[] = []
    let offset = 0
    let hasMore = true

    // Paginate until no more data (free keys may only return 50 per page)
    while (hasMore) {
      const apiUrl = `https://airlabs.co/api/v9/fleets?api_key=${apiKey}&limit=${limit}&offset=${offset}`
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

      const fleetsPage: any[] = json.response || []
      if (!Array.isArray(fleetsPage) || fleetsPage.length === 0) {
        hasMore = false
        break
      }

      allFleets.push(...fleetsPage)

      // Check if there are more pages via request.has_more
      hasMore = json.request?.has_more === true
      offset += limit
    }

    if (allFleets.length === 0) {
      return NextResponse.json(
        { success: false, error: "No fleet records returned from AirLabs API" },
        { status: 404 }
      )
    }

    const pool = getMySQLPool()

    const CHUNK_SIZE = 500
    let insertedTotal = 0

    for (let i = 0; i < allFleets.length; i += CHUNK_SIZE) {
      const chunk = allFleets.slice(i, i + CHUNK_SIZE)
      const valueTuples: string[] = []
      const params: any[] = []

      for (const item of chunk) {
        // Skip entries without hex or reg_number
        if (!item.hex && !item.reg_number) continue

        valueTuples.push("(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        params.push(
          item.hex ? String(item.hex).substring(0, 10) : null,
          item.reg_number ? String(item.reg_number).substring(0, 20) : null,
          item.flag ? String(item.flag).substring(0, 10) : null,
          item.airline_icao ? String(item.airline_icao).substring(0, 10) : null,
          item.airline_iata ? String(item.airline_iata).substring(0, 10) : null,
          item.seen !== undefined ? Number(item.seen) : null,
          item.icao ? String(item.icao).substring(0, 10) : null,
          item.iata ? String(item.iata).substring(0, 10) : null,
          item.model ? String(item.model).substring(0, 255) : null,
          item.engine ? String(item.engine).substring(0, 20) : null,
          item.engine_count ? String(item.engine_count).substring(0, 10) : null,
          item.manufacturer ? String(item.manufacturer).substring(0, 100) : null,
          item.type ? String(item.type).substring(0, 50) : null,
          item.category ? String(item.category).substring(0, 10) : null,
          item.built !== undefined && item.built !== null ? Number(item.built) : null,
          item.age !== undefined && item.age !== null ? Number(item.age) : null,
          item.msn ? String(item.msn).substring(0, 50) : null,
          item.line ? String(item.line).substring(0, 50) : null,
          typeof item.lat === "number" ? item.lat : (item.lat ? parseFloat(item.lat) : null),
          typeof item.lng === "number" ? item.lng : (item.lng ? parseFloat(item.lng) : null),
          item.alt !== undefined && item.alt !== null ? Number(item.alt) : null,
          item.dir !== undefined && item.dir !== null ? Number(item.dir) : null,
          item.speed !== undefined && item.speed !== null ? Number(item.speed) : null,
          item.v_speed !== undefined && item.v_speed !== null ? Number(item.v_speed) : null,
          item.squawk ? String(item.squawk).substring(0, 10) : null,
          item.last_seen ? new Date(Number(item.last_seen) * 1000) : null
        )
      }

      if (valueTuples.length > 0) {
        const sql = `INSERT IGNORE INTO aircraft (hex, reg_number, flag, airline_icao, airline_iata, seen, icao, iata, model, engine, engine_count, manufacturer, type, category, built, age, msn, line, lat, lng, alt, dir, speed, v_speed, squawk, last_seen) VALUES ${valueTuples.join(", ")}`
        const [result] = await pool.query(sql, params) as any
        insertedTotal += (result as any).affectedRows
      }
    }

    await recordAuditLog({
      event: "Aircraft Fleet Synced from AirLabs",
      actor: "admin@skyledger.io",
      status: "success",
      metadata: { totalSynced: insertedTotal, totalFetched: allFleets.length, apiVersion: "v9" },
    })

    return NextResponse.json({
      success: true,
      count: insertedTotal,
      message: `Successfully synchronized ${insertedTotal} aircraft fleet records into MariaDB!`,
    })
  } catch (error) {
    console.error("POST /api/admin/fleets/sync error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to sync fleet data: " + (error as Error).message },
      { status: 500 }
    )
  }
}
