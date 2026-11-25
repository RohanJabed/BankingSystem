import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Account from "@/models/Account";
import { requireAuth, handleAuthError } from "@/lib/auth/session";
import { updateAccountSchema } from "@/lib/validations/account";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    await connectDB();

    const account = await Account.findById(id).populate("userId", "firstName lastName email").lean();
    if (!account) return NextResponse.json({ success: false, error: "Account not found" }, { status: 404 });

    // Customers can only view their own accounts
    if (session.user.role === "CUSTOMER" && account.userId.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: account });
  } catch (e) {
    return handleAuthError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    if (session.user.role === "CUSTOMER") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateAccountSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    await connectDB();
    const account = await Account.findByIdAndUpdate(id, parsed.data, { new: true });
    if (!account) return NextResponse.json({ success: false, error: "Account not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: account });
  } catch (e) {
    return handleAuthError(e);
  }
}
