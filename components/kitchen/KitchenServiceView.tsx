import React, { useMemo, useState, useEffect } from 'react';
import {
  KitchenServiceOrder,
  KitchenServiceOrderStatus,
  KitchenOrderItemStatus,
  User,
  Workstation,
  Role,
  RolePermissions
} from '../../types';
import { Icon } from '../common/Icon';
import { api } from '../../services/api';

interface KitchenServiceViewProps {
  teamId: string;
  currentUser: User;
  workstations: Workstation[];
  currentUserRole?: Role;
  rolePermissions: RolePermissions;
  /** ενημερώνει τον γονιό (KitchenInterface) για πόσες “ανοιχτές” παραγγελίες υπάρχουν */
  onOpenOrdersCountChange?: (count: number) => void;
}

type NewOrderForm = {
  tableNumber: string;
  itemName: string;
  quantity: number;
  notes: string;
  workstationId?: string;
};

const STATUS_LABELS: Record<KitchenServiceOrderStatus, string> = {
  new: 'Νέα',
  in_progress: 'Σε εξέλιξη',
  ready: 'Έτοιμη',
  served: 'Σέρβιρεται / Έγινε',
  cancelled: 'Ακυρωμένη'
};

const STATUS_COLORS: Record<KitchenServiceOrderStatus, string> = {
  new: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-100',
  in_progress:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100',
  ready:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100',
  served:
    'bg-slate-100 text-slate-800 dark:bg-slate-800/60 dark:text-slate-100',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-100'
};

const ITEM_STATUS_LABELS: Record<KitchenOrderItemStatus, string> = {
  pending: 'Pending',
  prepping: 'Prepping',
  ready: 'Ready',
  cancelled: 'Cancelled'
};

