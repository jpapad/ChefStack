// components/dashboard/DashboardView.tsx
import React, { useMemo } from 'react';
import {
  Recipe,
  PrepTask,
  HaccpLog,
  InventoryItem,
  WasteLog,
  IngredientCost,
  View,
  InventoryTransaction,
  WasteReasonKey
} from '../../types';

interface DashboardViewProps {
  recipes: Recipe[];
  tasks: PrepTask[];
  haccpLogs: HaccpLog[];
  inventory: InventoryItem[];
  wasteLogs: WasteLog[];
  ingredientCosts: IngredientCost[];
  inventoryTransactions?: InventoryTransaction[]; // reserved για μελλοντικά analytics
  onViewChange: (view: View) => void;
}

type WasteLogWithCost = WasteLog & { cost: number | null };

const DashboardView: React.FC<DashboardViewProps> = ({
  recipes,
  tasks,
  haccpLogs,
  inventory,
  wasteLogs,
  ingredientCosts,
  onViewChange
}) => {
  // ---------- Waste με κόστος ----------
  const wasteLogsWithCost: WasteLogWithCost[] = useMemo(() => {
    return wasteLogs.map((log) => {
      const item = inventory.find((i) => i.id === log.inventoryItemId);
      if (!item || !item.ingredientCostId) {
        return { ...log, cost: null };
      }

      const costRow = ingredientCosts.find((c) => c.id === item.ingredientCostId);
      if (!costRow) {
        return { ...log, cost: null };
      }

      // Υποθέτουμε ότι purchaseUnit == unit φθοράς
      if (costRow.purchaseUnit !== log.unit) {
        return { ...log, cost: null };
      }

      return {
        ...log,
        cost: log.quantity * costRow.cost
      };
    });
  }, [wasteLogs, inventory, ingredientCosts]);

  const wasteStats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const nowTime = now.getTime();
    const sevenDaysAgo = nowTime - 6 * 24 * 60 * 60 * 1000; // last 7 days
    const year = now.getFullYear();
    const month = now.getMonth();

    let qtyToday = 0;
    let costToday = 0;

    let qtyWeek = 0;
    let costWeek = 0;

    let qtyMonth = 0;
    let costMonth = 0;

    const byItem: Record<
      string,
      { quantity: number; cost: number; name: string }
    > = {};

    const byReason: Record<
      WasteReasonKey,
      { quantity: number; cost: number }
    > = {} as any;

    wasteLogsWithCost.forEach((log) => {
      const ts = log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp);
      const logStr = ts.toISOString().slice(0, 10);
      const t = ts.getTime();

      const qty = log.quantity;
      const cost = log.cost ?? 0;

      // Today
      if (logStr === todayStr) {
        qtyToday += qty;
        costToday += cost;
      }

      // Last 7 days
      if (t >= sevenDaysAgo && t <= nowTime) {
        qtyWeek += qty;
        costWeek += cost;
      }

      // This month
      if (ts.getFullYear() === year && ts.getMonth() === month) {
        qtyMonth += qty;
        costMonth += cost;
      }

      // By item
      const item = inventory.find((i) => i.id === log.inventoryItemId);
      const name = item?.name ?? 'Άγνωστο είδος';
      if (!byItem[log.inventoryItemId]) {
        byItem[log.inventoryItemId] = { quantity: 0, cost: 0, name };
      }
      byItem[log.inventoryItemId].quantity += qty;
      byItem[log.inventoryItemId].cost += cost;

      // By reason
      if (!byReason[log.reason]) {
        byReason[log.reason] = { quantity: 0, cost: 0 };
      }
      byReason[log.reason].quantity += qty;
      byReason[log.reason].cost += cost;
    });

    const topItemsByQuantity = Object.values(byItem)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const topReasons = Object.entries(byReason)
      .map(([reason, data]) => ({
        reason: reason as WasteReasonKey,
        quantity: data.quantity,
        cost: data.cost
      }))
      .sort((a, b) => b.cost - a.cost || b.quantity - a.quantity)
      .slice(0, 5);

    return {
      qtyToday,
      costToday,
      qtyWeek,
      costWeek,
      qtyMonth,
      costMonth,
      topItemsByQuantity,
      topReasons
    };
  }, [wasteLogsWithCost, inventory]);

  // ---------- Inventory Analytics ----------
  const inventoryStats = useMemo(() => {
    let totalValue = 0;

    const lowStockItems: {
      id: string;
      name: string;
      totalQty: number;
      reorderPoint: number;
      value: number;
    }[] = [];

    inventory.forEach((item) => {
      const totalQty = item.locations.reduce(
        (sum, loc) => sum + loc.quantity,
        0
      );

      let value = 0;
      if (item.ingredientCostId) {
        const costRow = ingredientCosts.find(
          (c) => c.id === item.ingredientCostId
        );
        if (costRow && costRow.purchaseUnit === item.unit) {
          value = totalQty * costRow.cost;
          totalValue += value;
        }
      }

      if (item.reorderPoint > 0 && totalQty < item.reorderPoint) {
        lowStockItems.push({
          id: item.id,
          name: item.name,
          totalQty,
          reorderPoint: item.reorderPoint,
          value
        });
      }
    });

    const lowStockSorted = lowStockItems.sort((a, b) => {
      const aRatio = a.totalQty / a.reorderPoint;
      const bRatio = b.totalQty / b.reorderPoint;
      return aRatio - bRatio; // μικρότερο ratio = πιο “επικίνδυνο”
    });

    return {
      totalValue,
      lowStockCount: lowStockItems.length,
      lowStockItems: lowStockSorted.slice(0, 5)
    };
  }, [inventory, ingredientCosts]);

  const openWasteLog = () => onViewChange('waste_log');
  const openInventory = () => onViewChange('inventory');

  const pendingTasks = tasks.filter((t) => t.status !== 'done');
  const totalRecipes = recipes.length;
  const todayLogs = haccpLogs.filter((l) => {
    const d = l.timestamp;
    return d.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);
  });

  return (
    <div className="space-y-6">
      {/* Πάνω σειρά με βασικά KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={openWasteLog}
          className="bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col items-start"
        >
          <span className="text-xs font-medium uppercase text-slate-400 mb-1">
            ΣΗΜΕΡΙΝΗ ΦΘΟΡΑ (ποσότητα)
          </span>
          <span className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            {wasteStats.qtyToday.toFixed(2)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Συνολική ποσότητα (όλες οι μονάδες)
          </span>
        </button>

        <button
          onClick={openWasteLog}
          className="bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col items-start"
        >
          <span className="text-xs font-medium uppercase text-slate-400 mb-1">
            ΣΗΜΕΡΙΝΗ ΦΘΟΡΑ (€)
          </span>
          <span className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
            € {wasteStats.costToday.toFixed(2)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Μόνο όπου υπάρχει καταχωρημένο κόστος
          </span>
        </button>

        <button
          onClick={openInventory}
          className="bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col items-start"
        >
          <span className="text-xs font-medium uppercase text-slate-400 mb-1">
            ΣΥΝΤΑΓΕΣ
          </span>
          <span className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            {totalRecipes}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Σύνολο ενεργών συνταγών
          </span>
        </button>

        <button
          onClick={() => onViewChange('workstations')}
          className="bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col items-start"
        >
          <span className="text-xs font-medium uppercase text-slate-400 mb-1">
            ΕΚΚΡΕΜΕΙΣ ΕΡΓΑΣΙΕΣ
          </span>
          <span className="text-2xl font-semibold text-amber-600 dark:text-amber-400">
            {pendingTasks.length}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tasks που δεν είναι ολοκληρωμένα
          </span>
        </button>
      </div>

      {/* Νέα σειρά: Inventory Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Αξία αποθέματος */}
        <div className="bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Συνολική αξία αποθέματος
            </h2>
            <button
              onClick={openInventory}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Προβολή αποθήκης
            </button>
          </div>
          <p className="text-3xl font-semibold text-slate-900 dark:text-slate-50 mb-1">
            € {inventoryStats.totalValue.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Υπολογισμένο μόνο όπου υπάρχει τιμή & ταιριάζει η μονάδα (kg / L / τεμ).
          </p>
        </div>

        {/* Είδη υπό όριο */}
        <div className="bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Είδη υπό όριο (reorder point)
            </h2>
            <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-xs">
              {inventoryStats.lowStockCount} είδη
            </span>
          </div>
          {inventoryStats.lowStockItems.length === 0 ? (
            <p className="text-xs text-slate-400">
              Δεν υπάρχουν ακόμη προϊόντα κάτω από το όριο.
            </p>
          ) : (
            <ul className="space-y-1 text-xs sm:text-sm">
              {inventoryStats.lowStockItems.map((item) => (
                <li key={item.id} className="flex justify-between items-center">
                  <div className="truncate">
                    <div className="font-medium text-slate-800 dark:text-slate-100 truncate">
                      {item.name}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      Απόθεμα: {item.totalQty.toFixed(2)} / Όριο:{' '}
                      {item.reorderPoint.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    {item.value > 0 && (
                      <div className="text-emerald-600 dark:text-emerald-400">
                        € {item.value.toFixed(2)}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Σειρά με Waste Analytics & HACCP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Waste ανά περίοδο */}
        <div className="bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Φθορά ανά περίοδο
            </h2>
            <button
              onClick={openWasteLog}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Άνοιγμα καταγραφών
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                Σήμερα:
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-100">
                {wasteStats.qtyToday.toFixed(2)} (qty) — €{' '}
                {wasteStats.costToday.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                Τελευταίες 7 ημέρες:
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-100">
                {wasteStats.qtyWeek.toFixed(2)} (qty) — €{' '}
                {wasteStats.costWeek.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                Τρέχων μήνας:
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-100">
                {wasteStats.qtyMonth.toFixed(2)} (qty) — €{' '}
                {wasteStats.costMonth.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Top προϊόντα με μεγαλύτερη φθορά */}
        <div className="bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Top προϊόντα με φθορά
            </h2>
            <button
              onClick={openInventory}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Αποθήκη
            </button>
          </div>
          {wasteStats.topItemsByQuantity.length === 0 ? (
            <p className="text-xs text-slate-400">
              Δεν υπάρχουν ακόμη καταγραφές φθοράς.
            </p>
          ) : (
            <ul className="space-y-1 text-sm">
              {wasteStats.topItemsByQuantity.map((item) => (
                <li
                  key={item.name}
                  className="flex justify-between items-center"
                >
                  <div className="truncate">
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right text-xs">
                    <div className="text-slate-500 dark:text-slate-400">
                      qty: {item.quantity.toFixed(2)}
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400">
                      € {item.cost.toFixed(2)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* HACCP / today logs */}
        <div className="bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              HACCP Σήμερα
            </h2>
            <button
              onClick={() => onViewChange('haccp')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Προβολή HACCP
            </button>
          </div>
          <p className="text-3xl font-semibold text-slate-900 dark:text-slate-50 mb-1">
            {todayLogs.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Συνολικές καταγραφές HACCP για σήμερα
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
