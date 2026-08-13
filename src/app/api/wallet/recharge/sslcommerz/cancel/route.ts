import { NextResponse } from "next/server"
import { getMySQLPool } from "@/lib/db"
import { recordAuditLog } from "@/lib/mongodb"

export async function POST(request: Request) {
  const pool = getMySQLPool()
  const connection = await pool.getConnection()

  try {
    const formData = await request.formData()
    const tran_id = formData.get("tran_id") as string

    if (!tran_id) {
      connection.release()
      return renderRedirectHTML(request, "cancel", "")
    }

    // Update transaction to failed in database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [rows] = await connection.execute<any[]>(
      `SELECT 
        t.id as transaction_id, t.status as transaction_status,
        u.first_name, u.last_name, u.email
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE t.reference = ?`,
      [tran_id]
    )

    if (rows && rows.length > 0) {
      const txInfo = rows[0]
      if (txInfo.transaction_status === "pending") {
        await connection.beginTransaction()
        await connection.execute(
          "UPDATE transactions SET status = 'failed', description = 'Wallet Deposit Cancelled by User' WHERE id = ?",
          [txInfo.transaction_id]
        )
        await connection.commit()

        await recordAuditLog({
          event: "Wallet Recharge Cancelled",
          actor: `${txInfo.first_name} ${txInfo.last_name} (${txInfo.email})`,
          status: "warning",
          metadata: {
            tranId: tran_id,
          },
        })
      }
    }

    connection.release()
    return renderRedirectHTML(request, "cancel", tran_id)
  } catch (error) {
    await connection.rollback()
    connection.release()
    console.error("SSLCommerz cancel callback error:", error)
    return renderRedirectHTML(request, "cancel", "")
  }
}

function renderRedirectHTML(request: Request, status: string, ref: string) {
  const host = request.headers.get("host") || "localhost:3000"
  const protocol = request.headers.get("x-forwarded-proto") || "http"
  const baseUrl = `${protocol}://${host}`

  const redirectUrl = `${baseUrl}/user/wallet?status=cancel&ref=${ref}`

  const html = `
    <html>
      <head>
        <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
        <script>window.location.href = "${redirectUrl}"</script>
      </head>
      <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #1e293b;">
        <div style="text-align: center; padding: 2rem; border-radius: 8px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <p style="font-size: 14px; font-weight: 600; color: #475569;">Payment Cancelled. Redirecting back...</p>
        </div>
      </body>
    </html>
  `

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  })
}
