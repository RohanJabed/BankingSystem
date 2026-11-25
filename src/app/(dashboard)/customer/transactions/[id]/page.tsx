"use client";
import { use } from "react";
import { useGetTransactionByIdQuery } from "@/redux/features/transactions/transactionApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/index";
import { useRouter } from "next/navigation";
import type { IAccount } from "@/types";

export default function TransactionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useGetTransactionByIdQuery(id);
  const tx = data?.data;

  const senderAcc = tx?.senderAccountId as IAccount | undefined;
  const receiverAcc = tx?.receiverAccountId as IAccount | undefined;

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="Transaction Details" action={<Button variant="outline" size="sm" onClick={() => router.back()}>Back</Button>} />
      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : !tx ? (
        <div className="text-center py-16 text-gray-500">Transaction not found.</div>
      ) : (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="text-center pb-4 border-b border-gray-100 dark:border-gray-800">
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(tx.amount)}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge variant="outline">{tx.type.replace(/_/g, " ")}</Badge>
                <Badge variant={tx.status === "COMPLETED" ? "default" : tx.status === "FAILED" ? "destructive" : "secondary"}>{tx.status}</Badge>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { label: "Reference", value: tx.transactionRef, mono: true },
                { label: "Fee", value: formatCurrency(tx.fee) },
                { label: "Description", value: tx.description || "—" },
                { label: "From Account", value: senderAcc?.accountNumber ?? "—", mono: true },
                { label: "To Account", value: receiverAcc?.accountNumber ?? "—", mono: true },
                { label: "Date", value: new Date(tx.createdAt).toLocaleString() },
                ...(tx.isFlagged ? [{ label: "Flag Reason", value: tx.flagReason ?? "Suspicious activity" }] : []),
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{label}</span>
                  <span className={`font-medium text-gray-900 dark:text-gray-100 ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
