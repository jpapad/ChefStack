import React, { useMemo, useState } from 'react';
import {
  WasteLog,
  InventoryItem,
  User,
  Role,
  RolePermissions,
  WasteReasonKey,
  WASTE_REASON_KEYS,
  WASTE_REASON_TRANSLATIONS,
  IngredientCost,
} from '../../types';
import { Icon } from '../common/Icon';

interface WasteLogViewProps {
  wasteLogs: WasteLog[];
  setWasteLogs: React.Dispatch<React.SetStateAction<WasteLog[]>>; // κρατάμε για μελλοντική χρήση
  inventory: InventoryItem[];
  users: User[];
  ingredientCosts: IngredientCost[];
  onSave: (logData: Omit<WasteLog, 'id' | 'teamId' | 'userId'>) => void;
  onDelete: (log: WasteLog) => void;
  currentUserRole?: Role;
  rolePermissions: RolePermissions;
  withApiKeyCheck: (action: () => void) => void;

  /** Προαιρετικό callback για άνοιγμα είδους στην Αποθήκη */
  onOpenInventoryItem?: (itemId: string) => void;
}

// Βοηθητικό: υπολογισμός κόστους φθοράς για μία εγγραφή
const computeWasteCostForLog = (
  log: WasteLog,
  inventory: InventoryItem[],
  ingredientCosts: IngredientCost[]
): number => {
  const item = inventory.find((i) => i.id === log.inventoryItemId);
  if (!item || !item.ingredientCostId) return 0;

  const costRow = ingredientCosts.find((c) => c.id === item.ingredientCostId);
  if (!costRow) return 0;

  const unitCost = costRow.cost || 0;

  // Για αρχή, θεωρούμε 1:1 μονάδα (purchaseUnit ~ unit φθοράς)
  return log.quantity * unitCost;
};

