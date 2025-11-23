import React, { useMemo } from 'react';
import {
  WasteLog,
  InventoryItem,
  IngredientCost,
  Recipe,
  Menu,
} from '../../types';
import { Icon } from '../common/Icon';

interface WasteInsightsPanelProps {
  wasteLogs: WasteLog[];
  inventory: InventoryItem[];
  ingredientCosts: IngredientCost[];
  recipes: Recipe[];
  menus: Menu[];
}

/**
 * Κεντρικό panel για Waste Insights:
 * - Top προϊόντα με φθορά (ποσότητα & κόστος)
 * - Συνολική ποσότητα και εκτιμώμενο κόστος
 * - Συνταγές & μενού που χρησιμοποιούν τα προϊόντα με υψηλή φθορά
 * - Μικρό trend ανά ημέρα
 */
const WasteInsightsPanel: React.FC<WasteInsightsPanelProps> = ({
  wasteLogs,
  inventory,
  ingredientCosts,
  recipes,
  menus,
}) => {
  // 🔎 γρήγορα lookup maps
  const inventoryById = useMemo(() => {
    const map = new Map<string, InventoryItem>();
    inventory.forEach((item) => map.set(item.id, item));
    return map;
  }, [inventory]);

  const ingredientCostById = useMemo(() => {
    const map = new Map<string, IngredientCost>();
    ingredientCosts.forEach((c) => map.set(c.id, c));
    return map;
  }, [ingredientCosts]);

  // 📊 συνολικά & ανά είδος
  const {
    totalQuantity,
    totalCost,
    byItem,
    dailyTrend,
  } = useMemo(() => {
    let totalQuantity = 0;
    let totalCost = 0;

    const byItem: {
      [itemId: string]: {
        quantity: number;
        estimatedCost: number;
      };
    } = {};

    // ανά ημερομηνία (YYYY-MM-DD)
    const dailyTrend: {
      [date: string]: {
        quantity: number;
        estimatedCost: number;
      };
    } = {};

    wasteLogs.forEach((log) => {
      const invItem = inventoryById.get(log.inventoryItemId);
      const baseQuantity = log.quantity;

      totalQuantity += baseQuantity;

      // Εκτίμηση κόστους: χρησιμοποιούμε ingredientCost από το InventoryItem
      let costForThisLog = 0;
      if (invItem && invItem.ingredientCostId) {
        const costRow = ingredientCostById.get(invItem.ingredientCostId);
        if (costRow && costRow.cost) {
          // Πολύ απλή προσέγγιση: υποθέτουμε ότι η μονάδα κόστους ταιριάζει με τη μονάδα του inventory
          costForThisLog = baseQuantity * costRow.cost;
          totalCost += costForThisLog;
        }
      }

      if (!byItem[log.inventoryItemId]) {
        byItem[log.inventoryItemId] = {
          quantity: 0,
          estimatedCost: 0,
        };
        }
      byItem[log.inventoryItemId].quantity += baseQuantity;
      byItem[log.inventoryItemId].estimatedCost += costForThisLog;

      const dateKey = new Date(log.timestamp).toISOString().slice(0, 10);
      if (!dailyTrend[dateKey]) {
        dailyTrend[dateKey] = {
          quantity: 0,
          estimatedCost: 0,
        };
      }
      dailyTrend[dateKey].quantity += baseQuantity;
      dailyTrend[dateKey].estimatedCost += costForThisLog;
    });

    return { totalQuantity, totalCost, byItem, dailyTrend };
  }, [wasteLogs, inventoryById, ingredientCostById]);

  // Top 5 items by quantity
  const topItems = useMemo(() => {
    return (Object.entries(byItem) as [
      string,
      { quantity: number; estimatedCost: number }
    ][])
      .map(([itemId, info]) => {
        const invItem = inventoryById.get(itemId);
        return {
          itemId,
          itemName: invItem?.name || 'Άγνωστο είδος',
          unit: invItem?.unit || '',
          quantity: info.quantity,
          estimatedCost: info.estimatedCost,
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [byItem, inventoryById]);

  // Trend των τελευταίων 7–10 ημερών (sorted)
  const dailyTrendSorted = useMemo(() => {
    const entries = Object.entries(dailyTrend) as [
      string,
      { quantity: number; estimatedCost: number }
    ][];
    const sorted = entries.sort(
      (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );
    // κρατάμε μόνο τελευταίες 10 ημέρες για να μην γίνει τεράστιο
    return sorted.slice(-10);
  }, [dailyTrend]);

  // 🔗 Σύνδεση προϊόντων με συνταγές & μενού
  const topItemsWithUsage = useMemo(() => {
    return topItems.map((item) => {
      const lowerName = item.itemName.toLowerCase();

      // Συνταγές που πιθανόν χρησιμοποιούν το είδος (με βάση το όνομα υλικού)
      const usedInRecipes = recipes.filter((r) =>
        r.ingredients.some((ing) =>
          ing.name.toLowerCase().includes(lowerName)
        )
      );

      // Μενού που περιέχουν αυτές τις συνταγές
      const usedInMenus: {
        menuId: string;
        name: string;
        type: Menu['type'];
      }[] = [];

      menus.forEach((menu) => {
        let usesAnyRecipe = false;

        if (menu.type === 'a_la_carte') {
          usesAnyRecipe = usedInRecipes.some((r) =>
            menu.recipeIds.includes(r.id)
          );
        } else if (menu.type === 'buffet') {
          const buffetUses = menu.dailyPlans.some((plan) =>
            plan.mealPeriods.some((period) =>
              period.categories.some((cat) =>
                cat.recipes.some((stub) =>
                  usedInRecipes.some((r) => r.id === stub.recipeId)
                )
              )
            )
          );
          usesAnyRecipe = buffetUses;
        }

        if (usesAnyRecipe) {
          usedInMenus.push({
            menuId: menu.id,
            name: menu.name,
            type: menu.type,
          });
        }
      });

      return {
        ...item,
        usedInRecipes,
        usedInMenus,
      };
    });
  }, [topItems, recipes, menus]);

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 h-full flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-200/80 dark:border-gray-700/80">
        <div className="flex items-center gap-2">
          <Icon
            name="trash-2"
            className="w-6 h-6 text-amber-500 flex-shrink-0"
          />
          <div>
            <h2 className="text-xl font-extrabold font-heading">
              Waste Insights
            </h2>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
              Επισκόπηση φθορών ανά προϊόν, κόστος και σύνδεση με συνταγές &amp; μενού.
            </p>
          </div>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5">
          <p className="text-xs font-semibold uppercase text-light-text-secondary dark:text-dark-text-secondary">
            Συνολική ποσότητα φθοράς
          </p>
          <p className="mt-2 text-2xl font-extrabold">
            {totalQuantity.toFixed(2)}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">
            Συνολικό άθροισμα μονάδων από όλα τα προϊόντα.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5">
          <p className="text-xs font-semibold uppercase text-light-text-secondary dark:text-dark-text-secondary">
            Εκτιμώμενο κόστος φθοράς
          </p>
          <p className="mt-2 text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {totalCost.toFixed(2)} €
          </p>
          <p className="text-[11px] text-gray-500 mt-1">
            Υπολογισμένο από τις τιμές αγοράς (όπου υπάρχουν).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/40 border border-amber-200/80 dark:border-amber-700/70">
          <p className="text-xs font-semibold uppercase text-amber-800 dark:text-amber-100">
            Κορυφαίο προϊόν σε φθορά
          </p>
          {topItems[0] ? (
            <>
              <p className="mt-2 text-sm font-bold text-amber-900 dark:text-amber-50">
                {topItems[0].itemName}
              </p>
              <p className="text-xs text-amber-900/80 dark:text-amber-100/80">
                {topItems[0].quantity.toFixed(2)} {topItems[0].unit} &bull;{' '}
                ~{topItems[0].estimatedCost.toFixed(2)} €
              </p>
            </>
          ) : (
            <p className="mt-2 text-xs text-amber-900/80 dark:text-amber-100/80">
              Δεν υπάρχουν ακόμη καταχωρήσεις φθοράς.
            </p>
          )}
        </div>
      </div>

      {/* Κύριο περιεχόμενο: αριστερά top items, δεξιά trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Top προϊόντα */}
        <div className="flex flex-col min-h-0">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Icon name="bar-chart-3" className="w-4 h-4" />
            Top προϊόντα σε φθορά
          </h3>
          {topItemsWithUsage.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-light-text-secondary dark:text-dark-text-secondary border border-dashed border-gray-300/70 dark:border-gray-700/70 rounded-xl p-4">
              Δεν υπάρχουν αρκετά δεδομένα φθοράς για να εμφανιστούν insights.
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {topItemsWithUsage.map((item) => (
                <div
                  key={item.itemId}
                  className="p-3 rounded-xl bg-light-card/80 dark:bg-dark-card/80 border border-black/5 dark:border-white/10"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">
                        {item.itemName}
                      </p>
                      <p className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary">
                        Φθορά:{' '}
                        <strong>
                          {item.quantity.toFixed(2)} {item.unit}
                        </strong>{' '}
                        (~{item.estimatedCost.toFixed(2)} €)
                      </p>
                    </div>
                  </div>

                  {/* Συνταγές */}
                  {item.usedInRecipes.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[11px] font-semibold text-gray-500 mb-1">
                        Συνταγές που χρησιμοποιούν το προϊόν:
                      </p>
                      <ul className="flex flex-wrap gap-1">
                        {item.usedInRecipes.slice(0, 4).map((r) => (
                          <li
                            key={r.id}
                            className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[11px]"
                          >
                            {r.name}
                          </li>
                        ))}
                        {item.usedInRecipes.length > 4 && (
                          <li className="text-[11px] text-gray-500">
                            +{item.usedInRecipes.length - 4} ακόμα
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Μενού */}
                  {item.usedInMenus.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[11px] font-semibold text-gray-500 mb-1">
                        Εμφανίζεται σε μενού:
                      </p>
                      <ul className="flex flex-wrap gap-1">
                        {item.usedInMenus.slice(0, 3).map((m) => (
                          <li
                            key={m.menuId}
                            className="px-2 py-0.5 rounded-full bg-amber-50/80 dark:bg-amber-900/50 border border-amber-200/80 dark:border-amber-700/80 text-[11px] text-amber-900 dark:text-amber-50"
                          >
                            {m.name}{' '}
                            <span className="opacity-70">
                              ({m.type === 'a_la_carte'
                                ? 'à la carte'
                                : 'buffet'}
                              )
                            </span>
                          </li>
                        ))}
                        {item.usedInMenus.length > 3 && (
                          <li className="text-[11px] text-gray-500">
                            +{item.usedInMenus.length - 3} ακόμα
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily trend */}
        <div className="flex flex-col min-h-0">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Icon name="activity" className="w-4 h-4" />
            Trend φθοράς ανά ημέρα
          </h3>
          {dailyTrendSorted.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-light-text-secondary dark:text-dark-text-secondary border border-dashed border-gray-300/70 dark:border-gray-700/70 rounded-xl p-4">
              Δεν υπάρχουν ακόμη καταχωρήσεις φθοράς για να δεις trend.
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto border border-black/5 dark:border-white/10 rounded-xl">
              <table className="w-full text-xs">
                <thead className="bg-black/5 dark:bg-white/10">
                  <tr>
                    <th className="p-2 text-left">Ημερομηνία</th>
                    <th className="p-2 text-right">Ποσότητα</th>
                    <th className="p-2 text-right">Εκτ. Κόστος</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyTrendSorted.map(([date, info]) => (
                    <tr
                      key={date}
                      className="border-t border-black/5 dark:border-white/5"
                    >
                      <td className="p-2">
                        {new Date(date).toLocaleDateString('el-GR', {
                          weekday: 'short',
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </td>
                      <td className="p-2 text-right">
                        {info.quantity.toFixed(2)}
                      </td>
                      <td className="p-2 text-right">
                        {info.estimatedCost.toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-2 text-[11px] text-light-text-secondary dark:text-dark-text-secondary">
            * Οι υπολογισμοί κόστους είναι προσεγγιστικοί και βασίζονται στις
            τιμές αγοράς όπως έχουν καταχωρηθεί στα είδη αποθήκης.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WasteInsightsPanel;
