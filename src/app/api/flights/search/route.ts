import { NextResponse } from "next/server"

const TRAVELPAYOUTS_TOKEN = process.env.TRAVELPAYOUTS_API_KEY || "570107c3-1b06-4f25-a099-3287f36b31e7"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const origin = searchParams.get("origin")
  const destination = searchParams.get("destination")
  const departure_at = searchParams.get("departure_at") 

  if (!origin || !destination || !departure_at) {
    return NextResponse.json(
      { success: false, error: "Missing required parameters: origin, destination, departure_at" },
      { status: 400 }
    )
  }

  try {
    const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${origin}&destination=${destination}&departure_at=${departure_at}&token=${TRAVELPAYOUTS_TOKEN}&limit=50&sorting=price&one_way=true`
    
    const response = await fetch(url, {
      headers: {
        "Accept-Encoding": "gzip, deflate",
        "User-Agent": "SkyLedger-App/1.0"
      }
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Flight search error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to search flights" },
      { status: 500 }
    )
  }
}
