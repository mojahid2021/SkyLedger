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
        user_id INT UNIQUE NULL,
        code INT NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        type ENUM('Asset', 'Liability', 'Equity', 'Revenue', 'Expense') NOT NULL,
        balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `)

    try {
      await p.query(`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS user_id INT UNIQUE NULL AFTER id;`)
    } catch {
      // Column may already exist
    }

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

    // Seed admin login (inserted only if not already present)
    await p.execute(`
      INSERT IGNORE INTO users (first_name, last_name, email, phone, date_of_birth, password_hash, role)
      VALUES
      ('Alexander', 'Vance', 'admin@skyledger.io', '+1 (404) 555-0101', '1985-03-14', 'admin123', 'admin');
    `)

    // Create MariaDB Trigger to automatically create a wallet account upon user registration
    try {
      await p.query(`DROP TRIGGER IF EXISTS after_user_insert;`)
      await p.query(`
        CREATE TRIGGER after_user_insert
        AFTER INSERT ON users
        FOR EACH ROW
        BEGIN
          INSERT INTO accounts (user_id, code, name, type, balance)
          VALUES (NEW.id, 1000 + NEW.id, CONCAT(NEW.first_name, ' ', NEW.last_name, ' Wallet'), 'Asset', 0.00);
        END;
      `)
    } catch (triggerErr) {
      console.warn("Notice: MariaDB trigger initialization message:", (triggerErr as Error).message)
    }

    // Ensure all existing users have a wallet account
    try {
      await p.query(`
        INSERT INTO accounts (user_id, code, name, type, balance)
        SELECT id, 1000 + id, CONCAT(first_name, ' ', last_name, ' Wallet'), 'Asset', 0.00
        FROM users
        WHERE id NOT IN (SELECT user_id FROM accounts WHERE user_id IS NOT NULL);
      `)
    } catch {
      // Wallet accounts already exist
    }

    return { success: true, message: "MySQL database tables initialized successfully" }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}
