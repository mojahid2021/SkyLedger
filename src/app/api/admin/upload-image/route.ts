import { NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Fallback Mock Mode if AWS credentials are not configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET_NAME) {
      console.warn("⚠ AWS S3 environment variables not set. Running image upload in MOCK mode.")
      
      // We will mock the upload and return a static local image path
      return NextResponse.json({ 
        success: true, 
        fileName: "hero_airplane_flying.jpg", 
        mock: true 
      })
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

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Generate a unique filename using crypto
    const fileExt = file.name.split('.').pop()
    const fileName = `deals/${crypto.randomUUID()}.${fileExt}`

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    )

    return NextResponse.json({ success: true, fileName })
  } catch (error) {
    console.error("POST /api/admin/upload-image error:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