const KitchenServiceView: React.FC<KitchenServiceViewProps> = ({
  teamId,
  currentUser,
  workstations,
  currentUserRole,
  rolePermissions,
  onOpenOrdersCountChange
}) => {
  const [orders, setOrders] = useState<KitchenServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [form, setForm] = useState<NewOrderForm>({
    tableNumber: '',
    itemName: '',
    quantity: 1,
    notes: '',
    workstationId: workstations[0]?.id
  });

  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<KitchenServiceOrderStatus | 'all'>('all');

  const canManageKitchenService =
    currentUserRole &&
    rolePermissions[currentUserRole]?.includes('manage_kitchen_service');

  const isReadOnly = !canManageKitchenService;

  // ⏱ κρατάμε ένα "τώρα" ώστε να ανανεώνεται ο χρόνος που είναι ανοικτή η παραγγελία
  const [now, setNow] = useState<Date>(new Date());

  // ⏱ interval που ανανεώνει το "τώρα" κάθε 30s
  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  // 📥 Φόρτωση παραγγελιών από Supabase
  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      setIsLoading(true);
      try {
        const data = await api.fetchKitchenServiceOrders(teamId);
        if (cancelled) return;

        // Normalize dates
        const normalized = data.map((o) => ({
          ...o,
          createdAt:
            o.createdAt instanceof Date
              ? o.createdAt
              : new Date((o as any).createdAt),
          updatedAt:
            o.updatedAt instanceof Date
              ? o.updatedAt
              : new Date((o as any).updatedAt)
        }));

        setOrders(normalized);
        setLoadError(null);
      } catch (e: any) {
        if (cancelled) return;
        console.error('Failed to load kitchen-service orders', e);
        setLoadError(
          e?.message || 'Αποτυχία φόρτωσης Kitchen–Service παραγγελιών.'
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [teamId]);

  // 🔢 Υπολογισμός πόσες παραγγελίες είναι "ανοιχτές" για badge (new + in_progress + ready)
  useEffect(() => {
    const openCount = orders.filter(
      (o) =>
        o.teamId === teamId &&
        o.status !== 'served' &&
        o.status !== 'cancelled'
    ).length;
    if (onOpenOrdersCountChange) {
      onOpenOrdersCountChange(openCount);
    }
  }, [orders, teamId, onOpenOrdersCountChange]);

  // 🔍 Παράγωγες τιμές
  const filteredOrders = useMemo(() => {
    const base = orders.filter((o) => o.teamId === teamId);
    if (selectedStatusFilter === 'all') return base;
    return base.filter((o) => o.status === selectedStatusFilter);
  }, [orders, teamId, selectedStatusFilter]);

  const groupedByStatus = useMemo(() => {
    const groups: Record<KitchenServiceOrderStatus, KitchenServiceOrder[]> = {
      new: [],
      in_progress: [],
      ready: [],
      served: [],
      cancelled: []
    };
    for (const order of filteredOrders) {
      groups[order.status].push(order);
    }
    return groups;
  }, [filteredOrders]);

  const handleFormChange = (
    field: keyof NewOrderForm,
    value: string | number | undefined
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ⏱ helper: πόση ώρα είναι ανοικτή μια παραγγελία (σε λεπτά)
  const getOrderAgeMinutes = (order: KitchenServiceOrder): number => {
    const created =
      order.createdAt instanceof Date
        ? order.createdAt
        : new Date((order as any).createdAt);
    const diffMs = now.getTime() - created.getTime();
    if (!isFinite(diffMs) || diffMs < 0) return 0;
    return Math.floor(diffMs / 60000);
  };

  const formatAge = (order: KitchenServiceOrder): string => {
    const minutes = getOrderAgeMinutes(order);
    if (minutes < 1) return '0′';
    if (minutes < 60) return `${minutes}′`;
    const hours = Math.floor(minutes / 60);
    const rem = minutes % 60;
    return rem > 0 ? `${hours}ω ${rem}′` : `${hours}ω`;
  };

  const ageColorClass = (order: KitchenServiceOrder): string => {
    const m = getOrderAgeMinutes(order);
    if (m >= 20) return 'text-red-500';
    if (m >= 10) return 'text-amber-500';
    return 'text-emerald-600';
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isReadOnly) {
      alert('Δεν έχεις δικαίωμα να καταχωρείς παραγγελίες (read-only πρόσβαση).');
      return;
    }

    if (!form.itemName.trim()) {
      alert('Γράψε τουλάχιστον ένα πιάτο για την παραγγελία.');
      return;
    }

    const nowDate = new Date();

    const newId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? (crypto as any).randomUUID()
        : `order_${nowDate.getTime()}_${Math.random().toString(16).slice(2)}`;

    const payload: KitchenServiceOrder = {
      id: newId,
      teamId,
      channelId: undefined,
      tableNumber: form.tableNumber || undefined,
      externalRef: undefined,
      status: 'new',
      items: [
        {
          id: `item_${nowDate.getTime()}`,
          recipeId: undefined,
          customName: form.itemName.trim(),
          quantity: form.quantity || 1,
          status: 'pending',
          workstationId: form.workstationId,
          notes: form.notes || '',
          tags: []
        }
      ],
      notes: form.notes || '',
      createdAt: nowDate,
      updatedAt: nowDate,
      createdByUserId: currentUser.id,
      servedByUserId: undefined
    };

    try {
      const saved = await api.saveKitchenServiceOrder(payload);
      const normalized: KitchenServiceOrder = {
        ...saved,
        createdAt:
          saved.createdAt instanceof Date
            ? saved.createdAt
            : new Date((saved as any).createdAt),
        updatedAt:
          saved.updatedAt instanceof Date
            ? saved.updatedAt
            : new Date((saved as any).updatedAt)
      };
      setOrders((prev) => [normalized, ...prev]);

      setForm({
        tableNumber: '',
        itemName: '',
        quantity: 1,
        notes: '',
        workstationId: workstations[0]?.id
      });
    } catch (err: any) {
      console.error('Failed to create order', err);
      alert(
        err?.message ||
          'Αποτυχία δημιουργίας Kitchen–Service παραγγελίας μέσω Supabase.'
      );
    }
  };

  const handleChangeOrderStatus = (
    orderId: string,
    newStatus: KitchenServiceOrderStatus
  ) => {
    if (isReadOnly) {
      alert('Δεν έχεις δικαίωμα να αλλάζεις την κατάσταση παραγγελιών.');
      return;
    }

    setOrders((prev) => {
      let updatedOrder: KitchenServiceOrder | null = null;
      const next = prev.map((o) => {
        if (o.id !== orderId) return o;
        updatedOrder = {
          ...o,
          status: newStatus,
          updatedAt: new Date()
        };
        return updatedOrder;
      });

      if (updatedOrder) {
        api
          .saveKitchenServiceOrder(updatedOrder)
          .catch((err) =>
            console.error('Failed to persist order status change', err)
          );
      }

      return next;
    });
  };

  const handleBumpItemStatus = (orderId: string, itemId: string) => {
    if (isReadOnly) {
      alert('Δεν έχεις δικαίωμα να αλλάζεις την κατάσταση των πιάτων.');
      return;
    }

    setOrders((prev) => {
      let updatedOrder: KitchenServiceOrder | null = null;
      const next = prev.map((order) => {
        if (order.id !== orderId) return order;

        const updatedItems = order.items.map((item) => {
          if (item.id !== itemId) return item;

          let nextStatus: KitchenOrderItemStatus = item.status;
          if (item.status === 'pending') nextStatus = 'prepping';
          else if (item.status === 'prepping') nextStatus = 'ready';
          else if (item.status === 'ready') nextStatus = 'ready';

          return { ...item, status: nextStatus };
        });

        updatedOrder = {
          ...order,
          items: updatedItems,
          updatedAt: new Date()
        };

        return updatedOrder;
      });

      if (updatedOrder) {
        api
          .saveKitchenServiceOrder(updatedOrder)
          .catch((err) =>
            console.error('Failed to persist item status change', err)
          );
      }

      return next;
    });
  };

  const handleCancelOrder = (orderId: string) => {
    if (isReadOnly) {
      alert('Δεν έχεις δικαίωμα να ακυρώνεις παραγγελίες.');
      return;
    }

    const ok = window.confirm('Σίγουρα θέλεις να ακυρώσεις την παραγγελία;');
    if (!ok) return;

    handleChangeOrderStatus(orderId, 'cancelled');
  };

  const handleMarkServed = (orderId: string) => {
    if (isReadOnly) {
      alert('Δεν έχεις δικαίωμα να κλείνεις παραγγελίες ως σερβιρισμένες.');
      return;
    }

    setOrders((prev) => {
      let updatedOrder: KitchenServiceOrder | null = null;
      const next = prev.map((o) => {
        if (o.id !== orderId) return o;
        updatedOrder = {
          ...o,
          status: 'served',
          updatedAt: new Date(),
          servedByUserId: currentUser.id
        };
        return updatedOrder;
      });

      if (updatedOrder) {
        api
          .saveKitchenServiceOrder(updatedOrder)
          .catch((err) =>
            console.error('Failed to persist served status change', err)
          );
      }

      return next;
    });
  };

  const formatTime = (d: Date) =>
    d instanceof Date
      ? d.toLocaleTimeString('el-GR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      : '';

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Πάνω μπάρα: φόρμα & φίλτρα */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Φόρμα νέας παραγγελίας */}
        <div className="xl:col-span-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg border border-white/30 dark:border-slate-700/50 rounded-2xl shadow-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
              <Icon name="clipboard-list" className="w-5 h-5" />
              Νέα Παραγγελία (Kitchen–Service)
            </h2>
            {isReadOnly && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600">
                <Icon name="lock" className="w-3 h-3" />
                Read-only
              </span>
            )}
          </div>

          <form onSubmit={handleCreateOrder} className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs mb-1">Τραπέζι / Ref</label>
                <input
                  type="text"
                  value={form.tableNumber}
                  onChange={(e) =>
                    handleFormChange('tableNumber', e.target.value)
                  }
                  className="w-full border rounded px-2 py-1 bg-white dark:bg-slate-900"
                  placeholder="π.χ. T12 ή Takeaway #5"
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Σταθμός</label>
                <select
                  value={form.workstationId}
                  onChange={(e) =>
                    handleFormChange(
                      'workstationId',
                      e.target.value || undefined
                    )
                  }
                  className="w-full border rounded px-2 py-1 bg-white dark:bg-slate-900"
                  disabled={isReadOnly}
                >
                  <option value="">— Όλοι —</option>
                  {workstations.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-xs mb-1">Πιάτο</label>
                <input
                  type="text"
                  value={form.itemName}
                  onChange={(e) =>
                    handleFormChange('itemName', e.target.value)
                  }
                  className="w-full border rounded px-2 py-1 bg-white dark:bg-slate-900"
                  placeholder="π.χ. Μοσχαράκι κοκκινιστό"
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Τεμάχια</label>
                <input
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={(e) =>
                    handleFormChange('quantity', Number(e.target.value) || 1)
                  }
                  className="w-full border rounded px-2 py-1 bg-white dark:bg-slate-900"
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1">
                Σχόλια (χωρίς, καλά ψημένο κ.λπ.)
              </label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                className="w-full border rounded px-2 py-1 bg-white dark:bg-slate-900 resize-none"
                disabled={isReadOnly}
              />
            </div>

            <button
              type="submit"
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isReadOnly
                  ? 'bg-slate-300 text-slate-600 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
              disabled={isLoading || isReadOnly}
            >
              <Icon name="plus" className="w-4 h-4" />
              Προσθήκη Παραγγελίας
            </button>

            {isLoading && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                Φόρτωση / αποθήκευση παραγγελιών...
              </p>
            )}
            {loadError && (
              <p className="mt-1 text-xs text-red-500">{loadError}</p>
            )}
          </form>
        </div>

        {/* Φίλτρα / σύνοψη */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg border border-white/30 dark:border-slate-700/50 rounded-2xl p-3 text-sm">
            <h3 className="text-xs font-semibold mb-2 flex items-center gap-2">
              <Icon name="filter" className="w-4 h-4" />
              Φίλτρο κατάστασης
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedStatusFilter('all')}
                className={`px-2 py-1 rounded-full text-xs border ${
                  selectedStatusFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-transparent text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                }`}
              >
                Όλες ({orders.length})
              </button>
              {(
                [
                  'new',
                  'in_progress',
                  'ready',
                  'served',
                  'cancelled'
                ] as KitchenServiceOrderStatus[]
              ).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatusFilter(st)}
                  className={`px-2 py-1 rounded-full text-xs border ${
                    selectedStatusFilter === st
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-transparent text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {STATUS_LABELS[st]} ({groupedByStatus[st].length})
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg border border-white/30 dark:border-slate-700/50 rounded-2xl p-3 text-xs text-slate-600 dark:text-slate-300">
            <h3 className="text-xs font-semibold mb-2 flex items-center gap-2">
              <Icon name="info" className="w-4 h-4" />
              Tips χρήσης
            </h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>
                Χρησιμοποίησε το πεδίο Τραπέζι / Ref για T12, Takeaway κ.λπ.
              </li>
              <li>
                Κάνε κλικ πάνω στο πιάτο για να αλλάζεις status (Pending →
                Prepping → Ready).
              </li>
              <li>
                Πάτα «Έγινε / Σερβιρίστηκε» όταν ο δίσκος φύγει από το pass.
              </li>
              <li>
                Πρόσεχε τις παραγγελίες με κόκκινο χρόνο — είναι πάνω από 20′
                ανοικτές.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Board παραγγελιών */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 min-h-0">
        {(
          ['new', 'in_progress', 'ready', 'served'] as KitchenServiceOrderStatus[]
        ).map((status) => {
          const columnOrders = groupedByStatus[status];
          return (
            <div
              key={status}
              className="flex flex-col bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-lg min-h-[200px]"
            >
              <div className="px-3 py-2 border-b border-white/20 dark:border-slate-700/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_COLORS[status]}`}
                  >
                    {STATUS_LABELS[status]}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {columnOrders.length} παραγγελίες
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {columnOrders.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center mt-4">
                    Δεν υπάρχουν παραγγελίες.
                  </p>
                ) : (
                  columnOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 rounded-xl p-2 text-xs space-y-1 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">
                            {order.tableNumber || 'Χωρίς τραπέζι'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            #{String(order.id).slice(-4)}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-slate-400">
                            {formatTime(
                              order.createdAt instanceof Date
                                ? order.createdAt
                                : new Date((order as any).createdAt)
                            )}
                          </span>
                          <span
                            className={`text-[10px] font-semibold ${ageColorClass(
                              order
                            )}`}
                          >
                            {formatAge(order)}
                          </span>
                        </div>
                      </div>
                      <div className="border-t border-slate-100 dark:border-slate-700/70 pt-1 mt-1 space-y-1">
                        {order.items.map((item) => {
                          const wsName = item.workstationId
                            ? workstations.find(
                                (w) => w.id === item.workstationId
                              )?.name
                            : undefined;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() =>
                                handleBumpItemStatus(order.id, item.id)
                              }
                              className={`w-full text-left group ${
                                isReadOnly ? 'cursor-not-allowed' : ''
                              }`}
                              disabled={isReadOnly}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div>
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium">
                                      x{item.quantity} {item.customName}
                                    </span>
                                    {wsName && (
                                      <span className="text-[10px] px-1 rounded bg-slate-100 dark:bg-slate-700/70">
                                        {wsName}
                                      </span>
                                    )}
                                  </div>
                                  {item.notes && (
                                    <p className="text-[11px] text-amber-700 dark:text-amber-300">
                                      {item.notes}
                                    </p>
                                  )}
                                </div>
                                <span className="text-[10px] px-1 py-0.5 rounded border border-slate-300 dark:border-slate-600 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-slate-100 dark:group-hover:text-slate-900 transition-colors">
                                  {ITEM_STATUS_LABELS[item.status]}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {order.notes && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-300">
                          {order.notes}
                        </p>
                      )}
                      <div className="flex items-center justify-end gap-1 pt-1 border-t border-slate-100 dark:border-slate-700/70 mt-1">
                        {order.status !== 'cancelled' &&
                          order.status !== 'served' && (
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(order.id)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${
                                isReadOnly
                                  ? 'border-slate-300 text-slate-400 cursor-not-allowed dark:border-slate-700 dark:text-slate-500'
                                  : 'border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30'
                              }`}
                              disabled={isReadOnly}
                            >
                              <Icon name="x-circle" className="w-3 h-3" />
                              Άκυρο
                            </button>
                          )}
                        {order.status !== 'served' &&
                          order.status !== 'cancelled' && (
                            <button
                              type="button"
                              onClick={() => handleMarkServed(order.id)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${
                                isReadOnly
                                  ? 'border-slate-300 text-slate-400 cursor-not-allowed dark:border-slate-700 dark:text-slate-500'
                                  : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-200 dark:hover:bg-emerald-900/30'
                              }`}
                              disabled={isReadOnly}
                            >
                              <Icon name="check-circle" className="w-3 h-3" />
                              Σερβιρίστηκε
                            </button>
                          )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}

        {/* Στήλη ακυρωμένων (xl-only) */}
        <div className="hidden xl:flex flex-col bg-white/40 dark:bg-slate-900/40 backdrop-blur-lg border border-white/10 dark:border-slate-800/40 rounded-2xl min-h-[200px]">
          <div className="px-3 py-2 border-b border-white/10 dark:border-slate-800/60 flex items-center justify-between">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_COLORS.cancelled}`}
            >
              {STATUS_LABELS.cancelled}
            </span>
            <span className="text-xs text-slate-400">
              {groupedByStatus.cancelled.length} παραγγελίες
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {groupedByStatus.cancelled.length === 0 ? (
              <p className="text-xs text-slate-400 text-center mt-4">
                Καμία ακυρωμένη παραγγελία.
              </p>
            ) : (
              groupedByStatus.cancelled.map((order) => (
                <div
                  key={order.id}
                  className="bg-white/80 dark:bg-slate-800 border border-red-200/70 dark:border-red-800/70 rounded-xl p-2 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      {order.tableNumber || 'Χωρίς τραπέζι'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatTime(
                        order.createdAt instanceof Date
                          ? order.createdAt
                          : new Date((order as any).createdAt)
                      )}
                    </span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-slate-600 dark:text-slate-200">
                    {order.items.map((i) => (
                      <li key={i.id}>
                        x{i.quantity} {i.customName}
                      </li>
                    ))}
                  </ul>
                  {order.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-300">
                      {order.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenServiceView;
