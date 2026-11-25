"use client";
import Link from "next/link";
import { Bell, Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { toggleSidebar } from "@/redux/features/ui/uiSlice";
import { useGetNotificationsQuery } from "@/redux/features/notifications/notificationApi";
import { cn } from "@/lib/utils";

interface TopbarProps {
  title: string;
  role: string;
}

export function Topbar({ title, role }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((s) => s.ui.sidebarOpen);
  const notifHref = role === "CUSTOMER" ? "/customer/notifications" : role === "ADMIN" ? "/admin" : "/staff";

  const { data } = useGetNotificationsQuery(undefined, { skip: role !== "CUSTOMER" });
  const unread = data?.data?.unreadCount ?? 0;

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="lg:hidden text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        {role === "CUSTOMER" && (
          <Link href={notifHref} className="relative">
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
