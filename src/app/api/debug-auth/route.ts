import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await connectDB();
    const user = await User.findOne({ email: "admin@bank.com" }).select("+password");
    if (!user) return NextResponse.json({ error: "User not found" });

    const valid = await bcrypt.compare("Admin@123", user.password);
    return NextResponse.json({
      found: true,
      isActive: user.isActive,
      isBlocked: user.isBlocked,
      role: user.role,
      passwordValid: valid,
      hashPrefix: user.password?.slice(0, 10),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) });
  }
}
