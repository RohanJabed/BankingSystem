"use client";
import { useState, useEffect } from "react";
import { useGetBankingSettingsQuery, useUpdateBankingSettingsMutation } from "@/redux/features/auth/adminApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { IBankingSettings } from "@/types";

export default function AdminSettingsPage() {
  const { data, isLoading } = useGetBankingSettingsQuery();
  const [updateSettings, { isLoading: saving }] = useUpdateBankingSettingsMutation();
  const settings = data?.data as IBankingSettings | undefined;

  const [form, setForm] = useState({
    defaultDailyTransferLimit: "",
    defaultMaxSingleTransaction: "",
    defaultMinimumBalance: "",
    loanInterestRate: "",
    transactionFeePercent: "",
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        defaultDailyTransferLimit: String(settings.defaultDailyTransferLimit),
        defaultMaxSingleTransaction: String(settings.defaultMaxSingleTransaction),
        defaultMinimumBalance: String(settings.defaultMinimumBalance),
        loanInterestRate: String(settings.loanInterestRate),
        transactionFeePercent: String(settings.transactionFeePercent),
      });
    }
  }, [settings]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);
    await updateSettings({
      defaultDailyTransferLimit: Number(form.defaultDailyTransferLimit),
      defaultMaxSingleTransaction: Number(form.defaultMaxSingleTransaction),
      defaultMinimumBalance: Number(form.defaultMinimumBalance),
      loanInterestRate: Number(form.loanInterestRate),
      transactionFeePercent: Number(form.transactionFeePercent),
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  const fields = [
    { key: "defaultDailyTransferLimit", label: "Default Daily Transfer Limit ($)" },
    { key: "defaultMaxSingleTransaction", label: "Max Single Transaction ($)" },
    { key: "defaultMinimumBalance", label: "Minimum Balance ($)" },
    { key: "loanInterestRate", label: "Loan Interest Rate (%)" },
    { key: "transactionFeePercent", label: "Transaction Fee (%)" },
  ] as const;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Banking Settings" description="Configure global banking parameters" />
      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map(({ key, label }) => (
                <div key={key} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    required
                  />
                </div>
              ))}
              {success && <p className="text-sm text-green-600 dark:text-green-400">Settings saved successfully.</p>}
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
