"use client";
import { use, useState } from "react";
import { useGetLoanByIdQuery, useRepayLoanMutation } from "@/redux/features/loans/loanApi";
import { useGetMyAccountsQuery } from "@/redux/features/accounts/accountApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency, generateIdempotencyKey } from "@/lib/utils/index";
import { useRouter } from "next/navigation";
import type { IAccount, IUser } from "@/types";

const statusVariant = (s: string) =>
  s === "ACTIVE" || s === "APPROVED" ? "default" : s === "REJECTED" ? "destructive" : s === "COMPLETED" ? "secondary" : "outline";

export default function LoanDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading, refetch } = useGetLoanByIdQuery(id);
  const { data: accountsData } = useGetMyAccountsQuery();
  const [repay, { isLoading: repaying }] = useRepayLoanMutation();

  const loan = data?.data;
  const accounts = accountsData?.data?.filter((a) => a.status === "ACTIVE") ?? [];

  const [showRepay, setShowRepay] = useState(false);
  const [repayForm, setRepayForm] = useState({ accountId: "", amount: "", pin: "" });
  const [repayError, setRepayError] = useState("");

  async function handleRepay(e: React.FormEvent) {
    e.preventDefault();
    setRepayError("");
    const amount = parseFloat(repayForm.amount);
    if (!amount || amount <= 0) return setRepayError("Enter a valid amount.");
    if (repayForm.pin.length !== 4) return setRepayError("PIN must be 4 digits.");
    try {
      await repay({ id, accountId: repayForm.accountId, amount: Math.round(amount * 100), pin: repayForm.pin, idempotencyKey: generateIdempotencyKey() }).unwrap();
      setShowRepay(false);
      setRepayForm({ accountId: "", amount: "", pin: "" });
      refetch();
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      setRepayError(e?.data?.error ?? "Repayment failed.");
    }
  }

  const reviewedByUser = loan?.reviewedBy as IUser | undefined;
  const loanAccount = loan?.accountId as IAccount | undefined;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Loan Details"
        action={
          <div className="flex gap-2">
            {loan?.status === "ACTIVE" && (
              <Button size="sm" onClick={() => setShowRepay(true)}>Make Repayment</Button>
            )}
            <Button variant="outline" size="sm" onClick={() => router.back()}>Back</Button>
          </div>
        }
      />

      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : !loan ? (
        <div className="text-center py-16 text-gray-500">Loan not found.</div>
      ) : (
        <>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(loan.requestedAmount)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{loan.loanType} Loan</p>
                </div>
                <Badge variant={statusVariant(loan.status)}>{loan.status}</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                {[
                  { label: "Interest Rate", value: `${loan.interestRate}% p.a.` },
                  { label: "Duration", value: `${loan.durationMonths} months` },
                  { label: "Account", value: loanAccount?.accountNumber ?? "—" },
                  ...(loan.approvedAmount != null ? [{ label: "Approved Amount", value: formatCurrency(loan.approvedAmount) }] : []),
                  ...(loan.status === "ACTIVE" ? [{ label: "Outstanding", value: formatCurrency(loan.outstandingBalance) }] : []),
                  ...(loan.disbursedAt ? [{ label: "Disbursed", value: new Date(loan.disbursedAt).toLocaleDateString() }] : []),
                  { label: "Employment", value: loan.employmentStatus.replace("_", " ") },
                  { label: "Applied", value: new Date(loan.createdAt).toLocaleDateString() },
                  ...(reviewedByUser ? [{ label: "Reviewed By", value: `${reviewedByUser.firstName} ${reviewedByUser.lastName}` }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                    <p className="text-gray-500 dark:text-gray-400 text-xs">{label}</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {loan.description && (
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Purpose</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{loan.description}</p>
                </div>
              )}
              {loan.notes && (
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Review Notes</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{loan.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {loan.repaymentSchedule && loan.repaymentSchedule.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <p className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Repayment Schedule</p>
                <div className="space-y-2">
                  {loan.repaymentSchedule.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <span className="text-gray-500 dark:text-gray-400">{new Date(s.dueDate).toLocaleDateString()}</span>
                      <span className="font-medium">{formatCurrency(s.amount)}</span>
                      <Badge variant={s.isPaid ? "default" : "outline"}>{s.isPaid ? "Paid" : "Pending"}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Dialog open={showRepay} onOpenChange={setShowRepay}>
        <DialogContent>
          <DialogHeader><DialogTitle>Make Repayment</DialogTitle></DialogHeader>
          <form onSubmit={handleRepay} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>From Account</Label>
              <Select value={repayForm.accountId} onValueChange={(v) => setRepayForm((f) => ({ ...f, accountId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => <SelectItem key={a._id} value={a._id}>{a.accountNumber} — {formatCurrency(a.balance)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Amount ($)</Label>
              <Input type="number" min="0.01" step="0.01" placeholder="0.00" value={repayForm.amount} onChange={(e) => setRepayForm((f) => ({ ...f, amount: e.target.value }))} required />
              {loan && <p className="text-xs text-gray-500">Outstanding: {formatCurrency(loan.outstandingBalance)}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Transaction PIN</Label>
              <Input type="password" maxLength={4} placeholder="••••" value={repayForm.pin} onChange={(e) => setRepayForm((f) => ({ ...f, pin: e.target.value.replace(/\D/g, "") }))} required />
            </div>
            {repayError && <p className="text-sm text-red-500">{repayError}</p>}
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowRepay(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={repaying || !repayForm.accountId}>
                {repaying ? "Processing..." : "Confirm Repayment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
