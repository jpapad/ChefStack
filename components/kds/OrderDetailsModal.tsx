import React from 'react';
import { KitchenOrder, OrderStatus, ORDER_STATUS_TRANSLATIONS, User } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

interface OrderDetailsModalProps {
  order: KitchenOrder;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onDelete: (orderId: string) => void;
  users: User[];
  canManage: boolean;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onStatusChange,
  onDelete,
  users,
  canManage,
}) => {
  const { language } = useTranslation();

  if (!isOpen) return null;

  const assignedUser = order.assignedTo ? users.find(u => u.id === order.assignedTo) : null;
  const statusConfig = ORDER_STATUS_TRANSLATIONS[order.status];

  const getElapsedTime = () => {
    if (!order.startedAt) return null;
    const end = order.readyAt ? new Date(order.readyAt).getTime() : Date.now();
    const start = new Date(order.startedAt).getTime();
    const seconds = Math.floor((end - start) / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const statusActions: { status: OrderStatus; label: string; color: string }[] = [
    { status: 'new', label: ORDER_STATUS_TRANSLATIONS['new'][language], color: 'blue' },
    { status: 'in-progress', label: ORDER_STATUS_TRANSLATIONS['in-progress'][language], color: 'yellow' },
    { status: 'ready', label: ORDER_STATUS_TRANSLATIONS['ready'][language], color: 'green' },
    { status: 'served', label: ORDER_STATUS_TRANSLATIONS['served'][language], color: 'gray' },
    { status: 'cancelled', label: ORDER_STATUS_TRANSLATIONS['cancelled'][language], color: 'red' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                #{order.orderNumber}
                {order.tableNumber && (
                  <span className="text-lg text-gray-600 dark:text-gray-400">
                    - Τραπέζι {order.tableNumber}
                  </span>
                )}
              </h2>
              <div className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium ${
                statusConfig.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                statusConfig.color === 'yellow' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                statusConfig.color === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
              }`}>
                {statusConfig[language]}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Icon name="x" className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Items */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white flex items-center gap-2">
              <Icon name="list" className="w-5 h-5" />
              {language === 'el' ? 'Προϊόντα' : 'Items'}
            </h3>
            <div className="space-y-2">
              {order.items.map(item => (
                <div key={item.id} className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {item.quantity}x {item.recipeName}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {item.notes}
                    </p>
                  )}
                  {item.specialRequests && item.specialRequests.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.specialRequests.map((req, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded">
                          {req}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white flex items-center gap-2">
              <Icon name="clock" className="w-5 h-5" />
              {language === 'el' ? 'Χρονοδιάγραμμα' : 'Timeline'}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Icon name="plus-circle" className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600 dark:text-gray-400">
                  {language === 'el' ? 'Δημιουργήθηκε' : 'Created'}:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(order.createdAt).toLocaleTimeString('el-GR')}
                </span>
              </div>

              {order.startedAt && (
                <div className="flex items-center gap-3 text-sm">
                  <Icon name="play" className="w-4 h-4 text-yellow-600" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {language === 'el' ? 'Ξεκίνησε' : 'Started'}:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(order.startedAt).toLocaleTimeString('el-GR')}
                  </span>
                </div>
              )}

              {order.readyAt && (
                <div className="flex items-center gap-3 text-sm">
                  <Icon name="check-circle" className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {language === 'el' ? 'Έτοιμη' : 'Ready'}:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(order.readyAt).toLocaleTimeString('el-GR')}
                  </span>
                  {order.startedAt && (
                    <span className="text-xs text-gray-500">
                      ({getElapsedTime()})
                    </span>
                  )}
                </div>
              )}

              {order.servedAt && (
                <div className="flex items-center gap-3 text-sm">
                  <Icon name="check" className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {language === 'el' ? 'Σερβιρίστηκε' : 'Served'}:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(order.servedAt).toLocaleTimeString('el-GR')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4">
            {order.station && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'el' ? 'Σταθμός' : 'Station'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">{order.station}</p>
              </div>
            )}

            {assignedUser && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'el' ? 'Ανατέθηκε σε' : 'Assigned to'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">{assignedUser.name}</p>
              </div>
            )}

            {order.estimatedTime && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'el' ? 'Εκτιμώμενος Χρόνος' : 'Estimated Time'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.estimatedTime} {language === 'el' ? 'λεπτά' : 'minutes'}
                </p>
              </div>
            )}
          </div>

          {order.notes && (
            <div>
              <h3 className="font-bold text-sm mb-2 text-gray-900 dark:text-white">
                {language === 'el' ? 'Σημειώσεις' : 'Notes'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                {order.notes}
              </p>
            </div>
          )}

          {/* Status Actions */}
          {canManage && order.status !== 'served' && order.status !== 'cancelled' && (
            <div>
              <h3 className="font-bold text-sm mb-3 text-gray-900 dark:text-white">
                {language === 'el' ? 'Ενέργειες' : 'Actions'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {statusActions.filter(a => a.status !== order.status).map(action => (
                  <button
                    key={action.status}
                    onClick={() => onStatusChange(order.id, action.status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      action.color === 'blue' ? 'bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-300' :
                      action.color === 'yellow' ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700 dark:bg-yellow-900 dark:hover:bg-yellow-800 dark:text-yellow-300' :
                      action.color === 'green' ? 'bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-300' :
                      action.color === 'red' ? 'bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-300' :
                      'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex gap-3">
          {canManage && (
            <button
              onClick={() => onDelete(order.id)}
              className="px-6 py-3 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-300 rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              <Icon name="trash-2" className="w-5 h-5" />
              {language === 'el' ? 'Διαγραφή' : 'Delete'}
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            {language === 'el' ? 'Κλείσιμο' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
