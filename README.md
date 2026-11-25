# 🏦 Banking System

A full-stack banking management system built with **Next.js 16**, **TypeScript**, **MongoDB**, and **NextAuth v5**. Supports three roles: Admin, Staff, and Customer.

---

## 🚀 Tech Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS v4, Redux Toolkit, Recharts
- **Backend:** Next.js API Routes, MongoDB, Mongoose
- **Auth:** NextAuth v5 (JWT)
- **Validation:** Zod, React Hook Form
- **UI:** Radix UI, Lucide React, Sonner

---

## ⚙️ Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/RohanJabed/BankingSystem.git
cd BankingSystem
npm install --legacy-peer-deps
```

### 2. Environment Variables

Create a `.env.local` file:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_secret_key_min_32_chars
NEXTAUTH_URL=http://localhost:3000
```

### 3. Seed the Database

```bash
npm run seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Demo Credentials

### Admin
| Field    | Value            |
|----------|------------------|
| URL      | /admin           |
| Email    | admin@bank.com   |
| Password | Admin@123        |

### Staff
| Field    | Value            |
|----------|------------------|
| URL      | /staff           |
| Email    | staff@bank.com   |
| Password | Staff@123        |

### Customers
| Name  | Email               | Password     |
|-------|---------------------|--------------|
| Alice | alice@example.com   | Customer@123 |
| Bob   | bob@example.com     | Customer@123 |
| Carol | carol@example.com   | Customer@123 |

> **URL:** `/customer` · **Transaction PIN:** `1234` (for all demo customers)

---

## 📁 Features

### Customer
- Dashboard with account overview
- Multiple accounts (Savings, Current, Business)
- Fund transfers with PIN verification
- Deposit & withdrawal requests
- Transaction history with filters
- Loan application & repayment
- Notifications
- Account statements (CSV export)

### Staff
- Customer registration & management
- Transaction monitoring
- Loan application review

### Admin
- Full dashboard with analytics
- Customer & account management
- Deposit & withdrawal approvals
- Loan management
- Suspicious transaction monitoring
- Banking settings configuration

---

## 🧪 Running Tests

```bash
npm run test
```

---

## 📂 Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, Register
│   ├── (dashboard)/     # Admin, Staff, Customer dashboards
│   ├── (public)/        # Landing, About, Services
│   └── api/             # All API routes
├── components/          # Shared UI components
├── lib/                 # Auth, DB, utils, validations
├── models/              # Mongoose models
├── redux/               # Redux store & RTK Query
└── types/               # TypeScript types
scripts/
└── seed.ts              # Database seed script
```

---

## 🔒 Security Features

- Argon2 password hashing
- Transaction PIN with lockout (5 failed attempts → 30 min lock)
- JWT session management
- Role-based access control (ADMIN / STAFF / CUSTOMER)
- Suspicious transaction detection & flagging
- Idempotency keys for transfers
- Atomic MongoDB transactions

---

## 📜 License

MIT
