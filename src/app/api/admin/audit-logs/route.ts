import { NextResponse } from "next/server"
import { getRecentAuditLogs, recordAuditLog } from "@/lib/mongodb"

export async function GET() {
  try {
    const logs = await getRecentAuditLogs(50)
    
    // Format MongoDB documents into clean API response format
    const formattedLogs = logs.map((doc) => {
      const diffMs = Date.now() - new Date(doc.timestamp).getTime()
      const diffMins = Math.floor(diffMs / 60000)
      
      let relativeTime = doc.time || "Just now"
      if (diffMins < 1) {
        relativeTime = "Just now"
      } else if (diffMins < 60) {
        relativeTime = `${diffMins} mins ago`
      } else if (diffMins < 1440) {
        relativeTime = `${Math.floor(diffMins / 60)} hrs ago`
      } else {
        relativeTime = `${Math.floor(diffMins / 1440)} days ago`
      }

      return {
        id: doc._id?.toString() || String(Math.random()),
        event: doc.event,
        actor: doc.actor,
        ip: doc.ip || "127.0.0.1",
        time: relativeTime,
        status: doc.status || "success",
        timestamp: doc.timestamp,
      }
    })

    return NextResponse.json({ success: true, logs: formattedLogs })
  } catch (error) {
    console.error("GET /api/admin/audit-logs error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch audit logs from MongoDB", logs: [] },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { event, actor, ip, status, metadata } = body

    if (!event || !actor) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: event and actor" },
        { status: 400 }
      )
    }

    const result = await recordAuditLog({
      event,
      actor,
      ip: ip || "127.0.0.1",
      status: status || "success",
      metadata,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("POST /api/admin/audit-logs error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to record audit log" },
      { status: 500 }
    )
  }
}
