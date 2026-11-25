import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import Account from "@/models/Account";
import { requireAuth, requireRole, handleAuthError } from "@/lib/auth/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    if (session.user.role === "CUSTOMER" && session.user.id !== id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const user = await User.findById(id).lean();
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    const accounts = await Account.find({ userId: id }).lean();

    return NextResponse.json({ success: true, data: { ...user, accounts } });
  } catch (e) {
    return handleAuthError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    await connectDB();

    if (session.user.role === "CUSTOMER") {
      if (session.user.id !== id) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      // Customers can only update their own profile fields
      const { firstName, lastName, phone, address } = body;
      const user = await User.findByIdAndUpdate(id, { firstName, lastName, phone, address }, { new: true });
      return NextResponse.json({ success: true, data: user });
    }

    // Admin/Staff can update more fields
    await requireRole(["ADMIN", "STAFF"]);
    const { isActive, isBlocked, ...rest } = body;
    const user = await User.findByIdAndUpdate(id, { isActive, isBlocked, ...rest }, { new: true });
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: user });
  } catch (e) {
    return handleAuthError(e);
  }
}
