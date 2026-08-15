import { NextResponse } from "next/server"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get("file")

    if (!fileName) {
      return new NextResponse("Missing file parameter", { status: 400 })
    }

    // Fallback Mock Mode if AWS credentials are not configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET_NAME) {
      // Return a redirect to the local mock image
      return NextResponse.redirect(new URL(`/${fileName}`, request.url))
    }

    const region = process.env.AWS_REGION || "us-east-1"
    const s3Client = new S3Client({
      region,
      endpoint: process.env.AWS_ENDPOINT || undefined,
      forcePathStyle: !!process.env.AWS_ENDPOINT,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    })

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
    })

    const response = await s3Client.send(command)

    // Convert the ReadableStream to a format Next.js can return
    return new NextResponse(response.Body as any, {
      headers: {
        "Content-Type": response.ContentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
      },
    })
  } catch (error: any) {
    console.error("GET /api/media error:", error)
    if (error.name === "NoSuchKey") {
      return new NextResponse("File not found", { status: 404 })
    }
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
