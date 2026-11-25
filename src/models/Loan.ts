import mongoose, { Schema, Document, Model } from "mongoose";

const RepaymentScheduleSchema = new Schema(
  {
    dueDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    transactionId: { type: Schema.Types.ObjectId, ref: "Transaction" },
  },
  { _id: true }
);

export interface ILoanDocument extends Document {
  userId: mongoose.Types.ObjectId;
  accountId: mongoose.Types.ObjectId;
  loanType: "PERSONAL" | "BUSINESS" | "MORTGAGE" | "AUTO" | "EDUCATION";
  requestedAmount: number;
  approvedAmount?: number;
  interestRate: number;
  durationMonths: number;
  monthlyIncome: number;
  employmentStatus: "EMPLOYED" | "SELF_EMPLOYED" | "UNEMPLOYED" | "RETIRED" | "STUDENT";
  description: string;
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "ACTIVE" | "COMPLETED";
  reviewedBy?: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  disbursedAt?: Date;
  notes?: string;
  repaymentSchedule: Array<{
    _id: mongoose.Types.ObjectId;
    dueDate: Date;
    amount: number;
    isPaid: boolean;
    paidAt?: Date;
    transactionId?: mongoose.Types.ObjectId;
  }>;
  outstandingBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

const LoanSchema = new Schema<ILoanDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    loanType: {
      type: String,
      enum: ["PERSONAL", "BUSINESS", "MORTGAGE", "AUTO", "EDUCATION"],
      required: true,
    },
    requestedAmount: { type: Number, required: true, min: 1 },
    approvedAmount: { type: Number },
    interestRate: { type: Number, default: 12 },
    durationMonths: { type: Number, required: true, min: 1 },
    monthlyIncome: { type: Number, required: true },
    employmentStatus: {
      type: String,
      enum: ["EMPLOYED", "SELF_EMPLOYED", "UNEMPLOYED", "RETIRED", "STUDENT"],
      required: true,
    },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "ACTIVE", "COMPLETED"],
      default: "PENDING",
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    disbursedAt: { type: Date },
    notes: { type: String },
    repaymentSchedule: [RepaymentScheduleSchema],
    outstandingBalance: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "Loan" }
);

LoanSchema.index({ userId: 1, status: 1 });
LoanSchema.index({ status: 1 });

const Loan: Model<ILoanDocument> =
  mongoose.models.Loan ?? mongoose.model<ILoanDocument>("Loan", LoanSchema);

export default Loan;
