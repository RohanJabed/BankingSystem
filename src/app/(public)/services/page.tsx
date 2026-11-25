import Link from "next/link";
import { Building2, ArrowLeft, CreditCard, ArrowLeftRight, TrendingUp, FileText, Bell, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  { icon: CreditCard, title: "Account Management", desc: "Savings, Current, and Business accounts with real-time balance tracking." },
  { icon: ArrowLeftRight, title: "Fund Transfers", desc: "Instant transfers between accounts within the bank with PIN verification." },
  { icon: TrendingUp, title: "Deposits & Withdrawals", desc: "Submit deposit and withdrawal requests reviewed by bank staff." },
  { icon: FileText, title: "Loan Services", desc: "Apply for personal, business, mortgage, auto, or education loans." },
  { icon: Bell, title: "Notifications", desc: "Real-time notifications for all account activities and transactions." },
  { icon: BarChart3, title: "Analytics & Statements", desc: "Detailed transaction history, spending analytics, and PDF statements." },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <nav className="border-b border-gray-200 dark:border-gray-800 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-gray-100">NexaBank</span>
        </Link>
        <Link href="/"><Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="h-4 w-4" />Back</Button></Link>
      </nav>
      <div className="max-w-5xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Our Services</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-12">Everything you need for modern digital banking.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div key={s.title} className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
              <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-3">
                <s.icon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{s.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
