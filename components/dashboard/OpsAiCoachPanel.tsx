import React, { useState, useMemo } from 'react';
import {
  Recipe,
  Menu,
  InventoryItem,
  WasteLog,
  HaccpLog,
  PrepTask,
} from '../../types';
import { Icon } from '../common/Icon';

interface OpsAiCoachPanelProps {
  recipes: Recipe[];
  menus: Menu[];
  inventory: InventoryItem[];
  wasteLogs: WasteLog[];
  haccpLogs: HaccpLog[];
  tasks: PrepTask[];
  withApiKeyCheck: (action: () => void | Promise<void>) => void;
}

const OpsAiCoachPanel: React.FC<OpsAiCoachPanelProps> = ({
  recipes,
  menus,
  inventory,
  wasteLogs,
  haccpLogs,
  tasks,
  withApiKeyCheck,
}) => {
  const [aiText, setAiText] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🔢 Βασικά metrics για daily briefing
  const {
    activeMenusCount,
    laCarteMenusCount,
    buffetMenusCount,
    totalInventoryItems,
    lowStockItems,
    totalWasteQty7d,
    totalWasteCost7d,
    haccpLogs7d,
    openTasks,
    inProgressTasks,
    doneTasksToday,
  } = useMemo(() => {
    const now = new Date();

    // Menus
    const activeMenus = menus; // αν έχεις isActive / date range μπορείς να το φιλτράρεις εδώ
    const laCarte = activeMenus.filter(m => (m as any).type === 'a_la_carte');
    const buffet = activeMenus.filter(m => (m as any).type === 'buffet');

    // Inventory
    const totalInv = inventory.length;
    const lowStock = inventory.filter(item => {
      const totalQty = item.locations.reduce((sum, loc) => sum + loc.quantity, 0);
      const reorderPoint = (item as any).reorderPoint ?? 0;
      return reorderPoint > 0 && totalQty <= reorderPoint;
    });

    // Waste 7 days
    const from7 = new Date();
    from7.setDate(from7.getDate() - 7);
    let wasteQty = 0;
    let wasteCost = 0;
    for (const log of wasteLogs) {
      const ts =
        log.timestamp instanceof Date
          ? log.timestamp
          : new Date((log as any).timestamp);
      if (ts >= from7) {
        wasteQty += log.quantity;
        // απλό cost: αν το inventoryItem έχει ingredientCost, θα μπορούσες να βάλεις πιο ακριβή λογική
        // εδώ αφήνουμε wasteCost = 0, θα το δώσει το AI σαν "εκτίμηση"
      }
    }

    // HACCP 7 days
    const haccp7 = haccpLogs.filter(log => {
      const ts =
        log.timestamp instanceof Date
          ? log.timestamp
          : new Date((log as any).timestamp);
      return ts >= from7;
    }).length;

    // Tasks
    const todayStr = now.toISOString().slice(0, 10);
    const open = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const doneToday = tasks.filter(t => {
      if (!t.completedAt) return false;
      const ts =
        t.completedAt instanceof Date
          ? t.completedAt
          : new Date((t as any).completedAt);
      return ts.toISOString().slice(0, 10) === todayStr;
    }).length;

    return {
      activeMenusCount: activeMenus.length,
      laCarteMenusCount: laCarte.length,
      buffetMenusCount: buffet.length,
      totalInventoryItems: totalInv,
      lowStockItems: lowStock,
      totalWasteQty7d: wasteQty,
      totalWasteCost7d: wasteCost,
      haccpLogs7d: haccp7,
      openTasks,
      inProgressTasks: inProgress,
      doneTasksToday,
    };
  }, [menus, inventory, wasteLogs, haccpLogs, tasks]);

  const handleDailyBriefing = () => {
    if (!menus.length && !inventory.length && !wasteLogs.length && !haccpLogs.length) {
      setAiError('Δεν υπάρχουν αρκετά δεδομένα (menus / αποθήκη / φθορές / HACCP) για briefing.');
      return;
    }

    withApiKeyCheck(() => {
      (async () => {
        setIsLoading(true);
        setAiError(null);
        setAiText(null);

        try {
          const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
          if (!apiKey) {
            throw new Error(
              'Λείπει το VITE_GEMINI_API_KEY στο .env.local. Πρόσθεσέ το και κάνε restart τον dev server.'
            );
          }

          const lowStockPreview = lowStockItems
            .slice(0, 10)
            .map(item => {
              const totalQty = item.locations.reduce(
                (sum, loc) => sum + loc.quantity,
                0
              );
              const reorderPoint = (item as any).reorderPoint ?? 0;
              return `- ${item.name}: ${totalQty.toFixed(2)} ${item.unit} (reorder: ${
                reorderPoint || '-'
              })`;
            })
            .join('\n');

          const prompt = `
Είσαι executive chef & F&B controller σε μεγάλη επαγγελματική κουζίνα.
Σου δίνω συνοπτικά δεδομένα από το operation για να ετοιμάσεις ένα daily briefing.

Δεδομένα:

• Συνταγές στο σύστημα: ${recipes.length}
• Ενεργά menus: ${activeMenusCount} (a la carte: ${laCarteMenusCount}, buffet: ${buffetMenusCount})

• Σύνολο ειδών αποθήκης: ${totalInventoryItems}
• Είδη με χαμηλό απόθεμα: ${lowStockItems.length}
Top low stock:
${lowStockPreview || '—'}

• Φθορές τελευταίων 7 ημερών:
  - Συνολική ποσότητα (σε μονάδες αποθήκης): ${totalWasteQty7d.toFixed(2)}
  - Εκτιμώμενο κόστος: ${totalWasteCost7d.toFixed(2)} € (υπολογισμός μέσα από το σύστημα μπορεί να βελτιωθεί)

• HACCP:
  - Καταγραφές τελευταίων 7 ημερών: ${haccpLogs7d}

• Εργασίες προετοιμασίας (prep tasks):
  - Ανοιχτές: ${openTasks}
  - Σε εξέλιξη: ${inProgressTasks}
  - Ολοκληρωμένες σήμερα: ${doneTasksToday}

Θέλω στα Ελληνικά, σε 6–10 bullets:

1. Μια συνοπτική εικόνα για το πώς φαίνεται η μέρα (workload / ρίσκα / ευκαιρίες).
2. Προτεραιότητες για τον Chef και το pass (προετοιμασίες, κρίσιμες εργασίες).
3. Προτεραιότητες για αγορές / απόθεμα με βάση τα low stock.
4. Παρατηρήσεις για waste & HACCP (αν χρειάζεται προσοχή ή training).
5. 3–5 πολύ συγκεκριμένα "next actions" (π.χ. έλεγξε αυτά τα είδη, μίλα με τον τάδε, κάνε extra έλεγχο στο τάδε ψυγείο).
6. Οτιδήποτε θα έλεγες στο briefing των 5 λεπτών πριν το service.

Να είσαι συγκεκριμένος και πρακτικός, όχι θεωρητικός. Χρησιμοποίησε bullets (•) και σύντομες φράσεις.
          `.trim();

          const model = 'gemini-2.0-flash';
          const endpoint =
            'https://generativelanguage.googleapis.com/v1beta/models/' +
            model +
            ':generateContent?key=' +
            encodeURIComponent(apiKey);

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          });

          if (!response.ok) {
            const text = await response.text();
            console.error('Gemini API error (ops coach):', text);
            throw new Error('Σφάλμα από το Gemini API.');
          }

          const data = await response.json();
          const text =
            data?.candidates?.[0]?.content?.parts
              ?.map((p: any) => p.text)
              .join('\n') || 'Δεν λήφθηκε απάντηση από το AI.';

          setAiText(text);
        } catch (e: any) {
          console.error('AI Ops coach error', e);
          setAiError(
            e?.message || 'Σφάλμα κατά την ανάλυση των operational δεδομένων.'
          );
        } finally {
          setIsLoading(false);
        }
      })();
    });
  };

  return (
    <div className="bg-purple-50/70 dark:bg-purple-900/40 border border-purple-200/80 dark:border-purple-700/70 rounded-2xl shadow-xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon
            name="sparkles"
            className="w-5 h-5 text-purple-500 dark:text-purple-300"
          />
          <h3 className="text-md font-heading font-semibold text-purple-800 dark:text-purple-100">
            Ops AI Coach (Daily Briefing)
          </h3>
        </div>
        <button
          type="button"
          onClick={handleDailyBriefing}
          disabled={isLoading}
          className="px-3 py-1 rounded-full border border-purple-400 text-purple-700 text-xs font-semibold hover:bg-purple-50 dark:border-purple-500 dark:text-purple-200 dark:hover:bg-purple-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Ανάλυση...' : 'AI Daily Briefing'}
        </button>
      </div>

      <div className="text-[11px] text-purple-900/80 dark:text-purple-200/80 mb-2">
        <p>
          Χρησιμοποιεί συνταγές, menus, απόθεμα, φθορές & HACCP για να σου δώσει
          προτεραιότητες ημέρας, σαν mini meeting πριν το service.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto border-t border-purple-200/60 dark:border-purple-700/60 pt-2 text-sm">
        {isLoading && (
          <p className="text-purple-700 dark:text-purple-200">
            Γίνεται ανάλυση των δεδομένων...
          </p>
        )}

        {!isLoading && aiError && (
          <p className="text-red-600 dark:text-red-300">{aiError}</p>
        )}

        {!isLoading && !aiError && aiText && (
          <pre className="whitespace-pre-wrap font-sans text-purple-900 dark:text-purple-100">
            {aiText}
          </pre>
        )}

        {!isLoading && !aiError && !aiText && (
          <p className="text-purple-800 dark:text-purple-200 text-sm">
            Όταν θα έχεις κάποια δεδομένα (menus, αποθήκη, φθορές, HACCP, tasks),
            πάτα <strong>“AI Daily Briefing”</strong> για να πάρεις μια συνοπτική
            εικόνα με προτεραιότητες για σήμερα.
          </p>
        )}
      </div>
    </div>
  );
};

export default OpsAiCoachPanel;
