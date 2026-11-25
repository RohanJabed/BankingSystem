"use client";
import { useGetDashboardStatsQuery } from "@/redux/features/auth/adminApi";
import { useGetAllTransactionsQuery } from "@/redux/features/transactions/transactionApi";
import { useGetAllLoansQuery } from "@/redux/features/loans/loanApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/index";
import { Users, CreditCard, DollarSign, ArrowLeftRight, TrendingUp, TrendingDown, FileText, AlertTriangle } from "lucide-react";

export default function AdminAnalyticsPage() {
  const { data: statsData, isLoading } = useGetDashboardStatsQuery();
  const { data: txData } = useGetAllTransactionsQuery({ limit: 1 });
  const { data: activeLoansData } = useGetAllLoansQuery({ status: "ACTIVE", limit: 1 });
  const { data: completedLoansData } = useGetAllLoansQuery({ status: "COMPLETED", limit: 1 });

  const stats = statsData?.data;

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Overview of banking system performance" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Customers" value={stats?.totalCustomers ?? 0} icon={Users} iconColor="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-900/20" loading={isLoading} />
        <StatCard title="Total Accounts" value={stats?.totalAccounts ?? 0} icon={CreditCard} iconColor="text-purple-600" iconBg="bg-purple-50 dark:bg-purple-900/20" loading={isLoading} />
        <StatCard title="Total Balance" value={formatCurrency(stats?.totalBalance ?? 0)} icon={DollarSign} iconColor="text-green-600" iconBg="bg-green-50 dark:bg-green-900/20" loading={isLoading} />
        <StatCard title="Total Transactions" value={stats?.totalTransactions ?? 0} icon={ArrowLeftRight} iconColor="text-orange-600" iconBg="bg-orange-50 dark:bg-orange-900/20" loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Deposits" value={formatCurrency(stats?.totalDeposits ?? 0)} icon={TrendingUp} iconColor="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-900/20" loading={isLoading} />
        <StatCard title="Total Withdrawals" value={formatCurrency(stats?.totalWithdrawals ?? 0)} icon={TrendingDown} iconColor="text-red-600" iconBg="bg-red-50 dark:bg-red-900/20" loading={isLoading} />
        <StatCard title="Active Loans" value={activeLoansData?.data?.total ?? 0} icon={FileText} iconColor="text-yellow-600" iconBg="bg-yellow-50 dark:bg-yellow-900/20" loading={isLoading} />
        <StatCard title="Completed Loans" value={completedLoansData?.data?.total ?? 0} icon={FileText} iconColor="text-teal-600" iconBg="bg-teal-50 dark:bg-teal-900/20" loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pending Deposits</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats?.pendingDeposits ?? 0}</p>
            <p className="text-xs text-orange-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pending Withdrawals</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats?.pendingWithdrawals ?? 0}</p>
            <p className="text-xs text-orange-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pending Loans</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats?.pendingLoans ?? 0}</p>
            <p className="text-xs text-orange-500 mt-1">Awaiting review</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
