import { RegisterForm } from "@/components/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create Account — NexaBank" };

export default function RegisterPage() {
  return <RegisterForm />;
}
