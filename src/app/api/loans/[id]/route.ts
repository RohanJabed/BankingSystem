import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Loan from "@/models/Loan";
import { requireAuth, handleAuthError } from "@/lib/auth/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    await connectDB();

    const loan = await Loan.findById(id)
      .populate("accountId", "accountNumber accountType")
      .populate("userId", "firstName lastName email")
      .populate("reviewedBy", "firstName lastName")
      .populate("approvedBy", "firstName lastName")
      .lean();

    if (!loan) return NextResponse.json({ success: false, error: "Loan not found" }, { status: 404 });

    if (session.user.role === "CUSTOMER" && loan.userId.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: loan });
  } catch (e) {
    return handleAuthError(e);
  }
}
