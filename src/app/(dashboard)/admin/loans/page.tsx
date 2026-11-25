"use client";
import { useState } from "react";
import { useGetAllLoansQuery } from "@/redux/features/loans/loanApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils/index";
import { useRouter } from "next/navigation";
import type { ILoan, IUser } from "@/types";

const statusVariant = (s: string) =>
  s === "ACTIVE" || s === "APPROVED" ? "default" : s === "REJECTED" ? "destructive" : s === "COMPLETED" ? "secondary" : "outline";

const columns: Column<ILoan>[] = [
  { key: "customer", header: "Customer", cell: (r) => { const u = r.userId as IUser | undefined; return <span className="font-medium">{u ? `${u.firstName} ${u.lastName}` : "—"}</span>; } },
  { key: "type", header: "Type", cell: (r) => <Badge variant="outline">{r.loanType}</Badge> },
  { key: "requested", header: "Requested", cell: (r) => <span className="font-semibold">{formatCurrency(r.requestedAmount)}</span> },
  { key: "approved", header: "Approved", cell: (r) => r.approvedAmount != null ? <span className="font-semibold">{formatCurrency(r.approvedAmount)}</span> : <span className="text-gray-400">—</span> },
  { key: "duration", header: "Duration", cell: (r) => <span>{r.durationMonths}m</span> },
  { key: "status", header: "Status", cell: (r) => <Badge variant={statusVariant(r.status)}>{r.status.replace("_", " ")}</Badge> },
  { key: "date", header: "Applied", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
];

export default function AdminLoansPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const { data, isLoading } = useGetAllLoansQuery({ page, limit: 10, status: status || undefined });
  const paginated = data?.data;

  return (
    <div>
      <PageHeader title="Loan Management" />
      <div className="mb-4">
        <Select value={status} onValueChange={(v) => { setStatus(v === "ALL" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={columns}
        data={paginated?.data ?? []}
        loading={isLoading}
        rowKey={(r) => r._id}
        onRowClick={(r) => router.push(`/admin/loans/${r._id}`)}
      />
      {paginated && <Pagination page={page} totalPages={paginated.totalPages} total={paginated.total} limit={paginated.limit} onPageChange={setPage} />}
    </div>
  );
}
