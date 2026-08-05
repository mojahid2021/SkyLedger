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

-- 2. Ledger Accounts Table (Numerical ID)
CREATE TABLE IF NOT EXISTS accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code INT NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  type ENUM('Asset', 'Liability', 'Equity', 'Revenue', 'Expense') NOT NULL,
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
