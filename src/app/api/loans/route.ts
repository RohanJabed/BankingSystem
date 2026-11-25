import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Loan from "@/models/Loan";
import Account from "@/models/Account";
import BankingSettings from "@/models/BankingSettings";
import { requireAuth, handleAuthError } from "@/lib/auth/session";
import { loanApplicationSchema } from "@/lib/validations/loan";
import { toCents } from "@/lib/utils/index";

export async function GET() {
  try {
    const session = await requireAuth();
    await connectDB();

    const filter = session.user.role === "CUSTOMER" ? { userId: session.user.id } : {};
    const loans = await Loan.find(filter)
      .populate("accountId", "accountNumber accountType")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: loans });
  } catch (e) {
    return handleAuthError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.user.role !== "CUSTOMER") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = loanApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    await connectDB();

    // Verify account ownership
    const account = await Account.findOne({ _id: parsed.data.accountId, userId: session.user.id });
    if (!account) return NextResponse.json({ success: false, error: "Account not found" }, { status: 404 });
    if (account.status !== "ACTIVE") return NextResponse.json({ success: false, error: "Account is not active" }, { status: 400 });

    // Check for existing pending loan
    const pendingLoan = await Loan.findOne({ userId: session.user.id, status: { $in: ["PENDING", "UNDER_REVIEW"] } });
    if (pendingLoan) {
      return NextResponse.json({ success: false, error: "You already have a pending loan application" }, { status: 400 });
    }

    const settings = await BankingSettings.findOne().lean();
    const interestRate = settings?.loanInterestRate ?? 12;

    const loan = await Loan.create({
      userId: session.user.id,
      accountId: parsed.data.accountId,
      loanType: parsed.data.loanType,
      requestedAmount: toCents(parsed.data.requestedAmount),
      interestRate,
      durationMonths: parsed.data.durationMonths,
      monthlyIncome: toCents(parsed.data.monthlyIncome),
      employmentStatus: parsed.data.employmentStatus,
      description: parsed.data.description,
      outstandingBalance: 0,
    });

    return NextResponse.json({ success: true, data: loan }, { status: 201 });
  } catch (e) {
    return handleAuthError(e);
  }
}
