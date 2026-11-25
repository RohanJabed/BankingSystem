import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Transaction from "@/models/Transaction";
import Account from "@/models/Account";
import { requireAuth, handleAuthError } from "@/lib/auth/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    await connectDB();

    const tx = await Transaction.findById(id)
      .populate("senderAccountId", "accountNumber accountType userId")
      .populate("receiverAccountId", "accountNumber accountType userId")
      .lean();

    if (!tx) return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });

    // Customers can only view their own transactions
    if (session.user.role === "CUSTOMER") {
      const userAccounts = await Account.find({ userId: session.user.id }).select("_id").lean();
      const ids = userAccounts.map((a) => a._id.toString());
      const sId = (tx.senderAccountId as { _id: { toString(): string } })?._id?.toString();
      const rId = (tx.receiverAccountId as { _id: { toString(): string } })?._id?.toString();
      if (!ids.includes(sId) && !ids.includes(rId)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, data: tx });
  } catch (e) {
    return handleAuthError(e);
  }
}
