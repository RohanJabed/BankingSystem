import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Notification from "@/models/Notification";
import { requireAuth, handleAuthError } from "@/lib/auth/session";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    await connectDB();

    const notif = await Notification.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { isRead: true }
    );
    if (!notif) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (e) {
    return handleAuthError(e);
  }
}
