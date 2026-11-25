"use client";
import { useState } from "react";
import { useGetAllWithdrawalsQuery, useReviewWithdrawalMutation } from "@/redux/features/accounts/depositWithdrawalApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils/index";
import type { IWithdrawalRequest, IUser, IAccount } from "@/types";

export default function AdminWithdrawalsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<IWithdrawalRequest | null>(null);
  const [action, setAction] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [note, setNote] = useState("");

  const { data, isLoading, refetch } = useGetAllWithdrawalsQuery({ page, limit: 10, status: status || undefined });
  const [reviewWithdrawal, { isLoading: reviewing }] = useReviewWithdrawalMutation();
  const paginated = data?.data;

  async function handleReview(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !action) return;
    await reviewWithdrawal({ id: selected._id, status: action, reviewNote: note || undefined });
    setSelected(null);
    setAction(null);
    setNote("");
    refetch();
  }

  const columns: Column<IWithdrawalRequest>[] = [
    { key: "customer", header: "Customer", cell: (r) => { const u = r.userId as IUser | undefined; return <span className="font-medium">{u ? `${u.firstName} ${u.lastName}` : "—"}</span>; } },
    { key: "account", header: "Account", cell: (r) => { const a = r.accountId as IAccount | undefined; return <span className="font-mono text-xs">{a?.accountNumber ?? "—"}</span>; } },
    { key: "amount", header: "Amount", cell: (r) => <span className="font-semibold">{formatCurrency(r.amount)}</span> },
    { key: "status", header: "Status", cell: (r) => <Badge variant={r.status === "APPROVED" ? "default" : r.status === "REJECTED" ? "destructive" : "secondary"}>{r.status}</Badge> },
    { key: "date", header: "Date", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
    {
      key: "action", header: "Action", cell: (r) => r.status === "PENDING" ? (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" onClick={() => { setSelected(r); setAction("APPROVED"); }}>Approve</Button>
          <Button size="sm" variant="destructive" onClick={() => { setSelected(r); setAction("REJECTED"); }}>Reject</Button>
        </div>
      ) : <span className="text-gray-400 text-xs">—</span>
    },
  ];

  return (
    <div>
      <PageHeader title="Withdrawal Approvals" />
      <div className="mb-4">
        <Select value={status} onValueChange={(v) => { setStatus(v === "ALL" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable columns={columns} data={paginated?.data ?? []} loading={isLoading} rowKey={(r) => r._id} />
      {paginated && <Pagination page={page} totalPages={paginated.totalPages} total={paginated.total} limit={paginated.limit} onPageChange={setPage} />}

      <Dialog open={!!selected} onOpenChange={() => { setSelected(null); setAction(null); setNote(""); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{action === "APPROVED" ? "Approve" : "Reject"} Withdrawal</DialogTitle></DialogHeader>
          <form onSubmit={handleReview} className="space-y-4 pt-2">
            {selected && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Amount: <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(selected.amount)}</span>
              </p>
            )}
            <div className="space-y-1.5">
              <Label>Review Note (optional)</Label>
              <Textarea placeholder="Add a note..." value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => { setSelected(null); setAction(null); }}>Cancel</Button>
              <Button type="submit" className="flex-1" variant={action === "REJECTED" ? "destructive" : "default"} disabled={reviewing}>
                {reviewing ? "Processing..." : "Confirm"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
