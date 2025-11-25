import React, { useMemo, useState } from 'react';
import { InventoryItem, Menu, Recipe, WasteLog } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

interface InventoryForecastProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  menus: Menu[];
  recipes: Recipe[];
  wasteLogs: WasteLog[];
  forecastDays?: number;
}

interface ForecastItem {
  inventoryItemId: string;
  itemName: string;
  currentStock: number;
  unit: string;
  projectedUsage: number;
  averageDailyWaste: number;
  projectedEndStock: number;
  daysUntilStockout: number | null;
  reorderPoint: number;
  status: 'ok' | 'warning' | 'critical';
  usedInMenus: string[];
}

const InventoryForecast: React.FC<InventoryForecastProps> = ({
  isOpen,
  onClose,
  inventory,
  menus,
  recipes,
  wasteLogs,
  forecastDays = 7
}) => {
  const { t } = useTranslation();
  const [selectedDays, setSelectedDays] = useState(forecastDays);

  const forecast = useMemo(() => {
    const forecastItems: ForecastItem[] = [];
    
    // Calculate average daily waste per ingredient
    const wasteByIngredient = new Map<string, number[]>();
    wasteLogs.forEach(log => {
      if (!log.itemName) return; // Skip if itemName is undefined
      const key = log.itemName.toLowerCase();
      if (!wasteByIngredient.has(key)) {
        wasteByIngredient.set(key, []);
      }
      wasteByIngredient.get(key)!.push(log.quantity);
    });

    const avgWasteByIngredient = new Map<string, number>();
    wasteByIngredient.forEach((quantities, key) => {
      const avg = quantities.reduce((sum, q) => sum + q, 0) / Math.max(quantities.length, 1);
      avgWasteByIngredient.set(key, avg);
    });

    // Calculate projected usage from menus
    const ingredientUsage = new Map<string, { quantity: number; menus: string[] }>();
    
    menus.forEach(menu => {
      let recipeIds: string[] = [];
      
      if (menu.type === 'a_la_carte') {
        recipeIds = menu.recipeIds;
      } else {
        // Buffet menu
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

      recipeIds.forEach(recipeId => {
        const recipe = recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        recipe.ingredients.forEach(ing => {
          const key = ing.name.toLowerCase();
          const existing = ingredientUsage.get(key);
          
          if (existing) {
            existing.quantity += ing.quantity;
            if (!existing.menus.includes(menu.name)) {
              existing.menus.push(menu.name);
            }
          } else {
            ingredientUsage.set(key, {
              quantity: ing.quantity,
              menus: [menu.name]
            });
          }
        });
      });
    });

    // Build forecast for each inventory item
    inventory.forEach(item => {
      if (!item.name || item.totalQuantity === undefined) return; // Skip invalid items
      
      const key = item.name.toLowerCase();
      const usage = ingredientUsage.get(key);
      const avgWaste = avgWasteByIngredient.get(key) || 0;
      
      const projectedUsage = usage ? usage.quantity : 0;
      const totalProjectedDepletion = (projectedUsage + avgWaste * selectedDays);
      const projectedEndStock = Math.max(0, item.totalQuantity - totalProjectedDepletion);
      
      // Calculate days until stockout
      let daysUntilStockout: number | null = null;
      if (projectedUsage + avgWaste > 0) {
        const dailyDepletion = (projectedUsage + avgWaste * selectedDays) / selectedDays;
        daysUntilStockout = Math.floor(item.totalQuantity / dailyDepletion);
        if (daysUntilStockout < 0) daysUntilStockout = 0;
      }

      // Determine status
      let status: 'ok' | 'warning' | 'critical' = 'ok';
      if (daysUntilStockout !== null) {
        if (daysUntilStockout <= 2) {
          status = 'critical';
        } else if (daysUntilStockout <= selectedDays / 2) {
          status = 'warning';
        }
      } else if (projectedEndStock < (item.reorderPoint || 0)) {
        status = 'warning';
      }

      forecastItems.push({
        inventoryItemId: item.id,
        itemName: item.name,
        currentStock: item.totalQuantity || 0,
        unit: item.unit || '',
        projectedUsage,
        averageDailyWaste: avgWaste,
        projectedEndStock,
        daysUntilStockout,
        reorderPoint: item.reorderPoint || 0,
        status,
        usedInMenus: usage?.menus || []
      });
    });

    // Sort by status priority
    return forecastItems.sort((a, b) => {
      const statusPriority = { critical: 0, warning: 1, ok: 2 };
      return statusPriority[a.status] - statusPriority[b.status];
    });
  }, [inventory, menus, recipes, wasteLogs, selectedDays]);

  const criticalCount = forecast.filter(f => f.status === 'critical').length;
  const warningCount = forecast.filter(f => f.status === 'warning').length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh]">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white -m-6 p-6 mb-4 rounded-t-lg">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <Icon name="trending-up" className="w-8 h-8" />
              <DialogTitle className="text-white text-2xl">Πρόβλεψη Αποθέματος</DialogTitle>
            </div>
            <DialogDescription className="text-white/90">
              Προβλέποντας την κατανάλωση για τις επόμενες {selectedDays} ημέρες
            </DialogDescription>
          </DialogHeader>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-white/80 text-sm mb-1">Κρίσιμα</div>
              <div className="text-3xl font-bold text-red-300">{criticalCount}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-white/80 text-sm mb-1">Προσοχή</div>
              <div className="text-3xl font-bold text-yellow-300">{warningCount}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-white/80 text-sm mb-1">Σύνολο Ειδών</div>
              <div className="text-3xl font-bold">{forecast.length}</div>
            </div>
          </div>
        </div>

        {/* Forecast Days Selector */}
        <div className="p-4 border-b">
          <Label className="mb-2">Περίοδος Πρόβλεψης:</Label>
          <div className="flex gap-2 mt-2">
            {[3, 7, 14, 30].map(days => (
              <Button
                key={days}
                variant={selectedDays === days ? 'default' : 'outline'}
                onClick={() => setSelectedDays(days)}
                className={selectedDays === days ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                {days} ημέρες
              </Button>
            ))}
          </div>
        </div>

        {/* Forecast List */}
        <div className="flex-1 overflow-auto p-6">
          {forecast.length === 0 ? (
            <div className="text-center py-12 text-light-text-secondary dark:text-dark-text-secondary">
              <Icon name="inbox" className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Δεν υπάρχουν δεδομένα για πρόβλεψη</p>
            </div>
          ) : (
            <div className="space-y-3">
              {forecast.map(item => (
                <div
                  key={item.inventoryItemId}
                  className={`border-l-4 rounded-lg p-4 transition-all ${
                    item.status === 'critical'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : item.status === 'warning'
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-green-500 bg-white dark:bg-dark-card'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{item.itemName}</h3>
                      {item.usedInMenus.length > 0 && (
                        <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          Χρησιμοποιείται σε: {item.usedInMenus.join(', ')}
                        </div>
                      )}
                    </div>
                    {item.daysUntilStockout !== null && (
                      <div className={`text-right ${
                        item.status === 'critical' ? 'text-red-600 dark:text-red-400' : 
                        item.status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 
                        'text-green-600 dark:text-green-400'
                      }`}>
                        <div className="text-2xl font-bold">{item.daysUntilStockout}</div>
                        <div className="text-xs">ημέρες</div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                    <div>
                      <div className="text-light-text-secondary dark:text-dark-text-secondary mb-1">
                        Τρέχον Απόθεμα
                      </div>
                      <div className="font-semibold">
                        {(item.currentStock || 0).toFixed(2)} {item.unit}
                      </div>
                    </div>
                    <div>
                      <div className="text-light-text-secondary dark:text-dark-text-secondary mb-1">
                        Προβλ. Χρήση
                      </div>
                      <div className="font-semibold">
                        {(item.projectedUsage || 0).toFixed(2)} {item.unit}
                      </div>
                    </div>
                    <div>
                      <div className="text-light-text-secondary dark:text-dark-text-secondary mb-1">
                        Μέση Απώλεια/Ημέρα
                      </div>
                      <div className="font-semibold">
                        {(item.averageDailyWaste || 0).toFixed(2)} {item.unit}
                      </div>
                    </div>
                    <div>
                      <div className="text-light-text-secondary dark:text-dark-text-secondary mb-1">
                        Προβλ. Τελικό Απόθεμα
                      </div>
                      <div className={`font-semibold ${
                        (item.projectedEndStock || 0) < (item.reorderPoint || 0)
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {(item.projectedEndStock || 0).toFixed(2)} {item.unit}
                      </div>
                    </div>
                    <div>
                      <div className="text-light-text-secondary dark:text-dark-text-secondary mb-1">
                        Σημείο Παραγγελίας
                      </div>
                      <div className="font-semibold">
                        {(item.reorderPoint || 0).toFixed(2)} {item.unit}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="h-2 bg-light-bg dark:bg-dark-bg rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          item.status === 'critical'
                            ? 'bg-red-500'
                            : item.status === 'warning'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.max(0, Math.min(100, ((item.projectedEndStock || 0) / (item.currentStock || 1)) * 100))}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Κρίσιμο (≤2 ημέρες)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Προσοχή</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Εντάξει</span>
            </div>
          </div>
          <Button variant="outline" onClick={onClose}>
            Κλείσιμο
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryForecast;
