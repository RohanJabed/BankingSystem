import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import { requireRole, handleAuthError } from "@/lib/auth/session";
import { ITEMS_PER_PAGE } from "@/constants";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["STAFF"]);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = parseInt(searchParams.get("limit") ?? String(ITEMS_PER_PAGE));
    const search = searchParams.get("search") ?? "";

    const filter: Record<string, unknown> = { role: "CUSTOMER" };
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(filter);
    const customers = await User.find(filter)
      .select("-password -transactionPin")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, data: { data: customers, total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (e) {
    return handleAuthError(e);
  }
}
