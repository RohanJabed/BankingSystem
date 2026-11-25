import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import BankingSettings from "@/models/BankingSettings";
import { requireAuth, handleAuthError } from "@/lib/auth/session";
import { transferSchema } from "@/lib/validations/account";
import { verifyPin } from "@/lib/auth/password";
import { generateTransactionRef, calculateTransactionFee, toCents } from "@/lib/utils/index";
import { createNotification } from "@/lib/utils/notifications";
import { formatCurrency } from "@/lib/utils/index";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.user.role !== "CUSTOMER") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = transferSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { senderAccountId, receiverAccountNumber, amount, description, pin, idempotencyKey } = parsed.data;
    const amountCents = toCents(amount);

    await connectDB();

    // Idempotency check
    const existing = await Transaction.findOne({ idempotencyKey });
    if (existing) {
      return NextResponse.json({ success: true, data: { transactionRef: existing.transactionRef } });
    }

    // Verify sender owns the account
    const senderAccount = await Account.findOne({ _id: senderAccountId, userId: session.user.id });
    if (!senderAccount) {
      return NextResponse.json({ success: false, error: "Sender account not found" }, { status: 404 });
    }
    if (senderAccount.status !== "ACTIVE") {
      return NextResponse.json({ success: false, error: "Sender account is not active" }, { status: 400 });
    }

    // Verify PIN
    const user = await User.findById(session.user.id).select("+transactionPin");
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    if (!user.transactionPin) {
      return NextResponse.json({ success: false, error: "Transaction PIN not set. Please set your PIN first." }, { status: 400 });
    }

    // PIN lockout check
    if (user.pinLockedUntil && user.pinLockedUntil > new Date()) {
      return NextResponse.json({ success: false, error: "PIN locked. Try again later." }, { status: 429 });
    }

    const pinValid = await verifyPin(pin, user.transactionPin);
    if (!pinValid) {
      user.failedPinAttempts = (user.failedPinAttempts || 0) + 1;
      if (user.failedPinAttempts >= 5) {
        user.pinLockedUntil = new Date(Date.now() + 30 * 60 * 1000);
        user.failedPinAttempts = 0;
      }
      await user.save();
      return NextResponse.json({ success: false, error: "Invalid transaction PIN" }, { status: 400 });
    }

    // Reset failed attempts on success
    user.failedPinAttempts = 0;
    user.pinLockedUntil = undefined;
    await user.save();

    // Get settings
    const settings = await BankingSettings.findOne().lean();
    const feePercent = settings?.transactionFeePercent ?? 0.5;
    const fee = calculateTransactionFee(amountCents, feePercent);
    const totalDeduction = amountCents + fee;

    // Validate limits
    if (amountCents > senderAccount.maxSingleTransactionAmount) {
      return NextResponse.json({ success: false, error: "Amount exceeds single transaction limit" }, { status: 400 });
    }

    // Check daily limit
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayTransfers = await Transaction.aggregate([
      { $match: { senderAccountId: senderAccount._id, type: "TRANSFER", status: "COMPLETED", createdAt: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const todayTotal = todayTransfers[0]?.total ?? 0;
    if (todayTotal + amountCents > senderAccount.dailyTransferLimit) {
      return NextResponse.json({ success: false, error: "Daily transfer limit exceeded" }, { status: 400 });
    }

    // Balance check
    if (senderAccount.balance - totalDeduction < senderAccount.minimumBalance) {
      return NextResponse.json({ success: false, error: "Insufficient balance" }, { status: 400 });
    }

    // Find receiver
    const receiverAccount = await Account.findOne({ accountNumber: receiverAccountNumber });
    if (!receiverAccount) {
      return NextResponse.json({ success: false, error: "Recipient account not found" }, { status: 404 });
    }
    if (receiverAccount.status !== "ACTIVE") {
      return NextResponse.json({ success: false, error: "Recipient account is not active" }, { status: 400 });
    }
    if (receiverAccount._id.toString() === senderAccountId) {
      return NextResponse.json({ success: false, error: "Cannot transfer to the same account" }, { status: 400 });
    }

    // Suspicious detection: >3 transfers in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await Transaction.countDocuments({
      senderAccountId: senderAccount._id, type: "TRANSFER", createdAt: { $gte: oneHourAgo },
    });
    const isSuspicious = recentCount >= 3 || amountCents > senderAccount.dailyTransferLimit * 0.8;

    const transactionRef = generateTransactionRef();

    // Atomic transaction
    const dbSession = await mongoose.startSession();
    try {
      await dbSession.withTransaction(async () => {
        await Account.findByIdAndUpdate(senderAccount._id, { $inc: { balance: -totalDeduction } }, { session: dbSession });
        await Account.findByIdAndUpdate(receiverAccount._id, { $inc: { balance: amountCents } }, { session: dbSession });

        await Transaction.create([{
          transactionRef,
          type: "TRANSFER",
          status: "COMPLETED",
          amount: amountCents,
          fee,
          senderAccountId: senderAccount._id,
          receiverAccountId: receiverAccount._id,
          description: description || "Fund Transfer",
          idempotencyKey,
          isFlagged: isSuspicious,
          flagReason: isSuspicious ? "Suspicious transfer pattern detected" : undefined,
        }], { session: dbSession });
      });
    } finally {
      await dbSession.endSession();
    }

    // Notifications (outside transaction)
    const receiverUser = await User.findById(receiverAccount.userId);
    await createNotification(
      session.user.id, "Transfer Sent",
      `You sent ${formatCurrency(amountCents)} to account ${receiverAccountNumber}. Ref: ${transactionRef}`,
      "TRANSFER"
    );
    if (receiverUser) {
      await createNotification(
        receiverUser._id, "Money Received",
        `You received ${formatCurrency(amountCents)}. Ref: ${transactionRef}`,
        "TRANSFER"
      );
    }

    return NextResponse.json({ success: true, data: { transactionRef } }, { status: 201 });
  } catch (e) {
    return handleAuthError(e);
  }
}
