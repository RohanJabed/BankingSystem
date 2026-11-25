"use client";
import { useState } from "react";
import { useGetAllCustomersQuery } from "@/redux/features/auth/adminApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { SearchFilter } from "@/components/shared/SearchFilter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { IUser } from "@/types";

const columns: Column<IUser>[] = [
  { key: "name", header: "Name", cell: (r) => <span className="font-medium">{r.firstName} {r.lastName}</span> },
  { key: "email", header: "Email", cell: (r) => <span className="text-sm text-gray-600 dark:text-gray-400">{r.email}</span> },
  { key: "phone", header: "Phone", cell: (r) => <span className="text-sm">{r.phone}</span> },
  {
    key: "status", header: "Status", cell: (r) => (
      <div className="flex gap-1">
        <Badge variant={r.isActive ? "default" : "secondary"}>{r.isActive ? "Active" : "Inactive"}</Badge>
        {r.isBlocked && <Badge variant="destructive">Blocked</Badge>}
      </div>
    )
  },
  { key: "joined", header: "Joined", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
];

export default function StaffCustomersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetAllCustomersQuery({ page, limit: 10, search: search || undefined });
  const paginated = data?.data;

  return (
    <div>
      <PageHeader
        title="Customers"
        action={<Button asChild><Link href="/staff/customers/new"><UserPlus className="h-4 w-4 mr-2" />Register Customer</Link></Button>}
      />
      <div className="mb-4">
        <SearchFilter
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search by name, email or phone..."
        />
      </div>
      <DataTable
        columns={columns}
        data={paginated?.data ?? []}
        loading={isLoading}
        rowKey={(r) => r._id}
        onRowClick={(r) => router.push(`/staff/customers/${r._id}`)}
      />
      {paginated && <Pagination page={page} totalPages={paginated.totalPages} total={paginated.total} limit={paginated.limit} onPageChange={setPage} />}
    </div>
  );
}
