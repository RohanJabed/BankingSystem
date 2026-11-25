import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  const results: Record<string, unknown> = {};
  try {
    await connectDB();
    results.db = "connected";

    const user = await User.findOne({ email: "admin@bank.com" }).select("+password");
    results.userFound = !!user;
    if (!user) return NextResponse.json(results);

    results.isActive = user.isActive;
    results.isBlocked = user.isBlocked;
    results.role = user.role;
    results.hasPassword = !!user.password;
    results.hashPrefix = user.password?.slice(0, 7);

    const valid = await bcrypt.compare("Admin@123", user.password);
    results.passwordValid = valid;

    // test what authorize would return
    if (!user.isActive || user.isBlocked || !valid) {
      results.authorizeResult = "null - would fail";
    } else {
      results.authorizeResult = "success - would return user";
    }

  } catch (e) {
    results.error = String(e);
    results.stack = e instanceof Error ? e.stack : "";
  }
  return NextResponse.json(results);
}
