"use client";
import { useState } from "react";
import { useGetAllTransactionsQuery } from "@/redux/features/transactions/transactionApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { SearchFilter } from "@/components/shared/SearchFilter";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils/index";
import { useRouter } from "next/navigation";
import type { ITransaction, IAccount } from "@/types";

const columns: Column<ITransaction>[] = [
  { key: "ref", header: "Reference", cell: (r) => <span className="font-mono text-xs">{r.transactionRef}</span> },
  { key: "type", header: "Type", cell: (r) => <Badge variant="outline">{r.type.replace(/_/g, " ")}</Badge> },
  { key: "amount", header: "Amount", cell: (r) => <span className="font-semibold">{formatCurrency(r.amount)}</span> },
  { key: "from", header: "From", cell: (r) => { const a = r.senderAccountId as IAccount | undefined; return <span className="font-mono text-xs">{a?.accountNumber ?? "—"}</span>; } },
  { key: "to", header: "To", cell: (r) => { const a = r.receiverAccountId as IAccount | undefined; return <span className="font-mono text-xs">{a?.accountNumber ?? "—"}</span>; } },
  { key: "status", header: "Status", cell: (r) => <Badge variant={r.status === "COMPLETED" ? "default" : r.status === "FAILED" ? "destructive" : "secondary"}>{r.status}</Badge> },
  { key: "flagged", header: "Flag", cell: (r) => r.isFlagged ? <Badge variant="destructive">Flagged</Badge> : <span className="text-gray-400 text-xs">—</span> },
  { key: "date", header: "Date", cell: (r) => new Date(r.createdAt).toLocaleString() },
];

export default function AdminTransactionsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetAllTransactionsQuery({ page, limit: 10, type: type || undefined, status: status || undefined, search: search || undefined });
  const paginated = data?.data;

  return (
    <div>
      <PageHeader title="Transaction Management" />
      <div className="flex flex-wrap gap-3 mb-4">
        <SearchFilter search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by reference..." />
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
        onRowClick={(r) => router.push(`/admin/transactions/${r._id}`)}
      />
      {paginated && <Pagination page={page} totalPages={paginated.totalPages} total={paginated.total} limit={paginated.limit} onPageChange={setPage} />}
    </div>
  );
}
