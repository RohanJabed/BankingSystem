"use client";
import { use } from "react";
import { useGetTransactionByIdQuery } from "@/redux/features/transactions/transactionApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/index";
import { useRouter } from "next/navigation";
import type { IAccount } from "@/types";

export default function AdminTransactionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useGetTransactionByIdQuery(id);
  const tx = data?.data;

  const sender = tx?.senderAccountId as IAccount | undefined;
  const receiver = tx?.receiverAccountId as IAccount | undefined;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="Transaction Details" action={<Button variant="outline" size="sm" onClick={() => router.back()}>Back</Button>} />

      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : !tx ? (
        <div className="text-center py-16 text-gray-500">Transaction not found.</div>
      ) : (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(tx.amount)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-0.5">{tx.transactionRef}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={tx.status === "COMPLETED" ? "default" : tx.status === "FAILED" ? "destructive" : "secondary"}>{tx.status}</Badge>
                {tx.isFlagged && <Badge variant="destructive">Flagged</Badge>}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {[
                { label: "Type", value: tx.type.replace(/_/g, " ") },
                { label: "Amount", value: formatCurrency(tx.amount) },
                { label: "Fee", value: formatCurrency(tx.fee) },
                { label: "From Account", value: sender?.accountNumber ?? "—" },
                { label: "To Account", value: receiver?.accountNumber ?? "—" },
                { label: "Date", value: new Date(tx.createdAt).toLocaleString() },
                ...(tx.flagReason ? [{ label: "Flag Reason", value: tx.flagReason }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                  <p className="text-gray-500 dark:text-gray-400 text-xs">{label}</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5 text-sm">{value}</p>
                </div>
              ))}
            </div>

            {tx.description && (
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{tx.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
