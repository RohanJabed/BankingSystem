import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import Withdrawal from "@/models/Withdrawal";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import { requireRole, handleAuthError } from "@/lib/auth/session";
import { reviewRequestSchema } from "@/lib/validations/account";
import { generateTransactionRef, formatCurrency } from "@/lib/utils/index";
import { createNotification } from "@/lib/utils/notifications";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["ADMIN"]);
    const { id } = await params;
    const body = await req.json();
    const parsed = reviewRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();
    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) return NextResponse.json({ success: false, error: "Withdrawal not found" }, { status: 404 });
    if (withdrawal.status !== "PENDING") return NextResponse.json({ success: false, error: "Already reviewed" }, { status: 400 });

    if (parsed.data.status === "APPROVED") {
      const account = await Account.findById(withdrawal.accountId);
      if (!account || account.status !== "ACTIVE") {
        return NextResponse.json({ success: false, error: "Account not active" }, { status: 400 });
      }
      if (account.balance - withdrawal.amount < account.minimumBalance) {
        return NextResponse.json({ success: false, error: "Insufficient balance" }, { status: 400 });
      }

      const transactionRef = generateTransactionRef();
      const dbSession = await mongoose.startSession();
      try {
        await dbSession.withTransaction(async () => {
          await Account.findByIdAndUpdate(withdrawal.accountId, { $inc: { balance: -withdrawal.amount } }, { session: dbSession });
          await Transaction.create([{
            transactionRef, type: "WITHDRAWAL", status: "COMPLETED",
            amount: withdrawal.amount, fee: 0,
            senderAccountId: withdrawal.accountId,
            description: withdrawal.description || "Withdrawal approved",
          }], { session: dbSession });
          await Withdrawal.findByIdAndUpdate(id, { status: "APPROVED", reviewedBy: session.user.id, reviewNote: parsed.data.reviewNote }, { session: dbSession });
        });
      } finally {
        await dbSession.endSession();
      }

      await createNotification(withdrawal.userId, "Withdrawal Approved",
        `Your withdrawal of ${formatCurrency(withdrawal.amount)} has been approved.`, "WITHDRAWAL", withdrawal._id);
    } else {
      await Withdrawal.findByIdAndUpdate(id, { status: "REJECTED", reviewedBy: session.user.id, reviewNote: parsed.data.reviewNote });
      await createNotification(withdrawal.userId, "Withdrawal Rejected",
        `Your withdrawal request of ${formatCurrency(withdrawal.amount)} was rejected.${parsed.data.reviewNote ? ` Reason: ${parsed.data.reviewNote}` : ""}`, "WITHDRAWAL", withdrawal._id);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return handleAuthError(e);
  }
}
