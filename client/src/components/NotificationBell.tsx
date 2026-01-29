/**
 * NotificationBell - Componente de notificaciones en tiempo real
 * Piano Emotion Manager
 */

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Query para contar notificaciones no leídas
  const { data: unreadCount, refetch: refetchCount } = trpc.notifications.countUnread.useQuery(
    { userId: user?.id || 0 },
    {
      enabled: !!user,
      refetchInterval: 30000, // Polling cada 30 segundos
    }
  );

  // Query para listar notificaciones
  const { data: notifications, refetch: refetchList } = trpc.notifications.list.useQuery(
    { userId: user?.id || 0, limit: 10 },
    {
      enabled: !!user && isOpen,
    }
  );

  // Mutation para marcar como leída
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      refetchCount();
      refetchList();
    },
  });

  // Mutation para marcar todas como leídas
  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      refetchCount();
      refetchList();
    },
  });

  const handleNotificationClick = (notificationId: number, actionUrl?: string) => {
    markAsReadMutation.mutate({ id: notificationId });
    if (actionUrl) {
      window.location.href = actionUrl;
    }
  };

  const handleMarkAllAsRead = () => {
    if (user) {
      markAllAsReadMutation.mutate({ userId: user.id });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approval_pending':
        return '⏳';
      case 'workflow_completed':
        return '✅';
      case 'workflow_failed':
        return '❌';
      case 'system':
        return 'ℹ️';
      default:
        return '🔔';
    }
  };

  const formatTime = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
    } catch {
      return '';
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount && unreadCount.count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount.count > 9 ? '9+' : unreadCount.count}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          {unreadCount && unreadCount.count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-primary hover:text-primary/80"
              onClick={handleMarkAllAsRead}
            >
              Marcar todas como leídas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications && notifications.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                  !notification.isRead ? 'bg-accent/50' : ''
                }`}
                onClick={() => handleNotificationClick(notification.id, notification.actionUrl || undefined)}
              >
                <div className="flex items-start gap-2 w-full">
                  <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">
                      {notification.title}
                    </p>
                    {notification.message && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No tienes notificaciones
          </div>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/workflows/approvals" className="w-full cursor-pointer">
            <span className="text-sm">Ver todas las aprobaciones pendientes</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
