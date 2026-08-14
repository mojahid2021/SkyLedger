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

    console.log("Dropping existing tables to ensure clean initialization...")
    await connection.query("SET FOREIGN_KEY_CHECKS = 0")
    await connection.query("DROP TABLE IF EXISTS booking_tickets")
    await connection.query("DROP TABLE IF EXISTS booking_passengers")
    await connection.query("DROP TABLE IF EXISTS bookings")
    await connection.query("DROP TABLE IF EXISTS transactions")
    await connection.query("DROP TABLE IF EXISTS accounts")
    await connection.query("DROP TABLE IF EXISTS audit_logs")
    await connection.query("DROP TABLE IF EXISTS flights")
    await connection.query("DROP TABLE IF EXISTS aircraft")
    await connection.query("DROP TABLE IF EXISTS airlines")
    await connection.query("DROP TABLE IF EXISTS cities")
    await connection.query("DROP TABLE IF EXISTS airports")
    await connection.query("DROP TABLE IF EXISTS users")
    await connection.query("SET FOREIGN_KEY_CHECKS = 1")

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

    // 5b. Airlines Table (AirLabs Sync Target)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS airlines (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        iata_code VARCHAR(10) NULL,
        iata_prefix VARCHAR(10) NULL,
        iata_accounting VARCHAR(10) NULL,
        icao_code VARCHAR(10) NULL,
        callsign VARCHAR(50) NULL,
        country_code VARCHAR(10) NULL,
        iosa_registered TINYINT(1) NULL DEFAULT 0,
        is_scheduled TINYINT(1) NULL DEFAULT 0,
        is_passenger TINYINT(1) NULL DEFAULT 0,
        is_cargo TINYINT(1) NULL DEFAULT 0,
        is_international TINYINT(1) NULL DEFAULT 0,
        total_aircrafts INT NULL DEFAULT 0,
        average_fleet_age DECIMAL(4, 1) NULL,
        accidents_last_5y INT NULL DEFAULT 0,
        crashes_last_5y INT NULL DEFAULT 0,
        website VARCHAR(255) NULL,
        facebook VARCHAR(255) NULL,
        twitter VARCHAR(255) NULL,
        instagram VARCHAR(255) NULL,
        linkedin VARCHAR(255) NULL,
        slug VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_iata (iata_code),
        INDEX idx_icao (icao_code),
        INDEX idx_country (country_code),
        INDEX idx_slug (slug)
      )
    `)
    console.log("✓ created 'airports', 'cities', and 'airlines' tables")

    await connection.query(`
      CREATE TABLE IF NOT EXISTS aircraft (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hex VARCHAR(10) NULL,
        reg_number VARCHAR(20) NULL,
        flag VARCHAR(10) NULL,
        airline_icao VARCHAR(10) NULL,
        airline_iata VARCHAR(10) NULL,
        seen INT NULL,
        icao VARCHAR(10) NULL,
        iata VARCHAR(10) NULL,
        model VARCHAR(255) NULL,
        engine VARCHAR(20) NULL,
        engine_count VARCHAR(10) NULL,
        manufacturer VARCHAR(100) NULL,
        type VARCHAR(50) NULL,
        category VARCHAR(10) NULL,
        built INT NULL,
        age INT NULL,
        msn VARCHAR(50) NULL,
        line VARCHAR(50) NULL,
        lat DECIMAL(10, 6) NULL,
        lng DECIMAL(10, 6) NULL,
        alt INT NULL,
        dir INT NULL,
        speed INT NULL,
        v_speed INT NULL,
        squawk VARCHAR(10) NULL,
        last_seen TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_hex (hex),
        INDEX idx_reg_number (reg_number),
        INDEX idx_airline_iata (airline_iata),
        INDEX idx_airline_icao (airline_icao),
        INDEX idx_icao_type (icao),
        INDEX idx_manufacturer (manufacturer),
        INDEX idx_flag (flag),
        INDEX idx_last_seen (last_seen)
      )
    `)
    console.log("✓ created 'aircraft' table")

    // 6. Bookings Tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_reference VARCHAR(32) UNIQUE NOT NULL,
        user_id INT NOT NULL,
        flight_id INT NULL,
        origin_code VARCHAR(10) NOT NULL,
        destination_code VARCHAR(10) NOT NULL,
        departure_date VARCHAR(30) NOT NULL,
        return_date VARCHAR(30) NULL,
        cabin_class VARCHAR(50) NOT NULL DEFAULT 'economy',
        total_amount DECIMAL(15, 2) NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'BDT',
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

    await connection.query(`
      CREATE TABLE IF NOT EXISTS flights (
        id INT AUTO_INCREMENT PRIMARY KEY,
        flight_number VARCHAR(20) NOT NULL,
        airline_id INT NOT NULL,
        origin_airport_id INT NOT NULL,
        destination_airport_id INT NOT NULL,
        aircraft_id INT NULL,
        is_direct TINYINT(1) DEFAULT 1,
        flight_type ENUM('direct', 'connecting', 'multi-city') NOT NULL DEFAULT 'direct',
        layover_cities VARCHAR(255) NULL,
        departure_time DATETIME NOT NULL,
        arrival_time DATETIME NOT NULL,
        price DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        status ENUM('scheduled', 'delayed', 'cancelled', 'landed') NOT NULL DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (airline_id) REFERENCES airlines(id),
        FOREIGN KEY (origin_airport_id) REFERENCES airports(id),
        FOREIGN KEY (destination_airport_id) REFERENCES airports(id),
        FOREIGN KEY (aircraft_id) REFERENCES aircraft(id)
      )
    `)
    console.log("✓ created 'bookings', 'booking_passengers', 'booking_tickets', and 'flights' tables")

    await connection.query(`
      CREATE TABLE IF NOT EXISTS flight_deals (
        flight_id INT PRIMARY KEY,
        tag VARCHAR(50) NOT NULL DEFAULT 'Low fare',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE
      )
    `)
    console.log("✓ created 'flight_deals' table")

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

    // Seed airports
    await connection.query(`
      INSERT IGNORE INTO airports (id, name, iata_code, icao_code, lat, lng, country_code) VALUES
      (1, 'Hartsfield-Jackson Atlanta International Airport', 'ATL', 'KATL', 33.6407, -84.4277, 'US'),
      (2, 'John F Kennedy International Airport', 'JFK', 'KJFK', 40.6398, -73.7789, 'US'),
      (3, 'Los Angeles International Airport', 'LAX', 'KLAX', 33.9416, -118.4085, 'US'),
      (4, 'London Heathrow Airport', 'LHR', 'EGLL', 51.4700, -0.4543, 'GB'),
      (5, 'Hazrat Shahjalal International Airport', 'DAC', 'VGHS', 23.8433, 90.3978, 'BD')
    `)
    console.log("✓ seeded initial airports (ATL, JFK, LAX, LHR, DAC)")

    // Seed airlines
    await connection.query(`
      INSERT IGNORE INTO airlines (id, name, iata_code, icao_code, country_code) VALUES
      (1, 'Delta Air Lines', 'DL', 'DAL', 'US'),
      (2, 'Biman Bangladesh Airlines', 'BG', 'BBC', 'BD'),
      (3, 'US-Bangla Airlines', 'BS', 'UBG', 'BD')
    `)
    console.log("✓ seeded initial airlines (Delta, Biman, US-Bangla)")

    // Seed aircraft
    await connection.query(`
      INSERT IGNORE INTO aircraft (id, model, iata, icao, reg_number, flag, airline_iata) VALUES
      (1, 'Boeing 737-800', '73H', 'B738', 'S2-AHV', 'BD', 'BG')
    `)
    console.log("✓ seeded initial aircraft (Boeing 737-800)")

    // Seed flights (departure 2, 3, 4 days from now + today's date)
    const formatMySQLDate = (d: Date) => d.toISOString().slice(0, 19).replace('T', ' ')
    const now = new Date()
    
    const dep1 = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
    const arr1 = new Date(dep1.getTime() + 2.5 * 60 * 60 * 1000)
    
    const dep2 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    const arr2 = new Date(dep2.getTime() + 4 * 60 * 60 * 1000)

    const dep3 = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000)
    const arr3 = new Date(dep3.getTime() + 7 * 60 * 60 * 1000)

    // Today's flights
    const depToday1 = new Date(now.getTime() + 3 * 60 * 60 * 1000)
    const arrToday1 = new Date(depToday1.getTime() + 1.5 * 60 * 60 * 1000)

    const depToday2 = new Date(now.getTime() + 6 * 60 * 60 * 1000)
    const arrToday2 = new Date(depToday2.getTime() + 2.5 * 60 * 60 * 1000)

    await connection.query(`
      INSERT IGNORE INTO flights (id, flight_number, airline_id, origin_airport_id, destination_airport_id, aircraft_id, is_direct, flight_type, departure_time, arrival_time, price, status) VALUES
      (1, 'DL 101', 1, 1, 2, 1, 1, 'direct', ?, ?, 9800.00, 'scheduled'),
      (2, 'DL 202', 1, 1, 3, 1, 1, 'direct', ?, ?, 14900.00, 'scheduled'),
      (3, 'DL 303', 1, 2, 4, 1, 1, 'direct', ?, ?, 41200.00, 'scheduled'),
      (4, 'BG 088', 1, 1, 3, 1, 1, 'direct', ?, ?, 6500.00, 'scheduled'),
      (5, 'BG 202', 1, 1, 2, 1, 1, 'direct', ?, ?, 5800.00, 'scheduled')
    `, [
      formatMySQLDate(dep1), formatMySQLDate(arr1),
      formatMySQLDate(dep2), formatMySQLDate(arr2),
      formatMySQLDate(dep3), formatMySQLDate(arr3),
      formatMySQLDate(depToday1), formatMySQLDate(arrToday1),
      formatMySQLDate(depToday2), formatMySQLDate(arrToday2)
    ])
    console.log("✓ seeded initial flights")

    // Seed flight deals
    await connection.query(`
      INSERT IGNORE INTO flight_deals (flight_id, tag) VALUES
      (1, 'Low fare'),
      (2, 'Popular'),
      (3, 'Best deal')
    `)
    console.log("✓ seeded initial flight deals")

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
