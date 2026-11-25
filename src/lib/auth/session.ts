import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

export async function getServerSession(): Promise<Session | null> {
  return auth();
}

export async function requireAuth(): Promise<Session> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireRole(roles: string[]): Promise<Session> {
  const session = await requireAuth();
  if (!roles.includes(session.user.role as string)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export function unauthorizedResponse() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}

export function forbiddenResponse() {
  return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
}

export function handleAuthError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") return unauthorizedResponse();
    if (error.message === "FORBIDDEN") return forbiddenResponse();
  }
  return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
}
