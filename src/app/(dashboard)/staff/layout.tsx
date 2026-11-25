import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { DashboardLayoutClient } from "../admin/DashboardLayoutClient";

export const dynamic = "force-dynamic";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "STAFF" && session.user.role !== "ADMIN")) redirect("/login");

  const userName = `${session.user.firstName} ${session.user.lastName}`;

  return (
    <DashboardLayoutClient role="STAFF" userName={userName}>
      {children}
    </DashboardLayoutClient>
  );
}
