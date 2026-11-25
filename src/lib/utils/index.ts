import { v4 as uuidv4 } from "uuid";

export function generateAccountNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `ACC${timestamp}${random}`;
}

export function generateTransactionRef(): string {
  return `TXN${uuidv4().replace(/-/g, "").toUpperCase().slice(0, 16)}`;
}

export function generateIdempotencyKey(): string {
  return uuidv4();
}

/** Store amounts as integer cents to avoid floating-point issues */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

export function formatCurrency(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export function calculateLoanRepayment(
  principal: number,
  annualRate: number,
  months: number
): { monthlyPayment: number; totalPayment: number; totalInterest: number } {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) {
    const monthlyPayment = Math.round(principal / months);
    return { monthlyPayment, totalPayment: monthlyPayment * months, totalInterest: 0 };
  }
  const monthlyPayment = Math.round(
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)
  );
  const totalPayment = monthlyPayment * months;
  return { monthlyPayment, totalPayment, totalInterest: totalPayment - principal };
}

export function calculateTransactionFee(amount: number, feePercent: number): number {
  return Math.round(amount * (feePercent / 100));
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