const WasteLogView: React.FC<WasteLogViewProps> = ({
  wasteLogs,
  setWasteLogs, // not used directly, reserved for future updates
  inventory,
  users,
  ingredientCosts,
  onSave,
  onDelete,
  currentUserRole,
  rolePermissions,
  withApiKeyCheck,
  onOpenInventoryItem,
}) => {
  const canManage = currentUserRole
    ? rolePermissions[currentUserRole]?.includes('manage_waste')
    : false;

  // 📅 Φίλτρο ημερομηνίας
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7d' | '30d'>(
    'all'
  );

  // 📋 Φόρμα νέας φθοράς
  const [formItemId, setFormItemId] = useState<string>(
    inventory[0]?.id ?? ''
  );
  const [formQuantity, setFormQuantity] = useState<number>(0);
  const [formReason, setFormReason] = useState<WasteReasonKey>('expired');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formTimestamp, setFormTimestamp] = useState<string>(() => {
    const now = new Date();
    const iso = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    ).toISOString();
    return iso.slice(0, 16);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      alert('Δεν έχετε δικαίωμα καταχώρησης φθορών.');
      return;
    }
    if (!formItemId || formQuantity <= 0) {
      alert('Συμπληρώστε είδος και ποσότητα.');
      return;
    }

    const item = inventory.find((i) => i.id === formItemId);
    const unit = item?.unit ?? 'kg';

    const payload: Omit<WasteLog, 'id' | 'teamId' | 'userId'> = {
      inventoryItemId: formItemId,
      quantity: formQuantity,
      unit,
      reason: formReason,
      notes: formNotes || '',
      timestamp: formTimestamp ? new Date(formTimestamp) : new Date(),
    };

    console.log('[WasteLogView] handleSubmit called', payload);

    onSave(payload);

    setFormQuantity(0);
    setFormNotes('');
  };

  // 🔎 maps για inventory & users
  const inventoryById = useMemo(() => {
    const map = new Map<string, InventoryItem>();
    inventory.forEach((i) => map.set(i.id, i));
    return map;
  }, [inventory]);

  const usersById = useMemo(() => {
    const map = new Map<string, User>();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  // 📊 Στατιστικά φθορών (για AI + header)
  const {
    logsSorted,
    wasteByItem,
    wasteByReason,
    totalWasteCost,
    logsGroupedByDay,
  } = useMemo(() => {
    const now = new Date();
    let from: Date | null = null;

    if (dateFilter === 'today') {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateFilter === '7d') {
      from = new Date(now);
      from.setDate(from.getDate() - 7);
    } else if (dateFilter === '30d') {
      from = new Date(now);
      from.setDate(from.getDate() - 30);
    }

    const filtered = from
      ? wasteLogs.filter((log) => log.timestamp >= from!)
      : wasteLogs;

    const sorted = [...filtered].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    const byItem = new Map<
      string,
      { name: string; total: number; unit: string }
    >();
    const byReason = new Map<WasteReasonKey, number>();
    let totalCost = 0;

    for (const log of filtered) {
      const item = inventoryById.get(log.inventoryItemId);
      const name = item?.name ?? 'Άγνωστο είδος';
      const unit = log.unit;

      const existingItem = byItem.get(log.inventoryItemId);
      if (existingItem) {
        existingItem.total += log.quantity;
      } else {
        byItem.set(log.inventoryItemId, {
          name,
          total: log.quantity,
          unit,
        });
      }

      const reasonTotal =
        byReason.get(log.reason as WasteReasonKey) ?? 0;
      byReason.set(
        log.reason as WasteReasonKey,
        reasonTotal + log.quantity
      );

      totalCost += computeWasteCostForLog(log, inventory, ingredientCosts);
    }

    // grouping ανά ημερομηνία (YYYY-MM-DD)
    const grouped: Record<string, WasteLog[]> = {};
    for (const log of sorted) {
      const dateKey = new Date(log.timestamp).toISOString().slice(0, 10);
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(log);
    }

    return {
      logsSorted: sorted,
      wasteByItem: Array.from(byItem.entries()),
      wasteByReason: Array.from(byReason.entries()),
      totalWasteCost: totalCost,
      logsGroupedByDay: grouped,
    };
  }, [wasteLogs, inventoryById, dateFilter, ingredientCosts]);

  // Συνολική ποσότητα φθοράς (μετά το φίλτρο)
  const totalWasteQuantity = useMemo(
    () =>
      wasteByItem.reduce((sum, [, info]) => sum + info.total, 0),
    [wasteByItem]
  );

  // 🧠 Κατάσταση & handler για Gemini
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAiWasteInsights = () => {
    if (wasteLogs.length === 0) {
      setAiError('Δεν υπάρχουν καταχωρημένες φθορές για ανάλυση.');
      return;
    }

    if (typeof withApiKeyCheck !== 'function') {
      console.error(
        'withApiKeyCheck prop is not a function in WasteLogView:',
        withApiKeyCheck
      );
      setAiError(
        'Η AI ανάλυση δεν είναι διαθέσιμη (εσωτερικό σφάλμα withApiKeyCheck).'
      );
      return;
    }

    withApiKeyCheck(() => {
      (async () => {
        setIsAiLoading(true);
        setAiError(null);

        try {
          const apiKey = import.meta.env.VITE_GEMINI_API_KEY as
            | string
            | undefined;
          if (!apiKey) {
            throw new Error(
              'Λείπει το VITE_GEMINI_API_KEY από το .env.local.'
            );
          }

          const topItems = wasteByItem
            .slice()
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 10)
            .map(([itemId, info]) => {
              return `- ${info.name}: ${info.total.toFixed(2)} ${
                info.unit
              }`;
            })
            .join('\n');

          const reasonsSummary = wasteByReason
            .map(([reason, total]) => {
              const label =
                WASTE_REASON_TRANSLATIONS[reason]?.el ?? reason;
              return `- ${label}: ${total.toFixed(2)}`;
            })
            .join('\n');

          const totalEvents = logsSorted.length;
          const distinctItems = new Set(
            logsSorted.map((w) => w.inventoryItemId)
          ).size;

          const prompt = `
Είσαι σύμβουλος εστίασης και food cost σε επαγγελματική κουζίνα.
Σου δίνω συγκεντρωτικά δεδομένα φθορών (waste log) και θέλω πρακτικές προτάσεις βελτίωσης.

Τα δεδομένα είναι ήδη φιλτραρισμένα με βάση την ημερομηνία (π.χ. σήμερα, 7 ημέρες, 30 ημέρες ή όλα).

Συνολική εικόνα:
- Αριθμός καταχωρήσεων φθοράς: ${totalEvents}
- Διαφορετικά είδη με φθορά: ${distinctItems}
- Συνολική ποσότητα (σε μονάδες αποθήκης): ${totalWasteQuantity.toFixed(
            2
          )}
- Εκτιμώμενο συνολικό κόστος φθοράς: ${totalWasteCost.toFixed(2)} €

Φθορά ανά είδος (top 10 κατά ποσότητα):
${topItems || '—'}

Φθορά ανά λόγο:
${reasonsSummary || '—'}

Ζητάω στα Ελληνικά, σε 5–8 bullets:
1. Ποια είδη φαίνεται να είναι τα πιο προβληματικά και γιατί.
2. Τι μπορεί να σημαίνει η κατανομή των λόγων φθοράς (λήξη, αλλοίωση, λάθη μαγειρέματος, πλεονάζουσα παραγωγή κ.λπ.).
3. Συγκεκριμένες ιδέες για μείωση φθοράς (planning, portioning, αλλαγές σε menu engineering, καλύτερο rotation, επικοινωνία με ομάδα).
4. Ποιες 2–3 ενέργειες θα έβαζες ως προτεραιότητα από αύριο.

Μη γράψεις δοκίμιο· θέλω συγκεκριμένες, πρακτικές προτάσεις.
          `.trim();

          const model = 'gemini-2.0-flash';
          const endpoint =
            'https://generativelanguage.googleapis.com/v1beta/models/' +
            model +
            ':generateContent?key=' +
            encodeURIComponent(apiKey);

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
            }),
          });

          if (!response.ok) {
            const text = await response.text();
            console.error('Gemini API error (waste):', text);
            throw new Error('Σφάλμα από το Gemini API.');
          }

          const data = await response.json();
          const text =
            data?.candidates?.[0]?.content?.parts
              ?.map((p: any) => String(p.text ?? ''))
              .join('\n') ||
            'Δεν λήφθηκε απάντηση από το AI.';

          setAiInsights(text);
        } catch (e: any) {
          console.error('AI waste insights error', e);
          setAiError(
            e?.message ||
              'Σφάλμα κατά την ανάλυση των δεδομένων φθοράς.'
          );
        } finally {
          setIsAiLoading(false);
        }
      })();
    });
  };

  // 🗑 Διαγραφή / undo φθοράς
  const handleDeleteClick = (log: WasteLog) => {
    if (!canManage) {
      alert('Δεν έχετε δικαίωμα διαγραφής φθορών.');
      return;
    }
    const ok = window.confirm(
      'Σίγουρα θέλετε να διαγράψετε αυτή τη φθορά; Θα γίνει αυτόματη διόρθωση του αποθέματος.'
    );
    if (!ok) return;

    onDelete(log);
  };

  // 📤 Export CSV (με βάση το τρέχον φίλτρο)
  const handleExportCsv = () => {
    if (logsSorted.length === 0) {
      alert(
        'Δεν υπάρχουν φθορές για εξαγωγή στο επιλεγμένο χρονικό φίλτρο.'
      );
      return;
    }

    const headers = [
      'Ημερομηνία',
      'Είδος',
      'Ποσότητα',
      'Μονάδα',
      'Λόγος',
      'Σχόλια',
      'Κόστος (€)',
    ];

    const rows = logsSorted.map((log) => {
      const item = inventoryById.get(log.inventoryItemId);
      const reasonLabel =
        WASTE_REASON_TRANSLATIONS[log.reason]?.el ?? log.reason;
      const cost = computeWasteCostForLog(log, inventory, ingredientCosts);

      return [
        log.timestamp.toLocaleString('el-GR'),
        item?.name ?? 'Άγνωστο είδος',
        log.quantity.toString(),
        log.unit,
        reasonLabel,
        log.notes || '',
        cost.toFixed(2),
      ];
    });

    const escapeField = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;

    const csvContent = [headers, ...rows]
      .map((row) => row.map((val) => escapeField(String(val))).join(';'))
      .join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waste_logs_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
      {/* Λίστα φθορών (grouped by day) */}
      <div className="xl:col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl p-4 flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-heading font-bold flex items-center gap-2">
              <Icon name="trash-2" className="w-5 h-5 text-amber-500" />
              Καταγραφή Φθορών
            </h2>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
              Εγγραφές: {logsSorted.length} / {wasteLogs.length} | Σύνολο ποσότητας:{' '}
              {totalWasteQuantity.toFixed(2)} | Εκτιμώμενο κόστος:{' '}
              {totalWasteCost.toFixed(2)} €
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(e.target.value as typeof dateFilter)
              }
              className="text-xs border rounded px-2 py-1 bg-white dark:bg-slate-900"
            >
              <option value="all">Όλες οι ημερομηνίες</option>
              <option value="today">Σήμερα</option>
              <option value="7d">Τελευταίες 7 ημέρες</option>
              <option value="30d">Τελευταίες 30 ημέρες</option>
            </select>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-slate-300 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              <Icon name="download" className="w-3 h-3" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="mt-2 overflow-y-auto max-h-[55vh] pr-1">
          {logsSorted.length === 0 ? (
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Δεν έχουν καταχωρηθεί φθορές για το επιλεγμένο χρονικό
              διάστημα.
            </p>
          ) : (
            Object.entries(
              logsGroupedByDay as Record<string, WasteLog[]>
            ).map(([date, logsForDate]) => (
              <div key={date} className="mb-4">
                {/* Header ημέρας */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px flex-1 bg-gray-300/60 dark:bg-gray-700/60" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 whitespace-nowrap">
                    {new Date(date).toLocaleDateString('el-GR', {
                      weekday: 'short',
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </span>
                  <div className="h-px flex-1 bg-gray-300/60 dark:bg-gray-700/60" />
                </div>

                {/* Cards της ημέρας */}
                <div className="space-y-2">
                  {logsForDate.map((log) => {
                    const item = inventoryById.get(log.inventoryItemId);
                    const reasonLabel =
                      WASTE_REASON_TRANSLATIONS[log.reason]?.el ??
                      log.reason;
                    const cost = computeWasteCostForLog(
                      log,
                      inventory,
                      ingredientCosts
                    );
                    const user = usersById.get(log.userId);
                    const timeStr = new Date(
                      log.timestamp
                    ).toLocaleTimeString('el-GR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={log.id}
                        className="flex justify-between items-start gap-2 p-3 rounded-lg bg-light-card/80 dark:bg-dark-card/80 border border-black/5 dark:border-white/10"
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-gray-500">
                              {timeStr}
                            </span>
                            <span className="font-semibold">
                              {item?.name ?? 'Άγνωστο είδος'}
                            </span>
                          </div>
                          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                            Ποσότητα:{' '}
                            <strong>
                              {log.quantity.toFixed(2)} {log.unit}
                            </strong>{' '}
                            • Λόγος:{' '}
                            <span className="italic">
                              {reasonLabel}
                            </span>
                          </p>
                          {log.notes && (
                            <p className="text-xs text-gray-500 mt-1">
                              Σχόλια: {log.notes}
                            </p>
                          )}
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1">
                            Κόστος φθοράς:{' '}
                            <strong>{cost.toFixed(2)} €</strong>
                          </p>
                          {user && (
                            <p className="text-[11px] text-gray-500 mt-1">
                              Καταχωρήθηκε από: {user.name}
                            </p>
                          )}

                          {/* 🔗 Link προς Αποθήκη για το είδος */}
                          {item && onOpenInventoryItem && (
                            <button
                              type="button"
                              onClick={() =>
                                onOpenInventoryItem(item.id)
                              }
                              className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-300 mt-1 hover:underline"
                            >
                              <Icon
                                name="arrow-right"
                                className="w-3 h-3"
                              />
                              Άνοιγμα στην Αποθήκη
                            </button>
                          )}
                        </div>

                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(log)}
                            className="inline-flex items-center justify-center p-1.5 rounded-full text-light-text-secondary hover:text-red-600 hover:bg-red-500/10 dark:text-dark-text-secondary dark:hover:text-red-400 transition-colors"
                            title="Διαγραφή"
                          >
                            <Icon name="trash-2" className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Μικρό summary box κάτω από τη λίστα */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-light-text-secondary dark:text-dark-text-secondary">
          <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3">
            <h4 className="font-semibold mb-1">
              Top φθορά ανά είδος (ποσότητα)
            </h4>
            {wasteByItem.length === 0 ? (
              <p>—</p>
            ) : (
              <ul className="space-y-1">
                {wasteByItem
                  .slice()
                  .sort((a, b) => b[1].total - a[1].total)
                  .slice(0, 5)
                  .map(([itemId, info]) => (
                    <li key={itemId} className="flex justify-between">
                      <span className="truncate mr-2">
                        {info.name}
                      </span>
                      <span className="font-mono">
                        {info.total.toFixed(2)} {info.unit}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
          <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3">
            <h4 className="font-semibold mb-1">
              Κατανομή λόγων φθοράς
            </h4>
            {wasteByReason.length === 0 ? (
              <p>—</p>
            ) : (
              <ul className="space-y-1">
                {wasteByReason.map(([reason, total]) => (
                  <li
                    key={reason}
                    className="flex justify-between"
                  >
                    <span className="truncate mr-2">
                      {WASTE_REASON_TRANSLATIONS[reason]?.el ??
                        reason}
                    </span>
                    <span className="font-mono">
                      {total.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Δεξιά στήλη: Φόρμα + AI panel */}
      <div className="xl:col-span-1 space-y-4">
        {/* Φόρμα νέας φθοράς */}
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl p-4">
          <h3 className="text-lg font-heading font-semibold mb-3">
            Νέα Καταχώρηση Φθοράς
          </h3>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs mb-1">
                Είδος αποθήκης
              </label>
              <select
                value={formItemId}
                onChange={(e) => setFormItemId(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-slate-900"
              >
                {inventory.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs mb-1">
                  Ποσότητα
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formQuantity}
                  onChange={(e) =>
                    setFormQuantity(Number(e.target.value))
                  }
                  className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">
                  Ημ/νία & ώρα
                </label>
                <input
                  type="datetime-local"
                  value={formTimestamp}
                  onChange={(e) => setFormTimestamp(e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1">
                Λόγος φθοράς
              </label>
              <select
                value={formReason}
                onChange={(e) =>
                  setFormReason(e.target.value as WasteReasonKey)
                }
                className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-slate-900"
              >
                {WASTE_REASON_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {WASTE_REASON_TRANSLATIONS[key].el}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs mb-1">
                Σχόλια (optional)
              </label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={3}
                className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-slate-900 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!canManage}
              className="w-full mt-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="plus" className="w-4 h-4" />
              Καταχώρηση Φθοράς
            </button>
          </form>
        </div>

        {/* 🧠 AI Panel για Waste */}
        <div className="bg-purple-50/70 dark:bg-purple-900/40 border border-purple-200/80 dark:border-purple-700/70 rounded-2xl shadow-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon
                name="sparkles"
                className="w-5 h-5 text-purple-500 dark:text-purple-300"
              />
              <h3 className="text-md font-heading font-semibold text-purple-800 dark:text-purple-100">
                AI Ανάλυση Φθορών
              </h3>
            </div>
            <button
              type="button"
              onClick={handleAiWasteInsights}
              className="px-3 py-1 rounded-full border border-purple-400 text-purple-700 text-xs font-semibold hover:bg-purple-50 dark:border-purple-500 dark:text-purple-200 dark:hover:bg-purple-500/10 transition-colors"
            >
              Ανάλυση με Gemini
            </button>
          </div>

          {isAiLoading && (
            <p className="text-sm text-purple-700 dark:text-purple-200">
              Γίνεται ανάλυση των φθορών...
            </p>
          )}

          {!isAiLoading && aiError && (
            <p className="text-sm text-red-600 dark:text-red-300">
              {aiError}
            </p>
          )}

          {!isAiLoading && !aiError && aiInsights && (
            <pre className="text-sm whitespace-pre-wrap font-sans text-purple-900 dark:text-purple-100">
              {aiInsights}
            </pre>
          )}

          {!isAiLoading && !aiError && !aiInsights && (
            <p className="text-sm text-purple-700 dark:text-purple-200">
              Κατέγραψε μερικές φθορές (ή βάλε φίλτρο ημερομηνίας) και
              πάτα <strong>“Ανάλυση με Gemini”</strong> για να δεις
              προτάσεις μείωσης waste και βελτίωσης διαδικασιών.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WasteLogView;
