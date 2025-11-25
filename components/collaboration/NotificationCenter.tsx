import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

export interface Notification {
  id: string;
  teamId: string;
  userId: string; // Target user
  type: 'info' | 'success' | 'warning' | 'error' | 'task' | 'inventory' | 'shift';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  readAt?: string;
  actionUrl?: string; // Optional link to relevant view
  priority: 'low' | 'medium' | 'high';
}

interface NotificationCenterProps {
  notifications: Notification[];
  currentUserId: string;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (notificationId: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  currentUserId,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}) => {
  const { language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<Notification['type'] | 'all'>('all');

  // Filter notifications for current user
  const userNotifications = useMemo(() => {
    let filtered = notifications.filter(n => n.userId === currentUserId);

    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, currentUserId, filter, typeFilter]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => n.userId === currentUserId && !n.read).length;
  }, [notifications, currentUserId]);

  const typeIcons: Record<Notification['type'], string> = {
    info: 'info',
    success: 'check-circle',
    warning: 'alert-triangle',
    error: 'x-circle',
    task: 'clipboard',
    inventory: 'package',
    shift: 'clock',
  };

  const typeColors: Record<Notification['type'], string> = {
    info: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
    task: 'text-purple-500',
    inventory: 'text-orange-500',
    shift: 'text-cyan-500',
  };

  const typeBgColors: Record<Notification['type'], string> = {
    info: 'bg-blue-50 dark:bg-blue-900/20',
    success: 'bg-green-50 dark:bg-green-900/20',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20',
    error: 'bg-red-50 dark:bg-red-900/20',
    task: 'bg-purple-50 dark:bg-purple-900/20',
    inventory: 'bg-orange-50 dark:bg-orange-900/20',
    shift: 'bg-cyan-50 dark:bg-cyan-900/20',
  };

  const getTimeAgo = (date: string): string => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return language === 'el' ? 'Μόλις τώρα' : 'Just now';
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return language === 'el' ? `${minutes} λεπτά πριν` : `${minutes}m ago`;
    }
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return language === 'el' ? `${hours} ώρες πριν` : `${hours}h ago`;
    }
    const days = Math.floor(seconds / 86400);
    return language === 'el' ? `${days} μέρες πριν` : `${days}d ago`;
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
      >
        <Icon name="bell" className="w-5 h-5 text-light-text dark:text-dark-text" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] text-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-12 w-96 max-h-[600px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-heading font-bold text-light-text dark:text-dark-text">
                  {language === 'el' ? 'Ειδοποιήσεις' : 'Notifications'}
                </h3>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllAsRead}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {language === 'el' ? 'Όλα ως αναγνωσμένα' : 'Mark all read'}
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                  >
                    <Icon name="x" className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filter === 'all'
                      ? 'bg-brand-yellow text-light-text'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {language === 'el' ? 'Όλες' : 'All'} ({userNotifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filter === 'unread'
                      ? 'bg-brand-yellow text-light-text'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {language === 'el' ? 'Μη αναγνωσμένες' : 'Unread'} ({unreadCount})
                </button>
              </div>
            </div>

            {/* Type Filter */}
            <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-700">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-light-text dark:text-dark-text"
              >
                <option value="all">{language === 'el' ? 'Όλοι οι τύποι' : 'All types'}</option>
                <option value="task">{language === 'el' ? 'Εργασίες' : 'Tasks'}</option>
                <option value="inventory">{language === 'el' ? 'Απόθεμα' : 'Inventory'}</option>
                <option value="shift">{language === 'el' ? 'Βάρδιες' : 'Shifts'}</option>
                <option value="info">{language === 'el' ? 'Πληροφορίες' : 'Info'}</option>
                <option value="warning">{language === 'el' ? 'Προειδοποιήσεις' : 'Warnings'}</option>
                <option value="error">{language === 'el' ? 'Σφάλματα' : 'Errors'}</option>
              </select>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {userNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Icon name="bell-off" className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {language === 'el' ? 'Δεν υπάρχουν ειδοποιήσεις' : 'No notifications'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                  {userNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${
                        !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg ${typeBgColors[notification.type]} flex-shrink-0 h-fit`}>
                          <Icon
                            name={typeIcons[notification.type]}
                            className={`w-4 h-4 ${typeColors[notification.type]}`}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-light-text dark:text-dark-text line-clamp-1">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>

                          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-2 line-clamp-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">
                              {getTimeAgo(notification.createdAt)}
                            </span>

                            <div className="flex gap-1">
                              {!notification.read && (
                                <button
                                  onClick={() => onMarkAsRead(notification.id)}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
                                  title={language === 'el' ? 'Επισήμανση ως αναγνωσμένο' : 'Mark as read'}
                                >
                                  <Icon name="check" className="w-3 h-3 text-green-600 dark:text-green-400" />
                                </button>
                              )}
                              <button
                                onClick={() => onDelete(notification.id)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
                                title={language === 'el' ? 'Διαγραφή' : 'Delete'}
                              >
                                <Icon name="trash-2" className="w-3 h-3 text-red-600 dark:text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
