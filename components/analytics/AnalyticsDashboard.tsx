import React, { useMemo, useState } from 'react';
import { Recipe, WasteLog, InventoryItem, IngredientCost, Menu } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

interface AnalyticsDashboardProps {
  recipes: Recipe[];
  wasteLogs: WasteLog[];
  inventory: InventoryItem[];
  ingredientCosts: IngredientCost[];
  menus: Menu[];
}

type TimeRange = '7d' | '30d' | '90d' | 'all';
type ChartType = 'food-cost' | 'waste-trends' | 'popular-recipes' | 'inventory-value';

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  recipes,
  wasteLogs,
  inventory,
  ingredientCosts,
  menus
}) => {
  const { t, language } = useTranslation();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedChart, setSelectedChart] = useState<ChartType>('food-cost');

  // Calculate date range
  const dateRange = useMemo(() => {
    const now = new Date();
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysAgo);
    return { startDate, endDate: now };
  }, [timeRange]);

  // Food Cost Analysis
  const foodCostAnalysis = useMemo(() => {
    let totalRecipeCost = 0;
    let totalRecipes = 0;

    recipes.forEach(recipe => {
      let recipeCost = 0;
      recipe.ingredients.forEach(ing => {
        const cost = ingredientCosts.find(c => 
          c.name.toLowerCase() === ing.name.toLowerCase()
        );
        if (cost) {
          recipeCost += ing.quantity * cost.cost;
        }
      });
      totalRecipeCost += recipeCost;
      totalRecipes++;
    });

    const averageCostPerRecipe = totalRecipes > 0 ? totalRecipeCost / totalRecipes : 0;
    const targetFoodCostPercentage = 30; // Industry standard 25-35%

    return {
      totalRecipeCost,
      averageCostPerRecipe,
      totalRecipes,
      targetFoodCostPercentage
    };
  }, [recipes, ingredientCosts]);

  // Waste Trends Analysis
  const wasteTrends = useMemo(() => {
    const filteredWaste = wasteLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= dateRange.startDate && logDate <= dateRange.endDate;
    });

    const totalWasteQuantity = filteredWaste.reduce((sum, log) => sum + (log.quantity || 0), 0);
    const totalWasteCost = filteredWaste.reduce((sum, log) => {
      const cost = ingredientCosts.find(c => 
        c.name.toLowerCase() === (log.itemName || '').toLowerCase()
      );
      return sum + (log.quantity || 0) * (cost?.cost || 0);
    }, 0);

    // Group by reason
    const wasteByReason = new Map<string, { count: number; quantity: number; cost: number }>();
    filteredWaste.forEach(log => {
      const reason = log.reason || 'Άλλο';
      const existing = wasteByReason.get(reason) || { count: 0, quantity: 0, cost: 0 };
      const cost = ingredientCosts.find(c => 
        c.name.toLowerCase() === (log.itemName || '').toLowerCase()
      );
      wasteByReason.set(reason, {
        count: existing.count + 1,
        quantity: existing.quantity + (log.quantity || 0),
        cost: existing.cost + (log.quantity || 0) * (cost?.cost || 0)
      });
    });

    const wasteReasons = Array.from(wasteByReason.entries())
      .map(([reason, data]) => ({ reason, ...data }))
      .sort((a, b) => b.cost - a.cost);

    return {
      totalWasteQuantity,
      totalWasteCost,
      wasteCount: filteredWaste.length,
      wasteReasons,
      averageWastePerDay: filteredWaste.length > 0 
        ? totalWasteQuantity / Math.max(1, (dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0
    };
  }, [wasteLogs, ingredientCosts, dateRange]);

  // Popular Recipes Analysis
  const popularRecipes = useMemo(() => {
    // Count recipe usage in menus
    const recipeUsage = new Map<string, number>();
    
    menus.forEach(menu => {
      if (menu.type === 'a_la_carte') {
        menu.recipeIds.forEach(id => {
          recipeUsage.set(id, (recipeUsage.get(id) || 0) + 1);
        });
      } else {
        menu.dailyPlans.forEach(plan => {
          plan.mealPeriods.forEach(period => {
            period.categories.forEach(category => {
              category.recipes.forEach(menuRecipe => {
                recipeUsage.set(menuRecipe.recipeId, (recipeUsage.get(menuRecipe.recipeId) || 0) + 1);
              });
            });
          });
        });
      }
    });

    const topRecipes = Array.from(recipeUsage.entries())
      .map(([recipeId, usageCount]) => {
        const recipe = recipes.find(r => r.id === recipeId);
        return recipe ? { recipe, usageCount } : null;
      })
      .filter((item): item is { recipe: Recipe; usageCount: number } => item !== null)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10);

    return topRecipes;
  }, [recipes, menus]);

  // Inventory Value Analysis
  const inventoryValue = useMemo(() => {
    let totalValue = 0;
    const categoryValues = new Map<string, number>();

    inventory.forEach(item => {
      const cost = ingredientCosts.find(c => 
        c.name.toLowerCase() === item.name.toLowerCase()
      );
      const itemValue = (item.totalQuantity || 0) * (cost?.cost || 0);
      totalValue += itemValue;

      const category = item.category || 'Άλλο';
      categoryValues.set(category, (categoryValues.get(category) || 0) + itemValue);
    });

    const valueByCategory = Array.from(categoryValues.entries())
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value);

    return {
      totalValue,
      valueByCategory,
      itemCount: inventory.length
    };
  }, [inventory, ingredientCosts]);

  const renderFoodCostChart = () => (
    <div className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Icon name="trending-up" className="w-6 h-6 text-green-600" />
        Ανάλυση Κόστους Τροφίμων
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg">
          <div className="text-sm text-green-700 dark:text-green-300 mb-1">Σύνολο Κόστους</div>
          <div className="text-2xl font-bold text-green-800 dark:text-green-200">
            €{foodCostAnalysis.totalRecipeCost.toFixed(2)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg">
          <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">Μέσο Κόστος/Συνταγή</div>
          <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
            €{foodCostAnalysis.averageCostPerRecipe.toFixed(2)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg">
          <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">Στόχος Food Cost %</div>
          <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
            {foodCostAnalysis.targetFoodCostPercentage}%
          </div>
        </div>
      </div>

      <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
        <p className="mb-2">
          💡 <strong>Tip:</strong> Ο ιδανικός δείκτης food cost για εστιατόρια είναι 25-35%. 
          Παρακολουθήστε το κόστος των συνταγών σας και προσαρμόστε τις τιμές ανάλογα.
        </p>
      </div>
    </div>
  );

  const renderWasteTrendsChart = () => (
    <div className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Icon name="trash-2" className="w-6 h-6 text-red-600" />
        Τάσεις Απωλειών
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-4 rounded-lg">
          <div className="text-sm text-red-700 dark:text-red-300 mb-1">Συνολικό Κόστος</div>
          <div className="text-2xl font-bold text-red-800 dark:text-red-200">
            €{wasteTrends.totalWasteCost.toFixed(2)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-4 rounded-lg">
          <div className="text-sm text-orange-700 dark:text-orange-300 mb-1">Συνολική Ποσότητα</div>
          <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
            {wasteTrends.totalWasteQuantity.toFixed(1)} kg
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-4 rounded-lg">
          <div className="text-sm text-amber-700 dark:text-amber-300 mb-1">Συμβάντα</div>
          <div className="text-2xl font-bold text-amber-800 dark:text-amber-200">
            {wasteTrends.wasteCount}
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-lime-50 dark:from-yellow-900/20 dark:to-lime-900/20 p-4 rounded-lg">
          <div className="text-sm text-yellow-700 dark:text-yellow-300 mb-1">Μέσος Όρος/Ημέρα</div>
          <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
            {wasteTrends.averageWastePerDay.toFixed(1)} kg
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-light-text-secondary dark:text-dark-text-secondary">
          Κατανομή ανά Αιτία:
        </h4>
        {wasteTrends.wasteReasons.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{item.reason}</span>
                <span className="text-sm font-bold text-red-600 dark:text-red-400">
                  €{item.cost.toFixed(2)}
                </span>
              </div>
              <div className="h-2 bg-light-bg dark:bg-dark-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                  style={{
                    width: `${(item.cost / Math.max(1, wasteTrends.totalWasteCost)) * 100}%`
                  }}
                />
              </div>
              <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                {item.count} συμβάντα • {item.quantity.toFixed(1)} kg
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPopularRecipesChart = () => (
    <div className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Icon name="star" className="w-6 h-6 text-yellow-600" />
        Top 10 Δημοφιλείς Συνταγές
      </h3>

      {popularRecipes.length === 0 ? (
        <p className="text-center text-light-text-secondary dark:text-dark-text-secondary py-8">
          Δεν υπάρχουν δεδομένα χρήσης συνταγών
        </p>
      ) : (
        <div className="space-y-3">
          {popularRecipes.map((item, idx) => (
            <div key={item.recipe.id} className="flex items-center gap-3 group hover:bg-light-bg dark:hover:bg-dark-bg p-2 rounded-lg transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                idx === 0 ? 'bg-yellow-500 text-white' :
                idx === 1 ? 'bg-gray-400 text-white' :
                idx === 2 ? 'bg-orange-600 text-white' :
                'bg-light-bg dark:bg-dark-bg text-light-text-secondary dark:text-dark-text-secondary'
              }`}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {language === 'el' ? item.recipe.name : item.recipe.name_en}
                </div>
                <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  {item.recipe.category}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-bold text-brand-yellow">
                  {item.usageCount}
                </div>
                <Icon name="menu" className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderInventoryValueChart = () => (
    <div className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Icon name="package" className="w-6 h-6 text-blue-600" />
        Αξία Αποθέματος
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg">
          <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">Συνολική Αξία</div>
          <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
            €{inventoryValue.totalValue.toFixed(2)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-lg">
          <div className="text-sm text-indigo-700 dark:text-indigo-300 mb-1">Σύνολο Ειδών</div>
          <div className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">
            {inventoryValue.itemCount}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-light-text-secondary dark:text-dark-text-secondary">
          Κατανομή ανά Κατηγορία:
        </h4>
        {inventoryValue.valueByCategory.slice(0, 8).map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{item.category}</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  €{item.value.toFixed(2)}
                </span>
              </div>
              <div className="h-2 bg-light-bg dark:bg-dark-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  style={{
                    width: `${(item.value / Math.max(1, inventoryValue.totalValue)) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-auto p-6 bg-gradient-to-br from-light-bg to-white dark:from-dark-bg dark:to-slate-900">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2 bg-gradient-to-r from-brand-yellow to-orange-500 bg-clip-text text-transparent">
          Analytics & Reporting
        </h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary">
          Αναλυτικά στοιχεία και αναφορές για την επιχείρησή σας
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {(['7d', '30d', '90d', 'all'] as TimeRange[]).map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeRange === range
                ? 'bg-brand-yellow text-white shadow-lg'
                : 'bg-white dark:bg-dark-card border border-light-border dark:border-dark-border hover:border-brand-yellow'
            }`}
          >
            {range === '7d' ? '7 Ημέρες' : range === '30d' ? '30 Ημέρες' : range === '90d' ? '90 Ημέρες' : 'Όλα'}
          </button>
        ))}
      </div>

      {/* Chart Selector */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { id: 'food-cost', icon: 'trending-up', label: 'Food Cost', color: 'green' },
          { id: 'waste-trends', icon: 'trash-2', label: 'Απώλειες', color: 'red' },
          { id: 'popular-recipes', icon: 'star', label: 'Δημοφιλείς', color: 'yellow' },
          { id: 'inventory-value', icon: 'package', label: 'Απόθεμα', color: 'blue' }
        ].map(chart => (
          <button
            key={chart.id}
            onClick={() => setSelectedChart(chart.id as ChartType)}
            className={`p-4 rounded-xl font-medium transition-all flex items-center gap-3 ${
              selectedChart === chart.id
                ? `bg-${chart.color}-600 text-white shadow-lg scale-105`
                : 'bg-white dark:bg-dark-card border border-light-border dark:border-dark-border hover:shadow-lg'
            }`}
          >
            <Icon name={chart.icon} className="w-5 h-5" />
            <span className="hidden sm:inline">{chart.label}</span>
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {selectedChart === 'food-cost' && renderFoodCostChart()}
        {selectedChart === 'waste-trends' && renderWasteTrendsChart()}
        {selectedChart === 'popular-recipes' && renderPopularRecipesChart()}
        {selectedChart === 'inventory-value' && renderInventoryValueChart()}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
