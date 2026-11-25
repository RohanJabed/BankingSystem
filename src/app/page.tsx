import Link from "next/link";
import { Building2, Shield, Zap, TrendingUp, CreditCard, ArrowRight, CheckCircle2, Users, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Shield, title: "Bank-Grade Security", desc: "256-bit encryption, 2FA, and real-time fraud detection keep your money safe." },
  { icon: Zap, title: "Instant Transfers", desc: "Send money to anyone within the bank instantly, 24/7." },
  { icon: TrendingUp, title: "Smart Analytics", desc: "Track your spending, deposits, and financial health with beautiful charts." },
  { icon: CreditCard, title: "Multiple Accounts", desc: "Savings, Current, and Business accounts — all in one place." },
  { icon: Users, title: "Loan Management", desc: "Apply for personal, business, or education loans with transparent terms." },
  { icon: Globe, title: "Always Available", desc: "Access your banking dashboard from any device, anywhere, anytime." },
];

const stats = [
  { value: "50K+", label: "Active Customers" },
  { value: "$2B+", label: "Transactions Processed" },
  { value: "99.9%", label: "Uptime Guarantee" },
  { value: "24/7", label: "Customer Support" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">NexaBank</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">About</Link>
            <Link href="/services" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Services</Link>
            <Link href="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <Lock className="h-3 w-3" />
          Secure Digital Banking Platform
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-6">
          Banking Made{" "}
          <span className="text-blue-600">Simple,</span>
          <br />
          Secure & Smart
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">
          Manage your finances with confidence. Transfer funds, apply for loans, track transactions, and grow your wealth — all in one powerful platform.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="gap-2 px-8">
              Open Free Account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="px-8">Sign In to Dashboard</Button>
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
          {["FDIC Insured", "256-bit SSL", "PCI DSS Compliant", "SOC 2 Certified"].map((badge) => (
            <div key={badge} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              {badge}
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-blue-200 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Everything you need to manage your finances</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">A complete banking platform built for individuals and businesses.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                <f.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Ready to get started?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Join thousands of customers who trust NexaBank for their daily banking needs.</p>
          <Link href="/register">
            <Button size="lg" className="gap-2 px-10">
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">NexaBank</span>
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} NexaBank. All rights reserved. This is a simulated banking platform.</p>
          <div className="flex gap-4">
            <Link href="/about" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">About</Link>
            <Link href="/services" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">Services</Link>
            <Link href="/contact" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
