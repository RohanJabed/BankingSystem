import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Notification from "@/models/Notification";
import { requireAuth, handleAuthError } from "@/lib/auth/session";

export async function PATCH() {
  try {
    const session = await requireAuth();
    await connectDB();
    await Notification.updateMany({ userId: session.user.id, isRead: false }, { isRead: true });
    return NextResponse.json({ success: true });
  } catch (e) {
    return handleAuthError(e);
  }
}
