import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransactionDocument extends Document {
  transactionRef: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "LOAN_DISBURSEMENT" | "LOAN_REPAYMENT";
  status: "PENDING" | "COMPLETED" | "FAILED" | "REVERSED";
  amount: number;
  fee: number;
  senderAccountId?: mongoose.Types.ObjectId;
  receiverAccountId?: mongoose.Types.ObjectId;
  description: string;
  idempotencyKey?: string;
  isFlagged: boolean;
  flagReason?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransactionDocument>(
  {
    transactionRef: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ["DEPOSIT", "WITHDRAWAL", "TRANSFER", "LOAN_DISBURSEMENT", "LOAN_REPAYMENT"],
      required: true,
    },
    status: { type: String, enum: ["PENDING", "COMPLETED", "FAILED", "REVERSED"], default: "PENDING" },
    amount: { type: Number, required: true, min: 1 },
    fee: { type: Number, default: 0 },
    senderAccountId: { type: Schema.Types.ObjectId, ref: "Account" },
    receiverAccountId: { type: Schema.Types.ObjectId, ref: "Account" },
    description: { type: String, default: "" },
    idempotencyKey: { type: String, sparse: true },
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true, collection: "Transactions" }
);

TransactionSchema.index({ transactionRef: 1 });
TransactionSchema.index({ senderAccountId: 1, createdAt: -1 });
TransactionSchema.index({ receiverAccountId: 1, createdAt: -1 });
TransactionSchema.index({ type: 1, status: 1 });
TransactionSchema.index({ idempotencyKey: 1 }, { sparse: true });

const Transaction: Model<ITransactionDocument> =
  mongoose.models.Transaction ??
  mongoose.model<ITransactionDocument>("Transaction", TransactionSchema);

export default Transaction;
