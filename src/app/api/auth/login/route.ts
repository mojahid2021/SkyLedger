import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Query MySQL database directly
    const users = await query<any[]>(
      "SELECT id, first_name, last_name, email, phone, DATE_FORMAT(date_of_birth, '%Y-%m-%d') as date_of_birth, role, password_hash FROM users WHERE email = ?",
      [email.toLowerCase().trim()]
    )

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const user = users[0]
    if (user.password_hash !== password) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const { password_hash, ...userProfile } = user
    return NextResponse.json({ success: true, user: userProfile })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Database connection error or user not found" },
      { status: 500 }
    )
  }
}
