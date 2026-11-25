"use client";
import { useGetMyAccountsQuery } from "@/redux/features/accounts/accountApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/index";
import { CreditCard } from "lucide-react";
import Link from "next/link";
import type { IAccount } from "@/types";

function AccountCard({ account }: { account: IAccount }) {
  return (
    <Link href={`/customer/accounts/${account._id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{account.accountType}</Badge>
              <Badge variant={account.status === "ACTIVE" ? "default" : account.status === "FROZEN" ? "secondary" : "destructive"}>
                {account.status}
              </Badge>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(account.balance)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">{account.accountNumber}</p>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div>
              <p>Daily Limit</p>
              <p className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(account.dailyTransferLimit)}</p>
            </div>
            <div>
              <p>Min Balance</p>
              <p className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(account.minimumBalance)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function MyAccountsPage() {
  const { data, isLoading } = useGetMyAccountsQuery();
  const accounts = data?.data ?? [];

  return (
    <div>
      <PageHeader title="My Accounts" description="View and manage your bank accounts" />
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">No accounts found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => <AccountCard key={acc._id} account={acc} />)}
        </div>
      )}
    </div>
  );
}
