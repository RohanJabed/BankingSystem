"use client";
import { useState } from "react";
import { useGetMyAccountsQuery } from "@/redux/features/accounts/accountApi";
import { useApplyLoanMutation } from "@/redux/features/loans/loanApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, calculateLoanRepayment } from "@/lib/utils/index";
import { useRouter } from "next/navigation";

const LOAN_TYPES = ["PERSONAL", "BUSINESS", "MORTGAGE", "AUTO", "EDUCATION"];
const EMPLOYMENT_STATUSES = ["EMPLOYED", "SELF_EMPLOYED", "UNEMPLOYED", "RETIRED", "STUDENT"];

export default function ApplyLoanPage() {
  const router = useRouter();
  const { data: accountsData } = useGetMyAccountsQuery();
  const [applyLoan, { isLoading }] = useApplyLoanMutation();

  const accounts = accountsData?.data?.filter((a) => a.status === "ACTIVE") ?? [];
  const [form, setForm] = useState({
    accountId: "", loanType: "", requestedAmount: "",
    durationMonths: "", monthlyIncome: "", employmentStatus: "", description: "",
  });
  const [error, setError] = useState("");

  const amount = parseFloat(form.requestedAmount) || 0;
  const months = parseInt(form.durationMonths) || 0;
  const estimate = amount > 0 && months > 0 ? calculateLoanRepayment(Math.round(amount * 100), 12, months) : null;

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await applyLoan({
        accountId: form.accountId,
        loanType: form.loanType,
        requestedAmount: Math.round(parseFloat(form.requestedAmount) * 100),
        durationMonths: parseInt(form.durationMonths),
        monthlyIncome: Math.round(parseFloat(form.monthlyIncome) * 100),
        employmentStatus: form.employmentStatus,
        description: form.description,
      }).unwrap();
      router.push("/customer/loans");
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      setError(e?.data?.error ?? "Application failed.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Apply for Loan" description="Fill in the details to submit your loan application" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Account</Label>
                    <Select value={form.accountId} onValueChange={(v) => set("accountId", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {accounts.map((a) => <SelectItem key={a._id} value={a._id}>{a.accountNumber}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Loan Type</Label>
                    <Select value={form.loanType} onValueChange={(v) => set("loanType", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {LOAN_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Requested Amount ($)</Label>
                    <Input type="number" min="1" step="0.01" placeholder="0.00" value={form.requestedAmount} onChange={(e) => set("requestedAmount", e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Duration (months)</Label>
                    <Input type="number" min="1" max="360" placeholder="12" value={form.durationMonths} onChange={(e) => set("durationMonths", e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Monthly Income ($)</Label>
                    <Input type="number" min="1" step="0.01" placeholder="0.00" value={form.monthlyIncome} onChange={(e) => set("monthlyIncome", e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Employment Status</Label>
                    <Select value={form.employmentStatus} onValueChange={(v) => set("employmentStatus", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {EMPLOYMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Purpose / Description</Label>
                  <Textarea placeholder="Describe the purpose of this loan (min 10 characters)..." value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} required />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>Cancel</Button>
                  <Button type="submit" className="flex-1" disabled={isLoading || !form.accountId || !form.loanType || !form.employmentStatus}>
                    {isLoading ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {estimate && (
          <div>
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-5 space-y-3">
                <p className="font-semibold text-blue-900 dark:text-blue-100 text-sm">Repayment Estimate</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">Based on 12% p.a. interest rate</p>
                {[
                  { label: "Monthly Payment", value: formatCurrency(estimate.monthlyPayment) },
                  { label: "Total Payment", value: formatCurrency(estimate.totalPayment) },
                  { label: "Total Interest", value: formatCurrency(estimate.totalInterest) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-blue-700 dark:text-blue-300">{label}</span>
                    <span className="font-semibold text-blue-900 dark:text-blue-100">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
