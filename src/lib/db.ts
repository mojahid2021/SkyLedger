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
    const [rows] = await connectionPool.query(sql, params)
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
      await p.query(`ALTER TABLE accounts ADD COLUMN user_id INT UNIQUE NULL AFTER id;`)
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

    // Create airports table
    await p.execute(`
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
      );
    `)

    // Create cities table
    await p.execute(`
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
      );
    `)

    // Create airlines table
    await p.execute(`
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
      );
    `)

    // Create aircraft table
    await p.execute(`
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
        age DECIMAL(5,1) NULL,
        msn VARCHAR(30) NULL,
        line VARCHAR(30) NULL,
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
        INDEX idx_reg_number (reg_number),
        INDEX idx_model (model),
        INDEX idx_manufacturer (manufacturer),
        INDEX idx_airline_iata (airline_iata)
      );
    `)

    // Create flights table
    await p.execute(`
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
      );
    `)

    // Create flight_deals table
    await p.execute(`
      CREATE TABLE IF NOT EXISTS flight_deals (
        flight_id INT PRIMARY KEY,
        tag VARCHAR(50) NOT NULL DEFAULT 'Low fare',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE
      );
    `)

    // Create bookings table
    await p.execute(`
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
      );
    `)

    // Create booking_passengers table
    await p.execute(`
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
      );
    `)

    // Create booking_tickets table
    await p.execute(`
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
