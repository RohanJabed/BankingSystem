import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import BankingSettings from "@/models/BankingSettings";
import { requireRole, handleAuthError } from "@/lib/auth/session";
import { z } from "zod";

const settingsSchema = z.object({
  defaultDailyTransferLimit: z.number().positive().optional(),
  defaultMaxSingleTransaction: z.number().positive().optional(),
  defaultMinimumBalance: z.number().min(0).optional(),
  loanInterestRate: z.number().min(0).max(100).optional(),
  transactionFeePercent: z.number().min(0).max(100).optional(),
});

export async function GET() {
  try {
    await requireRole(["ADMIN"]);
    await connectDB();
    const settings = await BankingSettings.findOne().lean();
    if (!settings) {
      const created = await BankingSettings.create({});
      return NextResponse.json({ success: true, data: created });
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (e) {
    return handleAuthError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireRole(["ADMIN"]);
    const body = await req.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    await connectDB();
    const settings = await BankingSettings.findOneAndUpdate(
      {},
      { ...parsed.data, updatedBy: session.user.id },
      { new: true, upsert: true }
    ).lean();

    return NextResponse.json({ success: true, data: settings });
  } catch (e) {
    return handleAuthError(e);
  }
}
