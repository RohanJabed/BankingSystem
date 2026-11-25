import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDepositDocument extends Document {
  userId: mongoose.Types.ObjectId;
  accountId: mongoose.Types.ObjectId;
  amount: number;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedBy?: mongoose.Types.ObjectId;
  reviewNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DepositSchema = new Schema<IDepositDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    amount: { type: Number, required: true, min: 1 },
    description: { type: String, default: "" },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewNote: { type: String },
  },
  { timestamps: true, collection: "Deposit and withdrawal" }
);

DepositSchema.index({ userId: 1, status: 1 });
DepositSchema.index({ status: 1 });

const Deposit: Model<IDepositDocument> =
  mongoose.models.Deposit ?? mongoose.model<IDepositDocument>("Deposit", DepositSchema);

export default Deposit;
