import { getServerSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { DashboardLayoutClient } from "./DashboardLayoutClient";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const userName = `${session.user.firstName} ${session.user.lastName}`;

  return (
    <DashboardLayoutClient role="ADMIN" userName={userName}>
      {children}
    </DashboardLayoutClient>
  );
}
