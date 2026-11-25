"use client";
import { use } from "react";
import { useGetAccountByIdQuery } from "@/redux/features/accounts/accountApi";
import { useGetMyTransactionsQuery } from "@/redux/features/transactions/transactionApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/index";
import { useState } from "react";
import type { ITransaction } from "@/types";
import { useRouter } from "next/navigation";

const txColumns: Column<ITransaction>[] = [
  { key: "ref", header: "Reference", cell: (r) => <span className="font-mono text-xs">{r.transactionRef}</span> },
  { key: "type", header: "Type", cell: (r) => <Badge variant="outline">{r.type}</Badge> },
  { key: "amount", header: "Amount", cell: (r) => <span className="font-semibold">{formatCurrency(r.amount)}</span> },
  { key: "status", header: "Status", cell: (r) => <Badge variant={r.status === "COMPLETED" ? "default" : r.status === "FAILED" ? "destructive" : "secondary"}>{r.status}</Badge> },
  { key: "date", header: "Date", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
];

export default function AccountDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data: accData, isLoading: loadingAcc } = useGetAccountByIdQuery(id);
  const { data: txData, isLoading: loadingTx } = useGetMyTransactionsQuery({ accountId: id, page, limit: 10 });

  const account = accData?.data;
  const txPaginated = txData?.data;

  return (
    <div className="space-y-6">
      <PageHeader title="Account Details" />
      {loadingAcc ? (
        <Skeleton className="h-40 rounded-xl" />
      ) : !account ? (
        <div className="text-center py-16 text-gray-500">Account not found.</div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(account.balance)}</p>
                <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mt-1">{account.accountNumber}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{account.accountType}</Badge>
                <Badge variant={account.status === "ACTIVE" ? "default" : account.status === "FROZEN" ? "secondary" : "destructive"}>{account.status}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {[
                { label: "Currency", value: account.currency },
                { label: "Daily Limit", value: formatCurrency(account.dailyTransferLimit) },
                { label: "Max Single Txn", value: formatCurrency(account.maxSingleTransactionAmount) },
                { label: "Min Balance", value: formatCurrency(account.minimumBalance) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                  <p className="text-gray-500 dark:text-gray-400 text-xs">{label}</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Transactions</h2>
        <DataTable
          columns={txColumns}
          data={txPaginated?.data ?? []}
          loading={loadingTx}
          rowKey={(r) => r._id}
          onRowClick={(r) => router.push(`/customer/transactions/${r._id}`)}
        />
        {txPaginated && (
          <Pagination page={page} totalPages={txPaginated.totalPages} total={txPaginated.total} limit={txPaginated.limit} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
