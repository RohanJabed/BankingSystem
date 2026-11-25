"use client";
import { useState } from "react";
import { useGetMyAccountsQuery } from "@/redux/features/accounts/accountApi";
import { useGetMyTransactionsQuery } from "@/redux/features/transactions/transactionApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils/index";
import { Download } from "lucide-react";
import type { ITransaction } from "@/types";

const columns: Column<ITransaction>[] = [
  { key: "date", header: "Date", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
  { key: "ref", header: "Reference", cell: (r) => <span className="font-mono text-xs">{r.transactionRef}</span> },
  { key: "type", header: "Type", cell: (r) => <Badge variant="outline">{r.type.replace(/_/g, " ")}</Badge> },
  { key: "desc", header: "Description", cell: (r) => <span className="text-sm text-gray-600 dark:text-gray-400">{r.description || "—"}</span> },
  { key: "amount", header: "Amount", cell: (r) => <span className="font-semibold">{formatCurrency(r.amount)}</span> },
  { key: "status", header: "Status", cell: (r) => <Badge variant={r.status === "COMPLETED" ? "default" : r.status === "FAILED" ? "destructive" : "secondary"}>{r.status}</Badge> },
];

function exportCSV(transactions: ITransaction[], accountNumber: string) {
  const header = "Date,Reference,Type,Description,Amount,Fee,Status\n";
  const rows = transactions.map((t) =>
    [
      new Date(t.createdAt).toLocaleDateString(),
      t.transactionRef,
      t.type,
      `"${t.description || ""}"`,
      (t.amount / 100).toFixed(2),
      (t.fee / 100).toFixed(2),
      t.status,
    ].join(",")
  ).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `statement-${accountNumber}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function StatementsPage() {
  const { data: accountsData } = useGetMyAccountsQuery();
  const accounts = accountsData?.data ?? [];

  const [accountId, setAccountId] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetMyTransactionsQuery(
    { accountId: accountId || undefined, page, limit: 20 },
    { skip: !accountId }
  );
  const paginated = data?.data;
  const selectedAccount = accounts.find((a) => a._id === accountId);

  return (
    <div>
      <PageHeader
        title="Account Statements"
        action={
          paginated && paginated.data.length > 0 && selectedAccount ? (
            <Button variant="outline" size="sm" onClick={() => exportCSV(paginated.data, selectedAccount.accountNumber)}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4">
        <Select value={accountId} onValueChange={(v) => { setAccountId(v); setPage(1); }}>
          <SelectTrigger className="w-72"><SelectValue placeholder="Select an account" /></SelectTrigger>
          <SelectContent>
            {accounts.map((a) => (
              <SelectItem key={a._id} value={a._id}>
                {a.accountNumber} — {a.accountType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!accountId ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">Select an account to view its statement.</div>
      ) : (
        <>
          {selectedAccount && (
            <div className="mb-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedAccount.accountNumber}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{selectedAccount.accountType}</p>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(selectedAccount.balance)}</p>
            </div>
          )}
          <DataTable columns={columns} data={paginated?.data ?? []} loading={isLoading} rowKey={(r) => r._id} />
          {paginated && <Pagination page={page} totalPages={paginated.totalPages} total={paginated.total} limit={paginated.limit} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
