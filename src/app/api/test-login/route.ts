import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  const log: string[] = [];
  try {
    log.push("1. connecting db...");
    await connectDB();
    log.push("2. db connected");

    log.push("3. finding user...");
    const user = await User.findOne({ email: "admin@bank.com" });
    log.push(`4. user found: ${!!user}`);
    if (!user) return NextResponse.json({ log });

    log.push(`5. password field exists: ${!!user.password}`);
    log.push(`6. password value: ${user.password?.slice(0, 10)}`);
    log.push(`7. isActive: ${user.isActive}, isBlocked: ${user.isBlocked}`);

    log.push("8. comparing password...");
    const valid = await bcrypt.compare("Admin@123", user.password);
    log.push(`9. password valid: ${valid}`);

  } catch (e) {
    log.push(`ERROR: ${String(e)}`);
  }
  return NextResponse.json({ log });
}
