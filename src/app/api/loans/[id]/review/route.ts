import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Loan from "@/models/Loan";
import { requireRole, handleAuthError } from "@/lib/auth/session";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["STAFF", "ADMIN"]);
    const { id } = await params;
    const body = await req.json();

    await connectDB();

    const loan = await Loan.findById(id);
    if (!loan) return NextResponse.json({ success: false, error: "Loan not found" }, { status: 404 });
    if (loan.status !== "PENDING") {
      return NextResponse.json({ success: false, error: "Only PENDING loans can be marked under review" }, { status: 400 });
    }

    const updated = await Loan.findByIdAndUpdate(
      id,
      { status: "UNDER_REVIEW", reviewedBy: session.user.id, ...(body.notes ? { notes: body.notes } : {}) },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    return handleAuthError(e);
  }
}
