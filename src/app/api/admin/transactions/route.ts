import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Transaction from "@/models/Transaction";
import { requireRole, handleAuthError } from "@/lib/auth/session";
import { ITEMS_PER_PAGE } from "@/constants";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = parseInt(searchParams.get("limit") ?? String(ITEMS_PER_PAGE));
    const type = searchParams.get("type") ?? "";
    const status = searchParams.get("status") ?? "";
    const search = searchParams.get("search") ?? "";

    const filter: Record<string, unknown> = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) filter.transactionRef = { $regex: search, $options: "i" };

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .populate("senderAccountId", "accountNumber accountType")
      .populate("receiverAccountId", "accountNumber accountType")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, data: { data: transactions, total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (e) {
    return handleAuthError(e);
  }
}
