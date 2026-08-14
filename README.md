# SkyLedger - Financial Accounting & Ledger System

Modern cloud-based accounting and ledger system built with **Next.js**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, and **React Tabler Icons**.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Icons**: React Tabler Icons (`@tabler/icons-react`)
- **Database**: MariaDB (latest) via Docker + phpMyAdmin

## 📦 Getting Started

### 1. Start the Database (Docker)

```bash
# Start MariaDB + phpMyAdmin containers
docker compose up -d
```

| Service | URL | Credentials |
|---|---|---|
| phpMyAdmin | http://localhost:8081 | User: `root` / Pass: `rootpassword` |
| MariaDB (host) | localhost:3306 | Database: `skyledger_db` |

### 2. Install dependencies & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3. Database schema

The `database/schema.sql` file is auto-loaded by MariaDB on first container startup. Tables:

- `users` — First Name, Last Name, Email, Phone, Date of Birth, Password, Role
- `accounts` — Ledger accounts (Asset, Liability, Equity, Revenue, Expense)
- `transactions` — Double-entry journal records
- `audit_logs` — Security & audit trail

## 🔐 Auth & Roles

- **Public registration** creates standard `user` accounts only (admins cannot self-register).
- **Login** redirects to role-based dashboards:
  - `/admin/dashboard` — Administrator console
  - `/user/dashboard` — Standard user portal

## 🛠 Docker Commands

```bash
docker compose up -d        # Start database + phpMyAdmin
docker compose down         # Stop containers
docker compose down -v      # Stop & delete volume (reset data)
docker compose logs -f mariadb   # View DB logs
docker exec -it skyledger-mariadb mariadb -uroot -prootpassword skyledger_db   # SQL shell
```

## 🗂 Project Structure

```
src/
├── app/
│   ├── admin/dashboard/    # Admin dashboard
│   ├── user/dashboard/     # User dashboard
│   ├── api/                # API routes (auth, transactions, admin)
│   ├── login/              # Login page
│   └── register/           # Registration page
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── ...                 # App-specific components
├── context/                # Auth context
└── lib/                    # MySQL connection pool & utilities
```

## 🗄 Advanced Database Architecture

SkyLedger employs advanced relational database capabilities directly within MariaDB, demonstrating complex SQL functionality in a real-world application:

### Data Definition (DDL) & Data Types
- **Dynamic Migrations**: `scripts/setup-db.ts` programmatically alters the schema using `ALTER TABLE`, injecting columns dynamically during setup.
- **Complex Types**: The schema uses diverse MySQL data types including `BLOB` (for avatars), `SET` (for preferences), `YEAR`, `DOUBLE` (for geospatial lat/lng), and `TINYINT(1)` boolean flags.

### Views & Query Optimization
- **`v_flight_search_optimized`**: A highly optimized Database View pre-joining `flights`, `airlines`, `airports`, and `aircraft`. The core search API queries this View instead of executing massive multi-table JOINs in the application layer.

### Triggers & Security
- **Data Integrity**: An `AFTER UPDATE` trigger on the `bookings` table manages audit logs. It also utilizes `SIGNAL SQLSTATE` to actively intercept and block invalid state transitions (e.g., preventing a cancelled ticket from being un-cancelled).

### Stored Procedures & Logic
- **Dynamic Pricing**: The checkout API (`/api/flights/offer`) delegates complex markup/discount calculations to the `CalculateDynamicPricing` Stored Procedure. This procedure uses `IN`/`OUT` parameters, `IF/ELSEIF` flow control, and internal Exception Handlers to apply pricing rules natively in MySQL based on the flight's load factor.

### Advanced Relational Queries (DML)
- **UNION ALL**: The global search bar unifies queries across airlines, airports, and cities into a single dataset.
- **Anti-Joins**: Admin dashboards use `LEFT JOIN ... WHERE ... IS NULL` to identify inactive users.
- **HAVING & Aggregates**: Metrics dashboards utilize grouped queries paired with `HAVING`, `MAX()`, and `AVG()` filters to determine "Top Airlines".
- **Correlated Subqueries**: Flight searches utilize correlated subqueries to dynamically detect if a specific flight's price is a "Great Deal" compared to the historical average for that specific route.
- **TCL (`SAVEPOINT`)**: Multi-passenger ticket issuance is guarded by `SAVEPOINT` and `ROLLBACK TO SAVEPOINT`, ensuring robust failure recovery during complex database transactions.
