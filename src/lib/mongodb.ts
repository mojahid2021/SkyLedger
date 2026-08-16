import { MongoClient, Collection, Document } from "mongodb"

export interface AuditLogDocument extends Document {
  _id?: any
  event: string
  actor: string
  ip: string
  time: string
  status: "success" | "blocked" | "warning"
  timestamp: Date
  metadata?: Record<string, any>
}

const uri =
  process.env.MONGODB_URI ||
  "mongodb://admin:mongopassword@localhost:27018/skyledger?authSource=admin"

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

export async function getMongoClient(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 })
      global._mongoClientPromise = client.connect()
    }
    return global._mongoClientPromise
  } else {
    if (!clientPromise) {
      client = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 })
      clientPromise = client.connect()
    }
    return clientPromise
  }
}

export async function getAuditCollection(): Promise<Collection<AuditLogDocument>> {
  const mongoClient = await getMongoClient()
  const db = mongoClient.db()
  return db.collection<AuditLogDocument>("audit_logs")
}

/**
 * Inserts a new audit event into MongoDB.
 */
export async function recordAuditLog(log: {
  event: string
  actor: string
  ip?: string
  status?: "success" | "blocked" | "warning"
  metadata?: Record<string, any>
}) {
  try {
    const collection = await getAuditCollection()
    const now = new Date()
    
    // Format human-readable relative time or timestamp
    const doc: AuditLogDocument = {
      event: log.event,
      actor: log.actor,
      ip: log.ip || "127.0.0.1",
      time: "Just now",
      status: log.status || "success",
      timestamp: now,
      metadata: log.metadata || {},
    }

    await collection.insertOne(doc)
    return { success: true }
  } catch (error) {
    console.error("Failed to record audit log to MongoDB:", error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Fetches recent audit logs from MongoDB.
 */
export async function getRecentAuditLogs(limit = 50): Promise<AuditLogDocument[]> {
  try {
    const collection = await getAuditCollection()
    return await collection.find({}).sort({ timestamp: -1 }).limit(limit).toArray()
  } catch (error) {
    console.error("Error fetching audit logs from MongoDB:", error)
    return []
  }
}
