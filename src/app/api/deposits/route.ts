import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Deposit from "@/models/Deposit";
import Account from "@/models/Account";
import { requireAuth, handleAuthError } from "@/lib/auth/session";
import { depositRequestSchema } from "@/lib/validations/account";
import { toCents } from "@/lib/utils/index";
import { ITEMS_PER_PAGE } from "@/constants";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = parseInt(searchParams.get("limit") ?? String(ITEMS_PER_PAGE));

    const filter = session.user.role === "CUSTOMER" ? { userId: session.user.id } : {};
    const total = await Deposit.countDocuments(filter);
    const deposits = await Deposit.find(filter)
      .populate("accountId", "accountNumber accountType")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, data: { data: deposits, total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (e) {
    return handleAuthError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.user.role !== "CUSTOMER") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = depositRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    await connectDB();
    const account = await Account.findOne({ _id: parsed.data.accountId, userId: session.user.id });
    if (!account) return NextResponse.json({ success: false, error: "Account not found" }, { status: 404 });
    if (account.status !== "ACTIVE") return NextResponse.json({ success: false, error: "Account is not active" }, { status: 400 });

    const deposit = await Deposit.create({
      userId: session.user.id,
      accountId: parsed.data.accountId,
      amount: toCents(parsed.data.amount),
      description: parsed.data.description ?? "",
    });

    return NextResponse.json({ success: true, data: deposit }, { status: 201 });
  } catch (e) {
    return handleAuthError(e);
  }
}
