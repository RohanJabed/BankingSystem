import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBankingSettingsDocument extends Document {
  defaultDailyTransferLimit: number;
  defaultMaxSingleTransaction: number;
  defaultMinimumBalance: number;
  loanInterestRate: number;
  transactionFeePercent: number;
  updatedBy?: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const BankingSettingsSchema = new Schema<IBankingSettingsDocument>(
  {
    defaultDailyTransferLimit: { type: Number, default: 500000 },
    defaultMaxSingleTransaction: { type: Number, default: 200000 },
    defaultMinimumBalance: { type: Number, default: 1000 },
    loanInterestRate: { type: Number, default: 12 },
    transactionFeePercent: { type: Number, default: 0.5 },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, collection: "BankingSettings" }
);

const BankingSettings: Model<IBankingSettingsDocument> =
  mongoose.models.BankingSettings ??
  mongoose.model<IBankingSettingsDocument>("BankingSettings", BankingSettingsSchema);

export default BankingSettings;
