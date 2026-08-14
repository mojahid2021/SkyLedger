import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { recordAuditLog } from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing required user id" }, { status: 400 })
    }

    const users = await query<any[]>(
      "SELECT id, first_name, last_name, email, phone, DATE_FORMAT(date_of_birth, '%Y-%m-%d') as date_of_birth, role FROM users WHERE id = ? AND role = 'admin'",
      [id]
    )

    if (!users || users.length === 0) {
      return NextResponse.json({ success: false, error: "Admin profile not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: users[0] })
  } catch (error) {
    console.error("Fetch admin profile error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile: " + (error as Error).message },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, first_name, last_name, email, phone, date_of_birth, current_password, new_password } = body

    if (!id || !first_name || !last_name || !email) {
      return NextResponse.json(
        { success: false, error: "Missing required profile fields" },
        { status: 400 }
      )
    }

    // First check if the admin exists and get current password if needed
    const existing = await query<any[]>(
      "SELECT id, password_hash, role, email FROM users WHERE id = ? AND role = 'admin'",
      [id]
    )

    if (!existing || existing.length === 0) {
      return NextResponse.json({ success: false, error: "Admin not found" }, { status: 404 })
    }

    const user = existing[0]

    // Handle password update logic if new password is provided
    let passwordHashToSave = user.password_hash
    if (new_password) {
      if (!current_password) {
        return NextResponse.json({ success: false, error: "Current password is required to set a new password." }, { status: 400 })
      }
      if (current_password !== user.password_hash) {
        await recordAuditLog({
          event: "Admin Password Change Failed (Invalid Current Password)",
          actor: user.email,
          status: "blocked",
        })
        return NextResponse.json({ success: false, error: "Incorrect current password." }, { status: 401 })
      }
      // Since passwords are plain text in this system as seen in auth routes
      passwordHashToSave = new_password
    }

    // Check for email collision
    if (email.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
      const emailCheck = await query<any[]>("SELECT id FROM users WHERE email = ? AND id != ?", [email.toLowerCase().trim(), id])
      if (emailCheck && emailCheck.length > 0) {
        return NextResponse.json({ success: false, error: "This email address is already in use by another account." }, { status: 409 })
      }
    }

    // Update profile
    await query(
      "UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, date_of_birth = ?, password_hash = ? WHERE id = ?",
      [
        first_name,
        last_name,
        email.toLowerCase().trim(),
        phone || null,
        date_of_birth || null,
        passwordHashToSave,
        id,
      ]
    )

    await recordAuditLog({
      event: "Admin Profile Updated",
      actor: email.toLowerCase().trim(),
      status: "success",
      metadata: { userId: id, changedPassword: !!new_password },
    })

    const updatedProfile = {
      id,
      first_name,
      last_name,
      email: email.toLowerCase().trim(),
      phone: phone || "",
      date_of_birth: date_of_birth || "",
      role: user.role,
    }

    return NextResponse.json({
      success: true,
      message: new_password ? "Profile and password updated successfully" : "Profile updated successfully",
      user: updatedProfile,
    })

  } catch (error) {
    console.error("Update admin profile error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update profile: " + (error as Error).message },
      { status: 500 }
    )
  }
}
