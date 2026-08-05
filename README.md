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
