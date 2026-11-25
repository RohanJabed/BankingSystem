"use client";
import { useState } from "react";
import { useGetMyTransactionsQuery } from "@/redux/features/transactions/transactionApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils/index";
import { useRouter } from "next/navigation";
import type { ITransaction } from "@/types";

const columns: Column<ITransaction>[] = [
  { key: "ref", header: "Reference", cell: (r) => <span className="font-mono text-xs">{r.transactionRef}</span> },
  { key: "type", header: "Type", cell: (r) => <Badge variant="outline">{r.type.replace("_", " ")}</Badge> },
  { key: "amount", header: "Amount", cell: (r) => <span className="font-semibold">{formatCurrency(r.amount)}</span> },
  { key: "fee", header: "Fee", cell: (r) => <span className="text-gray-500">{formatCurrency(r.fee)}</span> },
  { key: "status", header: "Status", cell: (r) => <Badge variant={r.status === "COMPLETED" ? "default" : r.status === "FAILED" ? "destructive" : "secondary"}>{r.status}</Badge> },
  { key: "date", header: "Date", cell: (r) => new Date(r.createdAt).toLocaleString() },
];

export default function TransactionsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  const { data, isLoading } = useGetMyTransactionsQuery({ page, limit: 10, type: type || undefined, status: status || undefined });
  const paginated = data?.data;

  return (
    <div>
      <PageHeader title="Transaction History" />
      <div className="flex gap-3 mb-4">
        <Select value={type} onValueChange={(v) => { setType(v === "ALL" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="TRANSFER">Transfer</SelectItem>
            <SelectItem value="DEPOSIT">Deposit</SelectItem>
            <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
            <SelectItem value="LOAN_DISBURSEMENT">Loan Disbursement</SelectItem>
            <SelectItem value="LOAN_REPAYMENT">Loan Repayment</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { setStatus(v === "ALL" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={columns}
        data={paginated?.data ?? []}
        loading={isLoading}
        rowKey={(r) => r._id}
        onRowClick={(r) => router.push(`/customer/transactions/${r._id}`)}
      />
      {paginated && <Pagination page={page} totalPages={paginated.totalPages} total={paginated.total} limit={paginated.limit} onPageChange={setPage} />}
    </div>
  );
}
