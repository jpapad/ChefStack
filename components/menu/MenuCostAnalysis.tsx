import React, { useMemo } from 'react';
import { Menu, Recipe, IngredientCost } from '../../types';
import { Icon } from '../common/Icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';

interface MenuCostAnalysisProps {
  menu: Menu;
  recipes: Recipe[];
  ingredientCosts: IngredientCost[];
  isOpen: boolean;
  onClose: () => void;
}

interface RecipeCostBreakdown {
  recipe: Recipe;
  totalCost: number;
  costPerServing: number;
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
    cost: number;
  }[];
}

const MenuCostAnalysis: React.FC<MenuCostAnalysisProps> = ({
  menu,
  recipes,
  ingredientCosts,
  isOpen,
  onClose
}) => {
  const analysis = useMemo(() => {
    const recipeBreakdowns: RecipeCostBreakdown[] = [];
    let totalMenuCost = 0;

    // Get all recipe IDs from the menu
    let recipeIds: string[] = [];
    if (menu.type === 'a_la_carte') {
      recipeIds = menu.recipeIds;
    } else {
      // Buffet menu - extract from daily plans
      menu.dailyPlans.forEach(plan => {
        plan.mealPeriods.forEach(period => {
          period.categories.forEach(category => {
            category.recipes.forEach(menuRecipe => {
              recipeIds.push(menuRecipe.recipeId);
            });
          });
        });
      });
    }

    // Calculate costs for each unique recipe
    const uniqueRecipeIds = Array.from(new Set(recipeIds));
    uniqueRecipeIds.forEach(recipeId => {
      const recipe = recipes.find(r => r.id === recipeId);
      if (!recipe) return;

      const ingredientDetails = recipe.ingredients.map(ing => {
        const cost = ingredientCosts.find(c => 
          c.name.toLowerCase() === ing.name.toLowerCase()
        );
        const ingredientCost = cost ? (ing.quantity * cost.cost) : 0;
        
        return {
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          cost: ingredientCost
        };
      });

      const totalCost = ingredientDetails.reduce((sum, ing) => sum + ing.cost, 0);
      const costPerServing = recipe.servings > 0 ? totalCost / recipe.servings : totalCost;

      recipeBreakdowns.push({
        recipe,
        totalCost,
        costPerServing,
        ingredients: ingredientDetails
      });

      totalMenuCost += totalCost;
    });

    // Sort by cost (highest first)
    recipeBreakdowns.sort((a, b) => b.totalCost - a.totalCost);

    const avgCostPerRecipe = recipeBreakdowns.length > 0 
      ? totalMenuCost / recipeBreakdowns.length 
      : 0;

    return {
      recipeBreakdowns,
      totalMenuCost,
      avgCostPerRecipe,
      recipesAnalyzed: recipeBreakdowns.length
    };
  }, [menu, recipes, ingredientCosts]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
          <DialogTitle className="text-2xl font-bold">Ανάλυση Κόστους Μενού</DialogTitle>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {menu.name}
          </DialogDescription>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {analysis.totalMenuCost.toFixed(2)} €
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Συνολικό Κόστος</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {analysis.avgCostPerRecipe.toFixed(2)} €
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Μέσος Όρος/Πιάτο</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {analysis.recipesAnalyzed}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Συνταγές</div>
          </div>
        </div>

        {/* Recipe Breakdown */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-4">
            {analysis.recipeBreakdowns.map((breakdown, idx) => (
              <div key={breakdown.recipe.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-slate-900/50 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-lg">{breakdown.recipe.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {breakdown.recipe.servings} μερίδες
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {breakdown.totalCost.toFixed(2)} €
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {breakdown.costPerServing.toFixed(2)} €/μερίδα
                    </div>
                  </div>
                </div>
                
                {/* Ingredients Breakdown */}
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Ανάλυση Υλικών:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {breakdown.ingredients.map((ing, ingIdx) => (
                      <div key={ingIdx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-900/30 rounded">
                        <div className="flex-1">
                          <span className="text-sm font-medium">{ing.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {ing.quantity} {ing.unit}
                          </span>
                        </div>
                        <span className={`text-sm font-semibold ${
                          ing.cost > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
                        }`}>
                          {ing.cost > 0 ? `${ing.cost.toFixed(2)} €` : 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Cost Breakdown Chart */}
                  <div className="mt-4">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                      {breakdown.ingredients
                        .filter(ing => ing.cost > 0)
                        .sort((a, b) => b.cost - a.cost)
                        .slice(0, 5)
                        .map((ing, idx) => {
                          const percentage = (ing.cost / breakdown.totalCost) * 100;
                          const colors = [
                            'bg-emerald-500',
                            'bg-blue-500',
                            'bg-purple-500',
                            'bg-amber-500',
                            'bg-pink-500'
                          ];
                          return (
                            <div
                              key={idx}
                              className={colors[idx % colors.length]}
                              style={{ width: `${percentage}%` }}
                              title={`${ing.name}: ${percentage.toFixed(1)}%`}
                            />
                          );
                        })}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {breakdown.ingredients
                        .filter(ing => ing.cost > 0)
                        .sort((a, b) => b.cost - a.cost)
                        .slice(0, 5)
                        .map((ing, idx) => {
                          const percentage = (ing.cost / breakdown.totalCost) * 100;
                          return (
                            <span key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                              {ing.name}: {percentage.toFixed(1)}%
                            </span>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {analysis.recipeBreakdowns.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Icon name="info" className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Δεν υπάρχουν διαθέσιμα στοιχεία κόστους για τις συνταγές αυτού του μενού</p>
            </div>
          )}
        </div>

        {/* Footer with Tips */}
        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Icon name="lightbulb" className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Συμβουλή:</strong> Για καλύτερη κερδοφορία, στόχευσε σε food cost 25-35% της τιμής πώλησης. 
              Τα πιάτα με υψηλότερο κόστος μπορεί να χρειάζονται ανατιμολόγηση ή βελτιστοποίηση υλικών.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MenuCostAnalysis;
