import React, { useMemo } from 'react';
import { Menu, Recipe } from '../../types';
import { Icon } from '../common/Icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';

interface AutoShoppingListProps {
  menu: Menu;
  recipes: Recipe[];
  servingsMultiplier?: number;
  isOpen: boolean;
  onClose: () => void;
}

interface ShoppingItem {
  name: string;
  totalQuantity: number;
  unit: string;
  usedInRecipes: string[];
}

const AutoShoppingList: React.FC<AutoShoppingListProps> = ({
  menu,
  recipes,
  servingsMultiplier = 1,
  isOpen,
  onClose
}) => {
  const shoppingList = useMemo(() => {
    const itemsMap = new Map<string, ShoppingItem>();

    const processRecipe = (recipe: Recipe, multiplier: number = 1) => {
      recipe.ingredients.forEach(ing => {
        const key = `${ing.name.toLowerCase()}_${ing.unit}`;
        const existing = itemsMap.get(key);
        
        if (existing) {
          existing.totalQuantity += ing.quantity * multiplier;
          if (!existing.usedInRecipes.includes(recipe.name)) {
            existing.usedInRecipes.push(recipe.name);
          }
        } else {
          itemsMap.set(key, {
            name: ing.name,
            totalQuantity: ing.quantity * multiplier,
            unit: ing.unit,
            usedInRecipes: [recipe.name]
          });
        }
      });
    };

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

    // Process each recipe
    recipeIds.forEach(recipeId => {
      const recipe = recipes.find(r => r.id === recipeId);
      if (recipe) {
        processRecipe(recipe, servingsMultiplier);
      }
    });

    return Array.from(itemsMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name, 'el')
    );
  }, [menu, recipes, servingsMultiplier]);

  const handleExport = () => {
    let text = `ΛΙΣΤΑ ΑΓΟΡΩΝ - ${menu.name}\n`;
    text += `Ημερομηνία: ${new Date().toLocaleDateString('el-GR')}\n`;
    text += `Πολλαπλασιαστής Μερίδων: ${servingsMultiplier}x\n`;
    text += `${'─'.repeat(60)}\n\n`;

    shoppingList.forEach((item, idx) => {
      text += `${idx + 1}. ${item.name}\n`;
      text += `   Ποσότητα: ${item.totalQuantity.toFixed(2)} ${item.unit}\n`;
      text += `   Χρησιμοποιείται σε: ${item.usedInRecipes.join(', ')}\n\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      alert('Η λίστα αγορών αντιγράφηκε στο clipboard!');
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyToClipboard = () => {
    handleExport();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] print:shadow-none print:max-w-full">
        <DialogHeader className="print:border-black">
          <DialogTitle>Αυτόματη Λίστα Αγορών</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">{menu.name}</p>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[75vh] py-4">
          <div className="flex gap-2 mb-4 print:hidden">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Icon name="printer" className="w-4 h-4" />
              Εκτύπωση
            </Button>
            <Button variant="outline" onClick={handleCopyToClipboard} className="gap-2">
              <Icon name="copy" className="w-4 h-4" />
              Αντιγραφή
            </Button>
          </div>

        {/* Info Bar */}
        <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-3 border-b border-blue-200 dark:border-blue-800 print:bg-gray-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-blue-900 dark:text-blue-100">
                Συνολικά Υλικά: {shoppingList.length}
              </span>
              <span className="text-blue-700 dark:text-blue-300">
                Ημερομηνία: {new Date().toLocaleDateString('el-GR')}
              </span>
            </div>
            <span className="font-semibold text-blue-900 dark:text-blue-100">
              Πολλαπλασιαστής: {servingsMultiplier}x
            </span>
          </div>
        </div>

        {/* Shopping List */}
        <div className="flex-1 overflow-auto p-6">
          {shoppingList.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Icon name="shopping-cart" className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Δεν βρέθηκαν υλικά για αυτό το μενού</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {shoppingList.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow print:break-inside-avoid print:shadow-none"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold text-sm flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                          {item.totalQuantity.toFixed(2)} {item.unit}
                        </div>
                      </div>
                    </div>
                    <label className="flex items-center justify-center w-6 h-6 border-2 border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:border-emerald-500 print:border-black">
                      <input type="checkbox" className="hidden print:inline" />
                    </label>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Χρησιμοποιείται σε:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.usedInRecipes.map((recipeName, rIdx) => (
                        <span
                          key={rIdx}
                          className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                        >
                          {recipeName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-gray-700 print:hidden">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Icon name="info" className="w-4 h-4" />
            <span>
              💡 Οι ποσότητες υπολογίζονται αυτόματα από τις συνταγές του μενού. 
              Προσαρμόστε ανάλογα με τις ανάγκες σας.
            </span>
          </div>
        </div>
      </div>

      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print\\:hidden {
              display: none !important;
            }
            .fixed {
              position: relative !important;
            }
            .bg-black\\/50 {
              background: white !important;
            }
          }
        `}
      </style>
      </DialogContent>
    </Dialog>
  );
};

export default AutoShoppingList;
