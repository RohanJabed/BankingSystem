import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "TRANSFER" | "DEPOSIT" | "WITHDRAWAL" | "LOAN" | "SYSTEM";
  isRead: boolean;
  relatedId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["TRANSFER", "DEPOSIT", "WITHDRAWAL", "LOAN", "SYSTEM"], required: true },
    isRead: { type: Boolean, default: false },
    relatedId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true, collection: "Notifications" }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification: Model<INotificationDocument> =
  mongoose.models.Notification ??
  mongoose.model<INotificationDocument>("Notification", NotificationSchema);

export default Notification;
