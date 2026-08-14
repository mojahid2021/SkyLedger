import * as dotenv from "dotenv"
import { resolve } from "path"
import mysql from "mysql2/promise"

dotenv.config({ path: resolve(process.cwd(), ".env.local") })

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "skyledger_db",
    multipleStatements: true
  })

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
  console.log("Stored Procedure GetUserProfile created!")
  process.exit(0)
}

run()
