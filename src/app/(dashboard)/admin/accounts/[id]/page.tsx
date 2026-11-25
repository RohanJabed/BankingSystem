"use client";
import { use } from "react";
import { useGetAccountByIdQuery, useUpdateAccountMutation } from "@/redux/features/accounts/accountApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/index";
import { useRouter } from "next/navigation";
import type { IUser } from "@/types";

export default function AdminAccountDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading, refetch } = useGetAccountByIdQuery(id);
  const [updateAccount, { isLoading: updating }] = useUpdateAccountMutation();
  const account = data?.data;
  const owner = account?.userId as IUser | undefined;

  async function toggleStatus() {
    if (!account) return;
    const newStatus = account.status === "ACTIVE" ? "FROZEN" : "ACTIVE";
    await updateAccount({ id, data: { status: newStatus } });
    refetch();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="Account Details" action={<Button variant="outline" size="sm" onClick={() => router.back()}>Back</Button>} />

      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : !account ? (
        <div className="text-center py-16 text-gray-500">Account not found.</div>
      ) : (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(account.balance)}</p>
                <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mt-0.5">{account.accountNumber}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{account.accountType}</Badge>
                <Badge variant={account.status === "ACTIVE" ? "default" : account.status === "FROZEN" ? "secondary" : "destructive"}>{account.status}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {[
                { label: "Owner", value: owner ? `${owner.firstName} ${owner.lastName}` : "—" },
                { label: "Email", value: owner?.email ?? "—" },
                { label: "Currency", value: account.currency },
                { label: "Daily Limit", value: formatCurrency(account.dailyTransferLimit) },
                { label: "Max Transaction", value: formatCurrency(account.maxSingleTransactionAmount) },
                { label: "Min Balance", value: formatCurrency(account.minimumBalance) },
                { label: "Created", value: new Date(account.createdAt).toLocaleDateString() },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                  <p className="text-gray-500 dark:text-gray-400 text-xs">{label}</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5 text-sm">{value}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <Button
                size="sm"
                variant={account.status === "ACTIVE" ? "secondary" : "default"}
                disabled={updating}
                onClick={toggleStatus}
              >
                {account.status === "ACTIVE" ? "Freeze Account" : "Unfreeze Account"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
