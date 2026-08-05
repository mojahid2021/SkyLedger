import { NextResponse } from "next/server"
import { initMySQLDatabase } from "@/lib/db"

export async function POST() {
  const result = await initMySQLDatabase()
  if (result.success) {
    return NextResponse.json(result)
  } else {
    return NextResponse.json(result, { status: 500 })
  }
}
