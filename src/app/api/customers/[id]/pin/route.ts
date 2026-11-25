import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import { requireAuth, handleAuthError } from "@/lib/auth/session";
import { hashPin, verifyPin } from "@/lib/auth/password";
import { setPinSchema, changePinSchema } from "@/lib/validations/auth";

// POST = set PIN for first time, PATCH = change existing PIN
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    if (session.user.id !== id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = setPinSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(id).select("+transactionPin");
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    if (user.transactionPin) {
      return NextResponse.json({ success: false, error: "PIN already set. Use change PIN." }, { status: 400 });
    }

    user.transactionPin = await hashPin(parsed.data.pin);
    await user.save();

    return NextResponse.json({ success: true, message: "Transaction PIN set successfully" });
  } catch (e) {
    return handleAuthError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    if (session.user.id !== id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = changePinSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(id).select("+transactionPin");
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    if (!user.transactionPin) {
      return NextResponse.json({ success: false, error: "No PIN set. Use set PIN." }, { status: 400 });
    }

    const valid = await verifyPin(parsed.data.currentPin, user.transactionPin);
    if (!valid) return NextResponse.json({ success: false, error: "Current PIN is incorrect" }, { status: 400 });

    user.transactionPin = await hashPin(parsed.data.newPin);
    await user.save();

    return NextResponse.json({ success: true, message: "PIN changed successfully" });
  } catch (e) {
    return handleAuthError(e);
  }
}
