import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import Loan from "@/models/Loan";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import { requireRole, handleAuthError } from "@/lib/auth/session";
import { generateTransactionRef, calculateLoanRepayment, toCents } from "@/lib/utils/index";
import { createNotification } from "@/lib/utils/notifications";
import { formatCurrency } from "@/lib/utils/index";
import { z } from "zod";

const approveSchema = z.object({
  approvedAmount: z.number().positive(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["ADMIN"]);
    const { id } = await params;
    const body = await req.json();
    const parsed = approveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    await connectDB();

    const loan = await Loan.findById(id);
    if (!loan) return NextResponse.json({ success: false, error: "Loan not found" }, { status: 404 });
    if (!["PENDING", "UNDER_REVIEW"].includes(loan.status)) {
      return NextResponse.json({ success: false, error: "Loan cannot be approved in current status" }, { status: 400 });
    }

    const approvedAmountCents = toCents(parsed.data.approvedAmount);
    const account = await Account.findById(loan.accountId);
    if (!account || account.status !== "ACTIVE") {
      return NextResponse.json({ success: false, error: "Loan account is not active" }, { status: 400 });
    }

    // Calculate repayment schedule
    const { monthlyPayment } = calculateLoanRepayment(approvedAmountCents, loan.interestRate, loan.durationMonths);
    const schedule = Array.from({ length: loan.durationMonths }, (_, i) => ({
      dueDate: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000),
      amount: monthlyPayment,
      isPaid: false,
    }));

    const transactionRef = generateTransactionRef();

    const dbSession = await mongoose.startSession();
    try {
      await dbSession.withTransaction(async () => {
        await Account.findByIdAndUpdate(account._id, { $inc: { balance: approvedAmountCents } }, { session: dbSession });

        await Transaction.create([{
          transactionRef,
          type: "LOAN_DISBURSEMENT",
          status: "COMPLETED",
          amount: approvedAmountCents,
          fee: 0,
          receiverAccountId: account._id,
          description: `Loan disbursement - ${loan.loanType}`,
        }], { session: dbSession });

        await Loan.findByIdAndUpdate(id, {
          status: "ACTIVE",
          approvedAmount: approvedAmountCents,
          approvedBy: session.user.id,
          reviewedBy: session.user.id,
          disbursedAt: new Date(),
          notes: parsed.data.notes,
          repaymentSchedule: schedule,
          outstandingBalance: approvedAmountCents,
        }, { session: dbSession });
      });
    } finally {
      await dbSession.endSession();
    }

    await createNotification(
      loan.userId, "Loan Approved",
      `Your ${loan.loanType} loan of ${formatCurrency(approvedAmountCents)} has been approved and disbursed.`,
      "LOAN", loan._id
    );

    return NextResponse.json({ success: true, data: { transactionRef } });
  } catch (e) {
    return handleAuthError(e);
  }
}
