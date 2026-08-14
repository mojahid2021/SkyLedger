import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { recordAuditLog } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

interface UserRow {
  id: number
  first_name?: string
  last_name?: string
  email: string
  phone?: string | null
  date_of_birth?: string | null
  role: "admin" | "user"
}

interface ResultSetHeader {
  insertId: number
  affectedRows: number
}

// GET /api/admin/users — List all system users
export async function GET() {
  try {
    const users = await query(
      "SELECT id, first_name, last_name, email, phone, DATE_FORMAT(date_of_birth, '%Y-%m-%d') as date_of_birth, role, created_at FROM users ORDER BY created_at DESC"
    )
    return NextResponse.json({ success: true, users: users || [] })
  } catch (error) {
    console.error("GET /api/admin/users error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch users from database", users: [] },
      { status: 500 }
    )
  }
}

// POST /api/admin/users — Create a new user by Admin
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const actor = request.headers.get("x-actor") || "System Admin"
    const { first_name, last_name, email, phone, date_of_birth, password, role } = body

    if (!first_name || !last_name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "First Name, Last Name, Email, and Password are required" },
        { status: 400 }
      )
    }

    const cleanEmail = email.toLowerCase().trim()
    const assignedRole = role === "admin" ? "admin" : "user"

    // Check existing email
    const existing = await query<UserRow[]>("SELECT id FROM users WHERE email = ?", [cleanEmail])
    if (existing && existing.length > 0) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists" },
        { status: 409 }
      )
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const result = await query<ResultSetHeader>(
      "INSERT INTO users (first_name, last_name, email, phone, date_of_birth, password_hash, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        first_name,
        last_name,
        cleanEmail,
        phone || null,
        date_of_birth || null,
        passwordHash,
        assignedRole,
      ]
    )

    // Audit Log in MongoDB
    await recordAuditLog({
      event: "Admin Created User Account",
      actor: actor,
      status: "success",
      metadata: { newUserId: result.insertId, email: cleanEmail, role: assignedRole },
    })

    return NextResponse.json({
      success: true,
      id: result.insertId,
      message: `User created successfully with role ${assignedRole.toUpperCase()}`,
    })
  } catch (error) {
    console.error("POST /api/admin/users error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create user: " + (error as Error).message },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/users — Update user profile & role assignment
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const actor = request.headers.get("x-actor") || "System Admin"
    const { userId, first_name, last_name, email, phone, date_of_birth, role } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      )
    }

    // Get current user data to log changes
    const currentUsers = await query<UserRow[]>("SELECT id, role, email FROM users WHERE id = ?", [userId])
    if (!currentUsers || currentUsers.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found in database" },
        { status: 404 }
      )
    }

    const currentUser = currentUsers[0]
    const assignedRole = role === "admin" ? "admin" : "user"
    const roleChanged = currentUser.role !== assignedRole

    // Perform MySQL update
    await query(
      "UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, date_of_birth = ?, role = ? WHERE id = ?",
      [
        first_name,
        last_name,
        email.toLowerCase().trim(),
        phone || null,
        date_of_birth || null,
        assignedRole,
        userId,
      ]
    )

    // Audit Log in MongoDB
    await recordAuditLog({
      event: roleChanged
        ? `Role Changed (${currentUser.role.toUpperCase()} → ${assignedRole.toUpperCase()})`
        : "User Profile Updated",
      actor: actor,
      status: "success",
      metadata: {
        userId,
        targetEmail: email,
        previousRole: currentUser.role,
        newRole: assignedRole,
      },
    })

    return NextResponse.json({
      success: true,
      message: roleChanged
        ? `User profile and role updated to ${assignedRole.toUpperCase()}`
        : "User profile updated successfully",
    })
  } catch (error) {
    console.error("PATCH /api/admin/users error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update user: " + (error as Error).message },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users — Delete user account
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const actor = request.headers.get("x-actor") || "System Admin"

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      )
    }

    const currentUsers = await query<UserRow[]>("SELECT email, role FROM users WHERE id = ?", [userId])
    const email = currentUsers?.[0]?.email || `ID #${userId}`

    await query("DELETE FROM users WHERE id = ?", [userId])

    // Audit Log in MongoDB
    await recordAuditLog({
      event: "User Account Deleted by Admin",
      actor: actor,
      status: "blocked",
      metadata: { deletedUserId: userId, deletedEmail: email },
    })

    return NextResponse.json({
      success: true,
      message: `User #${userId} (${email}) deleted successfully`,
    })
  } catch (error) {
    console.error("DELETE /api/admin/users error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete user: " + (error as Error).message },
      { status: 500 }
    )
  }
}
