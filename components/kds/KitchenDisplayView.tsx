import React, { useState, useEffect, useMemo } from 'react';
import { KitchenOrder, OrderStatus, ORDER_STATUS_TRANSLATIONS, Recipe, User } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';
import OrderCard from './OrderCard';
import NewOrderModal from './NewOrderModal';
import OrderDetailsModal from './OrderDetailsModal';
import { supabase } from '../../services/supabaseClient';
import { api } from '../../services/api';

interface KitchenDisplayViewProps {
  orders: KitchenOrder[];
  setOrders: React.Dispatch<React.SetStateAction<KitchenOrder[]>>;
  recipes: Recipe[];
  users: User[];
  currentUserId: string;
  currentTeamId: string;
  canManage: boolean;
}

// Notification sound (simple beep using Web Audio API)
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // 800 Hz beep
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

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
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  // Supabase Realtime subscription for live updates
  useEffect(() => {
    if (!supabase) {
      console.log('Supabase not configured - running in offline mode');
      return;
    }

    console.log('🔌 Setting up Realtime subscription for kitchen_orders...');

    const channel = supabase
      .channel('kitchen-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'kitchen_orders',
          filter: `team_id=eq.${currentTeamId}`
        },
        (payload) => {
          console.log('🆕 New order received:', payload.new);
          
          // Transform from snake_case to camelCase
          const newOrder = mapOrderFromDb(payload.new as any);
          
          setOrders(prev => {
            // Check if order already exists (avoid duplicates)
            if (prev.some(o => o.id === newOrder.id)) {
              return prev;
            }
            return [...prev, newOrder];
          });
          
          // Play notification sound
          playNotificationSound();
          
          // Browser notification (if permitted)
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Νέα Παραγγελία! 🍽️', {
              body: `Τραπέζι ${newOrder.tableNumber || 'N/A'} - ${newOrder.items?.length || 0} πιάτα`,
              icon: '/logo.png',
              tag: newOrder.id
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'kitchen_orders',
          filter: `team_id=eq.${currentTeamId}`
        },
        (payload) => {
          console.log('📝 Order updated:', payload.new);
          
          const updatedOrder = mapOrderFromDb(payload.new as any);
          
          setOrders(prev => prev.map(order => 
            order.id === updatedOrder.id ? updatedOrder : order
          ));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'kitchen_orders',
          filter: `team_id=eq.${currentTeamId}`
        },
        (payload) => {
          console.log('🗑️ Order deleted:', payload.old);
          
          setOrders(prev => prev.filter(order => order.id !== (payload.old as any).id));
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setIsRealtimeConnected(status === 'SUBSCRIBED');
      });

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      console.log('🔌 Unsubscribing from Realtime...');
      supabase.removeChannel(channel);
    };
  }, [currentTeamId, setOrders]);

  // Auto-refresh fallback (for offline mode or if realtime fails)
  useEffect(() => {
    if (!autoRefresh || isRealtimeConnected) return;
    
    const interval = setInterval(() => {
      console.log('⏰ Auto-refreshing orders (fallback mode)...');
      // In offline mode, this is just a placeholder
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, isRealtimeConnected]);

  // Helper function to map DB order to app format
  const mapOrderFromDb = (dbOrder: any): KitchenOrder => {
    return {
      id: dbOrder.id,
      teamId: dbOrder.team_id,
      orderNumber: dbOrder.order_number,
      tableNumber: dbOrder.table_number,
      customerName: dbOrder.customer_name,
      items: dbOrder.items || [],
      station: dbOrder.station,
      priority: dbOrder.priority || 'normal',
      status: dbOrder.status,
      source: dbOrder.source,
      externalOrderId: dbOrder.external_order_id,
      createdAt: dbOrder.created_at,
      startedAt: dbOrder.started_at,
      readyAt: dbOrder.ready_at,
      servedAt: dbOrder.served_at,
      cancelledAt: dbOrder.cancelled_at,
      assignedTo: dbOrder.assigned_to,
      notes: dbOrder.notes,
    };
  };

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

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updates: Partial<Pick<KitchenOrder, 'startedAt' | 'readyAt' | 'servedAt' | 'cancelledAt' | 'assignedTo'>> = {};

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

    // Optimistic update
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: newStatus, ...updates } : o
    ));

    // Save to API (async)
    try {
      await api.updateKitchenOrderStatus(orderId, newStatus, updates);
    } catch (error) {
      console.error('Failed to update order status:', error);
      // Revert on error
      setOrders(prev => prev.map(o => 
        o.id === orderId ? order : o
      ));
    }
  };

  const handleCreateOrder = async (orderData: Omit<KitchenOrder, 'id' | 'teamId' | 'createdAt' | 'status'>) => {
    try {
      const newOrder = await api.createKitchenOrder({
        ...orderData,
        teamId: currentTeamId,
        status: 'new',
      });

      // If realtime is connected, it will add the order automatically
      // Otherwise, add it manually
      if (!isRealtimeConnected) {
        setOrders(prev => [...prev, newOrder]);
      }
      
      setIsNewOrderOpen(false);
    } catch (error) {
      console.error('Failed to create order:', error);
      alert(language === 'el' ? 'Σφάλμα δημιουργίας παραγγελίας' : 'Failed to create order');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(language === 'el' ? 'Διαγραφή παραγγελίας;' : 'Delete order?')) return;
    
    // Optimistic delete
    const deletedOrder = orders.find(o => o.id === orderId);
    setOrders(prev => prev.filter(o => o.id !== orderId));
    setSelectedOrder(null);
    
    try {
      await api.deleteKitchenOrder(orderId);
    } catch (error) {
      console.error('Failed to delete order:', error);
      // Restore on error
      if (deletedOrder) {
        setOrders(prev => [...prev, deletedOrder]);
      }
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
              {/* Realtime Connection Indicator */}
              {supabase && (
                <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  isRealtimeConnected 
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                  {isRealtimeConnected ? (language === 'el' ? 'Live' : 'Live') : (language === 'el' ? 'Offline' : 'Offline')}
                </div>
              )}
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
