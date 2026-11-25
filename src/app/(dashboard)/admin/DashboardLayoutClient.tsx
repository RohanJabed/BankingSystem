"use client";
import { useAppSelector } from "@/hooks/redux";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface Props {
  role: "ADMIN" | "STAFF" | "CUSTOMER";
  userName: string;
  children: React.ReactNode;
}

function getPageTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last || ["admin", "staff", "customer"].includes(last)) return "Dashboard";
  return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
}

export function DashboardLayoutClient({ role, userName, children }: Props) {
  const isOpen = useAppSelector((s) => s.ui.sidebarOpen);
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar role={role} userName={userName} />
      <div className={cn("flex-1 flex flex-col transition-all duration-300", isOpen ? "ml-64" : "ml-16")}>
        <Topbar title={title} role={role} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
