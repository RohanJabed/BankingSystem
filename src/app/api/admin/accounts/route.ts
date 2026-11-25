import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Account from "@/models/Account";
import { requireRole, handleAuthError } from "@/lib/auth/session";
import { ITEMS_PER_PAGE } from "@/constants";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = parseInt(searchParams.get("limit") ?? String(ITEMS_PER_PAGE));
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";

    const filter: Record<string, unknown> = {};
    if (search) filter.accountNumber = { $regex: search, $options: "i" };
    if (status) filter.status = status;

    const total = await Account.countDocuments(filter);
    const accounts = await Account.find(filter)
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, data: { data: accounts, total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (e) {
    return handleAuthError(e);
  }
}
