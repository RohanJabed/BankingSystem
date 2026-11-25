"use client";
import { useState } from "react";
import { useGetFlaggedTransactionsQuery } from "@/redux/features/transactions/transactionApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/index";
import { useRouter } from "next/navigation";
import type { ITransaction, IAccount } from "@/types";

const columns: Column<ITransaction>[] = [
  { key: "ref", header: "Reference", cell: (r) => <span className="font-mono text-xs">{r.transactionRef}</span> },
  { key: "type", header: "Type", cell: (r) => <Badge variant="outline">{r.type.replace(/_/g, " ")}</Badge> },
  { key: "amount", header: "Amount", cell: (r) => <span className="font-semibold text-red-600">{formatCurrency(r.amount)}</span> },
  { key: "from", header: "From", cell: (r) => { const a = r.senderAccountId as IAccount | undefined; return <span className="font-mono text-xs">{a?.accountNumber ?? "—"}</span>; } },
  { key: "to", header: "To", cell: (r) => { const a = r.receiverAccountId as IAccount | undefined; return <span className="font-mono text-xs">{a?.accountNumber ?? "—"}</span>; } },
  { key: "reason", header: "Flag Reason", cell: (r) => <span className="text-sm text-red-500">{r.flagReason ?? "—"}</span> },
  { key: "date", header: "Date", cell: (r) => new Date(r.createdAt).toLocaleString() },
];

export default function AdminSuspiciousPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetFlaggedTransactionsQuery({ page, limit: 10 });
  const paginated = data?.data;

  return (
    <div>
      <PageHeader title="Suspicious Activities" description="Flagged transactions requiring review" />
      <DataTable
        columns={columns}
        data={paginated?.data ?? []}
        loading={isLoading}
        rowKey={(r) => r._id}
        onRowClick={(r) => router.push(`/admin/transactions/${r._id}`)}
        emptyMessage="No suspicious transactions found"
      />
      {paginated && <Pagination page={page} totalPages={paginated.totalPages} total={paginated.total} limit={paginated.limit} onPageChange={setPage} />}
    </div>
  );
}
