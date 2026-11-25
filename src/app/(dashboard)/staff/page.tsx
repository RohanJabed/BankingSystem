"use client";
import { useGetAllCustomersQuery } from "@/redux/features/auth/adminApi";
import { useGetAllLoansQuery } from "@/redux/features/loans/loanApi";
import { useGetAllTransactionsQuery } from "@/redux/features/transactions/transactionApi";
import { StatCard } from "@/components/shared/StatCard";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeftRight, FileText, UserPlus } from "lucide-react";
import { formatCurrency } from "@/lib/utils/index";
import Link from "next/link";
import type { ILoan } from "@/types";

const loanColumns: Column<ILoan>[] = [
  { key: "customer", header: "Customer", cell: (r) => { const u = r.userId as { firstName: string; lastName: string } | undefined; return <span>{u ? `${u.firstName} ${u.lastName}` : "—"}</span>; } },
  { key: "type", header: "Type", cell: (r) => <Badge variant="outline">{r.loanType}</Badge> },
  { key: "amount", header: "Amount", cell: (r) => <span className="font-semibold">{formatCurrency(r.requestedAmount)}</span> },
  { key: "status", header: "Status", cell: (r) => <Badge variant={r.status === "PENDING" ? "secondary" : "outline"}>{r.status}</Badge> },
  { key: "date", header: "Applied", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
];

export default function StaffDashboard() {
  const { data: customersData, isLoading: loadingCustomers } = useGetAllCustomersQuery({ limit: 1 });
  const { data: loansData, isLoading: loadingLoans } = useGetAllLoansQuery({ status: "PENDING", limit: 5 });
  const { data: txData, isLoading: loadingTx } = useGetAllTransactionsQuery({ limit: 1 });

  const pendingLoans = loansData?.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Customers" value={customersData?.data?.total ?? 0} icon={Users} iconColor="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-900/20" loading={loadingCustomers} />
        <StatCard title="Pending Loans" value={loansData?.data?.total ?? 0} icon={FileText} iconColor="text-orange-600" iconBg="bg-orange-50 dark:bg-orange-900/20" loading={loadingLoans} />
        <StatCard title="Total Transactions" value={txData?.data?.total ?? 0} icon={ArrowLeftRight} iconColor="text-purple-600" iconBg="bg-purple-50 dark:bg-purple-900/20" loading={loadingTx} />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pending Loan Applications</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild><Link href="/staff/loans">View All</Link></Button>
          <Button size="sm" asChild><Link href="/staff/customers/new"><UserPlus className="h-4 w-4 mr-2" />Register Customer</Link></Button>
        </div>
      </div>
      <DataTable
        columns={loanColumns}
        data={pendingLoans}
        loading={loadingLoans}
        rowKey={(r) => r._id}
        emptyMessage="No pending loan applications"
      />
    </div>
  );
}
