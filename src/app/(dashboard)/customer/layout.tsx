import { getServerSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { DashboardLayoutClient } from "../admin/DashboardLayoutClient";

export const dynamic = "force-dynamic";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "CUSTOMER") redirect("/login");

  const userName = `${session.user.firstName} ${session.user.lastName}`;

  return (
    <DashboardLayoutClient role="CUSTOMER" userName={userName}>
      {children}
    </DashboardLayoutClient>
  );
}
