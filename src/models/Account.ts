import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAccountDocument extends Document {
  accountNumber: string;
  accountType: "SAVINGS" | "CURRENT" | "BUSINESS";
  status: "ACTIVE" | "FROZEN" | "CLOSED";
  balance: number;
  userId: mongoose.Types.ObjectId;
  dailyTransferLimit: number;
  maxSingleTransactionAmount: number;
  minimumBalance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccountDocument>(
  {
    accountNumber: { type: String, required: true, unique: true },
    accountType: { type: String, enum: ["SAVINGS", "CURRENT", "BUSINESS"], required: true },
    status: { type: String, enum: ["ACTIVE", "FROZEN", "CLOSED"], default: "ACTIVE" },
    balance: { type: Number, default: 0, min: 0 },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dailyTransferLimit: { type: Number, default: 500000 },
    maxSingleTransactionAmount: { type: Number, default: 200000 },
    minimumBalance: { type: Number, default: 1000 },
    currency: { type: String, default: "USD" },
  },
  { timestamps: true, collection: "Accounts" }
);

AccountSchema.index({ userId: 1 });
AccountSchema.index({ accountNumber: 1 });
AccountSchema.index({ status: 1 });

const Account: Model<IAccountDocument> =
  mongoose.models.Account ?? mongoose.model<IAccountDocument>("Account", AccountSchema);

export default Account;
