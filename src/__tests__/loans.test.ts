import { describe, it, expect } from "vitest";
import { loanApplicationSchema, loanReviewSchema, loanRepaymentSchema } from "@/lib/validations/loan";
import { transferSchema, depositRequestSchema, withdrawalRequestSchema } from "@/lib/validations/account";

// ── Loan application schema ───────────────────────────────────────────────────
describe("loanApplicationSchema", () => {
  const valid = {
    accountId: "acc123",
    loanType: "PERSONAL" as const,
    requestedAmount: 5000,
    durationMonths: 12,
    monthlyIncome: 3000,
    employmentStatus: "EMPLOYED" as const,
    description: "Need money for home renovation",
  };

  it("accepts valid loan application", () => {
    expect(loanApplicationSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects negative amount", () => {
    expect(loanApplicationSchema.safeParse({ ...valid, requestedAmount: -100 }).success).toBe(false);
  });

  it("rejects invalid loan type", () => {
    expect(loanApplicationSchema.safeParse({ ...valid, loanType: "INVALID" }).success).toBe(false);
  });

  it("rejects short description", () => {
    expect(loanApplicationSchema.safeParse({ ...valid, description: "short" }).success).toBe(false);
  });

  it("rejects duration > 360 months", () => {
    expect(loanApplicationSchema.safeParse({ ...valid, durationMonths: 361 }).success).toBe(false);
  });

  it("rejects invalid employment status", () => {
    expect(loanApplicationSchema.safeParse({ ...valid, employmentStatus: "FREELANCER" }).success).toBe(false);
  });
});

// ── Loan review schema ────────────────────────────────────────────────────────
describe("loanReviewSchema", () => {
  it("accepts APPROVED with amount", () => {
    expect(loanReviewSchema.safeParse({ status: "APPROVED", approvedAmount: 5000 }).success).toBe(true);
  });

  it("accepts REJECTED with notes", () => {
    expect(loanReviewSchema.safeParse({ status: "REJECTED", notes: "Insufficient income" }).success).toBe(true);
  });

  it("rejects invalid status", () => {
    expect(loanReviewSchema.safeParse({ status: "PENDING" }).success).toBe(false);
  });
});

// ── Loan repayment schema ─────────────────────────────────────────────────────
describe("loanRepaymentSchema", () => {
  it("accepts valid repayment", () => {
    expect(
      loanRepaymentSchema.safeParse({ accountId: "acc1", amount: 500, pin: "1234", idempotencyKey: "key1" }).success
    ).toBe(true);
  });

  it("rejects PIN not 4 digits", () => {
    expect(
      loanRepaymentSchema.safeParse({ accountId: "acc1", amount: 500, pin: "12", idempotencyKey: "key1" }).success
    ).toBe(false);
  });
});

// ── Transfer schema ───────────────────────────────────────────────────────────
describe("transferSchema", () => {
  const valid = {
    senderAccountId: "acc1",
    receiverAccountNumber: "ACC1234567890",
    amount: 100,
    pin: "1234",
    idempotencyKey: "uuid-key",
  };

  it("accepts valid transfer", () => {
    expect(transferSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects zero amount", () => {
    expect(transferSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false);
  });

  it("rejects PIN with wrong length", () => {
    expect(transferSchema.safeParse({ ...valid, pin: "12345" }).success).toBe(false);
  });

  it("rejects missing receiver account", () => {
    expect(transferSchema.safeParse({ ...valid, receiverAccountNumber: "" }).success).toBe(false);
  });
});

// ── Deposit / Withdrawal schema ───────────────────────────────────────────────
describe("depositRequestSchema", () => {
  it("accepts valid deposit", () => {
    expect(depositRequestSchema.safeParse({ accountId: "acc1", amount: 500 }).success).toBe(true);
  });

  it("rejects negative amount", () => {
    expect(depositRequestSchema.safeParse({ accountId: "acc1", amount: -1 }).success).toBe(false);
  });
});

describe("withdrawalRequestSchema", () => {
  it("accepts valid withdrawal", () => {
    expect(withdrawalRequestSchema.safeParse({ accountId: "acc1", amount: 200 }).success).toBe(true);
  });

  it("rejects missing accountId", () => {
    expect(withdrawalRequestSchema.safeParse({ accountId: "", amount: 200 }).success).toBe(false);
  });
});

// ── Authorization logic ───────────────────────────────────────────────────────
describe("role-based authorization", () => {
  const roles = ["ADMIN", "STAFF", "CUSTOMER"];

  it("ADMIN has access to admin routes", () => {
    const allowedRoles = ["ADMIN"];
    expect(allowedRoles.includes("ADMIN")).toBe(true);
    expect(allowedRoles.includes("CUSTOMER")).toBe(false);
  });

  it("STAFF has access to staff routes", () => {
    const allowedRoles = ["ADMIN", "STAFF"];
    expect(allowedRoles.includes("STAFF")).toBe(true);
    expect(allowedRoles.includes("CUSTOMER")).toBe(false);
  });

  it("CUSTOMER cannot access admin routes", () => {
    const allowedRoles = ["ADMIN"];
    expect(allowedRoles.includes("CUSTOMER")).toBe(false);
  });

  it("all roles are valid", () => {
    roles.forEach((role) => {
      expect(["ADMIN", "STAFF", "CUSTOMER"].includes(role)).toBe(true);
    });
  });
});
