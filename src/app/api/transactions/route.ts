import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Transaction from "@/models/Transaction";
import Account from "@/models/Account";
import { requireAuth, handleAuthError } from "@/lib/auth/session";
import { ITEMS_PER_PAGE } from "@/constants";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = parseInt(searchParams.get("limit") ?? String(ITEMS_PER_PAGE));
    const type = searchParams.get("type") ?? "";
    const status = searchParams.get("status") ?? "";
    const accountId = searchParams.get("accountId") ?? "";

    // Get user's accounts
    const userAccounts = await Account.find({ userId: session.user.id }).select("_id").lean();
    const accountIds = userAccounts.map((a) => a._id);

    const filter: Record<string, unknown> = {
      $or: [{ senderAccountId: { $in: accountIds } }, { receiverAccountId: { $in: accountIds } }],
    };
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (accountId) {
      filter.$or = [{ senderAccountId: accountId }, { receiverAccountId: accountId }];
    }

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .populate("senderAccountId", "accountNumber accountType")
      .populate("receiverAccountId", "accountNumber accountType")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: { data: transactions, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (e) {
    return handleAuthError(e);
  }
}
