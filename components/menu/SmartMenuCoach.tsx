import React, { useMemo, useState } from 'react';
import { Recipe, InventoryItem, WasteLog } from '../../types';
import { Icon } from '../common/Icon';

interface SmartMenuCoachProps {
  recipes: Recipe[];
  inventory: InventoryItem[];
  wasteLogs: WasteLog[];
  withApiKeyCheck: (action: () => void | Promise<void>) => void;
}

const SmartMenuCoach: React.FC<SmartMenuCoachProps> = ({
  recipes,
  inventory,
  wasteLogs,
  withApiKeyCheck,
}) => {
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Βασικά aggregates για το prompt
  const {
    totalWasteQuantity,
    wasteByItem,
    totalInventoryItems,
    totalRecipes,
  } = useMemo(() => {
    const totalRecipes = recipes.length;
    const totalInventoryItems = inventory.length;

    const wasteMap = new Map<string, { name: string; totalQty: number; unit: string }>();
    let totalWasteQuantity = 0;

    for (const log of wasteLogs) {
      const item = inventory.find(i => i.id === log.inventoryItemId);
      const name = item?.name ?? 'Άγνωστο είδος';
      const unit = log.unit;

      const existing = wasteMap.get(log.inventoryItemId);
      if (existing) {
        existing.totalQty += log.quantity;
      } else {
        wasteMap.set(log.inventoryItemId, {
          name,
          totalQty: log.quantity,
          unit,
        });
      }

      totalWasteQuantity += log.quantity;
    }

    const wasteByItem = Array.from(wasteMap.values());

    return {
      totalWasteQuantity,
      wasteByItem,
      totalInventoryItems,
      totalRecipes,
    };
  }, [recipes, inventory, wasteLogs]);

  const handleAiMenuEngineering = () => {
    setAiError(null);
    setAiAdvice(null);

    if (recipes.length === 0) {
      setAiError('Δεν υπάρχουν καταχωρημένες συνταγές για ανάλυση μενού.');
      return;
    }

    withApiKeyCheck(() => {
      (async () => {
        try {
          setAiLoading(true);

          const rawKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
          if (typeof rawKey !== 'string' || !rawKey) {
            throw new Error(
              'Λείπει το VITE_GEMINI_API_KEY στο .env.local. Πρόσθεσέ το και κάνε restart τον dev server.'
            );
          }

          const apiKey: string = rawKey;

          const topWasteLines = wasteByItem
            .slice()
            .sort((a, b) => b.totalQty - a.totalQty)
            .slice(0, 7)
            .map(
              (entry) =>
                `- ${entry.name}: ${entry.totalQty.toFixed(2)} ${entry.unit}`
            )
            .join('\n');

          const prompt = `
Είσαι σύμβουλος menu engineering & F&B για επαγγελματική κουζίνα.

Σου δίνω μια συνοπτική εικόνα από το σύστημα:

Βασικά στοιχεία:
- Συνολικές συνταγές: ${totalRecipes}
- Συνολικά είδη αποθήκης: ${totalInventoryItems}
- Συνολική ποσότητα φθοράς (όλες οι εγγραφές): ${totalWasteQuantity.toFixed(
            2
          )} (σε μονάδες αποθήκης)

Top φθορά ανά είδος:
${topWasteLines || '— (δεν υπάρχουν δεδομένα φθοράς)'}

Θέλω στα Ελληνικά, σε 6–10 bullets:

1. Τι σου δείχνει αυτή η εικόνα για την ισορροπία παραγωγής / αποθέματος (overproduction, overstock κ.λπ.).
2. Πώς θα πρότεινες να “σφίξει” το menu (π.χ. μείωση κωδικών, κοινή χρήση ίδιων πρώτων υλών, ειδικά πιάτα ημέρας που καίνε stock).
3. Ποιες 3–5 πολύ συγκεκριμένες ενέργειες θα πρότεινες σε Head Chef & F&B Manager για τις επόμενες 2 εβδομάδες (π.χ. αλλαγές σε παραγγελίες, προτάσεις πιάτων ημέρας, rotation, portioning).
4. Πού βλέπεις μεγαλύτερο ρίσκο για φθορά ή χαμένο food cost.
5. Αν κρίνεις ότι χρειάζεται καλύτερη τυποποίηση συνταγών / σταθμών εργασίας, δώσε ιδέες.

Μη γράψεις έκθεση· θέλω πρακτικά bullets, σαν σημειώσεις πριν από meeting για menu engineering.
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
            console.error('Gemini API error (SmartMenuCoach):', text);
            throw new Error('Σφάλμα από το Gemini API.');
          }

          const data = await response.json();
          const text =
            data?.candidates?.[0]?.content?.parts
              ?.map((p: any) => p.text)
              .join('\n') || 'Δεν λήφθηκε απάντηση από το AI.';

          setAiAdvice(text);
        } catch (e: any) {
          console.error('AI SmartMenuCoach error', e);
          setAiError(
            e?.message ||
              'Σφάλμα κατά την ανάλυση του μενού / αποθέματος από το AI.'
          );
        } finally {
          setAiLoading(false);
        }
      })();
    });
  };

  return (
    <div className="bg-purple-50/70 dark:bg-purple-900/40 border border-purple-200/80 dark:border-purple-700/70 rounded-2xl shadow-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon
            name="sparkles"
            className="w-5 h-5 text-purple-500 dark:text-purple-300"
          />
          <div>
            <h3 className="text-md font-heading font-semibold text-purple-800 dark:text-purple-100">
              Smart Menu Coach
            </h3>
            <p className="text-[11px] text-purple-700/80 dark:text-purple-200/80">
              Χρησιμοποιεί συνταγές, απόθεμα & φθορές για menu engineering
              προτάσεις.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAiMenuEngineering}
          disabled={aiLoading}
          className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-purple-500 text-white text-xs font-semibold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Icon name="message-circle" className="w-4 h-4" />
          {aiLoading ? 'Γίνεται ανάλυση...' : 'Ανάλυση Μενού με Gemini'}
        </button>
      </div>

      {/* Μικρό summary πάνω από το κείμενο του AI */}
      <div className="mb-3 grid grid-cols-3 gap-2 text-[11px] text-purple-900/80 dark:text-purple-100/80">
        <div className="bg-white/60 dark:bg-purple-950/40 rounded-lg p-2">
          <p className="font-semibold">Συνταγές</p>
          <p className="font-mono text-sm">{totalRecipes}</p>
        </div>
        <div className="bg-white/60 dark:bg-purple-950/40 rounded-lg p-2">
          <p className="font-semibold">Είδη αποθήκης</p>
          <p className="font-mono text-sm">{totalInventoryItems}</p>
        </div>
        <div className="bg-white/60 dark:bg-purple-950/40 rounded-lg p-2">
          <p className="font-semibold">Συνολική φθορά</p>
          <p className="font-mono text-sm">
            {totalWasteQuantity.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Αν υπάρχει data φθοράς, δείξε top 3 items σαν mini context */}
      {wasteByItem.length > 0 && (
        <div className="mb-3 bg-white/60 dark:bg-purple-950/40 rounded-lg p-2 text-[11px]">
          <p className="font-semibold mb-1">Top φθορά ανά είδος:</p>
          <ul className="space-y-0.5">
            {wasteByItem
              .slice()
              .sort((a, b) => b.totalQty - a.totalQty)
              .slice(0, 3)
              .map((entry) => (
                <li
                  key={entry.name}
                  className="flex justify-between gap-2"
                >
                  <span className="truncate">{entry.name}</span>
                  <span className="font-mono">
                    {entry.totalQty.toFixed(2)} {entry.unit}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}

      <div className="mt-2 text-sm text-purple-900 dark:text-purple-100 max-h-64 overflow-y-auto border-t border-purple-200/60 dark:border-purple-700/60 pt-2">
        {aiError && (
          <p className="text-sm text-red-600 dark:text-red-300">
            {aiError}
          </p>
        )}

        {!aiError && aiAdvice && (
          <pre className="whitespace-pre-wrap font-sans">
            {aiAdvice}
          </pre>
        )}

        {!aiError && !aiAdvice && !aiLoading && (
          <p className="text-sm">
            Με βάση τις συνταγές, το απόθεμα & τις φθορές, ο Smart Menu Coach
            μπορεί να σου προτείνει:
            <br />
            • πού “περισσεύει” το menu σου,
            <br />
            • πώς να χρησιμοποιήσεις καλύτερα το stock,
            <br />
            • συγκεκριμένα επόμενα βήματα για Head Chef & F&amp;B Manager.
          </p>
        )}
      </div>
    </div>
  );
};

export default SmartMenuCoach;
