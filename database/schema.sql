-- SkyLedger Database Schema for MySQL (Numerical IDs Everywhere)
-- Database Name: skyledger_db

CREATE DATABASE IF NOT EXISTS skyledger_db;
USE skyledger_db;

-- 1. Users Table (Numerical ID, First Name, Last Name, Email, Phone, DOB, Password)
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

-- 2. Ledger Accounts Table (Numerical ID & Linked User ID)
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

-- 3. Transactions Table (Numerical ID & Numerical Foreign Key)
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
);

-- 4. Audit Logs Table (Numerical ID)
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event VARCHAR(255) NOT NULL,
  actor VARCHAR(150) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Airports Table (AirLabs Sync Target)
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

-- Seed Admin Login (inserted only if not already present)
INSERT IGNORE INTO users (first_name, last_name, email, phone, date_of_birth, password_hash, role)
VALUES
('Alexander', 'Vance', 'admin@skyledger.io', '+1 (404) 555-0101', '1985-03-14', 'admin123', 'admin');

-- 5. Trigger: Automatically Create User Wallet Account on User Registration
DROP TRIGGER IF EXISTS after_user_insert;

DELIMITER //
CREATE TRIGGER after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
  INSERT INTO accounts (user_id, code, name, type, balance)
  VALUES (NEW.id, 1000 + NEW.id, CONCAT(NEW.first_name, ' ', NEW.last_name, ' Wallet'), 'Asset', 0.00);
END;
//
DELIMITER ;

-- Ensure all existing users have a wallet account
INSERT IGNORE INTO accounts (user_id, code, name, type, balance)
SELECT id, 1000 + id, CONCAT(first_name, ' ', last_name, ' Wallet'), 'Asset', 0.00
FROM users
WHERE id NOT IN (SELECT user_id FROM accounts WHERE user_id IS NOT NULL);
