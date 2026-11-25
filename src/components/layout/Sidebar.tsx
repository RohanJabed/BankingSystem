"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Users, CreditCard, ArrowLeftRight, TrendingDown, TrendingUp,
  FileText, Settings, LogOut, ChevronLeft, ChevronRight, Bell, AlertTriangle,
  BarChart3, Building2, UserPlus, ClipboardList, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { toggleSidebar } from "@/redux/features/ui/uiSlice";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Accounts", href: "/admin/accounts", icon: CreditCard },
  { label: "Transactions", href: "/admin/transactions", icon: ArrowLeftRight },
  { label: "Deposits", href: "/admin/deposits", icon: TrendingUp },
  { label: "Withdrawals", href: "/admin/withdrawals", icon: TrendingDown },
  { label: "Loans", href: "/admin/loans", icon: FileText },
  { label: "Suspicious", href: "/admin/suspicious", icon: AlertTriangle },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const staffNav: NavItem[] = [
  { label: "Dashboard", href: "/staff", icon: LayoutDashboard },
  { label: "Register Customer", href: "/staff/customers/new", icon: UserPlus },
  { label: "Customers", href: "/staff/customers", icon: Users },
  { label: "Transactions", href: "/staff/transactions", icon: ArrowLeftRight },
  { label: "Loan Applications", href: "/staff/loans", icon: ClipboardList },
];

const customerNav: NavItem[] = [
  { label: "Dashboard", href: "/customer", icon: LayoutDashboard },
  { label: "My Accounts", href: "/customer/accounts", icon: CreditCard },
  { label: "Transfer", href: "/customer/transfer", icon: ArrowLeftRight },
  { label: "Deposit", href: "/customer/deposit", icon: TrendingUp },
  { label: "Withdraw", href: "/customer/withdrawal", icon: TrendingDown },
  { label: "Transactions", href: "/customer/transactions", icon: Eye },
  { label: "Loans", href: "/customer/loans", icon: FileText },
  { label: "Notifications", href: "/customer/notifications", icon: Bell },
  { label: "Statements", href: "/customer/statements", icon: BarChart3 },
];

interface SidebarProps {
  role: "ADMIN" | "STAFF" | "CUSTOMER";
  userName: string;
}

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((s) => s.ui.sidebarOpen);

  const navItems = role === "ADMIN" ? adminNav : role === "STAFF" ? staffNav : customerNav;
  const roleLabel = role === "ADMIN" ? "Administrator" : role === "STAFF" ? "Bank Staff" : "Customer";
  const roleColor = role === "ADMIN" ? "text-yellow-400" : role === "STAFF" ? "text-blue-400" : "text-green-400";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full z-40 flex flex-col bg-gray-950 border-r border-gray-800 transition-all duration-300",
        isOpen ? "w-64" : "w-16"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-800">
        <Building2 className="h-8 w-8 text-blue-500 shrink-0" />
        {isOpen && (
          <div className="ml-3 overflow-hidden">
            <p className="text-white font-bold text-sm leading-tight">NexaBank</p>
            <p className={cn("text-xs font-medium", roleColor)}>{roleLabel}</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && item.href !== "/staff" && item.href !== "/customer" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                  title={!isOpen ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {isOpen && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User + Logout */}
      <div className="border-t border-gray-800 p-3 space-y-2">
        {isOpen && (
          <div className="px-2 py-1">
            <p className="text-white text-sm font-medium truncate">{userName}</p>
            <p className={cn("text-xs", roleColor)}>{roleLabel}</p>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
          title={!isOpen ? "Sign Out" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {isOpen && <span>Sign Out</span>}
        </button>
      </div>

      {/* Toggle */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
      >
        {isOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
    </aside>
  );
}
