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
  multipleStatements: true
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
        segment_type ENUM('outbound', 'return') NOT NULL,
        flight_number VARCHAR(10) NOT NULL,
        airline_code VARCHAR(10) NOT NULL,
        airline_name VARCHAR(100) NOT NULL,
        seat_designator VARCHAR(10) NULL,
        seat_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        ticket_number VARCHAR(20) UNIQUE NOT NULL,
        status ENUM('active', 'used', 'cancelled', 'refunded') NOT NULL DEFAULT 'active',
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
        layover_cities JSON NULL,
        departure_time DATETIME NOT NULL,
        arrival_time DATETIME NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        tax_percentage DECIMAL(5, 2) DEFAULT 0.00,
        seat_selection_fee DECIMAL(10, 2) DEFAULT 0.00,
        total_seats INT NOT NULL DEFAULT 180,
        status ENUM('scheduled', 'delayed', 'cancelled', 'landed') NOT NULL DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (airline_id) REFERENCES airlines(id),
        FOREIGN KEY (origin_airport_id) REFERENCES airports(id),
        FOREIGN KEY (destination_airport_id) REFERENCES airports(id),
        FOREIGN KEY (aircraft_id) REFERENCES aircraft(id)
      )
    `)
    console.log("✓ created 'bookings', 'booking_passengers', 'booking_tickets', and 'flights' tables")

    // Authentic Data Types Injection via ALTER TABLE
    console.log("\\nExecuting Authentic DDL Migrations (ALTER TABLE)...")
    try {
      await connection.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar BLOB NULL")
      await connection.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences SET('sms', 'email', 'push') DEFAULT 'email'")
      await connection.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_points MEDIUMINT DEFAULT 0")
      await connection.query("ALTER TABLE aircraft MODIFY COLUMN built YEAR NULL")
      await connection.query("ALTER TABLE airlines MODIFY COLUMN is_passenger TINYINT(1) DEFAULT 0")
      await connection.query("ALTER TABLE airports MODIFY COLUMN lat DOUBLE NULL")
      await connection.query("ALTER TABLE airports MODIFY COLUMN lng DOUBLE NULL")
      await connection.query("ALTER TABLE flights ADD COLUMN IF NOT EXISTS flight_description TEXT NULL")
      try {
        await connection.query("ALTER TABLE flight_deals DROP COLUMN image_url")
      } catch (e) { /* ignore if doesn't exist */ }
      await connection.query("ALTER TABLE flight_deals ADD COLUMN IF NOT EXISTS image_file_name VARCHAR(500) NULL")
      console.log("✓ Applied advanced data types to live tables successfully")
    } catch (e) {
      console.log("⚠ Error applying ALTER TABLE:", e)
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS flight_deals (
        flight_id INT PRIMARY KEY,
        tag VARCHAR(50) NOT NULL DEFAULT 'Low fare',
        image_file_name VARCHAR(500) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE
      )
    `)
    console.log("✓ created 'flight_deals' table")

    console.log("\\nConfiguring Triggers...")
    
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

    await connection.query("DROP TRIGGER IF EXISTS after_booking_update")
    await connection.query(`
      CREATE TRIGGER after_booking_update
      AFTER UPDATE ON bookings
      FOR EACH ROW
      BEGIN
        -- Prevent un-canceling a cancelled booking using SIGNAL SQLSTATE
        IF OLD.status = 'cancelled' AND NEW.status != 'cancelled' THEN
          SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Cannot un-cancel a previously cancelled booking.';
        END IF;

        -- Audit log for cancellations
        IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
          INSERT INTO audit_logs (event, actor, ip_address, status)
          VALUES (CONCAT('Booking Cancelled: ', NEW.booking_reference), 'System', '127.0.0.1', 'success');
        END IF;
      END;
    `)
    console.log("✓ created authentic triggers ('after_user_insert', 'after_booking_update')")

    console.log("\\nCreating Views...")
    await connection.query("DROP VIEW IF EXISTS v_flight_search_optimized")
    await connection.query(`
      CREATE VIEW v_flight_search_optimized AS
      SELECT 
        f.id,
        f.flight_number,
        f.price,
        f.departure_time,
        f.arrival_time,
        f.status,
        f.origin_airport_id,
        f.destination_airport_id,
        f.tax_percentage,
        f.seat_selection_fee,
        a.name as airline_name,
        a.iata_code as airline_iata,
        orig.name as origin_name,
        orig.iata_code as origin_iata,
        dest.name as destination_name,
        dest.iata_code as destination_iata,
        ac.model as aircraft_model,
        ac.iata as aircraft_iata
      FROM flights f
      INNER JOIN airlines a ON f.airline_id = a.id
      INNER JOIN airports orig ON f.origin_airport_id = orig.id
      INNER JOIN airports dest ON f.destination_airport_id = dest.id
      LEFT JOIN aircraft ac ON f.aircraft_id = ac.id
    `)
    console.log("✓ created 'v_flight_search_optimized' View")

    console.log("\\nSeeding Initial Data...")

    // Admin seed
    await connection.query(`
      INSERT IGNORE INTO users (first_name, last_name, email, phone, date_of_birth, password_hash, role)
      VALUES
      ('Md', 'Mojahid', 'aammojahid@gmail.com', '+8801736345525', '1985-03-14', 'admin123', 'admin')
    `)
    console.log("✓ seeded Admin user (aammojahid@gmail.com)")

    // Seed airports (Removed demo data)
    // Seed airlines (Removed demo data)
    // Seed aircraft (Removed demo data)
    // Seed flights (Removed demo data)
    // Seed flight deals (Removed demo data)

    // Clean up empty wallets for existing users (in case trigger missed any pre-existing)
    await connection.query(`
      INSERT IGNORE INTO accounts (user_id, code, name, type, balance)
      SELECT id, 1000 + id, CONCAT(first_name, ' ', last_name, ' Wallet'), 'Asset', 0.00
      FROM users
      WHERE id NOT IN (SELECT user_id FROM accounts WHERE user_id IS NOT NULL);
    `)

    console.log("\\nCreating Stored Procedures...")
    await connection.query("DROP PROCEDURE IF EXISTS GetUserProfile;")

    const procedure = `
    CREATE PROCEDURE GetUserProfile(IN p_userId INT)
    BEGIN
      SELECT JSON_OBJECT(
        'user', (
           SELECT JSON_OBJECT('id', id, 'first_name', first_name, 'last_name', last_name, 'email', email, 'phone', phone, 'role', role, 'date_of_birth', date_of_birth, 'created_at', created_at)
           FROM users WHERE id = p_userId
        ),
        'account', (
           SELECT JSON_OBJECT('id', id, 'balance', balance, 'code', code)
           FROM accounts WHERE user_id = p_userId LIMIT 1
        ),
        'transactions', (
           SELECT COALESCE(
             (SELECT JSON_ARRAYAGG(
               JSON_OBJECT('id', id, 'reference', reference, 'description', description, 'type', type, 'amount', amount, 'status', status, 'date', DATE_FORMAT(transaction_date, '%Y-%m-%d'))
             ) FROM transactions WHERE account_id = (SELECT id FROM accounts WHERE user_id = p_userId LIMIT 1)),
             JSON_ARRAY()
           )
        ),
        'bookings', (
           SELECT COALESCE(
             (SELECT JSON_ARRAYAGG(
               JSON_OBJECT('id', id, 'booking_reference', booking_reference, 'origin_code', origin_code, 'destination_code', destination_code, 'departure_date', departure_date, 'status', status, 'total_amount', total_amount)
             ) FROM bookings WHERE user_id = p_userId),
             JSON_ARRAY()
           )
        )
      ) as aggregateData;
    END;
    `
    await connection.query(procedure)
    
    // Authentic Procedure for Dynamic Pricing
    await connection.query("DROP PROCEDURE IF EXISTS CalculateDynamicPricing;")
    const dynamicPricingProcedure = `
    CREATE PROCEDURE CalculateDynamicPricing(IN p_flight_id INT, IN p_passengers INT, OUT p_final_price DECIMAL(15,2))
    BEGIN
      DECLARE v_base_price DECIMAL(10,2);
      DECLARE v_total_seats INT;
      DECLARE v_booked_seats INT;
      DECLARE v_load_factor DECIMAL(5,2);

      -- Error handling for missing flight
      DECLARE EXIT HANDLER FOR SQLEXCEPTION
      BEGIN
         SET p_final_price = 0.00;
      END;

      SELECT price, total_seats INTO v_base_price, v_total_seats
      FROM flights WHERE id = p_flight_id;

      SELECT COUNT(*) INTO v_booked_seats
      FROM bookings b
      JOIN booking_passengers bp ON b.id = bp.booking_id
      WHERE b.flight_id = p_flight_id AND b.status = 'confirmed';

      SET v_load_factor = v_booked_seats / v_total_seats;

      -- Apply dynamic pricing based on load factor
      IF v_load_factor > 0.80 THEN
         -- 20% markup if flight is mostly full
         SET p_final_price = (v_base_price * 1.20) * p_passengers;
      ELSEIF v_load_factor < 0.30 THEN
         -- 15% discount if flight is very empty
         SET p_final_price = (v_base_price * 0.85) * p_passengers;
      ELSE
         -- Standard price
         SET p_final_price = v_base_price * p_passengers;
      END IF;
    END;
    `
    await connection.query(dynamicPricingProcedure)
    console.log("✓ created 'GetUserProfile' and 'CalculateDynamicPricing' stored procedures")

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
