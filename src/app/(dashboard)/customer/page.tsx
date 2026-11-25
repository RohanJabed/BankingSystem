"use client";
import { useGetMyAccountsQuery } from "@/redux/features/accounts/accountApi";
import { useGetMyTransactionsQuery } from "@/redux/features/transactions/transactionApi";
import { useGetNotificationsQuery } from "@/redux/features/notifications/notificationApi";
import { StatCard } from "@/components/shared/StatCard";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ArrowLeftRight, Bell, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils/index";
import type { ITransaction, IAccount } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const txColumns: Column<ITransaction>[] = [
  { key: "ref", header: "Reference", cell: (r) => <span className="font-mono text-xs">{r.transactionRef}</span> },
  { key: "type", header: "Type", cell: (r) => <Badge variant="outline">{r.type}</Badge> },
  { key: "amount", header: "Amount", cell: (r) => <span className="font-semibold">{formatCurrency(r.amount)}</span> },
  {
    key: "status", header: "Status", cell: (r) => (
      <Badge variant={r.status === "COMPLETED" ? "default" : r.status === "FAILED" ? "destructive" : "secondary"}>
        {r.status}
      </Badge>
    )
  },
  { key: "date", header: "Date", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
];

export default function CustomerDashboard() {
  const { data: accountsData, isLoading: loadingAccounts } = useGetMyAccountsQuery();
  const { data: txData, isLoading: loadingTx } = useGetMyTransactionsQuery({ limit: 5 });
  const { data: notifData } = useGetNotificationsQuery();

  const accounts: IAccount[] = accountsData?.data ?? [];
  const transactions: ITransaction[] = txData?.data?.data ?? [];
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const unread = notifData?.data?.unreadCount ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Balance" value={formatCurrency(totalBalance)} icon={TrendingUp} iconColor="text-green-600" iconBg="bg-green-50 dark:bg-green-900/20" loading={loadingAccounts} />
        <StatCard title="Accounts" value={accounts.length} icon={CreditCard} iconColor="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-900/20" loading={loadingAccounts} />
        <StatCard title="Transactions" value={txData?.data?.total ?? 0} icon={ArrowLeftRight} iconColor="text-purple-600" iconBg="bg-purple-50 dark:bg-purple-900/20" loading={loadingTx} />
        <StatCard title="Notifications" value={unread} subtitle="Unread" icon={Bell} iconColor="text-orange-600" iconBg="bg-orange-50 dark:bg-orange-900/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => (
          <Link key={acc._id} href={`/customer/accounts/${acc._id}`}>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline">{acc.accountType}</Badge>
                <Badge variant={acc.status === "ACTIVE" ? "default" : "destructive"}>{acc.status}</Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(acc.balance)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">{acc.accountNumber}</p>
            </div>
          </Link>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Transactions</h2>
          <Button variant="outline" size="sm" asChild><Link href="/customer/transactions">View All</Link></Button>
        </div>
        <DataTable columns={txColumns} data={transactions} loading={loadingTx} rowKey={(r) => r._id} />
      </div>
    </div>
  );
}
