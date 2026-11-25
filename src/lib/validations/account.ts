import { z } from "zod";

export const createAccountSchema = z.object({
  userId: z.string().min(1, "User is required"),
  accountType: z.enum(["SAVINGS", "CURRENT", "BUSINESS"]),
});

export const updateAccountSchema = z.object({
  status: z.enum(["ACTIVE", "FROZEN", "CLOSED"]).optional(),
  dailyTransferLimit: z.number().positive().optional(),
  maxSingleTransactionAmount: z.number().positive().optional(),
  minimumBalance: z.number().min(0).optional(),
});

export const transferSchema = z.object({
  senderAccountId: z.string().min(1),
  receiverAccountNumber: z.string().min(1, "Recipient account number is required"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  pin: z.string().length(4, "PIN must be 4 digits"),
  idempotencyKey: z.string().min(1),
});

export const depositRequestSchema = z.object({
  accountId: z.string().min(1),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
});

export const withdrawalRequestSchema = z.object({
  accountId: z.string().min(1),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
});

export const reviewRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reviewNote: z.string().optional(),
});
