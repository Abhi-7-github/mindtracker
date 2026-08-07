import React from 'react';
import { Card } from '../ui/Card';
import { Bell, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const NotificationCard = ({ notification, onMarkRead }) => {
  const { title, body, read, type, createdAt } = notification;

  const icons = {
    info: Info,
    appointment: CheckCircle2,
    warning: AlertCircle,
    default: Bell,
  };

  const IconComponent = icons[type] || icons.default;

  return (
    <Card className={`p-4 transition-colors ${read ? 'bg-neutral-50 opacity-75' : 'bg-white border-l-4 border-l-[#B82126]'}`}>
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg polo-border ${read ? 'bg-neutral-200 text-neutral-600' : 'bg-[#B82126] text-white'}`}>
          <IconComponent className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-black text-black">{title || 'Notification'}</h5>
            {createdAt && (
              <span className="text-[10px] font-semibold text-neutral-500">
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-neutral-700 mt-1">{body}</p>
        </div>
      </div>
    </Card>
  );
};
