import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const accounts = await query(
      "SELECT id, user_id, code, name, type, balance, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at FROM accounts ORDER BY code ASC"
    )

    return NextResponse.json({ success: true, data: accounts || [] })
  } catch (error) {
    console.error("GET /api/accounts error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch accounts from database", data: [] },
      { status: 500 }
    )
  }
}
