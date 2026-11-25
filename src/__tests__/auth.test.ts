import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock dependencies ─────────────────────────────────────────────────────────
vi.mock("@/lib/db/connect", () => ({ connectDB: vi.fn() }));
vi.mock("@/models/User", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));
vi.mock("argon2", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
    verify: vi.fn(),
  },
  hash: vi.fn().mockResolvedValue("hashed_password"),
  verify: vi.fn(),
}));

import argon2 from "argon2";
import User from "@/models/User";

// ── hashPassword / verifyPassword ─────────────────────────────────────────────
describe("password utils", () => {
  it("hashes a password", async () => {
    const { hashPassword } = await import("@/lib/auth/password");
    const hash = await hashPassword("Admin@123");
    expect(hash).toBe("hashed_password");
    expect(argon2.hash).toHaveBeenCalledWith("Admin@123");
  });

  it("verifies a correct password", async () => {
    vi.mocked(argon2.verify).mockResolvedValueOnce(true);
    const { verifyPassword } = await import("@/lib/auth/password");
    const result = await verifyPassword("Admin@123", "hashed_password");
    expect(result).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    vi.mocked(argon2.verify).mockResolvedValueOnce(false);
    const { verifyPassword } = await import("@/lib/auth/password");
    const result = await verifyPassword("wrong", "hashed_password");
    expect(result).toBe(false);
  });
});

// ── Login validation ──────────────────────────────────────────────────────────
describe("loginSchema validation", () => {
  it("accepts valid credentials", async () => {
    const { loginSchema } = await import("@/lib/validations/auth");
    const result = loginSchema.safeParse({ email: "admin@bank.com", password: "Admin@123" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", async () => {
    const { loginSchema } = await import("@/lib/validations/auth");
    const result = loginSchema.safeParse({ email: "not-an-email", password: "Admin@123" });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", async () => {
    const { loginSchema } = await import("@/lib/validations/auth");
    const result = loginSchema.safeParse({ email: "admin@bank.com", password: "" });
    expect(result.success).toBe(false);
  });
});

// ── requireAuth / requireRole ─────────────────────────────────────────────────
describe("session helpers", () => {
  beforeEach(() => vi.resetModules());

  it("requireAuth throws UNAUTHORIZED when no session", async () => {
    vi.doMock("@/lib/auth/config", () => ({ auth: vi.fn().mockResolvedValue(null) }));
    const { requireAuth } = await import("@/lib/auth/session");
    await expect(requireAuth()).rejects.toThrow("UNAUTHORIZED");
  });

  it("requireAuth returns session when authenticated", async () => {
    const mockSession = { user: { id: "1", role: "ADMIN" } };
    vi.doMock("@/lib/auth/config", () => ({ auth: vi.fn().mockResolvedValue(mockSession) }));
    const { requireAuth } = await import("@/lib/auth/session");
    const session = await requireAuth();
    expect(session.user.id).toBe("1");
  });

  it("requireRole throws FORBIDDEN for wrong role", async () => {
    const mockSession = { user: { id: "1", role: "CUSTOMER" } };
    vi.doMock("@/lib/auth/config", () => ({ auth: vi.fn().mockResolvedValue(mockSession) }));
    const { requireRole } = await import("@/lib/auth/session");
    await expect(requireRole(["ADMIN"])).rejects.toThrow("FORBIDDEN");
  });

  it("requireRole passes for correct role", async () => {
    const mockSession = { user: { id: "1", role: "ADMIN" } };
    vi.doMock("@/lib/auth/config", () => ({ auth: vi.fn().mockResolvedValue(mockSession) }));
    const { requireRole } = await import("@/lib/auth/session");
    const session = await requireRole(["ADMIN"]);
    expect(session.user.role).toBe("ADMIN");
  });
});
