"use client";
import { useGetMyLoansQuery } from "@/redux/features/loans/loanApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/index";
import Link from "next/link";
import type { ILoan } from "@/types";

const statusVariant = (s: string) =>
  s === "ACTIVE" || s === "APPROVED" ? "default" : s === "REJECTED" ? "destructive" : s === "COMPLETED" ? "secondary" : "outline";

function LoanCard({ loan }: { loan: ILoan }) {
  return (
    <Link href={`/customer/loans/${loan._id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{loan.loanType} Loan</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{loan.durationMonths} months · {loan.interestRate}% p.a.</p>
            </div>
            <Badge variant={statusVariant(loan.status)}>{loan.status}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Requested</p>
              <p className="font-semibold">{formatCurrency(loan.requestedAmount)}</p>
            </div>
            {loan.approvedAmount != null && (
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Approved</p>
                <p className="font-semibold text-green-600">{formatCurrency(loan.approvedAmount)}</p>
              </div>
            )}
            {loan.status === "ACTIVE" && (
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Outstanding</p>
                <p className="font-semibold text-orange-600">{formatCurrency(loan.outstandingBalance)}</p>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-3">{new Date(loan.createdAt).toLocaleDateString()}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function LoansPage() {
  const { data, isLoading } = useGetMyLoansQuery();
  const loans = data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="My Loans"
        action={<Button asChild><Link href="/customer/loans/apply">Apply for Loan</Link></Button>}
      />
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : loans.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p>No loans found.</p>
          <Button className="mt-4" asChild><Link href="/customer/loans/apply">Apply for your first loan</Link></Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loans.map((loan) => <LoanCard key={loan._id} loan={loan} />)}
        </div>
      )}
    </div>
  );
}
