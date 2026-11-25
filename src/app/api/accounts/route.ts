import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Account from "@/models/Account";
import { requireAuth, handleAuthError } from "@/lib/auth/session";
import { generateAccountNumber } from "@/lib/utils/index";
import { createAccountSchema } from "@/lib/validations/account";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    await connectDB();

    const accounts = await Account.find({ userId: session.user.id }).lean();
    return NextResponse.json({ success: true, data: accounts });
  } catch (e) {
    return handleAuthError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    await connectDB();

    const body = await req.json();

    // Staff/Admin can create for any user; customer cannot create their own
    if (session.user.role === "CUSTOMER") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const parsed = createAccountSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const accountNumber = generateAccountNumber();
    const account = await Account.create({
      accountNumber,
      accountType: parsed.data.accountType,
      userId: parsed.data.userId,
    });

    return NextResponse.json({ success: true, data: account }, { status: 201 });
  } catch (e) {
    return handleAuthError(e);
  }
}
