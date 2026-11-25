"use client";
import { useGetDashboardStatsQuery } from "@/redux/features/auth/adminApi";
import { useGetAllDepositsQuery, useGetAllWithdrawalsQuery } from "@/redux/features/accounts/depositWithdrawalApi";
import { useGetAllLoansQuery } from "@/redux/features/loans/loanApi";
import { StatCard } from "@/components/shared/StatCard";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, CreditCard, DollarSign, TrendingUp, TrendingDown, ArrowLeftRight, FileText, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils/index";
import Link from "next/link";
import type { IDepositRequest, IWithdrawalRequest, IUser, IAccount } from "@/types";

const depositCols: Column<IDepositRequest>[] = [
  { key: "customer", header: "Customer", cell: (r) => { const u = r.userId as IUser | undefined; return <span className="font-medium">{u ? `${u.firstName} ${u.lastName}` : "—"}</span>; } },
  { key: "amount", header: "Amount", cell: (r) => <span className="font-semibold">{formatCurrency(r.amount)}</span> },
  { key: "date", header: "Date", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
];

const withdrawalCols: Column<IWithdrawalRequest>[] = [
  { key: "customer", header: "Customer", cell: (r) => { const u = r.userId as IUser | undefined; return <span className="font-medium">{u ? `${u.firstName} ${u.lastName}` : "—"}</span>; } },
  { key: "amount", header: "Amount", cell: (r) => <span className="font-semibold">{formatCurrency(r.amount)}</span> },
  { key: "date", header: "Date", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
];

export default function AdminDashboard() {
  const { data: statsData, isLoading } = useGetDashboardStatsQuery();
  const { data: depositsData, isLoading: loadingDeposits } = useGetAllDepositsQuery({ status: "PENDING", limit: 5 });
  const { data: withdrawalsData, isLoading: loadingWithdrawals } = useGetAllWithdrawalsQuery({ status: "PENDING", limit: 5 });
  const { data: loansData } = useGetAllLoansQuery({ status: "PENDING", limit: 1 });

  const stats = statsData?.data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Customers" value={stats?.totalCustomers ?? 0} icon={Users} iconColor="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-900/20" loading={isLoading} />
        <StatCard title="Total Accounts" value={stats?.totalAccounts ?? 0} icon={CreditCard} iconColor="text-purple-600" iconBg="bg-purple-50 dark:bg-purple-900/20" loading={isLoading} />
        <StatCard title="Total Balance" value={formatCurrency(stats?.totalBalance ?? 0)} icon={DollarSign} iconColor="text-green-600" iconBg="bg-green-50 dark:bg-green-900/20" loading={isLoading} />
        <StatCard title="Total Transactions" value={stats?.totalTransactions ?? 0} icon={ArrowLeftRight} iconColor="text-orange-600" iconBg="bg-orange-50 dark:bg-orange-900/20" loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Pending Deposits" value={stats?.pendingDeposits ?? 0} icon={TrendingUp} iconColor="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-900/20" loading={isLoading} />
        <StatCard title="Pending Withdrawals" value={stats?.pendingWithdrawals ?? 0} icon={TrendingDown} iconColor="text-red-600" iconBg="bg-red-50 dark:bg-red-900/20" loading={isLoading} />
        <StatCard title="Pending Loans" value={loansData?.data?.total ?? 0} icon={FileText} iconColor="text-yellow-600" iconBg="bg-yellow-50 dark:bg-yellow-900/20" loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2"><Clock className="h-4 w-4" />Pending Deposits</h2>
            <Button variant="outline" size="sm" asChild><Link href="/admin/deposits">View All</Link></Button>
          </div>
          <DataTable columns={depositCols} data={depositsData?.data?.data ?? []} loading={loadingDeposits} rowKey={(r) => r._id} emptyMessage="No pending deposits" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2"><Clock className="h-4 w-4" />Pending Withdrawals</h2>
            <Button variant="outline" size="sm" asChild><Link href="/admin/withdrawals">View All</Link></Button>
          </div>
          <DataTable columns={withdrawalCols} data={withdrawalsData?.data?.data ?? []} loading={loadingWithdrawals} rowKey={(r) => r._id} emptyMessage="No pending withdrawals" />
        </div>
      </div>
    </div>
  );
}
