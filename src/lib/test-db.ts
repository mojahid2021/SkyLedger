import { query } from "./db.js";

async function run() {
  const users = await query("SELECT COUNT(*) as c FROM users");
  const flights = await query("SELECT COUNT(*) as c FROM flights");
  const bookings = await query("SELECT COUNT(*) as c, SUM(total_amount) as rev FROM bookings");
  const airlines = await query("SELECT COUNT(*) as c FROM airlines");
  console.log(users, flights, bookings, airlines);
  process.exit(0);
}
run();
