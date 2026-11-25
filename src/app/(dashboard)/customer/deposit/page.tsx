"use client";
import { useState } from "react";
import { useGetMyAccountsQuery } from "@/redux/features/accounts/accountApi";
import { useRequestDepositMutation } from "@/redux/features/accounts/depositWithdrawalApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils/index";
import { useRouter } from "next/navigation";

export default function DepositPage() {
  const router = useRouter();
  const { data: accountsData } = useGetMyAccountsQuery();
  const [requestDeposit, { isLoading }] = useRequestDepositMutation();

  const accounts = accountsData?.data?.filter((a) => a.status === "ACTIVE") ?? [];
  const [form, setForm] = useState({ accountId: "", amount: "", description: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return setError("Enter a valid amount.");

    try {
      await requestDeposit({ accountId: form.accountId, amount: Math.round(amount * 100), description: form.description }).unwrap();
      setSuccess("Deposit request submitted. Awaiting approval.");
      setForm({ accountId: "", amount: "", description: "" });
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      setError(e?.data?.error ?? "Request failed.");
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="Deposit Request" description="Submit a deposit request for approval" />
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Account</Label>
              <Select value={form.accountId} onValueChange={(v) => setForm((f) => ({ ...f, accountId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a._id} value={a._id}>
                      {a.accountNumber} — {formatCurrency(a.balance)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Amount ($)</Label>
              <Input type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required />
            </div>

            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Textarea placeholder="Reason for deposit..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={isLoading || !form.accountId}>
                {isLoading ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
