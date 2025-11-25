import React, { useMemo } from 'react';
import type {
  View,
  Recipe,
  PrepTask,
  HaccpLog,
  HaccpItem,
  HaccpReminder,
  InventoryItem,
  WasteLog,
  Message,
  Channel
} from '../../types';
import { Icon } from '../common/Icon';
import { DashboardSkeleton } from './DashboardSkeleton';
import TopRecipesWidget from './TopRecipesWidget';
import InventoryAlertsWidget from './InventoryAlertsWidget';
import { HaccpDashboardWidget } from '../haccp/HaccpDashboardWidget';
import { useTranslation } from '../../i18n';

interface DashboardViewProps {
  recipes: Recipe[];
  tasks: PrepTask[];
  haccpLogs: HaccpLog[];
  haccpItems: HaccpItem[];
  haccpReminders: HaccpReminder[];
  inventory: InventoryItem[];
  wasteLogs: WasteLog[];
  messages?: Message[];
  channels?: Channel[];
  onViewChange: (view: View) => void;
  withApiKeyCheck: (action: () => void | Promise<void>) => void;
  isLoading?: boolean;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  recipes,
  tasks,
  haccpLogs,
  haccpItems,
  haccpReminders,
  inventory,
  wasteLogs,
  messages,
  channels,
  onViewChange,
  withApiKeyCheck,
  isLoading = false
}) => {
  // --- Στατιστικά ---
  const totalRecipes = recipes.length;

  const lowStockItems = useMemo(() => {
    return inventory
      .filter((item) => {
        if (!item.reorderPoint || item.reorderPoint <= 0) return false;
        const totalQty = (item.locations || []).reduce(
          (sum, l) => sum + (l.quantity || 0),
          0
        );
        return totalQty <= item.reorderPoint;
      })
      .slice(0, 3);
  }, [inventory]);

  const recentWasteLogs = useMemo(() => {
    const sorted = [...wasteLogs].sort((a, b) => {
      const ta =
        a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp as any).getTime();
      const tb =
        b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp as any).getTime();
      return tb - ta;
    });
    return sorted.slice(0, 3);
  }, [wasteLogs]);

  const recentHaccpLogs = useMemo(() => {
    const sorted = [...haccpLogs].sort((a, b) => {
      const ta =
        a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp as any).getTime();
      const tb =
        b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp as any).getTime();
      return tb - ta;
    });
    return sorted.slice(0, 3);
  }, [haccpLogs]);

  const pendingTasks = useMemo(() => {
    return tasks.slice(0, 5);
  }, [tasks]);

  // --- Live Walkie Feed ---
  const liveMessages = useMemo(() => {
    if (!messages || messages.length === 0) return [];
    const sorted = [...messages].sort((a: any, b: any) => {
      const ta =
        (a as any).createdAt instanceof Date
          ? (a as any).createdAt.getTime()
          : new Date((a as any).createdAt).getTime();
      const tb =
        (b as any).createdAt instanceof Date
          ? (b as any).createdAt.getTime()
          : new Date((b as any).createdAt).getTime();
      return ta - tb;
    });
    return sorted.slice(-8);
  }, [messages]);

  const channelNameById = useMemo(() => {
    const map: Record<string, string> = {};
    (channels || []).forEach((ch) => {
      map[(ch as any).id] = (ch as any).name;
    });
    return map;
  }, [channels]);

  const handleAIDailyBriefing = () => {
    withApiKeyCheck(() => {
      // προς το παρόν ανοίγουμε τη Λίστα Αγορών ως “AI βοηθό αγορών”
      onViewChange('shopping_list');
    });
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pb-6">
      {/* Top: Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => onViewChange('recipes')}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-white/40 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all text-sm"
        >
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-brand-yellow/10 text-brand-yellow">
            <Icon name="book-open" className="w-4 h-4" />
          </span>
          <div className="flex flex-col text-left">
            <span className="font-semibold text-xs">Συνταγές</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Δες ή δημιούργησε συνταγές
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onViewChange('inventory')}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-white/40 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all text-sm"
        >
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Icon name="package" className="w-4 h-4" />
          </span>
          <div className="flex flex-col text-left">
            <span className="font-semibold text-xs">Απόθεμα</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Έλεγχος και κινήσεις stock
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onViewChange('waste_log')}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-white/40 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all text-sm"
        >
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500">
            <Icon name="trash-2" className="w-4 h-4" />
          </span>
          <div className="flex flex-col text-left">
            <span className="font-semibold text-xs">Φθορές</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Καταχώρησε απώλειες
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onViewChange('notifications')}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-white/40 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all text-sm"
        >
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500">
            <Icon name="mic" className="w-4 h-4" />
          </span>
          <div className="flex flex-col text-left">
            <span className="font-semibold text-xs">Walkie</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Άνοιξε τα κανάλια επικοινωνίας
            </span>
          </div>
        </button>
      </div>

      {/* Analytics widgets row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopRecipesWidget 
          recipes={recipes}
          limit={5}
          onRecipeClick={(id) => {
            // Could navigate to recipe detail in future
            console.log('Recipe clicked:', id);
          }}
        />
        
        <InventoryAlertsWidget 
          inventory={inventory}
          limit={8}
        />
      </div>

      {/* HACCP Dashboard Widget */}
      <HaccpDashboardWidget
        logs={haccpLogs}
        haccpItems={haccpItems}
        haccpReminders={haccpReminders}
        onViewAll={() => onViewChange('haccp')}
      />

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left: Live Walkie Feed */}
        <div className="xl:col-span-3">
          <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-white/40 dark:border-slate-800/70 shadow-sm p-4 md:p-6 flex flex-col h-96">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/10 text-amber-500">
                  <Icon name="radio" className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold">Live Walkie Feed</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Τελευταία μηνύματα από τα κανάλια υπηρεσίας.
                  </p>
                </div>
              </div>

              <button
              type="button"
              onClick={() => onViewChange('notifications')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500 text-white text-[11px] font-medium hover:brightness-105"
            >
              <Icon name="headphones" className="w-3.5 h-3.5" />
              Άνοιγμα Walkie
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 text-xs">
            {liveMessages && liveMessages.length > 0 ? (
              liveMessages.map((m: any) => {
                const ts =
                  m.createdAt instanceof Date
                    ? m.createdAt
                    : new Date(m.createdAt);
                const timeLabel = ts.toLocaleTimeString('el-GR', {
                  hour: '2-digit',
                  minute: '2-digit'
                });
                const channelName =
                  channelNameById[m.channelId] || 'Κανάλι';

                return (
                  <div
                    key={m.id}
                    className="flex items-start gap-2 p-2 rounded-2xl bg-slate-50/80 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60"
                  >
                    <div className="mt-0.5">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-semibold">
                        {channelName.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-[11px] font-semibold truncate">
                          {channelName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {timeLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 dark:text-slate-100 line-clamp-2">
                        {m.content}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex items-center justify-center text-[11px] text-slate-400">
                Δεν υπάρχουν ακόμα μηνύματα. Στείλε το πρώτο από την καρτέλα
                “Ειδοποιήσεις”.
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Right column: KPIs + Activity + AI card */}
        <div className="xl:col-span-1 flex flex-col gap-4">
          {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
          <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-white/50 dark:border-slate-800/70 shadow-sm p-4 flex flex-col gap-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Συνταγές
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold">{totalRecipes}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Δες, επεξεργάσου ή δημιούργησε νέες συνταγές.
            </p>
          </div>

          <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-white/50 dark:border-slate-800/70 shadow-sm p-4 flex flex-col gap-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Icon name="alert-triangle" className="w-3.5 h-3.5 text-amber-500" />
              Χαμηλό απόθεμα
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold">
                {lowStockItems.length}
              </span>
            </div>
            <ul className="mt-1 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
              {lowStockItems.map((item) => {
                const totalQty = (item.locations || []).reduce(
                  (sum, l) => sum + (l.quantity || 0),
                  0
                );
                return (
                  <li key={item.id} className="flex justify-between gap-2">
                    <span className="truncate">{item.name}</span>
                    <span className="font-medium">
                      {totalQty} {item.unit}
                    </span>
                  </li>
                );
              })}
              {lowStockItems.length === 0 && (
                <li className="text-slate-400">Όλα οκ προς το παρόν.</li>
              )}
            </ul>
          </div>

          <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-white/50 dark:border-slate-800/70 shadow-sm p-4 flex flex-col gap-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Icon name="droplets" className="w-3.5 h-3.5 text-rose-500" />
              Πρόσφατες φθορές
            </span>
            <ul className="mt-1 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
              {recentWasteLogs.length > 0 ? (
                recentWasteLogs.map((log) => {
                  const ts =
                    log.timestamp instanceof Date
                      ? log.timestamp
                      : new Date(log.timestamp as any);
                  return (
                    <li key={log.id} className="flex flex-col">
                      <div className="flex justify-between gap-2">
                        <span className="truncate">{log.reason}</span>
                        <span className="font-medium">
                          {log.quantity} {log.unit}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {ts.toLocaleDateString('el-GR')}{' '}
                        {ts.toLocaleTimeString('el-GR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </li>
                  );
                })
              ) : (
                <li className="text-slate-400">Δεν υπάρχουν καταχωρήσεις.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Activity feed */}
        <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-white/50 dark:border-slate-800/70 shadow-sm p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold flex items-center gap-1">
              <Icon name="activity" className="w-3.5 h-3.5 text-violet-500" />
              Κίνηση κουζίνας
            </span>
            <button
              type="button"
              onClick={() => onViewChange('inventory_history')}
              className="text-[11px] text-violet-500 hover:underline"
            >
              Ιστορικό
            </button>
          </div>

          <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 max-h-44 overflow-y-auto">
            {recentHaccpLogs.map((log) => {
              const ts =
                log.timestamp instanceof Date
                  ? log.timestamp
                  : new Date(log.timestamp as any);
              return (
                <div key={log.id} className="flex flex-col">
                  <span className="font-medium">HACCP: {log.type}</span>
                  <span className="text-[10px] text-slate-400">
                    {ts.toLocaleDateString('el-GR')}{' '}
                    {ts.toLocaleTimeString('el-GR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              );
            })}
            {pendingTasks.map((task) => (
              <div key={task.id} className="flex flex-col">
                <span className="font-medium">Task: {task.title}</span>
                {task.workstationId && (
                  <span className="text-[10px] text-slate-400">
                    Πόστο: {task.workstationId}
                  </span>
                )}
              </div>
            ))}
            {recentHaccpLogs.length === 0 && pendingTasks.length === 0 && (
              <div className="text-slate-400">Καμία πρόσφατη δραστηριότητα.</div>
            )}
          </div>
        </div>

        {/* AI Daily Briefing */}
        <div className="rounded-3xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200/70 dark:border-violet-700/70 shadow-sm p-4 flex flex-col gap-2">
          <span className="text-xs font-semibold flex items-center gap-2 text-violet-700 dark:text-violet-200">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-2xl bg-white/80 dark:bg-violet-900 text-violet-600 dark:text-violet-100 shadow-sm">
              <Icon name="sparkles" className="w-4 h-4" />
            </span>
            AI Daily Briefing
          </span>
          <p className="text-[11px] text-violet-900/80 dark:text-violet-100">
            Σύνοψη ημέρας για stock, waste, οργάνωση. Άφησέ το στον ψηφιακό
            βοηθό σου.
          </p>
          <button
            type="button"
            onClick={handleAIDailyBriefing}
            className="mt-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-600 text-white text-[11px] font-medium hover:brightness-110"
          >
            <Icon name="wand-2" className="w-3.5 h-3.5" />
            Άνοιγμα Kitchen AI
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
