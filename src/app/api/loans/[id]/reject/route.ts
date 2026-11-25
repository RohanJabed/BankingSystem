import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Loan from "@/models/Loan";
import { requireRole, handleAuthError } from "@/lib/auth/session";
import { createNotification } from "@/lib/utils/notifications";
import { z } from "zod";

const rejectSchema = z.object({ notes: z.string().optional() });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["ADMIN"]);
    const { id } = await params;
    const body = await req.json();
    const parsed = rejectSchema.safeParse(body);

    await connectDB();

    const loan = await Loan.findById(id);
    if (!loan) return NextResponse.json({ success: false, error: "Loan not found" }, { status: 404 });
    if (!["PENDING", "UNDER_REVIEW"].includes(loan.status)) {
      return NextResponse.json({ success: false, error: "Loan cannot be rejected in current status" }, { status: 400 });
    }

    await Loan.findByIdAndUpdate(id, {
      status: "REJECTED",
      reviewedBy: session.user.id,
      notes: parsed.success ? parsed.data.notes : undefined,
    });

    await createNotification(
      loan.userId, "Loan Rejected",
      `Your ${loan.loanType} loan application has been rejected.${parsed.success && parsed.data.notes ? ` Reason: ${parsed.data.notes}` : ""}`,
      "LOAN", loan._id
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    return handleAuthError(e);
  }
}
