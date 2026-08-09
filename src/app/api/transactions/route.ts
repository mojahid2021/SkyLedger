import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userIdStr = searchParams.get("userId")

    let sql = "SELECT t.id, t.reference, t.description, t.category, a.name as account, t.type, t.amount, t.status, DATE_FORMAT(t.transaction_date, '%Y-%m-%d') as date FROM transactions t LEFT JOIN accounts a ON t.account_id = a.id"
    let params: any[] = []

    if (userIdStr) {
      sql += " WHERE a.user_id = ?"
      params.push(parseInt(userIdStr, 10))
    }

    sql += " ORDER BY t.created_at DESC"

    const transactions = await query(sql, params)

    return NextResponse.json({ success: true, data: transactions || [] })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch transactions from database", data: [] },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, description, category, accountId, type } = body

    const reference = `REF-2026-${Math.floor(1000 + Math.random() * 9000)}`
    const date = new Date().toISOString().split("T")[0]

    const result = await query<any>(
      "INSERT INTO transactions (reference, description, category, account_id, type, amount, status, transaction_date) VALUES (?, ?, ?, ?, ?, ?, 'completed', ?)",
      [reference, description, category, accountId || 1, type, amount, date]
    )

    return NextResponse.json({ success: true, id: result.insertId, reference })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to post transaction: " + (error as Error).message },
      { status: 500 }
    )
  }
}
