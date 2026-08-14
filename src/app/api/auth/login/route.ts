import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { recordAuditLog } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

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
      await recordAuditLog({
        event: "Unrecognized User Login Attempt",
        actor: email,
        status: "blocked",
      })
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const user = users[0]
    
    // Check if password matches (support both hash and plain text for backward compatibility if needed, but here we expect bcrypt)
    const isMatch = await bcrypt.compare(password, user.password_hash).catch(() => false);
    const isLegacyPlain = user.password_hash === password;
    
    if (!isMatch && !isLegacyPlain) {
      await recordAuditLog({
        event: "Failed Sign-In Attempt (Invalid Password)",
        actor: email,
        status: "blocked",
      })
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Record successful login audit log in MongoDB
    await recordAuditLog({
      event: user.role === "admin" ? "Admin Login Success" : "User Sign-In Success",
      actor: email,
      status: "success",
      metadata: { role: user.role },
    })

    const { password_hash, ...userProfile } = user
    return NextResponse.json({ success: true, user: userProfile })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Database connection error or user not found" },
      { status: 500 }
    )
  }
}
