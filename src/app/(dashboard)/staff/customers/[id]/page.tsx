"use client";
import { use } from "react";
import { useGetCustomerByIdQuery } from "@/redux/features/auth/adminApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/index";
import { useRouter } from "next/navigation";
import type { IAccount } from "@/types";

interface CustomerWithAccounts {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  isActive: boolean;
  isBlocked: boolean;
  createdAt: string;
  accounts: IAccount[];
}

export default function StaffCustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useGetCustomerByIdQuery(id);
  const customer = data?.data as unknown as CustomerWithAccounts | undefined;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Customer Details"
        action={<Button variant="outline" size="sm" onClick={() => router.back()}>Back</Button>}
      />

      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : !customer ? (
        <div className="text-center py-16 text-gray-500">Customer not found.</div>
      ) : (
        <>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{customer.firstName} {customer.lastName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={customer.isActive ? "default" : "secondary"}>{customer.isActive ? "Active" : "Inactive"}</Badge>
                  {customer.isBlocked && <Badge variant="destructive">Blocked</Badge>}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                {[
                  { label: "Phone", value: customer.phone || "—" },
                  { label: "Address", value: customer.address || "—" },
                  { label: "Date of Birth", value: customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString() : "—" },
                  { label: "Joined", value: new Date(customer.createdAt).toLocaleDateString() },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                    <p className="text-gray-500 dark:text-gray-400 text-xs">{label}</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5 text-sm">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Accounts</p>
            {customer.accounts?.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No accounts found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.accounts?.map((acc) => (
                  <Card key={acc._id}>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline">{acc.accountType}</Badge>
                        <Badge variant={acc.status === "ACTIVE" ? "default" : acc.status === "FROZEN" ? "secondary" : "destructive"}>
                          {acc.status}
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(acc.balance)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">{acc.accountNumber}</p>
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <div>
                          <p>Daily Limit</p>
                          <p className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(acc.dailyTransferLimit)}</p>
                        </div>
                        <div>
                          <p>Min Balance</p>
                          <p className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(acc.minimumBalance)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
