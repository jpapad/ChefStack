import React, { useMemo, useState } from 'react';
import {
  WasteLog,
  InventoryItem,
  User,
  Role,
  RolePermissions,
  WasteReasonKey,
  WASTE_REASON_KEYS,
  WASTE_REASON_TRANSLATIONS
} from '../../types';
import { Icon } from '../common/Icon';

interface WasteLogViewProps {
  wasteLogs: WasteLog[];
  setWasteLogs: React.Dispatch<React.SetStateAction<WasteLog[]>>;
  inventory: InventoryItem[];
  users: User[];
  onSave: (logData: Omit<WasteLog, 'id' | 'teamId' | 'userId'>) => void;
  currentUserRole?: Role;
  rolePermissions: RolePermissions;
  withApiKeyCheck: (action: () => void) => void;
}

const WasteLogView: React.FC<WasteLogViewProps> = ({
  wasteLogs,
  setWasteLogs, // (δεν το χρησιμοποιούμε προς το παρόν, η αποθήκευση γίνεται από onSave)
  inventory,
  users,
  onSave,
  currentUserRole,
  rolePermissions,
  withApiKeyCheck
}) => {
  const canManage = currentUserRole
    ? rolePermissions[currentUserRole]?.includes('manage_waste')
    : false;

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
    return iso.slice(0, 16); // YYYY-MM-DDTHH:MM για <input type="datetime-local">
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

    const item = inventory.find(i => i.id === formItemId);
    const unit = item?.unit ?? 'kg';

    onSave({
      inventoryItemId: formItemId,
      quantity: formQuantity,
      unit,
      reason: formReason,
      notes: formNotes || '',
      timestamp: formTimestamp
        ? new Date(formTimestamp)
        : new Date()
    });

    // reset απλά quantity/notes
    setFormQuantity(0);
    setFormNotes('');
  };

  // 📊 Στατιστικά φθορών (για AI + dashboard)
  const { logsSorted, wasteByItem, wasteByReason } = useMemo(() => {
    const sorted = [...wasteLogs].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    const byItem = new Map<
      string,
      { name: string; total: number; unit: string }
    >();
    const byReason = new Map<WasteReasonKey, number>();

    for (const log of wasteLogs) {
      const item = inventory.find(i => i.id === log.inventoryItemId);
      const name = item?.name ?? 'Άγνωστο είδος';
      const unit = log.unit;

      const existingItem = byItem.get(log.inventoryItemId);
      if (existingItem) {
        existingItem.total += log.quantity;
      } else {
        byItem.set(log.inventoryItemId, {
          name,
          total: log.quantity,
          unit
        });
      }

      const reasonTotal = byReason.get(log.reason as WasteReasonKey) ?? 0;
      byReason.set(log.reason as WasteReasonKey, reasonTotal + log.quantity);
    }

    return {
      logsSorted: sorted,
      wasteByItem: Array.from(byItem.entries()),
      wasteByReason: Array.from(byReason.entries())
    };
  }, [wasteLogs, inventory]);

  // 🧠 Κατάσταση & handler για Gemini
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAiWasteInsights = () => {
    if (wasteLogs.length === 0) {
      setAiError('Δεν υπάρχουν καταχωρημένες φθορές για ανάλυση.');
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

          // Φτιάχνουμε μια συνοπτική περίληψη για το prompt
          const topItems = wasteByItem
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

          const totalEvents = wasteLogs.length;
          const distinctItems = new Set(
            wasteLogs.map(w => w.inventoryItemId)
          ).size;

          const prompt = `
Είσαι σύμβουλος εστίασης και food cost σε επαγγελματική κουζίνα.
Σου δίνω συγκεντρωτικά δεδομένα φθορών (waste log) και θέλω πρακτικές προτάσεις βελτίωσης.

Συνολική εικόνα:
- Αριθμός καταχωρήσεων φθοράς: ${totalEvents}
- Διαφορετικά είδη με φθορά: ${distinctItems}

Φθορά ανά είδος (top 10 κατά ποσότητα):
${topItems || '—'}

Φθορά ανά λόγο:
${reasonsSummary || '—'}

Ζήταω στα Ελληνικά, σε 5–8 bullets:
1. Ποια είδη φαίνεται να είναι τα πιο προβληματικά και γιατί.
2. Τι μπορεί να σημαίνει η κατανομή των λόγων φθοράς (λήξη, αλλοίωση, λάθη μαγειρέματος, πλεονάζουσα παραγωγή κ.λπ.).
3. Συγκεκριμένες ιδέες για μείωση φθοράς (planning, portioning, αλλαγές σε menu engineering, καλύτερο rotation, επικοινωνία με ομάδα).
4. Ποιες 2–3 ενέργειες θα έβαζες ως προτεραιότητα από αύριο.

Μη γράψεις δοκίμιο· θέλω συγκεκριμένες, πρακτικές προτάσεις.
          `.trim();

          const response = await fetch(
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' +
    encodeURIComponent(apiKey),
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    })
  }
);



          if (!response.ok) {
            const text = await response.text();
            console.error('Gemini API error (waste):', text);
            throw new Error('Σφάλμα από το Gemini API.');
          }

          const data = await response.json();
          const text =
            data?.candidates?.[0]?.content?.parts
              ?.map((p: any) => p.text)
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

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
      {/* Λίστα φθορών */}
      <div className="xl:col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl p-4 flex flex-col">
        <div className="flex justify-between items-center mb  -4">
          <h2 className="text-xl font-heading font-bold">
            Καταγραφή Φθορών
          </h2>
          <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Σύνολο: {wasteLogs.length} εγγραφές
          </span>
        </div>

        <div className="mt-4 overflow-y-auto max-h-[55vh]">
          {wasteLogs.length === 0 ? (
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Δεν έχουν καταχωρηθεί φθορές ακόμα.
            </p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase text-light-text-secondary dark:text-dark-text-secondary">
                <tr>
                  <th className="py-2 pr-4">Ημ/νία</th>
                  <th className="py-2 pr-4">Είδος</th>
                  <th className="py-2 pr-4">Ποσότητα</th>
                  <th className="py-2 pr-4">Λόγος</th>
                  <th className="py-2 pr-4">Σχόλια</th>
                </tr>
              </thead>
              <tbody>
                {logsSorted.map(log => {
                  const item = inventory.find(
                    i => i.id === log.inventoryItemId
                  );
                  const reasonLabel =
                    WASTE_REASON_TRANSLATIONS[log.reason]?.el ??
                    log.reason;
                  return (
                    <tr
                      key={log.id}
                      className="border-t border-light-border/40 dark:border-dark-border/40"
                    >
                      <td className="py-2 pr-4 align-top">
                        {log.timestamp.toLocaleString('el-GR')}
                      </td>
                      <td className="py-2 pr-4 align-top">
                        {item?.name ?? 'Άγνωστο είδος'}
                      </td>
                      <td className="py-2 pr-4 align-top font-mono">
                        {log.quantity.toFixed(2)} {log.unit}
                      </td>
                      <td className="py-2 pr-4 align-top">
                        {reasonLabel}
                      </td>
                      <td className="py-2 pr-4 align-top">
                        {log.notes || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
                  .slice(0, 5)
                  .sort((a, b) => b[1].total - a[1].total)
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
                onChange={e => setFormItemId(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-slate-900"
              >
                {inventory.map(item => (
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
                  onChange={e =>
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
                  onChange={e => setFormTimestamp(e.target.value)}
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
                onChange={e =>
                  setFormReason(e.target.value as WasteReasonKey)
                }
                className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-slate-900"
              >
                {WASTE_REASON_KEYS.map(key => (
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
                onChange={e => setFormNotes(e.target.value)}
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
              Κατέγραψε μερικές φθορές και πάτα{' '}
              <strong>“Ανάλυση με Gemini”</strong> για να δεις
              προτάσεις μείωσης waste και βελτίωσης διαδικασιών.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WasteLogView;
