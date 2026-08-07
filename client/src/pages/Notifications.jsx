import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { NotificationCard } from '../components/cards/NotificationCard';
import { Button } from '../components/ui/Button';
import * as notificationService from '../services/notificationService';
import { Bell, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await notificationService.markAllAsRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        toast.success('All notifications marked as read');
      }
    } catch (err) {
      toast.error('Failed to update notifications');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase text-black">Notifications</h1>
            <p className="text-xs font-bold text-neutral-600">
              Updates regarding session requests, doctor approvals, and system notices
            </p>
          </div>
          {notifications.some((n) => !n.read) && (
            <Button variant="outline" size="sm" icon={CheckCheck} onClick={handleMarkAllRead}>
              Mark All Read
            </Button>
          )}
        </div>

        {loading ? (
          <p className="text-xs font-bold text-neutral-500 py-12 text-center">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-neutral-300 rounded-2xl bg-white space-y-2">
            <Bell className="w-10 h-10 text-neutral-400 mx-auto" />
            <h3 className="text-base font-black text-black uppercase">No Notifications Yet</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              You don&apos;t have any notifications at the moment. Notifications will appear here when appointments are requested or approved.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <NotificationCard key={item._id || item.id} notification={item} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
