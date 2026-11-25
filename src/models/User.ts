import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  dateOfBirth: Date;
  role: "ADMIN" | "STAFF" | "CUSTOMER";
  isActive: boolean;
  isBlocked: boolean;
  transactionPin?: string;
  profileImage?: string;
  failedPinAttempts: number;
  pinLockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, default: "" },
    dateOfBirth: { type: Date },
    role: { type: String, enum: ["ADMIN", "STAFF", "CUSTOMER"], default: "CUSTOMER" },
    isActive: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    transactionPin: { type: String, select: false },
    profileImage: { type: String },
    failedPinAttempts: { type: Number, default: 0 },
    pinLockedUntil: { type: Date },
  },
  { timestamps: true, collection: "Users" }
);

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

const User: Model<IUserDocument> =
  mongoose.models.User ?? mongoose.model<IUserDocument>("User", UserSchema);

export default User;
