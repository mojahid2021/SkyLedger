import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const users = await query(
      "SELECT id, first_name, last_name, email, phone, DATE_FORMAT(date_of_birth, '%Y-%m-%d') as date_of_birth, role, created_at FROM users ORDER BY created_at DESC"
    )
    return NextResponse.json({ success: true, users: users || [] })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch users from database", users: [] },
      { status: 500 }
    )
  }
}
