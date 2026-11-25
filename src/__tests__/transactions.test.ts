import { describe, it, expect } from "vitest";
import {
  toCents,
  fromCents,
  formatCurrency,
  calculateTransactionFee,
  generateTransactionRef,
  generateAccountNumber,
  calculateLoanRepayment,
} from "@/lib/utils/index";

describe("toCents / fromCents", () => {
  it("converts dollars to cents", () => {
    expect(toCents(10)).toBe(1000);
    expect(toCents(0.99)).toBe(99);
    expect(toCents(100.5)).toBe(10050);
  });

  it("converts cents back to dollars", () => {
    expect(fromCents(1000)).toBe(10);
    expect(fromCents(99)).toBe(0.99);
  });
});

describe("formatCurrency", () => {
  it("formats cents as USD string", () => {
    expect(formatCurrency(100000)).toBe("$1,000.00");
    expect(formatCurrency(50)).toBe("$0.50");
  });
});

describe("calculateTransactionFee", () => {
  it("calculates 0.5% fee correctly", () => {
    expect(calculateTransactionFee(100000, 0.5)).toBe(500);
  });

  it("calculates 1% fee correctly", () => {
    expect(calculateTransactionFee(50000, 1)).toBe(500);
  });

  it("returns 0 for 0% fee", () => {
    expect(calculateTransactionFee(100000, 0)).toBe(0);
  });
});

describe("generateTransactionRef", () => {
  it("starts with TXN", () => {
    expect(generateTransactionRef()).toMatch(/^TXN/);
  });

  it("generates unique refs", () => {
    const refs = new Set(Array.from({ length: 100 }, generateTransactionRef));
    expect(refs.size).toBe(100);
  });
});

describe("generateAccountNumber", () => {
  it("starts with ACC", () => {
    expect(generateAccountNumber()).toMatch(/^ACC/);
  });

  it("has correct length (13 chars)", () => {
    expect(generateAccountNumber()).toHaveLength(13);
  });
});

describe("calculateLoanRepayment", () => {
  it("calculates monthly payment for 12% annual rate", () => {
    const { monthlyPayment, totalPayment, totalInterest } = calculateLoanRepayment(120000, 12, 12);
    expect(monthlyPayment).toBeGreaterThan(10000);
    expect(totalPayment).toBeGreaterThan(120000);
    expect(totalInterest).toBeGreaterThan(0);
  });

  it("handles 0% interest rate", () => {
    const { monthlyPayment, totalInterest } = calculateLoanRepayment(120000, 0, 12);
    expect(monthlyPayment).toBe(10000);
    expect(totalInterest).toBe(0);
  });

  it("total payment equals monthly * months", () => {
    const { monthlyPayment, totalPayment } = calculateLoanRepayment(100000, 10, 6);
    expect(totalPayment).toBe(monthlyPayment * 6);
  });
});
