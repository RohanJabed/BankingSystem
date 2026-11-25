import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(10, "Invalid phone number"),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

export const setPinSchema = z.object({
  pin: z.string().length(4, "PIN must be exactly 4 digits").regex(/^\d+$/, "PIN must be numeric"),
  confirmPin: z.string().length(4),
}).refine((d) => d.pin === d.confirmPin, { message: "PINs do not match", path: ["confirmPin"] });

export const changePinSchema = z.object({
  currentPin: z.string().length(4),
  newPin: z.string().length(4).regex(/^\d+$/, "PIN must be numeric"),
  confirmPin: z.string().length(4),
}).refine((d) => d.newPin === d.confirmPin, { message: "PINs do not match", path: ["confirmPin"] });
