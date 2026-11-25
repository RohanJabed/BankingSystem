import mongoose from "mongoose";
import argon2 from "argon2";
import { v4 as uuidv4 } from "uuid";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://banking:OwznP2aa4Av9V8sP@cluster0.vyryoss.mongodb.net/bankingsystem?retryWrites=true&w=majority";

const UserSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    phone: String,
    address: String,
    dateOfBirth: Date,
    role: { type: String, default: "CUSTOMER" },
    isActive: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    transactionPin: String,
    failedPinAttempts: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "Users" }
);

const AccountSchema = new mongoose.Schema(
  {
    accountNumber: { type: String, unique: true },
    accountType: String,
    status: { type: String, default: "ACTIVE" },
    balance: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    dailyTransferLimit: { type: Number, default: 500000 },
    maxSingleTransactionAmount: { type: Number, default: 200000 },
    minimumBalance: { type: Number, default: 1000 },
    currency: { type: String, default: "USD" },
  },
  { timestamps: true, collection: "Accounts" }
);

const TransactionSchema = new mongoose.Schema(
  {
    transactionRef: { type: String, unique: true },
    type: String,
    status: { type: String, default: "COMPLETED" },
    amount: Number,
    fee: { type: Number, default: 0 },
    senderAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    receiverAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    description: String,
    isFlagged: { type: Boolean, default: false },
    flagReason: String,
  },
  { timestamps: true, collection: "Transactions" }
);

const LoanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    loanType: String,
    requestedAmount: Number,
    approvedAmount: Number,
    interestRate: { type: Number, default: 12 },
    durationMonths: Number,
    monthlyIncome: Number,
    employmentStatus: String,
    description: String,
    status: { type: String, default: "PENDING" },
    outstandingBalance: { type: Number, default: 0 },
    repaymentSchedule: { type: [], default: [] },
  },
  { timestamps: true, collection: "Loan" }
);

const DepositSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    amount: Number,
    description: String,
    status: { type: String, default: "PENDING" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewNote: String,
  },
  { timestamps: true, collection: "Deposit and withdrawal" }
);

const WithdrawalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    amount: Number,
    description: String,
    status: { type: String, default: "PENDING" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewNote: String,
  },
  { timestamps: true, collection: "Withdrawal" }
);

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: String,
    message: String,
    type: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "Notifications" }
);

