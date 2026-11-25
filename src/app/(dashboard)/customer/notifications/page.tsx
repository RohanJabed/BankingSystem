"use client";
import { useGetNotificationsQuery, useMarkAsReadMutation, useMarkAllAsReadMutation } from "@/redux/features/notifications/notificationApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { INotification } from "@/types";

const typeColor: Record<string, string> = {
  TRANSFER: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  DEPOSIT: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  WITHDRAWAL: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  LOAN: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  SYSTEM: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

function NotificationItem({ notif, onRead }: { notif: INotification; onRead: (id: string) => void }) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer",
        notif.isRead
          ? "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
          : "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10"
      )}
      onClick={() => !notif.isRead && onRead(notif._id)}
    >
      <div className={cn("h-9 w-9 rounded-full flex items-center justify-center shrink-0", typeColor[notif.type] ?? typeColor.SYSTEM)}>
        <Bell className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm font-medium", notif.isRead ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-gray-100")}>
            {notif.title}
          </p>
          <span className="text-xs text-gray-400 shrink-0">{new Date(notif.createdAt).toLocaleDateString()}</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{notif.message}</p>
      </div>
      {!notif.isRead && <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />}
    </div>
  );
}

export default function NotificationsPage() {
  const { data, isLoading } = useGetNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: markingAll }] = useMarkAllAsReadMutation();

  const notifications = data?.data?.notifications ?? [];
  const unread = data?.data?.unreadCount ?? 0;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `${unread} unread` : "All caught up"}
        action={
          unread > 0 ? (
            <Button variant="outline" size="sm" onClick={() => markAllAsRead()} disabled={markingAll}>
              <BellOff className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <NotificationItem key={n._id} notif={n} onRead={(id) => markAsRead(id)} />
          ))}
        </div>
      )}
    </div>
  );
}
