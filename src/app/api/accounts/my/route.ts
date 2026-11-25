import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Account from "@/models/Account";
import { requireAuth, handleAuthError } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await requireAuth();
    await connectDB();
    const accounts = await Account.find({ userId: session.user.id }).lean();
    return NextResponse.json({ success: true, data: accounts });
  } catch (e) {
    return handleAuthError(e);
  }
}
