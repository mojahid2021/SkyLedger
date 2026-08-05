import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { recordAuditLog } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const { first_name, last_name, email, phone, date_of_birth, password } = await request.json()

    if (!first_name || !last_name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "First Name, Last Name, email, and password are required" },
        { status: 400 }
      )
    }

    const cleanEmail = email.toLowerCase().trim()

    // SECURITY ENFORCEMENT: Admin role can NEVER be registered via public registration
    const forcedRole = "user"

    // Check if user already exists in MySQL
    const existing = await query<any[]>("SELECT id FROM users WHERE email = ?", [cleanEmail])
    if (existing && existing.length > 0) {
      await recordAuditLog({
        event: "Registration Blocked (Duplicate Email)",
        actor: cleanEmail,
        status: "blocked",
      })
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists" },
        { status: 409 }
      )
    }

    // Insert new user into MySQL (First Name, Last Name, Email, Phone, Date of Birth, Password, Role)
    const result = await query<any>(
      "INSERT INTO users (first_name, last_name, email, phone, date_of_birth, password_hash, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        first_name,
        last_name,
        cleanEmail,
        phone || null,
        date_of_birth || null,
        password,
        forcedRole,
      ]
    )

    const newUserId = result.insertId

    // Record new registration audit log in MongoDB
    await recordAuditLog({
      event: "New Member Registered",
      actor: cleanEmail,
      status: "success",
      metadata: { userId: newUserId, role: forcedRole },
    })

    const newProfile = {
      id: newUserId,
      first_name,
      last_name,
      email: cleanEmail,
      phone: phone || "",
      date_of_birth: date_of_birth || "",
      role: forcedRole,
    }

    return NextResponse.json({
      success: true,
      user: newProfile,
      message: "User registered successfully as Standard User",
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Database error during registration: " + (error as Error).message },
      { status: 500 }
    )
  }
}
