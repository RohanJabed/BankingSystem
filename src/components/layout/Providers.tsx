"use client";
import { Toaster } from "sonner";
import { ReduxProvider } from "@/redux/provider";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ReduxProvider>
        {children}
        <Toaster richColors position="top-right" />
      </ReduxProvider>
    </SessionProvider>
  );
}
