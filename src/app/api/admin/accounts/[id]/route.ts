import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Account from "@/models/Account";
import { requireRole, handleAuthError } from "@/lib/auth/session";
import { updateAccountSchema } from "@/lib/validations/account";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const { id } = await params;
    await connectDB();

    const account = await Account.findById(id).populate("userId", "firstName lastName email phone").lean();
    if (!account) return NextResponse.json({ success: false, error: "Account not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: account });
  } catch (e) {
    return handleAuthError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await params;
    const body = await req.json();
    const parsed = updateAccountSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();
    const account = await Account.findByIdAndUpdate(id, parsed.data, { new: true });
    if (!account) return NextResponse.json({ success: false, error: "Account not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: account });
  } catch (e) {
    return handleAuthError(e);
  }
}
