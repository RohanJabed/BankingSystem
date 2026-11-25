import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import Loan from "@/models/Loan";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { requireAuth, handleAuthError } from "@/lib/auth/session";
import { loanRepaymentSchema } from "@/lib/validations/loan";
import { verifyPin } from "@/lib/auth/password";
import { generateTransactionRef, toCents, formatCurrency } from "@/lib/utils/index";
import { createNotification } from "@/lib/utils/notifications";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    if (session.user.role !== "CUSTOMER") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = loanRepaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { accountId, amount, pin, idempotencyKey } = parsed.data;
    const amountCents = toCents(amount);

    await connectDB();

    // Idempotency
    const existing = await Transaction.findOne({ idempotencyKey });
    if (existing) return NextResponse.json({ success: true, data: { transactionRef: existing.transactionRef } });

    const loan = await Loan.findOne({ _id: id, userId: session.user.id });
    if (!loan) return NextResponse.json({ success: false, error: "Loan not found" }, { status: 404 });
    if (loan.status !== "ACTIVE") return NextResponse.json({ success: false, error: "Loan is not active" }, { status: 400 });

    if (amountCents > loan.outstandingBalance) {
      return NextResponse.json({ success: false, error: "Amount exceeds outstanding balance" }, { status: 400 });
    }

    const account = await Account.findOne({ _id: accountId, userId: session.user.id });
    if (!account || account.status !== "ACTIVE") {
      return NextResponse.json({ success: false, error: "Account not found or inactive" }, { status: 404 });
    }
    if (account.balance < amountCents) {
      return NextResponse.json({ success: false, error: "Insufficient balance" }, { status: 400 });
    }

    // PIN check
    const user = await User.findById(session.user.id).select("+transactionPin");
    if (!user?.transactionPin) return NextResponse.json({ success: false, error: "Transaction PIN not set" }, { status: 400 });
    if (user.pinLockedUntil && user.pinLockedUntil > new Date()) {
      return NextResponse.json({ success: false, error: "PIN locked. Try again later." }, { status: 429 });
    }
    const pinValid = await verifyPin(pin, user.transactionPin);
    if (!pinValid) {
      user.failedPinAttempts = (user.failedPinAttempts || 0) + 1;
      if (user.failedPinAttempts >= 5) { user.pinLockedUntil = new Date(Date.now() + 30 * 60 * 1000); user.failedPinAttempts = 0; }
      await user.save();
      return NextResponse.json({ success: false, error: "Invalid transaction PIN" }, { status: 400 });
    }
    user.failedPinAttempts = 0; user.pinLockedUntil = undefined; await user.save();

    const transactionRef = generateTransactionRef();
    const newOutstanding = loan.outstandingBalance - amountCents;

    // Mark repayment schedule installments as paid
    let remaining = amountCents;
    const updatedSchedule = loan.repaymentSchedule.map((inst) => {
      if (!inst.isPaid && remaining >= inst.amount) {
        remaining -= inst.amount;
        return { ...inst, isPaid: true, paidAt: new Date() };
      }
      return { ...inst };
    });

    const dbSession = await mongoose.startSession();
    let txDoc: { _id: mongoose.Types.ObjectId };
    try {
      await dbSession.withTransaction(async () => {
        await Account.findByIdAndUpdate(account._id, { $inc: { balance: -amountCents } }, { session: dbSession });

        const [created] = await Transaction.create([{
          transactionRef,
          type: "LOAN_REPAYMENT",
          status: "COMPLETED",
          amount: amountCents,
          fee: 0,
          senderAccountId: account._id,
          description: `Loan repayment`,
          idempotencyKey,
        }], { session: dbSession });
        txDoc = created;

        await Loan.findByIdAndUpdate(id, {
          outstandingBalance: newOutstanding,
          repaymentSchedule: updatedSchedule,
          status: newOutstanding <= 0 ? "COMPLETED" : "ACTIVE",
        }, { session: dbSession });
      });
    } finally {
      await dbSession.endSession();
    }

    await createNotification(
      session.user.id, "Loan Repayment Successful",
      `Repayment of ${formatCurrency(amountCents)} processed. Outstanding: ${formatCurrency(newOutstanding)}.`,
      "LOAN", loan._id
    );

    return NextResponse.json({ success: true, data: { transactionRef } }, { status: 201 });
  } catch (e) {
    return handleAuthError(e);
  }
}
