import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Loan from "@/models/Loan";
import { requireRole, handleAuthError } from "@/lib/auth/session";
import { ITEMS_PER_PAGE } from "@/constants";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["STAFF"]);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = parseInt(searchParams.get("limit") ?? String(ITEMS_PER_PAGE));
    const status = searchParams.get("status") ?? "";

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const total = await Loan.countDocuments(filter);
    const loans = await Loan.find(filter)
      .populate("userId", "firstName lastName email")
      .populate("accountId", "accountNumber accountType")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, data: { data: loans, total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (e) {
    return handleAuthError(e);
  }
}
