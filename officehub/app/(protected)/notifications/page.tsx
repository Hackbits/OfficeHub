"use client";

import { useNotifications, useMarkNotificationsRead } from "@/hooks/use-notifications";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BellOff,
  CheckCheck,
  CalendarOff,
  Home,
  Settings,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  leave: { icon: CalendarOff, color: "text-amber-500" },
  wfh: { icon: Home, color: "text-blue-500" },
  attendance: { icon: CheckCheck, color: "text-green-500" },
  system: { icon: Settings, color: "text-gray-500" },
};

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const { data: unreadData, isLoading: unreadLoading } = useNotifications({ unreadOnly: true });
  const markRead = useMarkNotificationsRead();

  const notifications = data?.notifications || [];
  const unreadCount = unreadData?.unreadCount || 0;

  if (isLoading || unreadLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  const handleMarkAllRead = () => {
    markRead.mutate({ markAll: true });
  };

  const handleMarkRead = (id: string) => {
    markRead.mutate({ ids: [id] });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={markRead.isPending}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <BellOff className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold">No notifications</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm">
              You&apos;re all caught up! Notifications about leave requests, WFH approvals, and attendance will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.system;
            const Icon = config.icon;

            return (
              <Card
                key={notification.id}
                className={`transition-colors ${
                  !notification.read ? "bg-primary/5 border-primary/20" : ""
                }`}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`mt-0.5 shrink-0 ${config.color}`}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold">{notification.title}</h4>
                        {!notification.read && (
                          <Badge variant="default" className="h-4 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px]">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 h-7 sm:h-8 text-xs sm:text-sm"
                        onClick={() => handleMarkRead(notification.id)}
                        disabled={markRead.isPending}
                      >
                        <span className="hidden sm:inline">Mark read</span>
                        <span className="sm:hidden">Read</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
