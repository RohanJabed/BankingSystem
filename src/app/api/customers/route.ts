import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth/password";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();
    const existing = await User.findOne({ email: parsed.data.email });
    if (existing) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(parsed.data.password);
    const user = await User.create({
      ...parsed.data,
      password: hashedPassword,
      role: "CUSTOMER",
    });

    return NextResponse.json({
      success: true,
      data: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Registration failed" }, { status: 500 });
  }
}
