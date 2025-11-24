// components/ai/ChefCopilot.tsx
import React, { useMemo, useState } from 'react';
import {
  Recipe,
  Menu,
  InventoryItem,
  WasteLog,
  HaccpLog,
  PrepTask,
  Workstation,
} from '../../types';
import { Icon } from '../common/Icon';

interface ChefCopilotProps {
  recipes: Recipe[];
  menus: Menu[];
  inventory: InventoryItem[];
  wasteLogs: WasteLog[];
  haccpLogs: HaccpLog[];
  tasks: PrepTask[];
  workstations: Workstation[];
  withApiKeyCheck: (action: () => void | Promise<void>) => void;
}

const ChefCopilot: React.FC<ChefCopilotProps> = ({
  recipes,
  menus,
  inventory,
  wasteLogs,
  haccpLogs,
  tasks,
  workstations,
  withApiKeyCheck,
}) => {
  const [question, setQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🔹 Γρήγορα prompts για "ένα κλικ" ερωτήσεις
  const quickPrompts = [
    {
      id: 'food_cost',
      label: 'Μείωση food cost',
      text: 'Πώς μπορώ να μειώσω food cost την επόμενη εβδομάδα με βάση αποθέματα, φθορές και μενού;',
    },
    {
      id: 'waste',
      label: 'Μείωση waste',
      text: 'Ποιες κινήσεις να κάνω για να μειώσω food waste, με βάση τις τωρινές φθορές και το απόθεμα;',
    },
    {
      id: 'menu_engineering',
      label: 'Menu engineering',
      text: 'Τι θα πρότεινες για βελτίωση του menu engineering (προτάσεις για αλλαγές σε πιάτα, τιμές, mix);',
    },
    {
      id: 'prep_plan',
      label: 'Prep plan',
      text: 'Βοήθησέ με να οργανώσω καλύτερα το prep plan ανά σταθμό εργασίας για σήμερα.',
    },
    {
      id: 'haccp',
      label: 'HACCP & ασφάλεια',
      text: 'Βλέποντας τα δεδομένα HACCP και τις φθορές, ποιους κινδύνους βλέπεις και τι training θα πρότεινες στην ομάδα;',
    },
  ] as const;

  // 🧮 Συνοπτικά στατιστικά για context στο prompt
  const {
    totalRecipes,
    totalMenus,
    totalInventoryItems,
    totalWasteQty,
    topWasteItemsText,
    topInventoryItemsText,
    openTasksByWorkstationText,
    haccpSummaryText,
  } = useMemo(() => {
    const totalRecipes = recipes.length;
    const totalMenus = menus.length;
    const totalInventoryItems = inventory.length;

    // Top waste items κατά ποσότητα
    const wasteByItem = new Map<string, { name: string; total: number; unit: string }>();
    for (const w of wasteLogs) {
      const item = inventory.find((i) => i.id === w.inventoryItemId);
      const name = item?.name ?? 'Άγνωστο είδος';
      const unit = w.unit;
      const existing = wasteByItem.get(w.inventoryItemId);
      if (existing) {
        existing.total += w.quantity;
      } else {
        wasteByItem.set(w.inventoryItemId, { name, total: w.quantity, unit });
      }
    }
    const wasteArr = Array.from(wasteByItem.values());
    const totalWasteQty = wasteArr.reduce((sum, x) => sum + x.total, 0);

    const topWasteItemsText =
      wasteArr
        .sort((a, b) => b.total - a.total)
        .slice(0, 10)
        .map((x) => `- ${x.name}: ${x.total.toFixed(2)} ${x.unit}`)
        .join('\n') || '—';

    // Inventory: απλά top items βάσει ποσότητας
    const topInventoryItemsText =
      inventory
        .slice()
        .sort((a, b) => {
          const qa = a.locations?.reduce((s, l) => s + l.quantity, 0) ?? 0;
          const qb = b.locations?.reduce((s, l) => s + l.quantity, 0) ?? 0;
          return qb - qa;
        })
        .slice(0, 15)
        .map((item) => {
          const qty = item.locations?.reduce((s, l) => s + l.quantity, 0) ?? 0;
          return `- ${item.name}: ${qty.toFixed(2)} ${item.unit}`;
        })
        .join('\n') || '—';

    // Tasks ανά workstation
    const tasksByWS = new Map<string, { name: string; count: number }>();
    for (const t of tasks) {
      const wsName =
        t.workstationId &&
        workstations.find((w) => w.id === t.workstationId)?.name;
      const key = wsName || 'Γενικές / χωρίς σταθμό';
      const existing = tasksByWS.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        tasksByWS.set(key, { name: key, count: 1 });
      }
    }
    const openTasksByWorkstationText =
      Array.from(tasksByWS.values())
        .map((x) => `- ${x.name}: ${x.count} εργασίες`)
        .join('\n') || '—';

    // HACCP συνοπτικά
    const totalHaccpLogs = haccpLogs.length;
    let lastHaccpDate: string | null = null;
    if (totalHaccpLogs > 0) {
      const sorted = [...haccpLogs].sort((a, b) => {
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
      const last = sorted[0];
      const ts =
        last.timestamp instanceof Date
          ? last.timestamp
          : new Date((last as any).timestamp);
      lastHaccpDate = ts.toLocaleString('el-GR');
    }
    const haccpSummaryText = `Σύνολο HACCP καταγραφών: ${totalHaccpLogs}${
      lastHaccpDate ? ` | Τελευταία καταγραφή: ${lastHaccpDate}` : ''
    }`;

    return {
      totalRecipes,
      totalMenus,
      totalInventoryItems,
      totalWasteQty,
      topWasteItemsText,
      topInventoryItemsText,
      openTasksByWorkstationText,
      haccpSummaryText,
    };
  }, [recipes, menus, inventory, wasteLogs, haccpLogs, tasks, workstations]);

  const handleUseQuickPrompt = (text: string) => {
    setQuestion(text);
    setAiAnswer(null);
    setAiError(null);
  };

  const handleAsk = () => {
    setAiError(null);
    setAiAnswer(null);

    if (!question.trim()) {
      setAiError('Γράψε μια ερώτηση ή διάλεξε ένα quick prompt.');
      return;
    }

    withApiKeyCheck(() => {
      (async () => {
        try {
          setIsLoading(true);

          const apiKey = import.meta.env.VITE_GEMINI_API_KEY as
            | string
            | undefined;
          if (!apiKey) {
            throw new Error(
              'Λείπει το VITE_GEMINI_API_KEY στο .env.local. Πρόσθεσέ το και κάνε restart τον dev server.'
            );
          }

          const recipesSummary =
            recipes
              .slice(0, 25)
              .map(
                (r) =>
                  `- ${r.name} (${r.category || 'χωρίς κατηγορία'})${
                    r.price ? ` | τιμή: ${r.price.toFixed(2)}€` : ''
                  }`
              )
              .join('\n') || '—';

          const menusSummary =
            menus
              .slice(0, 15)
              .map(
                (m) =>
                  `- ${m.name} (${m.type})${
                    (m as any).pax ? ` | pax: ${(m as any).pax}` : ''
                  }`
              )
              .join('\n') || '—';

          const prompt = `
Είσαι έμπειρος Executive Chef & F&B consultant σε ξενοδοχείο / εστιατόριο.
Έχεις πρόσβαση σε συνοπτικά δεδομένα της κουζίνας (recipes, μενού, απόθεμα, φθορές, HACCP, prep tasks).

Τα δεδομένα σου:

[Recipes]
Σύνολο συνταγών: ${totalRecipes}
Top συνταγές:
${recipesSummary}

[Menus]
Σύνολο menus: ${totalMenus}
Σύνοψη:
${menusSummary}

[Inventory]
Σύνολο ειδών αποθήκης: ${totalInventoryItems}
Top items βάσει ποσότητας:
${topInventoryItemsText}

[Waste / Φθορές]
Συνολική ποσότητα φθοράς (κατά προσέγγιση): ${totalWasteQty.toFixed(2)}
Top είδη με φθορά:
${topWasteItemsText}

[Prep Tasks & Workstations]
Σύνοψη εργασιών ανά σταθμό:
${openTasksByWorkstationText}

[HACCP / Ασφάλεια τροφίμων]
${haccpSummaryText}

Η ερώτηση του Chef είναι:
"${question.trim()}"

Απάντησε στα Ελληνικά, σε 8–14 bullets, με πολύ πρακτικά βήματα.
Δώσε μου:
1) Γρήγορη αξιολόγηση κατάστασης (1–2 bullets).
2) 3–5 άμεσα actions για τις επόμενες 24–48 ώρες (πολύ συγκεκριμένα).
3) 3–5 μεσοπρόθεσμες ενέργειες (1–4 εβδομάδες) για βελτίωση (food cost, waste, οργάνωση, HACCP, training).
4) Αν χρειάζονται αλλαγές σε menu / συνταγές, δώσε σύντομες, συγκεκριμένες προτάσεις.

Απόφυγε μεγάλα κατεβατά· χρησιμοποίησε bullets με δυνατά, actionable σημεία.
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
            console.error('Gemini API error (ChefCopilot):', text);
            throw new Error('Σφάλμα από το Gemini API.');
          }

          const data: any = await response.json();
          const text =
            data?.candidates?.[0]?.content?.parts
              ?.map((p: any) => p.text)
              .join('\n') || 'Δεν λήφθηκε απάντηση από το AI.';

          setAiAnswer(text);
        } catch (e: any) {
          console.error('ChefCopilot AI error', e);
          setAiError(
            e?.message ||
              'Σφάλμα κατά την ανάλυση των δεδομένων από το AI Copilot.'
          );
        } finally {
          setIsLoading(false);
        }
      })();
    });
  };

  return (
    <div className="h-full flex flex-col gap-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-gray-200/80 dark:border-gray-700/80 pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading flex items-center gap-2">
            <Icon name="sparkles" className="w-7 h-7 text-purple-500" />
            Chef AI Copilot
          </h2>
          <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
            Συνδυάζει δεδομένα από συνταγές, menus, απόθεμα, φθορές, HACCP & prep tasks
            για να σου δώσει executive συμβουλές.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-right text-[11px] text-light-text-secondary dark:text-dark-text-secondary">
          <div>
            <p className="font-semibold">Recipes</p>
            <p className="font-mono">{totalRecipes}</p>
          </div>
          <div>
            <p className="font-semibold">Menus</p>
            <p className="font-mono">{totalMenus}</p>
          </div>
          <div>
            <p className="font-semibold">Inventory items</p>
            <p className="font-mono">{totalInventoryItems}</p>
          </div>
        </div>
      </div>

      {/* Πάνω μέρος: quick prompts + ερώτηση */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick prompts */}
        <div className="lg:col-span-1 bg-black/5 dark:bg-white/5 rounded-2xl p-3 flex flex-col">
          <h3 className="text-sm font-heading font-semibold mb-2 flex items-center gap-2">
            <Icon name="zap" className="w-4 h-4 text-amber-500" />
            Quick prompts
          </h3>
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-2">
            Διάλεξε ένα θέμα και προσαρμόσέ το αν χρειάζεται:
          </p>
          <div className="flex flex-col gap-2">
            {quickPrompts.map((qp) => (
              <button
                key={qp.id}
                type="button"
                onClick={() => handleUseQuickPrompt(qp.text)}
                className="text-left px-3 py-2 rounded-xl text-xs bg-white/80 dark:bg-slate-900/70 hover:bg-amber-50 dark:hover:bg-amber-900/30 border border-black/5 dark:border-white/10 transition-colors"
              >
                <div className="font-semibold mb-0.5">{qp.label}</div>
                <div className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary line-clamp-2">
                  {qp.text}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Ερώτηση + κουμπί Ask Copilot */}
        <div className="lg:col-span-2 bg-black/5 dark:bg-white/5 rounded-2xl p-3 flex flex-col">
          <h3 className="text-sm font-heading font-semibold mb-2 flex items-center gap-2">
            <Icon name="message-circle" className="w-4 h-4 text-purple-500" />
            Η ερώτηση του Chef
          </h3>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm resize-none"
            placeholder="Πες μου τι σε απασχολεί π.χ. “πώς μειώνω waste χωρίς να κόψω πιάτα best-seller;”"
          />
          <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
            <p className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary">
              Το Copilot θα χρησιμοποιήσει τα τρέχοντα δεδομένα της κουζίνας (όχι ολόκληρα
              dumps, αλλά συνοπτική εικόνα) για να σου δώσει προτάσεις.
            </p>
            <button
              type="button"
              onClick={handleAsk}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="sparkles" className="w-4 h-4" />
              {isLoading ? 'Σκέφτεται...' : 'Ρώτα το Copilot'}
            </button>
          </div>
        </div>
      </div>

      {/* Απάντηση AI */}
      <div className="flex-1 min-h-[180px] bg-purple-50/60 dark:bg-purple-900/30 border border-purple-200/70 dark:border-purple-700/60 rounded-2xl p-4 overflow-y-auto">
        <h3 className="text-sm font-heading font-semibold mb-2 flex items-center gap-2 text-purple-900 dark:text-purple-50">
          <Icon name="sparkles" className="w-4 h-4" />
          Copilot απάντηση
        </h3>

        {isLoading && (
          <p className="text-sm text-purple-800 dark:text-purple-100">
            Γίνεται ανάλυση των δεδομένων της κουζίνας...
          </p>
        )}

        {!isLoading && aiError && (
          <p className="text-sm text-red-600 dark:text-red-300">{aiError}</p>
        )}

        {!isLoading && !aiError && aiAnswer && (
          <pre className="text-sm whitespace-pre-wrap font-sans text-purple-950 dark:text-purple-50">
            {aiAnswer}
          </pre>
        )}

        {!isLoading && !aiError && !aiAnswer && (
          <p className="text-sm text-purple-900/80 dark:text-purple-100/80">
            Ξεκίνησε με ένα quick prompt ή γράψε εσύ την ερώτηση που σε καίει για
            food cost, waste, menu engineering, HACCP ή οργάνωση κουζίνας. Το Copilot
            θα απαντήσει σαν Executive Chef & F&B consultant, με συγκεκριμένα επόμενα βήματα.
          </p>
        )}
      </div>
    </div>
  );
};

export default ChefCopilot;
