import React, { useState, useEffect, useMemo } from 'react';
import { KitchenOrder, OrderStatus, ORDER_STATUS_TRANSLATIONS, Recipe, User } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';
import OrderCard from './OrderCard.tsx';
import NewOrderModal from './NewOrderModal.tsx';
import OrderDetailsModal from './OrderDetailsModal.tsx';

interface KitchenDisplayViewProps {
  orders: KitchenOrder[];
  setOrders: React.Dispatch<React.SetStateAction<KitchenOrder[]>>;
  recipes: Recipe[];
  users: User[];
  currentUserId: string;
  currentTeamId: string;
  canManage: boolean;
}

const KitchenDisplayView: React.FC<KitchenDisplayViewProps> = ({
  orders,
  setOrders,
  recipes,
  users,
  currentUserId,
  currentTeamId,
  canManage,
}) => {
  const { language } = useTranslation();
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);
  const [filterStation, setFilterStation] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      // In real app, this would fetch from API
      console.log('Auto-refreshing orders...');
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Group orders by status
  const ordersByStatus = useMemo(() => {
    const filtered = filterStation === 'all' 
      ? orders 
      : orders.filter(o => o.station === filterStation);

    return {
      new: filtered.filter(o => o.status === 'new'),
      inProgress: filtered.filter(o => o.status === 'in-progress'),
      ready: filtered.filter(o => o.status === 'ready'),
      served: filtered.filter(o => o.status === 'served'),
    };
  }, [orders, filterStation]);

  // Station list
  const stations = useMemo(() => {
    const stationSet = new Set(orders.map(o => o.station).filter(Boolean));
    return Array.from(stationSet);
  }, [orders]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;

      const updates: Partial<KitchenOrder> = { status: newStatus };

      switch (newStatus) {
        case 'in-progress':
          updates.startedAt = new Date().toISOString();
          updates.assignedTo = currentUserId;
          break;
        case 'ready':
          updates.readyAt = new Date().toISOString();
          break;
        case 'served':
          updates.servedAt = new Date().toISOString();
          break;
        case 'cancelled':
          updates.cancelledAt = new Date().toISOString();
          break;
      }

      return { ...order, ...updates };
    }));
  };

  const handleCreateOrder = (orderData: Omit<KitchenOrder, 'id' | 'teamId' | 'createdAt' | 'status'>) => {
    const newOrder: KitchenOrder = {
      ...orderData,
      id: `order_${Date.now()}`,
      teamId: currentTeamId,
      createdAt: new Date().toISOString(),
      status: 'new',
    };

    setOrders(prev => [...prev, newOrder]);
    setIsNewOrderOpen(false);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm(language === 'el' ? 'Διαγραφή παραγγελίας;' : 'Delete order?')) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setSelectedOrder(null);
    }
  };

  // Statistics
  const stats = useMemo(() => ({
    total: orders.length,
    new: ordersByStatus.new.length,
    inProgress: ordersByStatus.inProgress.length,
    ready: ordersByStatus.ready.length,
    avgTime: orders.length > 0 
      ? orders
          .filter(o => o.startedAt && o.readyAt)
          .reduce((sum, o) => {
            const start = new Date(o.startedAt!).getTime();
            const ready = new Date(o.readyAt!).getTime();
            return sum + (ready - start);
          }, 0) / (1000 * 60) / orders.filter(o => o.startedAt && o.readyAt).length || 0
      : 0,
  }), [orders, ordersByStatus]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Icon name="monitor" className="w-8 h-8 text-blue-600" />
              Kitchen Display System
            </h1>
            <div className="flex items-center gap-2 text-sm">
              <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                {stats.new} {language === 'el' ? 'Νέες' : 'New'}
              </div>
              <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full font-medium">
                {stats.inProgress} {language === 'el' ? 'Σε Εξέλιξη' : 'In Progress'}
              </div>
              <div className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full font-medium">
                {stats.ready} {language === 'el' ? 'Έτοιμες' : 'Ready'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Station Filter */}
            {stations.length > 0 && (
              <select
                value={filterStation}
                onChange={(e) => setFilterStation(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              >
                <option value="all">{language === 'el' ? 'Όλα τα Σταθμά' : 'All Stations'}</option>
                {stations.map(station => (
                  <option key={station} value={station}>{station}</option>
                ))}
              </select>
            )}

            {/* Auto Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
              }`}
              title={language === 'el' ? 'Αυτόματη Ανανέωση' : 'Auto Refresh'}
            >
              <Icon name="refresh-cw" className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>

            {/* New Order */}
            {canManage && (
              <button
                onClick={() => setIsNewOrderOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Icon name="plus" className="w-5 h-5" />
                {language === 'el' ? 'Νέα Παραγγελία' : 'New Order'}
              </button>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-4 flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Icon name="clock" className="w-4 h-4" />
            <span>
              {language === 'el' ? 'Μέσος Χρόνος' : 'Avg Time'}: {stats.avgTime.toFixed(1)} {language === 'el' ? 'λεπτά' : 'min'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="list" className="w-4 h-4" />
            <span>
              {language === 'el' ? 'Σύνολο' : 'Total'}: {stats.total}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="check-circle" className="w-4 h-4" />
            <span>
              {language === 'el' ? 'Ολοκληρωμένες Σήμερα' : 'Completed Today'}: {ordersByStatus.served.length}
            </span>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
          {/* New Orders Column */}
          <div className="flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-lg border-2 border-blue-200 dark:border-blue-800">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-900/20 rounded-t-xl">
              <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <Icon name="inbox" className="w-5 h-5" />
                {language === 'el' ? 'Νέες' : 'New'} ({ordersByStatus.new.length})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {ordersByStatus.new.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  onClick={() => setSelectedOrder(order)}
                  users={users}
                />
              ))}
              {ordersByStatus.new.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Icon name="check-circle" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{language === 'el' ? 'Καμία νέα παραγγελία' : 'No new orders'}</p>
                </div>
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-lg border-2 border-yellow-200 dark:border-yellow-800">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-yellow-50 dark:bg-yellow-900/20 rounded-t-xl">
              <h3 className="font-bold text-lg text-yellow-900 dark:text-yellow-100 flex items-center gap-2">
                <Icon name="loader" className="w-5 h-5" />
                {language === 'el' ? 'Σε Εξέλιξη' : 'In Progress'} ({ordersByStatus.inProgress.length})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {ordersByStatus.inProgress.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  onClick={() => setSelectedOrder(order)}
                  users={users}
                />
              ))}
              {ordersByStatus.inProgress.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Icon name="coffee" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{language === 'el' ? 'Καμία παραγγελία σε εξέλιξη' : 'No orders in progress'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Ready Column */}
          <div className="flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-lg border-2 border-green-200 dark:border-green-800">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-green-50 dark:bg-green-900/20 rounded-t-xl">
              <h3 className="font-bold text-lg text-green-900 dark:text-green-100 flex items-center gap-2">
                <Icon name="check-square" className="w-5 h-5" />
                {language === 'el' ? 'Έτοιμες' : 'Ready'} ({ordersByStatus.ready.length})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {ordersByStatus.ready.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  onClick={() => setSelectedOrder(order)}
                  users={users}
                />
              ))}
              {ordersByStatus.ready.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Icon name="package" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{language === 'el' ? 'Καμία έτοιμη παραγγελία' : 'No ready orders'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Served Column */}
          <div className="flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-gray-900/20 rounded-t-xl">
              <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Icon name="check-circle" className="w-5 h-5" />
                {language === 'el' ? 'Σερβιρισμένες' : 'Served'} ({ordersByStatus.served.length})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {ordersByStatus.served.slice(0, 10).map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  onClick={() => setSelectedOrder(order)}
                  users={users}
                  compact
                />
              ))}
              {ordersByStatus.served.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Icon name="archive" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{language === 'el' ? 'Καμία σερβιρισμένη παραγγελία' : 'No served orders'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isNewOrderOpen && (
        <NewOrderModal
          isOpen={isNewOrderOpen}
          onClose={() => setIsNewOrderOpen(false)}
          onSave={handleCreateOrder}
          recipes={recipes}
        />
      )}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteOrder}
          users={users}
          canManage={canManage}
        />
      )}
    </div>
  );
};

export default KitchenDisplayView;
