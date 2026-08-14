import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { recordAuditLog } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing required user id" }, { status: 400 })
    }

    const users = await query<any[]>(
      "SELECT id, first_name, last_name, email, phone, DATE_FORMAT(date_of_birth, '%Y-%m-%d') as date_of_birth, role FROM users WHERE id = ? AND role = 'user'",
      [id]
    )

    if (!users || users.length === 0) {
      return NextResponse.json({ success: false, error: "User profile not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: users[0] })
  } catch (error) {
    console.error("Fetch user profile error:", error)
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

    // First check if the user exists and get current password if needed
    const existing = await query<any[]>(
      "SELECT id, password_hash, role, email FROM users WHERE id = ? AND role = 'user'",
      [id]
    )

    if (!existing || existing.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const user = existing[0]

    // Handle password update logic if new password is provided
    let passwordHashToSave = user.password_hash
    if (new_password) {
      if (!current_password) {
        return NextResponse.json({ success: false, error: "Current password is required to set a new password." }, { status: 400 })
      }
      
      const isMatch = await bcrypt.compare(current_password, user.password_hash).catch(() => false);
      const isLegacyPlain = user.password_hash === current_password;

      if (!isMatch && !isLegacyPlain) {
        await recordAuditLog({
          event: "User Password Change Failed (Invalid Current Password)",
          actor: user.email,
          status: "blocked",
        })
        return NextResponse.json({ success: false, error: "Incorrect current password." }, { status: 401 })
      }
      
      const salt = await bcrypt.genSalt(10)
      passwordHashToSave = await bcrypt.hash(new_password, salt)
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
      event: "User Profile Updated",
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
    console.error("Update user profile error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update profile: " + (error as Error).message },
      { status: 500 }
    )
  }
}
