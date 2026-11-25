import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import Deposit from "@/models/Deposit";
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
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    await connectDB();
    const deposit = await Deposit.findById(id);
    if (!deposit) return NextResponse.json({ success: false, error: "Deposit not found" }, { status: 404 });
    if (deposit.status !== "PENDING") return NextResponse.json({ success: false, error: "Already reviewed" }, { status: 400 });

    if (parsed.data.status === "APPROVED") {
      const account = await Account.findById(deposit.accountId);
      if (!account || account.status !== "ACTIVE") {
        return NextResponse.json({ success: false, error: "Account not active" }, { status: 400 });
      }

      const transactionRef = generateTransactionRef();
      const dbSession = await mongoose.startSession();
      try {
        await dbSession.withTransaction(async () => {
          await Account.findByIdAndUpdate(deposit.accountId, { $inc: { balance: deposit.amount } }, { session: dbSession });
          await Transaction.create([{
            transactionRef, type: "DEPOSIT", status: "COMPLETED",
            amount: deposit.amount, fee: 0,
            receiverAccountId: deposit.accountId,
            description: deposit.description || "Deposit approved",
          }], { session: dbSession });
          await Deposit.findByIdAndUpdate(id, { status: "APPROVED", reviewedBy: session.user.id, reviewNote: parsed.data.reviewNote }, { session: dbSession });
        });
      } finally {
        await dbSession.endSession();
      }

      await createNotification(deposit.userId, "Deposit Approved",
        `Your deposit of ${formatCurrency(deposit.amount)} has been approved.`, "DEPOSIT", deposit._id);
    } else {
      await Deposit.findByIdAndUpdate(id, { status: "REJECTED", reviewedBy: session.user.id, reviewNote: parsed.data.reviewNote });
      await createNotification(deposit.userId, "Deposit Rejected",
        `Your deposit request of ${formatCurrency(deposit.amount)} was rejected.${parsed.data.reviewNote ? ` Reason: ${parsed.data.reviewNote}` : ""}`, "DEPOSIT", deposit._id);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return handleAuthError(e);
  }
}