const BankingSettingsSchema = new mongoose.Schema(
  {
    defaultDailyTransferLimit: { type: Number, default: 500000 },
    defaultMaxSingleTransaction: { type: Number, default: 200000 },
    defaultMinimumBalance: { type: Number, default: 1000 },
    loanInterestRate: { type: Number, default: 12 },
    transactionFeePercent: { type: Number, default: 0.5 },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, collection: "BankingSettings" }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Account = mongoose.models.Account || mongoose.model("Account", AccountSchema);
const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
const Loan = mongoose.models.Loan || mongoose.model("Loan", LoanSchema);
const Deposit = mongoose.models.Deposit || mongoose.model("Deposit", DepositSchema);
const Withdrawal = mongoose.models.Withdrawal || mongoose.model("Withdrawal", WithdrawalSchema);
const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
const BankingSettings = mongoose.models.BankingSettings || mongoose.model("BankingSettings", BankingSettingsSchema);

function accNum() {
  return `ACC${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
}
function txnRef() {
  return `TXN${uuidv4().replace(/-/g, "").toUpperCase().slice(0, 16)}`;
}

async function seed() {
  await mongoose.connect(MONGODB_URI, { dbName: "bankingsystem" });
  console.log("✅ Connected to MongoDB");

  await Promise.all([
    User.deleteMany({}),
    Account.deleteMany({}),
    Transaction.deleteMany({}),
    Loan.deleteMany({}),
    Deposit.deleteMany({}),
    Withdrawal.deleteMany({}),
    Notification.deleteMany({}),
    BankingSettings.deleteMany({}),
  ]);
  console.log("🗑️  Cleared existing data");

  const [adminPass, staffPass, custPass, pin] = await Promise.all([
    argon2.hash("Admin@123"),
    argon2.hash("Staff@123"),
    argon2.hash("Customer@123"),
    argon2.hash("1234"),
  ]);

  const [admin, staff, c1, c2, c3] = await User.insertMany([
    {
      firstName: "Super", lastName: "Admin",
      email: "admin@bank.com", password: adminPass,
      phone: "+1-555-0001", address: "123 Admin St, New York, NY",
      dateOfBirth: new Date("1980-01-15"), role: "ADMIN",
    },
    {
      firstName: "John", lastName: "Staff",
      email: "staff@bank.com", password: staffPass,
      phone: "+1-555-0002", address: "456 Staff Ave, New York, NY",
      dateOfBirth: new Date("1990-05-20"), role: "STAFF",
    },
    {
      firstName: "Alice", lastName: "Johnson",
      email: "alice@example.com", password: custPass,
      phone: "+1-555-0101", address: "789 Oak Lane, Brooklyn, NY",
      dateOfBirth: new Date("1992-03-10"), role: "CUSTOMER", transactionPin: pin,
    },
    {
      firstName: "Bob", lastName: "Smith",
      email: "bob@example.com", password: custPass,
      phone: "+1-555-0102", address: "321 Maple Dr, Queens, NY",
      dateOfBirth: new Date("1988-07-22"), role: "CUSTOMER", transactionPin: pin,
    },
    {
      firstName: "Carol", lastName: "Williams",
      email: "carol@example.com", password: custPass,
      phone: "+1-555-0103", address: "654 Pine Rd, Bronx, NY",
      dateOfBirth: new Date("1995-11-05"), role: "CUSTOMER", transactionPin: pin,
    },
  ]);
  console.log("👥 Users created");

  const [a1, a2, a3, a4, a5] = await Account.insertMany([
    { accountNumber: accNum(), accountType: "SAVINGS",  balance: 500000,  userId: c1._id },
    { accountNumber: accNum(), accountType: "CURRENT",  balance: 250000,  userId: c1._id },
    { accountNumber: accNum(), accountType: "SAVINGS",  balance: 750000,  userId: c2._id },
    { accountNumber: accNum(), accountType: "BUSINESS", balance: 1200000, userId: c2._id },
    { accountNumber: accNum(), accountType: "SAVINGS",  balance: 100000,  userId: c3._id },
  ]);
  console.log("🏦 Accounts created");

  await Transaction.insertMany([
    {
      transactionRef: txnRef(), type: "TRANSFER", status: "COMPLETED",
      amount: 50000, fee: 250,
      senderAccountId: a1._id, receiverAccountId: a3._id,
      description: "Rent payment",
    },
    {
      transactionRef: txnRef(), type: "TRANSFER", status: "COMPLETED",
      amount: 25000, fee: 125,
      senderAccountId: a3._id, receiverAccountId: a5._id,
      description: "Freelance payment",
    },
    {
      transactionRef: txnRef(), type: "DEPOSIT", status: "COMPLETED",
      amount: 100000, receiverAccountId: a1._id,
      description: "Cash deposit",
    },
    {
      transactionRef: txnRef(), type: "WITHDRAWAL", status: "COMPLETED",
      amount: 30000, senderAccountId: a2._id,
      description: "ATM withdrawal",
    },
    {
      transactionRef: txnRef(), type: "TRANSFER", status: "COMPLETED",
      amount: 400000, fee: 2000,
      senderAccountId: a4._id, receiverAccountId: a1._id,
      description: "Large transfer",
      isFlagged: true, flagReason: "Suspicious transfer pattern detected",
    },
    {
      transactionRef: txnRef(), type: "LOAN_DISBURSEMENT", status: "COMPLETED",
      amount: 500000, receiverAccountId: a5._id,
      description: "Personal loan disbursement",
    },
  ]);
  console.log("💸 Transactions created");

  await Loan.insertMany([
    {
      userId: c1._id, accountId: a1._id,
      loanType: "PERSONAL", requestedAmount: 500000, approvedAmount: 500000,
      interestRate: 12, durationMonths: 12, monthlyIncome: 200000,
      employmentStatus: "EMPLOYED", description: "Home renovation",
      status: "ACTIVE", outstandingBalance: 450000,
    },
    {
      userId: c2._id, accountId: a3._id,
      loanType: "BUSINESS", requestedAmount: 2000000,
      interestRate: 10, durationMonths: 24, monthlyIncome: 500000,
      employmentStatus: "SELF_EMPLOYED", description: "Business expansion",
      status: "PENDING", outstandingBalance: 0,
    },
    {
      userId: c3._id, accountId: a5._id,
      loanType: "EDUCATION", requestedAmount: 300000, approvedAmount: 300000,
      interestRate: 8, durationMonths: 36, monthlyIncome: 80000,
      employmentStatus: "STUDENT", description: "University tuition",
      status: "APPROVED", outstandingBalance: 300000,
    },
  ]);
  console.log("💰 Loans created");

  await Deposit.insertMany([
    {
      userId: c1._id, accountId: a1._id,
      amount: 200000, description: "Salary deposit", status: "PENDING",
    },
    {
      userId: c2._id, accountId: a3._id,
      amount: 500000, description: "Business revenue", status: "APPROVED",
      reviewedBy: admin._id, reviewNote: "Verified",
    },
  ]);
  console.log("📥 Deposits created");

  await Withdrawal.insertMany([
    {
      userId: c1._id, accountId: a2._id,
      amount: 50000, description: "Personal expenses", status: "PENDING",
    },
    {
      userId: c3._id, accountId: a5._id,
      amount: 20000, description: "Utility bills", status: "APPROVED",
      reviewedBy: staff._id, reviewNote: "Approved",
    },
  ]);
  console.log("📤 Withdrawals created");

  await Notification.insertMany([
    {
      userId: c1._id, title: "Transfer Sent",
      message: "You sent $500.00. Ref: TXN001", type: "TRANSFER", isRead: false,
    },
    {
      userId: c1._id, title: "Loan Approved",
      message: "Your personal loan of $5,000.00 has been approved.", type: "LOAN", isRead: true,
    },
    {
      userId: c2._id, title: "Money Received",
      message: "You received $500.00. Ref: TXN001", type: "TRANSFER", isRead: false,
    },
    {
      userId: c3._id, title: "Deposit Pending",
      message: "Your deposit request of $200.00 is under review.", type: "DEPOSIT", isRead: false,
    },
  ]);
  console.log("🔔 Notifications created");

  await BankingSettings.create({
    defaultDailyTransferLimit: 500000,
    defaultMaxSingleTransaction: 200000,
    defaultMinimumBalance: 1000,
    loanInterestRate: 12,
    transactionFeePercent: 0.5,
    updatedBy: admin._id,
  });
  console.log("⚙️  Banking settings created");

  console.log("\n✅ Seed completed!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Demo Credentials:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Admin    → admin@bank.com    / Admin@123");
  console.log("Staff    → staff@bank.com    / Staff@123");
  console.log("Customer → alice@example.com / Customer@123");
  console.log("Customer → bob@example.com   / Customer@123");
  console.log("Customer → carol@example.com / Customer@123");
  console.log("Transaction PIN: 1234");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
