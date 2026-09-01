"use client";

import { useNotifications, useMarkNotificationsRead } from "@/hooks/use-notifications";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  BellOff,
  CheckCheck,
  CalendarOff,
  Home,
  ClipboardCheck,
  AlertCircle,
  Settings,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  leave: { icon: CalendarOff, color: "text-amber-500", label: "Leave" },
  wfh: { icon: Home, color: "text-blue-500", label: "WFH" },
  attendance: { icon: CheckCheck, color: "text-green-500", label: "Attendance" },
  system: { icon: Settings, color: "text-gray-500", label: "System" },
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
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
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <BellOff className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No notifications</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
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
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`mt-0.5 ${config.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold">{notification.title}</h4>
                        {!notification.read && (
                          <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        onClick={() => handleMarkRead(notification.id)}
                        disabled={markRead.isPending}
                      >
                        Mark read
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
