import mysql from "mysql2/promise"

// Read MySQL config from environment variables
const dbConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "skyledger_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Global connection pool instance
let pool: mysql.Pool | null = null

export function getMySQLPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

// Universal query runner helper
export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  try {
    const connectionPool = getMySQLPool()
    const [rows] = await connectionPool.execute(sql, params)
    return rows as T
  } catch (error) {
    console.warn("MySQL query execution warning:", (error as Error).message)
    throw error
  }
}

// Table initialization helper if database tables do not exist
export async function initMySQLDatabase() {
  try {
    const p = getMySQLPool()
    
    // Create users table
    await p.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(30),
        date_of_birth DATE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Create accounts table
    await p.execute(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code INT NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        type ENUM('Asset', 'Liability', 'Equity', 'Revenue', 'Expense') NOT NULL,
        balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Create transactions table
    await p.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reference VARCHAR(64) NOT NULL,
        description VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        account_id INT NOT NULL,
        type ENUM('credit', 'debit') NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        status ENUM('completed', 'pending', 'failed') NOT NULL DEFAULT 'completed',
        transaction_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Create audit logs table
    await p.execute(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event VARCHAR(255) NOT NULL,
        actor VARCHAR(150) NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    return { success: true, message: "MySQL database tables initialized successfully" }

    return { success: true, message: "MySQL database tables initialized successfully" }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}
