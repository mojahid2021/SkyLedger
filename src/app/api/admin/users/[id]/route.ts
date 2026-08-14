import { NextResponse } from "next/server"
import { getMySQLPool } from "@/lib/db"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  let connection;
  try {
    const params = await context.params
    const userId = Number(params.id)

    if (isNaN(userId)) {
      return NextResponse.json({ success: false, error: "Invalid user ID" }, { status: 400 })
    }

    const pool = getMySQLPool()
    connection = await pool.getConnection()

    // ✨ THIS CALLS THE STORED PROCEDURE
    const [rows] = await connection.execute("CALL GetUserProfile(?)", [userId])
    
    // The procedure returns JSON inside a result set
    const resultSets = rows as any[]
    
    if (!resultSets || !resultSets[0] || resultSets[0].length === 0) {
       return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const aggregatedData = resultSets[0][0].aggregateData
    
    // Usually MySQL JSON unquotes automatically, but if it's a string, we parse it
    const data = typeof aggregatedData === "string" ? JSON.parse(aggregatedData) : aggregatedData

    if (!data.user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error("Error executing GetUserProfile Procedure:", error)
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 })
  } finally {
    if (connection) connection.release()
  }
}
