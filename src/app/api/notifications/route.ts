import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Notification from "@/models/Notification";
import { requireAuth, handleAuthError } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await requireAuth();
    await connectDB();

    const notifications = await Notification.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({ userId: session.user.id, isRead: false });

    return NextResponse.json({ success: true, data: { notifications, unreadCount } });
  } catch (e) {
    return handleAuthError(e);
  }
}
