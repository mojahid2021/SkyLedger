import { NextResponse } from "next/server"
import { getMySQLPool } from "@/lib/db"
import { recordAuditLog } from "@/lib/mongodb"

export async function POST(request: Request) {
  const pool = getMySQLPool()
  const connection = await pool.getConnection()

  try {
    const body = await request.json()
    const { userId, amount } = body

    if (!userId || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      connection.release()
      return NextResponse.json(
        { success: false, error: "Invalid recharge amount or missing user ID" },
        { status: 400 }
      )
    }

    const rechargeAmount = Number(amount)

    // 1. Fetch user & account details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [userRows] = await connection.execute<any[]>(
      "SELECT first_name, last_name, email, phone FROM users WHERE id = ?",
      [userId]
    )
    if (!userRows || userRows.length === 0) {
      connection.release()
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }
    const user = userRows[0]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [accountRows] = await connection.execute<any[]>(
      "SELECT id, balance FROM accounts WHERE user_id = ?",
      [userId]
    )
    if (!accountRows || accountRows.length === 0) {
      connection.release()
      return NextResponse.json({ success: false, error: "User wallet account not found" }, { status: 404 })
    }
    const account = accountRows[0]

    const today = new Date().toISOString().split("T")[0]
    const tran_id = `SSL-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`

    // Start a transaction to insert the pending transaction record
    await connection.beginTransaction()
    await connection.execute(
      `INSERT INTO transactions 
        (reference, description, category, account_id, type, amount, status, transaction_date)
      VALUES (?, ?, ?, ?, 'credit', ?, 'pending', ?)`,
      [
        tran_id,
        "Wallet Funds Added via SSLCommerz (Pending)",
        "Wallet Deposit",
        account.id,
        rechargeAmount,
        today,
      ]
    )
    await connection.commit()

    // 2. Prepare SSLCommerz request parameters
    const host = request.headers.get("host") || "localhost:3000"
    const protocol = request.headers.get("x-forwarded-proto") || "http"
    const baseUrl = `${protocol}://${host}`

    const storeId = process.env.SSLCOMMERZ_STORE_ID || "testbox"
    const storePasswd = process.env.SSLCOMMERZ_STORE_PASSWORD || "qwerty"
    const isSandbox = process.env.SSLCOMMERZ_IS_SANDBOX !== "false"

    const sslcommerzUrl = isSandbox
      ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
      : "https://securepay.sslcommerz.com/gwprocess/v4/api.php"

    const params = new URLSearchParams()
    params.append("store_id", storeId)
    params.append("store_passwd", storePasswd)
    params.append("total_amount", rechargeAmount.toString())
    params.append("currency", "USD")
    params.append("tran_id", tran_id)
    params.append("success_url", `${baseUrl}/api/wallet/recharge/sslcommerz/success`)
    params.append("fail_url", `${baseUrl}/api/wallet/recharge/sslcommerz/fail`)
    params.append("cancel_url", `${baseUrl}/api/wallet/recharge/sslcommerz/cancel`)
    params.append("ipn_url", `${baseUrl}/api/wallet/recharge/sslcommerz/ipn`)
    params.append("cus_name", `${user.first_name} ${user.last_name}`)
    params.append("cus_email", user.email)
    params.append("cus_add1", "Dhaka, Bangladesh")
    params.append("cus_city", "Dhaka")
    params.append("cus_state", "Dhaka")
    params.append("cus_postcode", "1200")
    params.append("cus_country", "Bangladesh")
    params.append("cus_phone", user.phone || "01700000000")
    params.append("shipping_method", "NO")
    params.append("product_name", "Wallet Deposit")
    params.append("product_category", "Wallet")
    params.append("product_profile", "non-physical-goods")

    // Record audit log for initiating
    await recordAuditLog({
      event: "Wallet Recharge Initiated",
      actor: `${user.first_name} ${user.last_name} (${user.email})`,
      status: "success",
      metadata: {
        userId,
        rechargeAmount,
        tranId: tran_id,
      },
    })

    // 3. Request session from SSLCommerz
    const sslRes = await fetch(sslcommerzUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    })

    const sslData = await sslRes.json()

    if (sslData.status === "SUCCESS" && sslData.GatewayPageURL) {
      connection.release()
      return NextResponse.json({
        success: true,
        redirectUrl: sslData.GatewayPageURL,
      })
    } else {
      // Mark transaction as failed since gateway session couldn't be created
      await connection.beginTransaction()
      await connection.execute(
        "UPDATE transactions SET status = 'failed', description = ? WHERE reference = ?",
        [`Failed to initiate payment session: ${sslData.failedreason || "unknown"}`, tran_id]
      )
      await connection.commit()
      connection.release()

      console.error("SSLCommerz session initiation failed:", sslData)
      return NextResponse.json(
        { success: false, error: sslData.failedreason || "Failed to initiate payment session with SSLCommerz." },
        { status: 500 }
      )
    }
  } catch (error) {
    await connection.rollback()
    connection.release()
    console.error("SSLCommerz initiation error:", error)
    return NextResponse.json(
      { success: false, error: "SSLCommerz initiation error: " + (error as Error).message },
      { status: 500 }
    )
  }
}
