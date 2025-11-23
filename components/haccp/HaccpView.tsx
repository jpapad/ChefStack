import React, { useMemo, useState } from 'react';
import { HaccpLog, HaccpItem, Role, RolePermissions } from '../../types';
import { Icon } from '../common/Icon';

interface HaccpViewProps {
  logs: HaccpLog[];
  setLogs: React.Dispatch<React.SetStateAction<HaccpLog[]>>;
  haccpItems: HaccpItem[];
  onNavigateToPrint: () => void;
  currentUserRole?: Role;
  rolePermissions: RolePermissions;
  withApiKeyCheck: (action: () => void | Promise<void>) => void;
}

const HaccpView: React.FC<HaccpViewProps> = ({
  logs,
  setLogs, // κρατάμε για μελλοντική χρήση (π.χ. δημιουργία / edit logs)
  haccpItems,
  onNavigateToPrint,
  currentUserRole,
  rolePermissions,
  withApiKeyCheck,
}) => {
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7d' | '30d'>(
    'all'
  );

  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const canManage = currentUserRole
    ? rolePermissions[currentUserRole]?.includes('manage_haccp')
    : false;

  // 🔍 Φιλτράρισμα & στατιστικά HACCP logs
  const {
    logsSorted,
    totalLogs,
    logsLast7Days,
    lastLogDate,
    byItem,
    byType,
    byStatus,
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
      ? logs.filter((log) => {
          const ts =
            log.timestamp instanceof Date
              ? log.timestamp
              : new Date((log as any).timestamp);
          return ts >= from!;
        })
      : logs;

    const sorted = [...filtered].sort((a, b) => {
      const ta =
        a.timestamp instanceof Date
          ? a.timestamp.getTime()
          : new Date((a as any).timestamp).getTime();
      const tb =
        b.timestamp instanceof Date
          ? b.timestamp.getTime()
          : new Date((b as any).timestamp).getTime();
      return tb - ta;
    });

    const byItem = new Map<string, { name: string; count: number }>();
    const byType = new Map<string, number>();
    const byStatus = new Map<string, number>();

    for (const log of filtered) {
      const ts =
        log.timestamp instanceof Date
          ? log.timestamp
          : new Date((log as any).timestamp);

      const itemId = (log as any).itemId || (log as any).haccpItemId;
      const type = (log as any).type || (log as any).category || 'Γενικό';
      const status = (log as any).status || (log as any).result || 'ok';

      const item =
        itemId && haccpItems.find((i) => (i as any).id === itemId);
      const itemName = item ? (item as any).name || 'HACCP item' : 'Γενικός έλεγχος';

      const existing = byItem.get(itemName);
      if (existing) {
        existing.count += 1;
      } else {
        byItem.set(itemName, { name: itemName, count: 1 });
      }

      byType.set(type, (byType.get(type) ?? 0) + 1);
      byStatus.set(status, (byStatus.get(status) ?? 0) + 1);
    }

    // logs last 7 days (ανεξάρτητα από dateFilter)
    const from7 = new Date();
    from7.setDate(from7.getDate() - 7);
    const logsLast7Days = logs.filter((log) => {
      const ts =
        log.timestamp instanceof Date
          ? log.timestamp
          : new Date((log as any).timestamp);
      return ts >= from7;
    }).length;

    const lastLog = [...logs]
      .filter((l) => !!l.timestamp)
      .sort((a, b) => {
        const ta =
          a.timestamp instanceof Date
            ? a.timestamp.getTime()
            : new Date((a as any).timestamp).getTime();
        const tb =
          b.timestamp instanceof Date
            ? b.timestamp.getTime()
            : new Date((b as any).timestamp).getTime();
        return tb - ta;
      })[0];

    const lastLogDate = lastLog
      ? (lastLog.timestamp instanceof Date
          ? lastLog.timestamp
          : new Date((lastLog as any).timestamp)
        ).toLocaleString('el-GR')
      : null;

    return {
      logsSorted: sorted,
      totalLogs: logs.length,
      logsLast7Days,
      lastLogDate,
      byItem: Array.from(byItem.values()),
      byType: Array.from(byType.entries()),
      byStatus: Array.from(byStatus.entries()),
    };
  }, [logs, haccpItems, dateFilter]);

  // 🧠 AI HACCP Coach
  const handleAiHaccpInsights = () => {
    if (logs.length === 0) {
      setAiError('Δεν υπάρχουν καταχωρήσεις HACCP για ανάλυση.');
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
            throw new Error('Λείπει το VITE_GEMINI_API_KEY από το .env.local.');
          }

          const topItems = byItem
            .slice()
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
            .map((entry) => `- ${entry.name}: ${entry.count} καταγραφές`)
            .join('\n');

          const typeSummary = byType
            .map(([type, count]) => `- ${type}: ${count}`)
            .join('\n');

          const statusSummary = byStatus
            .map(([status, count]) => `- ${status}: ${count}`)
            .join('\n');

          const prompt = `
Είσαι σύμβουλος ασφάλειας τροφίμων & HACCP σε επαγγελματική κουζίνα.

Σου δίνω συγκεντρωτικά στοιχεία από τα HACCP logs:

- Συνολικές καταχωρήσεις: ${totalLogs}
- Καταχωρήσεις τελευταίων 7 ημερών: ${logsLast7Days}
- Τελευταία καταγραφή: ${
            lastLogDate || 'καμία διαθέσιμη ημερομηνία'
          }

Top HACCP σημεία (κατά πλήθος καταγραφών):
${topItems || '—'}

Κατανομή ανά τύπο / κατηγορία:
${typeSummary || '—'}

Κατανομή status (π.χ. ok, warning, critical):
${statusSummary || '—'}

Θέλω στα Ελληνικά, σε 5–8 bullets:

1. Τι εικόνα δίνουν τα δεδομένα για τη συνέπεια των HACCP καταγραφών.
2. Αν φαίνεται να υπάρχουν επαναλαμβανόμενα "αδύναμα σημεία" ή risk points.
3. Ποιες είναι οι 3–5 προτεραιότητες βελτίωσης (π.χ. θερμοκρασίες ψυγείων, ψύξη/αναθέρμανση, προσωπική υγιεινή, ιχνηλασιμότητα).
4. Συγκεκριμένες προτάσεις για training / checklists που θα βοηθήσουν την ομάδα.
5. Αν θεωρείς ότι η καταγραφή είναι επαρκής ή χρειάζεται πιο συχνό / πιο δομημένο logging.

Να είσαι πρακτικός, με απλά bullets, σαν να δίνεις feedback σε Head Chef και F&B Manager.
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
            console.error('Gemini API error (haccp):', text);
            throw new Error('Σφάλμα από το Gemini API.');
          }

          const data = await response.json();
          const text =
            data?.candidates?.[0]?.content?.parts
              ?.map((p: any) => p.text)
              .join('\n') || 'Δεν λήφθηκε απάντηση από το AI.';

          setAiInsights(text);
        } catch (e: any) {
          console.error('AI HACCP insights error', e);
          setAiError(
            e?.message || 'Σφάλμα κατά την ανάλυση των HACCP καταγραφών.'
          );
        } finally {
          setIsAiLoading(false);
        }
      })();
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
      {/* Αριστερά / κέντρο: λίστα HACCP logs & μικρά stats */}
      <div className="xl:col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl p-4 flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-heading font-bold">Καταγραφές HACCP</h2>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
              Σύνολο: {totalLogs} | Τελευταίες 7 ημέρες: {logsLast7Days}
              {lastLogDate && (
                <>
                  {' '}
                  | Τελευταία καταγραφή:{' '}
                  <span className="font-mono">{lastLogDate}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
              className="text-xs border rounded px-2 py-1 bg-white dark:bg-slate-900"
            >
              <option value="all">Όλες οι ημερομηνίες</option>
              <option value="today">Σήμερα</option>
              <option value="7d">Τελευταίες 7 ημέρες</option>
              <option value="30d">Τελευταίες 30 ημέρες</option>
            </select>

            <button
              type="button"
              onClick={onNavigateToPrint}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-emerald-400 text-emerald-700 text-xs font-semibold hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-200 dark:hover:bg-emerald-500/10 transition-colors"
            >
              <Icon name="printer" className="w-3 h-3" />
              Εκτύπωση HACCP
            </button>
          </div>
        </div>

        <div className="mt-2 overflow-y-auto max-h-[55vh]">
          {logsSorted.length === 0 ? (
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Δεν υπάρχουν καταχωρήσεις HACCP για το επιλεγμένο χρονικό διάστημα.
            </p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase text-light-text-secondary dark:text-dark-text-secondary">
                <tr>
                  <th className="py-2 pr-4">Ημ/νία</th>
                  <th className="py-2 pr-4">Σημείο ελέγχου</th>
                  <th className="py-2 pr-4">Τύπος</th>
                  <th className="py-2 pr-4">Τιμή</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Σχόλια</th>
                </tr>
              </thead>
              <tbody>
                {logsSorted.map((log) => {
                  const ts =
                    log.timestamp instanceof Date
                      ? log.timestamp
                      : new Date((log as any).timestamp);

                  const itemId =
                    (log as any).itemId || (log as any).haccpItemId;
                  const item =
                    itemId && haccpItems.find((i) => (i as any).id === itemId);
                  const itemName = item
                    ? (item as any).name || 'HACCP item'
                    : 'Γενικός έλεγχος';

                  const type =
                    (log as any).type || (log as any).category || '—';
                  const value =
                    (log as any).value !== undefined
                      ? (log as any).value
                      : (log as any).temperature ??
                        (log as any).reading ??
                        '—';
                  const status =
                    (log as any).status || (log as any).result || 'ok';
                  const notes =
                    (log as any).notes || (log as any).comment || '';

                  const statusColor =
                    status === 'critical' || status === 'fail'
                      ? 'text-red-600'
                      : status === 'warning'
                      ? 'text-amber-600'
                      : 'text-emerald-600';

                  return (
                    <tr
                      key={(log as any).id ?? ts.getTime()}
                      className="border-t border-light-border/40 dark:border-dark-border/40"
                    >
                      <td className="py-2 pr-4 align-top font-mono text-xs">
                        {ts.toLocaleString('el-GR')}
                      </td>
                      <td className="py-2 pr-4 align-top">{itemName}</td>
                      <td className="py-2 pr-4 align-top text-xs">{type}</td>
                      <td className="py-2 pr-4 align-top font-mono">
                        {String(value)}
                      </td>
                      <td
                        className={`py-2 pr-4 align-top text-xs font-semibold ${statusColor}`}
                      >
                        {status}
                      </td>
                      <td className="py-2 pr-4 align-top text-xs">
                        {notes || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Μικρά summaries κάτω από τη λίστα */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-light-text-secondary dark:text-dark-text-secondary">
          <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3">
            <h4 className="font-semibold mb-1">Συχνότερα HACCP σημεία</h4>
            {byItem.length === 0 ? (
              <p>—</p>
            ) : (
              <ul className="space-y-1">
                {byItem
                  .slice()
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)
                  .map((entry) => (
                    <li key={entry.name} className="flex justify-between">
                      <span className="truncate mr-2">{entry.name}</span>
                      <span className="font-mono">{entry.count}</span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
          <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3">
            <h4 className="font-semibold mb-1">Κατανομή status</h4>
            {byStatus.length === 0 ? (
              <p>—</p>
            ) : (
              <ul className="space-y-1">
                {byStatus.map(([status, count]) => (
                  <li key={status} className="flex justify-between">
                    <span className="truncate mr-2">{status}</span>
                    <span className="font-mono">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Δεξιά: AI HACCP Coach */}
      <div className="xl:col-span-1 space-y-4">
        <div className="bg-purple-50/70 dark:bg-purple-900/40 border border-purple-200/80 dark:border-purple-700/70 rounded-2xl shadow-xl p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon
                name="sparkles"
                className="w-5 h-5 text-purple-500 dark:text-purple-300"
              />
              <h3 className="text-md font-heading font-semibold text-purple-800 dark:text-purple-100">
                AI HACCP Coach
              </h3>
            </div>
            <button
              type="button"
              onClick={handleAiHaccpInsights}
              className="px-3 py-1 rounded-full border border-purple-400 text-purple-700 text-xs font-semibold hover:bg-purple-50 dark:border-purple-500 dark:text-purple-200 dark:hover:bg-purple-500/10 transition-colors"
            >
              Ανάλυση HACCP
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isAiLoading && (
              <p className="text-sm text-purple-700 dark:text-purple-200">
                Γίνεται ανάλυση των HACCP καταγραφών...
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
                Κατέγραψε μερικά HACCP σημεία (θερμοκρασίες, καθαριότητες κ.λπ.)
                και πάτα <strong>“Ανάλυση HACCP”</strong> για να πάρεις πρακτικό
                feedback και προτεραιότητες βελτίωσης.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HaccpView;
