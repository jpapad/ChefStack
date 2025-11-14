import React, { useState, useMemo } from 'react';
import { Menu, Recipe, InventoryItem, Supplier, ShoppingListItem, PurchaseUnit } from '../../types';
import { Icon } from '../common/Icon';

interface ShoppingListViewProps {
  menus: Menu[];
  recipes: Recipe[]; // All recipes available
  inventory: InventoryItem[];
  suppliers: Supplier[];
}

const ShoppingListView: React.FC<ShoppingListViewProps> = ({ menus, recipes, inventory, suppliers }) => {
  const [selectedMenuIds, setSelectedMenuIds] = useState<string[]>([]);

  const shoppingList = useMemo((): ShoppingListItem[] => {
    if (selectedMenuIds.length === 0) return [];
    
    const requiredIngredients: Record<string, { required: number, unit: PurchaseUnit, supplierName?: string }> = {};

    selectedMenuIds.forEach(menuId => {
        const menu = menus.find(m => m.id === menuId);
        if (!menu) return;

        let recipeStubs: { recipeId: string; quantity: number }[] = [];
        if (menu.type === 'a_la_carte') {
            // Assume 1 serving of each for a la carte for planning
            recipeStubs = menu.recipeIds.map(id => ({ recipeId: id, quantity: 1 }));
        } else { // buffet
            menu.dailyPlans.forEach(plan => {
                plan.mealPeriods.forEach(period => {
                    period.categories.forEach(cat => {
                         recipeStubs.push(...cat.recipes);
                    });
                });
            });
        }
        
        recipeStubs.forEach(stub => {
            const recipe = recipes.find(r => r.id === stub.recipeId);
            if (!recipe) return;

            const scalingFactor = stub.quantity / recipe.servings;
            recipe.ingredients.forEach(ing => {
                // This is a simplified conversion. A real app needs a robust unit conversion library.
                let purchaseUnit: PurchaseUnit = 'kg';
                if (['ml', 'L'].includes(ing.unit)) purchaseUnit = 'L';
                if (ing.unit === 'τεμ') purchaseUnit = 'τεμ';
                
                let quantityInPurchaseUnit = ing.quantity * scalingFactor;
                if (ing.unit === 'g' && purchaseUnit === 'kg') quantityInPurchaseUnit /= 1000;
                if (ing.unit === 'ml' && purchaseUnit === 'L') quantityInPurchaseUnit /= 1000;
                
                if (!requiredIngredients[ing.name]) {
                    requiredIngredients[ing.name] = { required: 0, unit: purchaseUnit };
                }
                requiredIngredients[ing.name].required += quantityInPurchaseUnit;
            });
        });
    });

    return Object.entries(requiredIngredients).map(([name, data]) => {
        const stockItem = inventory.find(i => i.name === name);
        const stock = stockItem ? stockItem.locations.reduce((sum, loc) => sum + loc.quantity, 0) : 0;
        const supplier = suppliers.find(s => s.id === stockItem?.supplierId);
        return {
            name,
            ...data,
            stock,
            toBuy: Math.max(0, data.required - stock),
            supplierName: supplier?.name,
        };
    }).sort((a,b) => a.name.localeCompare(b.name));

  }, [selectedMenuIds, menus, recipes, inventory, suppliers]);

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl h-full flex flex-col">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200/80 dark:border-gray-700/80 flex-wrap gap-2">
            <h2 className="text-3xl font-extrabold font-heading">Λίστα Αγορών</h2>
            <button onClick={() => window.print()} disabled={shoppingList.length === 0} className="flex items-center gap-2 bg-brand-dark text-white px-4 py-2 rounded-full hover:opacity-90 disabled:opacity-50">
                <Icon name="printer" className="w-5 h-5" />
                <span className="font-semibold text-sm">Εκτύπωση</span>
            </button>
        </div>

        <div className="mb-4">
            <label className="font-semibold mb-2 block">Επιλογή Μενού για Δημιουργία Λίστας:</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {menus.map(menu => (
                    <label key={menu.id} className={`p-3 rounded-lg cursor-pointer ${selectedMenuIds.includes(menu.id) ? 'bg-brand-yellow text-brand-dark' : 'bg-black/5 dark:bg-white/10'}`}>
                        <input type="checkbox" checked={selectedMenuIds.includes(menu.id)} onChange={() => setSelectedMenuIds(prev => prev.includes(menu.id) ? prev.filter(id => id !== menu.id) : [...prev, menu.id])} className="hidden" />
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
                    </tr>
                </thead>
                <tbody>
                    {shoppingList.map(item => (
                        <tr key={item.name} className={`border-b border-black/5 dark:border-white/5 ${item.toBuy <= 0 ? 'text-gray-400' : 'font-semibold'}`}>
                            <td className="p-2">{item.name}</td>
                            <td className="p-2 text-right">{item.required.toFixed(2)} {item.unit}</td>
                            <td className="p-2 text-right">{item.stock.toFixed(2)} {item.unit}</td>
                            <td className="p-2 text-right font-bold">{item.toBuy.toFixed(2)} {item.unit}</td>
                            <td className="p-2">{item.supplierName || '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {shoppingList.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    <p>Επιλέξτε ένα ή περισσότερα μενού για να δημιουργηθεί η λίστα αγορών.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default ShoppingListView;