// Setup & Seed Script for SkyLedger Database
// Run via: npx tsx scripts/setup-db.ts

import * as dotenv from "dotenv"
import { resolve } from "path"
import mysql from "mysql2/promise"

// Load env vars
dotenv.config({ path: resolve(process.cwd(), ".env.local") })

const dbConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
}

// Global connection
let connection: mysql.Connection | null = null

async function run() {
  console.log("✈️  SkyLedger Database Setup & Seeder ✈️\\n")

  try {
    console.log(`Connecting to MySQL server at ${dbConfig.host}:${dbConfig.port}...`)
    connection = await mysql.createConnection(dbConfig)

    // Ensure database exists
    const dbName = process.env.MYSQL_DATABASE || "skyledger_db"
    console.log(`Creating database '${dbName}' if it doesn't exist...`)
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``)
    await connection.query(`USE \`${dbName}\``)

    console.log("Setting up tables...")

    // 1. Users Table
    await connection.query(`
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
      )
    `)
    console.log("✓ created 'users' table")

    // 2. Accounts Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNIQUE NULL,
        code INT NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        type ENUM('Asset', 'Liability', 'Equity', 'Revenue', 'Expense') NOT NULL,
        balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)
    console.log("✓ created 'accounts' table")

    // 3. Transactions Table
    await connection.query(`
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
      )
    `)
    console.log("✓ created 'transactions' table")

    // 4. Audit Logs Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event VARCHAR(255) NOT NULL,
        actor VARCHAR(150) NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("✓ created 'audit_logs' table (MySQL fallback)")

    // 5. Airports & Cities
    await connection.query(`
      CREATE TABLE IF NOT EXISTS airports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        iata_code VARCHAR(10) NULL,
        icao_code VARCHAR(10) NULL,
        lat DECIMAL(10, 6) NULL,
        lng DECIMAL(10, 6) NULL,
        country_code VARCHAR(10) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_iata (iata_code),
        INDEX idx_icao (icao_code),
        INDEX idx_country (country_code)
      )
    `)
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city_code VARCHAR(10) NULL,
        lat DECIMAL(10, 6) NULL,
        lng DECIMAL(10, 6) NULL,
        country_code VARCHAR(10) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_city_code (city_code),
        INDEX idx_country (country_code)
      )
    `)
    console.log("✓ created 'airports' and 'cities' tables")

    // 6. Bookings Tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_reference VARCHAR(32) UNIQUE NOT NULL,
        user_id INT NOT NULL,
        duffel_offer_id VARCHAR(128) NULL,
        origin_code VARCHAR(10) NOT NULL,
        destination_code VARCHAR(10) NOT NULL,
        departure_date VARCHAR(30) NOT NULL,
        return_date VARCHAR(30) NULL,
        cabin_class VARCHAR(50) NOT NULL DEFAULT 'economy',
        total_amount DECIMAL(15, 2) NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'USD',
        status ENUM('confirmed', 'cancelled') NOT NULL DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_bookings (user_id),
        INDEX idx_pnr (booking_reference)
      )
    `)

    await connection.query(`
      CREATE TABLE IF NOT EXISTS booking_passengers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NULL,
        phone VARCHAR(30) NULL,
        date_of_birth DATE NULL,
        passport_number VARCHAR(50) NULL,
        passenger_type ENUM('adult', 'child', 'infant') NOT NULL DEFAULT 'adult',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
      )
    `)

    await connection.query(`
      CREATE TABLE IF NOT EXISTS booking_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        passenger_id INT NOT NULL,
        segment_type ENUM('outbound', 'return') NOT NULL DEFAULT 'outbound',
        flight_number VARCHAR(20) NOT NULL,
        airline_code VARCHAR(10) NOT NULL,
        airline_name VARCHAR(100) NOT NULL,
        seat_designator VARCHAR(10) NULL,
        seat_price DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        ticket_number VARCHAR(64) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (passenger_id) REFERENCES booking_passengers(id) ON DELETE CASCADE
      )
    `)
    console.log("✓ created 'bookings', 'booking_passengers', and 'booking_tickets' tables")

    console.log("\\nConfiguring Triggers...")
    // Trigger to auto-create wallets
    await connection.query("DROP TRIGGER IF EXISTS after_user_insert")
    await connection.query(`
      CREATE TRIGGER after_user_insert
      AFTER INSERT ON users
      FOR EACH ROW
      BEGIN
        INSERT INTO accounts (user_id, code, name, type, balance)
        VALUES (NEW.id, 1000 + NEW.id, CONCAT(NEW.first_name, ' ', NEW.last_name, ' Wallet'), 'Asset', 0.00);
      END;
    `)
    console.log("✓ created 'after_user_insert' auto-wallet trigger")


    console.log("\\nSeeding Initial Data...")

    // Admin seed
    await connection.query(`
      INSERT IGNORE INTO users (first_name, last_name, email, phone, date_of_birth, password_hash, role)
      VALUES
      ('Md', 'Mojahid', 'aammojahid@gmail.com', '+8801736345525', '1985-03-14', 'admin123', 'admin')
    `)
    console.log("✓ seeded Admin user (aammojahid@gmail.com)")

    // Clean up empty wallets for existing users (in case trigger missed any pre-existing)
    await connection.query(`
      INSERT IGNORE INTO accounts (user_id, code, name, type, balance)
      SELECT id, 1000 + id, CONCAT(first_name, ' ', last_name, ' Wallet'), 'Asset', 0.00
      FROM users
      WHERE id NOT IN (SELECT user_id FROM accounts WHERE user_id IS NOT NULL);
    `)

    console.log("\\n✅ Setup completed successfully!")
  } catch (error) {
    console.error("\\n❌ Setup failed:")
    console.error(error)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

run()
