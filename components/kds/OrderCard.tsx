import React, { useState, useEffect } from 'react';
import { KitchenOrder, OrderStatus, ORDER_STATUS_TRANSLATIONS, ORDER_PRIORITY_TRANSLATIONS, User } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

interface OrderCardProps {
  order: KitchenOrder;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onClick: () => void;
  users: User[];
  compact?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onStatusChange,
  onClick,
  users,
  compact = false,
}) => {
  const { language } = useTranslation();
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer for in-progress orders
  useEffect(() => {
    if (order.status !== 'in-progress' || !order.startedAt) return;

    const interval = setInterval(() => {
      const start = new Date(order.startedAt!).getTime();
      const now = Date.now();
      setElapsedTime(Math.floor((now - start) / 1000)); // seconds
    }, 1000);

    return () => clearInterval(interval);
  }, [order.status, order.startedAt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      'new': 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
      'in-progress': 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
      'ready': 'border-green-500 bg-green-50 dark:bg-green-900/20',
      'served': 'border-gray-400 bg-gray-50 dark:bg-gray-900/20',
      'cancelled': 'border-red-500 bg-red-50 dark:bg-red-900/20',
    };
    return colors[status];
  };

  const getPriorityBadge = () => {
    if (order.priority === 'low' || order.priority === 'normal') return null;
    
    const config = ORDER_PRIORITY_TRANSLATIONS[order.priority];
    const colors = {
      high: 'bg-orange-500 text-white',
      urgent: 'bg-red-500 text-white animate-pulse',
    };

    return (
      <div className={`px-2 py-0.5 rounded text-xs font-bold ${colors[order.priority]}`}>
        {config[language]}
      </div>
    );
  };

  const getNextStatus = (): OrderStatus | null => {
    switch (order.status) {
      case 'new':
        return 'in-progress';
      case 'in-progress':
        return 'ready';
      case 'ready':
        return 'served';
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus();
  const statusConfig = ORDER_STATUS_TRANSLATIONS[order.status];
  const assignedUser = order.assignedTo ? users.find(u => u.id === order.assignedTo) : null;

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${getStatusColor(order.status)}`}
      >
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-gray-900 dark:text-white">#{order.orderNumber}</span>
          {order.tableNumber && (
            <span className="text-gray-600 dark:text-gray-400">Τραπέζι {order.tableNumber}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${getStatusColor(order.status)}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-lg text-gray-900 dark:text-white">
              #{order.orderNumber}
            </h4>
            {getPriorityBadge()}
          </div>
          {order.tableNumber && (
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
              <Icon name="users" className="w-3 h-3" />
              Τραπέζι {order.tableNumber}
            </p>
          )}
        </div>

        {order.status === 'in-progress' && (
          <div className="text-right">
            <div className={`text-2xl font-mono font-bold ${
              elapsedTime > (order.estimatedTime || 20) * 60 ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {formatTime(elapsedTime)}
            </div>
            {order.estimatedTime && (
              <div className="text-xs text-gray-500">
                / {order.estimatedTime} min
              </div>
            )}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="space-y-1 mb-3">
        {order.items.map(item => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300">
              {item.quantity}x {item.recipeName}
            </span>
            {item.notes && (
              <span className="text-xs text-gray-500" title={item.notes}>
                <Icon name="message-circle" className="w-3 h-3" />
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {assignedUser && (
            <span className="flex items-center gap-1">
              <Icon name="user" className="w-3 h-3" />
              {assignedUser.name}
            </span>
          )}
          {!assignedUser && order.station && (
            <span className="flex items-center gap-1">
              <Icon name="map-pin" className="w-3 h-3" />
              {order.station}
            </span>
          )}
        </div>

        {nextStatus && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(order.id, nextStatus);
            }}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              nextStatus === 'in-progress'
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : nextStatus === 'ready'
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            {ORDER_STATUS_TRANSLATIONS[nextStatus][language]}
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
