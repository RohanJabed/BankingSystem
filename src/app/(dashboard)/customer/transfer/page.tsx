"use client";
import { useState } from "react";
import { useGetMyAccountsQuery, useTransferMutation } from "@/redux/features/accounts/accountApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, generateIdempotencyKey } from "@/lib/utils/index";
import { useRouter } from "next/navigation";

export default function TransferPage() {
  const router = useRouter();
  const { data: accountsData } = useGetMyAccountsQuery();
  const [transfer, { isLoading }] = useTransferMutation();

  const accounts = accountsData?.data?.filter((a) => a.status === "ACTIVE") ?? [];

  const [form, setForm] = useState({
    senderAccountId: "",
    receiverAccountNumber: "",
    amount: "",
    description: "",
    pin: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedAccount = accounts.find((a) => a._id === form.senderAccountId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return setError("Enter a valid amount.");
    if (form.pin.length !== 4) return setError("PIN must be 4 digits.");

    try {
      const res = await transfer({
        senderAccountId: form.senderAccountId,
        receiverAccountNumber: form.receiverAccountNumber,
        amount: Math.round(amount * 100),
        description: form.description,
        pin: form.pin,
        idempotencyKey: generateIdempotencyKey(),
      }).unwrap();
      setSuccess(`Transfer successful! Ref: ${res.data?.transactionRef}`);
      setForm({ senderAccountId: "", receiverAccountNumber: "", amount: "", description: "", pin: "" });
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      setError(e?.data?.error ?? "Transfer failed.");
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="Fund Transfer" description="Transfer money to another account" />
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>From Account</Label>
              <Select value={form.senderAccountId} onValueChange={(v) => setForm((f) => ({ ...f, senderAccountId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a._id} value={a._id}>
                      {a.accountNumber} — {formatCurrency(a.balance)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedAccount && (
                <p className="text-xs text-gray-500">Available: {formatCurrency(selectedAccount.balance)}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Recipient Account Number</Label>
              <Input placeholder="ACC..." value={form.receiverAccountNumber} onChange={(e) => setForm((f) => ({ ...f, receiverAccountNumber: e.target.value }))} required />
            </div>

            <div className="space-y-1.5">
              <Label>Amount ($)</Label>
              <Input type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required />
            </div>

            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Input placeholder="Payment for..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>

            <div className="space-y-1.5">
              <Label>Transaction PIN</Label>
              <Input type="password" maxLength={4} placeholder="••••" value={form.pin} onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value.replace(/\D/g, "") }))} required />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={isLoading || !form.senderAccountId}>
                {isLoading ? "Processing..." : "Transfer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
