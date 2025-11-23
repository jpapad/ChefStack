import React, { useState, useMemo } from 'react';
import {
  Menu,
  Recipe,
  InventoryItem,
  Supplier,
  ShoppingListItem,
  PurchaseUnit,
  WasteLog,
} from '../../types';
import { Icon } from '../common/Icon';

interface ShoppingListViewProps {
  menus: Menu[];
  recipes: Recipe[]; // All recipes available
  inventory: InventoryItem[];
  suppliers: Supplier[];
  withApiKeyCheck: (action: () => void | Promise<void>) => void;
  wasteLogs?: WasteLog[]; // προαιρετικά, για μελλοντική ανάλυση με βάση φθορές

  /** Προαιρετικό callback για άνοιγμα είδους στην Αποθήκη */
  onOpenInventoryItem?: (itemId: string) => void;
}

const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  menus,
  recipes,
  inventory,
  suppliers,
  withApiKeyCheck,
  wasteLogs,
  onOpenInventoryItem,
}) => {
  const [selectedMenuIds, setSelectedMenuIds] = useState<string[]>([]);

  const shoppingList = useMemo((): ShoppingListItem[] => {
    if (selectedMenuIds.length === 0) return [];

    const requiredIngredients: Record<
      string,
      { required: number; unit: PurchaseUnit; supplierName?: string }
    > = {};

    selectedMenuIds.forEach((menuId) => {
      const menu = menus.find((m) => m.id === menuId);
      if (!menu) return;

      let recipeStubs: { recipeId: string; quantity: number }[] = [];
      if (menu.type === 'a_la_carte') {
        // Assume 1 serving of each for a la carte for planning
        recipeStubs = menu.recipeIds.map((id) => ({
          recipeId: id,
          quantity: 1,
        }));
      } else {
        // buffet
        menu.dailyPlans.forEach((plan) => {
          plan.mealPeriods.forEach((period) => {
            period.categories.forEach((cat) => {
              recipeStubs.push(...cat.recipes);
            });
          });
        });
      }

      recipeStubs.forEach((stub) => {
        const recipe = recipes.find((r) => r.id === stub.recipeId);
        if (!recipe) return;

        const scalingFactor = stub.quantity / recipe.servings;
        recipe.ingredients.forEach((ing) => {
          // This is a simplified conversion. A real app needs a robust unit conversion library.
          let purchaseUnit: PurchaseUnit = 'kg';
          if (['ml', 'L'].includes(ing.unit)) purchaseUnit = 'L';
          if (ing.unit === 'τεμ') purchaseUnit = 'τεμ';

          let quantityInPurchaseUnit = ing.quantity * scalingFactor;
          if (ing.unit === 'g' && purchaseUnit === 'kg') {
            quantityInPurchaseUnit /= 1000;
          }
          if (ing.unit === 'ml' && purchaseUnit === 'L') {
            quantityInPurchaseUnit /= 1000;
          }

          if (!requiredIngredients[ing.name]) {
            requiredIngredients[ing.name] = {
              required: 0,
              unit: purchaseUnit,
            };
          }
          requiredIngredients[ing.name].required += quantityInPurchaseUnit;
        });
      });
    });

    return Object.entries(requiredIngredients)
      .map(([name, data]) => {
        const stockItem = inventory.find((i) => i.name === name);
        const stock = stockItem
          ? stockItem.locations.reduce((sum, loc) => sum + loc.quantity, 0)
          : 0;
        const supplier = suppliers.find((s) => s.id === stockItem?.supplierId);
        return {
          name,
          ...data,
          stock,
          toBuy: Math.max(0, data.required - stock),
          supplierName: supplier?.name,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedMenuIds, menus, recipes, inventory, suppliers]);

  // 🧠 Κατάσταση για AI Βοηθό Αγορών
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAiShoppingAdvice = () => {
    setAiError(null);
    setAiAdvice(null);

    if (selectedMenuIds.length === 0 || shoppingList.length === 0) {
      setAiError(
        'Επίλεξε πρώτα ένα ή περισσότερα μενού για να δημιουργηθεί λίστα αγορών.'
      );
      return;
    }

    withApiKeyCheck(() => {
      (async () => {
        try {
          setAiLoading(true);

          const apiKey = import.meta.env.VITE_GEMINI_API_KEY as
            | string
            | undefined;
          if (!apiKey) {
            throw new Error(
              'Λείπει το VITE_GEMINI_API_KEY στο .env.local. Πρόσθεσέ το και κάνε restart τον dev server.'
            );
          }

          const itemsToBuy = shoppingList.filter((i) => i.toBuy > 0.0001);
          const totalItems = shoppingList.length;
          const totalToBuy = itemsToBuy.length;

          const topToBuy = itemsToBuy
            .slice()
            .sort((a, b) => b.toBuy - a.toBuy)
            .slice(0, 15)
            .map((item) => {
              const supplierText = item.supplierName
                ? ` (προμηθευτής: ${item.supplierName})`
                : '';
              return `- ${item.name}: χρειάζονται ${item.required.toFixed(
                2
              )} ${item.unit}, απόθεμα ${item.stock.toFixed(
                2
              )} => για αγορά ${item.toBuy.toFixed(2)} ${item.unit}${supplierText}`;
            })
            .join('\n');

          // Ομαδοποίηση ανά προμηθευτή για πιο «αγοραστική» ματιά
          const bySupplier: Record<
            string,
            { count: number; lines: string[] }
          > = {};
          itemsToBuy.forEach((item) => {
            const supplierName =
              item.supplierName || 'Χωρίς συγκεκριμένο προμηθευτή';
            if (!bySupplier[supplierName]) {
              bySupplier[supplierName] = { count: 0, lines: [] };
            }
            bySupplier[supplierName].count += 1;
            bySupplier[supplierName].lines.push(
              `• ${item.name}: ${item.toBuy.toFixed(2)} ${item.unit}`
            );
          });

          const supplierSummary = Object.entries(bySupplier)
            .map(([supplierName, info]) => {
              return `Προμηθευτής: ${supplierName} (είδη: ${
                info.count
              })\n${info.lines.join('\n')}`;
            })
            .join('\n\n');

          // (Προαιρετικό) summary από wasteLogs – για μελλοντική χρήση
          const wasteInfo =
            wasteLogs && wasteLogs.length > 0
              ? `Υπάρχουν ${wasteLogs.length} καταχωρήσεις φθοράς στο σύστημα (μπορεί να σημαίνει ότι κάποια είδη χρειάζονται προσοχή ως προς ποσότητες / rotation).`
              : 'Δεν χρησιμοποιούμε ακόμα λεπτομέρειες φθοράς εδώ, αλλά το σύστημα έχει δυνατότητα HACCP & waste log.';

          const prompt = `
Είσαι F&B controller και βοηθός αγορών για επαγγελματική κουζίνα.

Σου δίνω μια αυτόματα υπολογισμένη λίστα αγορών, με βάση τα επιλεγμένα μενού και τις συνταγές.
Οι ποσότητες είναι ήδη σε μονάδες αγοράς (kg, L, τεμ κ.λπ.) και έχουν αφαιρεθεί τα τρέχοντα stock.

Γενική εικόνα:
- Επιλεγμένα μενού: ${selectedMenuIds.length}
- Συνολικά διαφορετικά είδη στη λίστα: ${totalItems}
- Είδη που χρειάζονται πραγματική αγορά (toBuy > 0): ${totalToBuy}

Top είδη για αγορά (μεγαλύτερα gaps):
${topToBuy || '— (όλες οι ανάγκες καλύπτονται από το υπάρχον απόθεμα)'}

Ομαδοποίηση ανά προμηθευτή:
${supplierSummary || '— (δεν έχουν οριστεί προμηθευτές για τα περισσότερα είδη)'}

Πληροφορία για φθορές / waste:
${wasteInfo}

Θέλω στα Ελληνικά, σε 6–10 bullets:

1. Ποια 3–5 είδη βάζεις ως ΑΠΟΛΥΤΗ προτεραιότητα στις σημερινές αγορές και γιατί.
2. Πώς θα πρότεινες να οργανωθούν οι παραγγελίες ανά προμηθευτή (π.χ. ποιες παραγγελίες πάνε μαζί).
3. Αν βλέπεις κίνδυνο να παραγγείλουμε υπερβολικές ποσότητες σε σχέση με το stock, δώσε προειδοποίηση.
4. Προτάσεις για substitutions / εναλλακτικές πρώτες ύλες αν κάποιο είδος είναι πολύ ακριβό ή δύσκολο στην προμήθεια.
5. 3–5 πολύ συγκεκριμένα "next actions" για τον Chef ή τον F&B Manager (π.χ. τηλεφώνησε στον Χ προμηθευτή, κλείσε παραγγελία μέχρι ώρα Χ, έλεγξε ψυγεία για Α, κ.λπ.).
6. Αν κρίνεις ότι κάποια είδη θα έπρεπε να περιοριστούν στο menu για να μειωθεί η πολυπλοκότητα, κάνε το σχόλιο.

Χρησιμοποίησε bullets (•) και όχι μεγάλες παραγράφους. Να είσαι πρακτικός και συγκεκριμένος, σαν να προετοιμάζεις σημειώσεις πριν τις πρωινές αγορές.
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
            console.error('Gemini API error (shopping list coach):', text);
            throw new Error('Σφάλμα από το Gemini API.');
          }

          const data = await response.json();
          const text =
            data?.candidates?.[0]?.content?.parts
              ?.map((p: any) => String(p.text ?? ''))
              .join('\n') || 'Δεν λήφθηκε απάντηση από το AI.';

          setAiAdvice(text);
        } catch (e: any) {
          console.error('AI shopping advisor error', e);
          setAiError(
            e?.message ||
              'Σφάλμα κατά την ανάλυση της λίστας αγορών από το AI.'
          );
        } finally {
          setAiLoading(false);
        }
      })();
    });
  };

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200/80 dark:border-gray-700/80 flex-wrap gap-2">
        <h2 className="text-3xl font-extrabold font-heading">Λίστα Αγορών</h2>
        <button
          onClick={() => window.print()}
          disabled={shoppingList.length === 0}
          className="flex items-center gap-2 bg-brand-dark text-white px-4 py-2 rounded-full hover:opacity-90 disabled:opacity-50"
        >
          <Icon name="printer" className="w-5 h-5" />
          <span className="font-semibold text-sm">Εκτύπωση</span>
        </button>
      </div>

      <div className="mb-4">
        <label className="font-semibold mb-2 block">
          Επιλογή Μενού για Δημιουργία Λίστας:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {menus.map((menu) => (
            <label
              key={menu.id}
              className={`p-3 rounded-lg cursor-pointer ${
                selectedMenuIds.includes(menu.id)
                  ? 'bg-brand-yellow text-brand-dark'
                  : 'bg-black/5 dark:bg-white/10'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedMenuIds.includes(menu.id)}
                onChange={() =>
                  setSelectedMenuIds((prev) =>
                    prev.includes(menu.id)
                      ? prev.filter((id) => id !== menu.id)
                      : [...prev, menu.id]
                  )
                }
                className="hidden"
              />
              <span className="font-semibold">{menu.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto printable-area">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md">
            <tr className="border-b-2 border-black/10 dark:border-white/10">
              <th className="p-2">Είδος</th>
              <th className="p-2 text-right">Απαιτείται</th>
              <th className="p-2 text-right">Απόθεμα</th>
              <th className="p-2 text-right font-bold">Για Αγορά</th>
              <th className="p-2">Προμηθευτής</th>
              <th className="p-2 text-center">Αποθήκη</th>
            </tr>
          </thead>
          <tbody>
            {shoppingList.map((item) => {
              const stockItem = inventory.find((i) => i.name === item.name);
              const canOpenInventory =
                !!stockItem && typeof onOpenInventoryItem === 'function';

              return (
                <tr
                  key={item.name}
                  className={`border-b border-black/5 dark:border-white/5 ${
                    item.toBuy <= 0 ? 'text-gray-400' : 'font-semibold'
                  }`}
                >
                  <td className="p-2">{item.name}</td>
                  <td className="p-2 text-right">
                    {item.required.toFixed(2)} {item.unit}
                  </td>
                  <td className="p-2 text-right">
                    {item.stock.toFixed(2)} {item.unit}
                  </td>
                  <td className="p-2 text-right font-bold">
                    {item.toBuy.toFixed(2)} {item.unit}
                  </td>
                  <td className="p-2">{item.supplierName || '-'}</td>
                  <td className="p-2 text-center">
                    {canOpenInventory ? (
                      <button
                        type="button"
                        onClick={() =>
                          stockItem && onOpenInventoryItem?.(stockItem.id)
                        }
                        className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs border border-blue-400 text-blue-700 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-200 dark:hover:bg-blue-500/10 transition-colors"
                        title="Άνοιγμα στην Αποθήκη"
                      >
                        <Icon name="arrow-right" className="w-3 h-3 mr-1" />
                        Αποθήκη
                      </button>
                    ) : (
                      <span className="text-[11px] text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {shoppingList.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <p>Επιλέξτε ένα ή περισσότερα μενού για να δημιουργηθεί η λίστα αγορών.</p>
          </div>
        )}
      </div>

      {/* 🧠 AI Βοηθός Αγορών */}
      <div className="mt-6 bg-purple-50/80 dark:bg-purple-900/40 border border-purple-200/80 dark:border-purple-700/70 rounded-2xl shadow-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon
              name="sparkles"
              className="w-5 h-5 text-purple-500 dark:text-purple-300"
            />
            <div>
              <h3 className="text-sm font-heading font-semibold text-purple-800 dark:text-purple-100">
                AI Βοηθός Αγορών
              </h3>
              <p className="text-[11px] text-purple-700/80 dark:text-purple-200/80">
                Αναλύει τη λίστα αγορών, προτεραιοποιεί είδη & προμηθευτές.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAiShoppingAdvice}
            disabled={aiLoading}
            className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-purple-500 text-white text-xs font-semibold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Icon name="message-circle" className="w-4 h-4" />
            {aiLoading ? 'Γίνεται ανάλυση...' : 'Πάρε προτάσεις αγορών'}
          </button>
        </div>

        <div className="mt-2 text-sm text-purple-900 dark:text-purple-100 max-h-64 overflow-y-auto border-t border-purple-200/60 dark:border-purple-700/60 pt-2">
          {aiError && (
            <p className="text-sm text-red-600 dark:text-red-300">{aiError}</p>
          )}

          {!aiError && aiAdvice && (
            <pre className="whitespace-pre-wrap font-sans">{aiAdvice}</pre>
          )}

          {!aiError && !aiAdvice && !aiLoading && (
            <p className="text-sm">
              Επίλεξε μενού, δες τη λίστα και μετά πάτησε{' '}
              <strong>“Πάρε προτάσεις αγορών”</strong> για να πάρεις:
              <br />
              • ποια είδη να παραγγείλεις πρώτα, <br />
              • πώς να οργανώσεις παραγγελίες ανά προμηθευτή, <br />
              • συγκεκριμένα next steps για τις σημερινές αγορές.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingListView;
