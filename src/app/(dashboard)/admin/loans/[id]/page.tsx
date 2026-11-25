"use client";
import { use, useState } from "react";
import { useGetLoanByIdQuery, useReviewLoanMutation } from "@/redux/features/loans/loanApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils/index";
import { useRouter } from "next/navigation";
import type { IAccount, IUser } from "@/types";

const statusVariant = (s: string) =>
  s === "ACTIVE" || s === "APPROVED" ? "default" : s === "REJECTED" ? "destructive" : s === "COMPLETED" ? "secondary" : "outline";

export default function AdminLoanDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading, refetch } = useGetLoanByIdQuery(id);
  const [reviewLoan, { isLoading: reviewing }] = useReviewLoanMutation();

  const loan = data?.data;
  const [action, setAction] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [approvedAmount, setApprovedAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  async function handleReview(e: React.FormEvent) {
    e.preventDefault();
    if (!action) return;
    setError("");
    try {
      await reviewLoan({
        id,
        status: action,
        ...(action === "APPROVED" && approvedAmount ? { approvedAmount: Number(approvedAmount) } : {}),
        notes: notes || undefined,
      }).unwrap();
      setAction(null);
      setApprovedAmount("");
      setNotes("");
      refetch();
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      setError(e?.data?.error ?? "Failed to review loan.");
    }
  }

  const loanAccount = loan?.accountId as IAccount | undefined;
  const customer = loan?.userId as IUser | undefined;
  const reviewedBy = loan?.reviewedBy as IUser | undefined;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Loan Application"
        action={
          <div className="flex gap-2">
            {(loan?.status === "PENDING" || loan?.status === "UNDER_REVIEW") && (
              <>
                <Button size="sm" onClick={() => setAction("APPROVED")}>Approve</Button>
                <Button size="sm" variant="destructive" onClick={() => setAction("REJECTED")}>Reject</Button>
              </>
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
                <Badge variant={statusVariant(loan.status)}>{loan.status.replace("_", " ")}</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                {[
                  { label: "Customer", value: customer ? `${customer.firstName} ${customer.lastName}` : "—" },
                  { label: "Email", value: customer?.email ?? "—" },
                  { label: "Account", value: loanAccount?.accountNumber ?? "—" },
                  { label: "Interest Rate", value: `${loan.interestRate}% p.a.` },
                  { label: "Duration", value: `${loan.durationMonths} months` },
                  { label: "Monthly Income", value: formatCurrency(loan.monthlyIncome) },
                  { label: "Employment", value: loan.employmentStatus.replace("_", " ") },
                  { label: "Applied", value: new Date(loan.createdAt).toLocaleDateString() },
                  ...(reviewedBy ? [{ label: "Reviewed By", value: `${reviewedBy.firstName} ${reviewedBy.lastName}` }] : []),
                  ...(loan.approvedAmount != null ? [{ label: "Approved Amount", value: formatCurrency(loan.approvedAmount) }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                    <p className="text-gray-500 dark:text-gray-400 text-xs">{label}</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5 text-sm">{value}</p>
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

      <Dialog open={!!action} onOpenChange={() => { setAction(null); setError(""); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{action === "APPROVED" ? "Approve" : "Reject"} Loan</DialogTitle></DialogHeader>
          <form onSubmit={handleReview} className="space-y-4 pt-2">
            {action === "APPROVED" && (
              <div className="space-y-1.5">
                <Label>Approved Amount</Label>
                <Input
                  type="number"
                  placeholder={loan ? String(loan.requestedAmount) : ""}
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Textarea placeholder="Add review notes..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setAction(null)}>Cancel</Button>
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
