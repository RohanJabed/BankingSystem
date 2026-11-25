import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import Account from "@/models/Account";
import { requireRole, handleAuthError } from "@/lib/auth/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const { id } = await params;
    await connectDB();

    const user = await User.findById(id).lean();
    if (!user) return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });

    const accounts = await Account.find({ userId: id }).lean();
    return NextResponse.json({ success: true, data: { ...user, accounts } });
  } catch (e) {
    return handleAuthError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await params;
    const body = await req.json();
    await connectDB();

    const allowed = ["isActive", "isBlocked", "firstName", "lastName", "phone", "address"];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }

    const user = await User.findByIdAndUpdate(id, update, { new: true });
    if (!user) return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: user });
  } catch (e) {
    return handleAuthError(e);
  }
}
