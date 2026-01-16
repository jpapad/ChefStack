import React, { useMemo, useState } from 'react';
import { Recipe, InventoryItem, WasteLog, IngredientCost, ALLERGEN_TRANSLATIONS } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

interface SmartMenuCoachProps {
  recipes: Recipe[];
  inventory: InventoryItem[];
  wasteLogs: WasteLog[];
  ingredientCosts: IngredientCost[];
  withApiKeyCheck: (action: () => void | Promise<void>) => void;
}

const SmartMenuCoach: React.FC<SmartMenuCoachProps> = ({
  recipes,
  inventory,
  wasteLogs,
  ingredientCosts,
  withApiKeyCheck,
}) => {
  const { language } = useTranslation();
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(false);

  // Helper: Get current season based on date
  const getCurrentSeason = (): string => {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  };

  // Seasonal ingredient suggestions
  const seasonalSuggestions = useMemo(() => {
    const season = getCurrentSeason();
    const suggestions: Record<string, string[]> = {
      spring: ['Αρακάς', 'Κουκιά', 'Αγκινάρες', 'Σπανάκι', 'Μαρούλι', 'Φράουλες'],
      summer: ['Ντομάτες', 'Αγγούρι', 'Μελιτζάνες', 'Κολοκυθάκια', 'Πιπεριές', 'Καρπούζι'],
      autumn: ['Μανιτάρια', 'Κολοκύθα', 'Καρότα', 'Μήλα', 'Σταφύλια', 'Σύκα'],
      winter: ['Λάχανο', 'Πράσο', 'Σέλινο', 'Πορτοκάλια', 'Μανταρίνια', 'Κουνουπίδι'],
    };
    return suggestions[season] || [];
  }, []);

  // Allergen warnings analysis
  const allergenAnalysis = useMemo(() => {
    const allergenCounts = new Map<string, number>();
    const allergenRecipes = new Map<string, string[]>();

    recipes.forEach(recipe => {
      if (recipe.allergens && recipe.allergens.length > 0) {
        recipe.allergens.forEach(allergen => {
          allergenCounts.set(allergen, (allergenCounts.get(allergen) || 0) + 1);
          
          if (!allergenRecipes.has(allergen)) {
            allergenRecipes.set(allergen, []);
          }
          allergenRecipes.get(allergen)!.push(language === 'el' ? recipe.name : recipe.name_en);
        });
      }
    });

    // Sort by frequency
    const sorted = Array.from(allergenCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return sorted.map(([allergen, count]) => ({
      allergen,
      count,
      recipes: allergenRecipes.get(allergen) || [],
    }));
  }, [recipes, language]);

  // Cost optimization insights
  const costOptimization = useMemo(() => {
    const insights: string[] = [];

    // Calculate average ingredient cost
    if (ingredientCosts.length > 0) {
      const avgCost = ingredientCosts.reduce((sum, ic) => sum + ic.cost, 0) / ingredientCosts.length;
      const expensiveItems = ingredientCosts
        .filter(ic => ic.cost > avgCost * 1.5)
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 3);

      if (expensiveItems.length > 0) {
        insights.push(`Ακριβά υλικά: ${expensiveItems.map(i => i.name).join(', ')} - Εξέτασε εναλλακτικές ή μικρότερες μερίδες`);
      }

      // Find recipes without ingredients in cost database
      const costIngredientNames = new Set(ingredientCosts.map(ic => ic.name.toLowerCase()));
      const recipesWithoutCosts = recipes.filter(r => {
        if (!r.ingredients || r.ingredients.length === 0) return false;
        return r.ingredients.some(ing => !costIngredientNames.has(ing.name.toLowerCase()));
      });

      if (recipesWithoutCosts.length > 0) {
        insights.push(`${recipesWithoutCosts.length} συνταγές χωρίς πλήρη κοστολόγηση - Πρόσθεσε κόστη υλικών`);
      }
    }

    // Waste-based cost warnings
    const topWaste = wasteLogs
      .reduce((acc, log) => {
        const item = inventory.find(i => i.id === log.inventoryItemId);
        if (!item) return acc;
        
        const existingIndex = acc.findIndex(w => w.itemId === log.inventoryItemId);
        if (existingIndex >= 0) {
          acc[existingIndex].quantity += log.quantity;
        } else {
          acc.push({
            itemId: log.inventoryItemId,
            name: item.name || 'Άγνωστο',
            quantity: log.quantity,
            unit: log.unit,
          });
        }
        return acc;
      }, [] as Array<{ itemId: string; name: string; quantity: number; unit: string }>)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3);

    if (topWaste.length > 0) {
      insights.push(`Top φθορά: ${topWaste.map(w => `${w.name} (${w.quantity.toFixed(1)}${w.unit})`).join(', ')} - Προσάρμοσε παραγγελίες`);
    }

    return insights;
  }, [ingredientCosts, recipes, wasteLogs, inventory]);

  // Sustainability recommendations
  const sustainabilityTips = useMemo(() => {
    const tips: string[] = [];
    const season = getCurrentSeason();

    // Check if recipes use seasonal ingredients
    const seasonalIngredients = seasonalSuggestions.map(s => s.toLowerCase());
    const recipesWithSeasonal = recipes.filter(r => {
      if (!r.ingredients || r.ingredients.length === 0) return false;
      return r.ingredients.some(ing => 
        seasonalIngredients.some(si => ing.name.toLowerCase().includes(si))
      );
    });

    if (recipes.length > 0 && recipesWithSeasonal.length < recipes.length * 0.3) {
      tips.push('Μόνο ' + Math.round((recipesWithSeasonal.length / recipes.length) * 100) + '% των συνταγών χρησιμοποιούν εποχιακά υλικά');
    }

    // Waste reduction tip
    const totalWaste = wasteLogs.reduce((sum, log) => sum + log.quantity, 0);
    if (totalWaste > 0 && wasteLogs.length > 10) {
      tips.push('Μείωσε τη φθορά με καλύτερο portion control και FIFO rotation');
    }

    // Local sourcing
    tips.push('Προτίμησε τοπικούς προμηθευτές για φρέσκα προϊόντα - μειώνει carbon footprint');

    return tips;
  }, [recipes, wasteLogs, seasonalSuggestions]);

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

          const topWasteLines = wasteByItem
            .slice()
            .sort((a, b) => b.totalQty - a.totalQty)
            .slice(0, 7)
            .map(
              (entry) =>
                `- ${entry.name}: ${entry.totalQty.toFixed(2)} ${entry.unit}`
            )
            .join('\n');

          const season = getCurrentSeason();
          const seasonNames = {
            spring: 'Άνοιξη',
            summer: 'Καλοκαίρι',
            autumn: 'Φθινόπωρο',
            winter: 'Χειμώνας',
          };

          const prompt = `
Είσαι σύμβουλος menu engineering & F&B για επαγγελματική κουζίνα.

Σου δίνω μια συνοπτική εικόνα από το σύστημα:

Βασικά στοιχεία:
- Συνολικές συνταγές: ${totalRecipes}
- Συνολικά είδη αποθήκης: ${totalInventoryItems}
- Συνολική ποσότητα φθοράς: ${totalWasteQuantity.toFixed(2)}
- Καταχωρημένα κόστη υλικών: ${ingredientCosts.length}
- Τρέχουσα εποχή: ${seasonNames[season as keyof typeof seasonNames]}

Top φθορά ανά είδος:
${topWasteLines || '— (δεν υπάρχουν δεδομένα φθοράς)'}

Εποχιακά υλικά για ${seasonNames[season as keyof typeof seasonNames]}:
${seasonalSuggestions.join(', ')}

Top αλλεργιογόνα στο μενού:
${allergenAnalysis.length > 0 
  ? allergenAnalysis.map(a => `- ${ALLERGEN_TRANSLATIONS[a.allergen as keyof typeof ALLERGEN_TRANSLATIONS]?.el || a.allergen}: ${a.count} συνταγές`).join('\n')
  : '— (δεν υπάρχουν δεδομένα αλλεργιογόνων)'}

Cost Optimization Insights:
${costOptimization.length > 0 ? costOptimization.map(c => `- ${c}`).join('\n') : '— (καλή κοστολόγηση)'}

Sustainability Tips:
${sustainabilityTips.length > 0 ? sustainabilityTips.map(t => `- ${t}`).join('\n') : '— (καλή βιωσιμότητα)'}

Θέλω στα Ελληνικά, σε 8–12 bullets:

1. Τι σου δείχνει αυτή η εικόνα για την ισορροπία παραγωγής / αποθέματος (overproduction, overstock κ.λπ.).
2. Πώς θα πρότεινες να "σφίξει" το menu (π.χ. μείωση κωδικών, κοινή χρήση ίδιων πρώτων υλών, ειδικά πιάτα ημέρας που καίνε stock).
3. Ποιες συγκεκριμένες εποχιακές συνταγές θα πρότεινες για ${seasonNames[season as keyof typeof seasonNames]} (χρησιμοποιώντας τα εποχιακά υλικά).
4. Πώς να χειριστείς τα αλλεργιογόνα στο μενού (προειδοποιήσεις, εναλλακτικές, cross-contamination).
5. Συγκεκριμένες ενέργειες για βελτίωση food cost (χρησιμοποίησε τα cost insights).
6. Πώς να μειώσεις τη φθορά με βάση τα top waste items.
7. Sustainability actions: local sourcing, seasonal menus, waste reduction.
8. Ποιες 3-5 πολύ συγκεκριμένες ενέργειες για τις επόμενες 2 εβδομάδες (Head Chef & F&B Manager).

Μη γράψεις έκθεση· θέλω πρακτικά bullets, σαν σημειώσεις πριν από meeting για menu engineering.
          `.trim();

            const { callGemini } = await import('../../src/lib/ai/callGemini');
            const result = await callGemini({
              feature: 'menu_generator',
              prompt,
            });

            if (result.error) {
              throw new Error(result.error);
            }

            const text = result.text || 'Δεν λήφθηκε απάντηση από το AI.';
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

  const seasonNames = {
    spring: 'Άνοιξη',
    summer: 'Καλοκαίρι',
    autumn: 'Φθινόπωρο',
    winter: 'Χειμώνας',
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
              Εποχιακότητα • Αλλεργιογόνα • Food Cost • Sustainability
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowInsights(!showInsights)}
            className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100 text-xs font-semibold hover:bg-purple-200 dark:hover:bg-purple-700 transition-colors"
          >
            <Icon name={showInsights ? "eye-off" : "eye"} className="w-4 h-4" />
            {showInsights ? 'Απόκρυψη' : 'Insights'}
          </button>
          <button
            type="button"
            onClick={handleAiMenuEngineering}
            disabled={aiLoading}
            className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-purple-500 text-white text-xs font-semibold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Icon name="message-circle" className="w-4 h-4" />
            {aiLoading ? 'Γίνεται ανάλυση...' : 'AI Ανάλυση'}
          </button>
        </div>
      </div>

      {/* Show Insights Panel */}
      {showInsights && (
        <div className="mb-3 space-y-2">
          {/* Seasonal Suggestions */}
          <div className="bg-green-50/80 dark:bg-green-900/30 rounded-lg p-3 border border-green-200 dark:border-green-700">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="leaf" className="w-4 h-4 text-green-600 dark:text-green-400" />
              <p className="font-semibold text-xs text-green-800 dark:text-green-200">
                Εποχιακά Υλικά ({seasonNames[getCurrentSeason() as keyof typeof seasonNames]})
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {seasonalSuggestions.map(item => (
                <span key={item} className="px-2 py-0.5 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 text-[10px] rounded-full">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Allergen Analysis */}
          {allergenAnalysis.length > 0 && (
            <div className="bg-orange-50/80 dark:bg-orange-900/30 rounded-lg p-3 border border-orange-200 dark:border-orange-700">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="alert-triangle" className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <p className="font-semibold text-xs text-orange-800 dark:text-orange-200">
                  Top Αλλεργιογόνα
                </p>
              </div>
              <div className="space-y-1 text-[11px]">
                {allergenAnalysis.map(({ allergen, count }) => (
                  <div key={allergen} className="flex justify-between items-center">
                    <span className="text-orange-700 dark:text-orange-300">
                      {ALLERGEN_TRANSLATIONS[allergen as keyof typeof ALLERGEN_TRANSLATIONS]?.el || allergen}
                    </span>
                    <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-100 rounded-full font-mono">
                      {count} συνταγές
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cost Optimization */}
          {costOptimization.length > 0 && (
            <div className="bg-blue-50/80 dark:bg-blue-900/30 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="trending-down" className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <p className="font-semibold text-xs text-blue-800 dark:text-blue-200">
                  Cost Optimization
                </p>
              </div>
              <ul className="space-y-1 text-[11px] text-blue-700 dark:text-blue-300">
                {costOptimization.map((insight, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span>•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sustainability */}
          {sustainabilityTips.length > 0 && (
            <div className="bg-teal-50/80 dark:bg-teal-900/30 rounded-lg p-3 border border-teal-200 dark:border-teal-700">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="heart" className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <p className="font-semibold text-xs text-teal-800 dark:text-teal-200">
                  Sustainability
                </p>
              </div>
              <ul className="space-y-1 text-[11px] text-teal-700 dark:text-teal-300">
                {sustainabilityTips.map((tip, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span>•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

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
            Με βάση τις συνταγές, το απόθεμα, τις φθορές & τα κόστη, ο Smart Menu Coach
            μπορεί να σου προτείνει:
            <br />
            • Εποχιακές συνταγές & βιώσιμα υλικά
            <br />
            • Διαχείριση αλλεργιογόνων & cross-contamination
            <br />
            • Cost optimization & μείωση φθοράς
            <br />
            • Συγκεκριμένα επόμενα βήματα για Head Chef & F&amp;B Manager
          </p>
        )}
      </div>
    </div>
  );
};

export default SmartMenuCoach;
