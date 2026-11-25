import { z } from "zod";

export const loanApplicationSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  loanType: z.enum(["PERSONAL", "BUSINESS", "MORTGAGE", "AUTO", "EDUCATION"]),
  requestedAmount: z.number().positive("Amount must be positive"),
  durationMonths: z.number().int().min(1).max(360),
  monthlyIncome: z.number().positive("Monthly income must be positive"),
  employmentStatus: z.enum(["EMPLOYED", "SELF_EMPLOYED", "UNEMPLOYED", "RETIRED", "STUDENT"]),
  description: z.string().min(10, "Please provide more details"),
});

export const loanReviewSchema = z.object({
  status: z.enum(["UNDER_REVIEW", "APPROVED", "REJECTED"]),
  approvedAmount: z.number().positive().optional(),
  notes: z.string().optional(),
});

export const loanRepaymentSchema = z.object({
  accountId: z.string().min(1),
  amount: z.number().positive("Amount must be positive"),
  pin: z.string().length(4, "PIN must be 4 digits"),
  idempotencyKey: z.string().min(1),
});
