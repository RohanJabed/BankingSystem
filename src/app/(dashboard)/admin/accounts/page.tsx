"use client";
import { useState } from "react";
import { useGetAllAccountsQuery, useUpdateAccountMutation } from "@/redux/features/accounts/accountApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { SearchFilter } from "@/components/shared/SearchFilter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/index";
import type { IAccount, IUser } from "@/types";

const statusVariant = (s: string) => s === "ACTIVE" ? "default" : s === "FROZEN" ? "secondary" : "destructive";

export default function AdminAccountsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const { data, isLoading, refetch } = useGetAllAccountsQuery({ page, limit: 10, search: search || undefined });
  const [updateAccount] = useUpdateAccountMutation();
  const paginated = data?.data;

  async function toggleStatus(acc: IAccount) {
    setUpdating(acc._id);
    const newStatus = acc.status === "ACTIVE" ? "FROZEN" : "ACTIVE";
    await updateAccount({ id: acc._id, data: { status: newStatus } });
    refetch();
    setUpdating(null);
  }

  const columns: Column<IAccount>[] = [
    { key: "number", header: "Account No.", cell: (r) => <span className="font-mono text-xs">{r.accountNumber}</span> },
    { key: "owner", header: "Owner", cell: (r) => { const u = r.userId as IUser | undefined; return <span className="font-medium">{u ? `${u.firstName} ${u.lastName}` : "—"}</span>; } },
    { key: "type", header: "Type", cell: (r) => <Badge variant="outline">{r.accountType}</Badge> },
    { key: "balance", header: "Balance", cell: (r) => <span className="font-semibold">{formatCurrency(r.balance)}</span> },
    { key: "status", header: "Status", cell: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
    { key: "created", header: "Created", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
    {
      key: "action", header: "Action", cell: (r) => (
        <Button size="sm" variant="outline" disabled={updating === r._id} onClick={(e) => { e.stopPropagation(); toggleStatus(r); }}>
          {r.status === "ACTIVE" ? "Freeze" : "Unfreeze"}
        </Button>
      )
    },
  ];

  return (
    <div>
      <PageHeader title="Account Management" />
      <div className="mb-4">
        <SearchFilter search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by account number or owner..." />
      </div>
      <DataTable columns={columns} data={paginated?.data ?? []} loading={isLoading} rowKey={(r) => r._id} />
      {paginated && <Pagination page={page} totalPages={paginated.totalPages} total={paginated.total} limit={paginated.limit} onPageChange={setPage} />}
    </div>
  );
}
