import Notification from "@/models/Notification";
import mongoose from "mongoose";

type NotifType = "TRANSFER" | "DEPOSIT" | "WITHDRAWAL" | "LOAN" | "SYSTEM";

export async function createNotification(
  userId: string | mongoose.Types.ObjectId,
  title: string,
  message: string,
  type: NotifType,
  relatedId?: string | mongoose.Types.ObjectId,
  session?: mongoose.ClientSession
) {
  await Notification.create(
    [{ userId, title, message, type, relatedId }],
    session ? { session } : {}
  );
}
