import React, { useState, useMemo } from 'react';
// Fix: Corrected MealPeriodName and MEAL_PERIOD_NAMES imports to their Key-based counterparts.
import { Menu, DailyPlan, MealPeriod, MealPeriodNameKey, BuffetCategory, MenuRecipe, Recipe, MEAL_PERIOD_NAME_KEYS } from '../../types';
import { Icon } from '../common/Icon';

interface BuffetPlanEditorProps {
  menu: Extract<Menu, { type: 'buffet' }>;
  selectedDate: Date;
  recipes: Recipe[];
  onUpdateMenu: (updatedMenuData: Partial<Extract<Menu, { type: 'buffet' }>>) => void;
  canManage: boolean;
}

const BuffetPlanEditor: React.FC<BuffetPlanEditorProps> = ({ menu, selectedDate, recipes, onUpdateMenu, canManage }) => {
  const [newCategoryNames, setNewCategoryNames] = useState<Record<string, string>>({});
  const [recipeToAdd, setRecipeToAdd] = useState<Record<string, string>>({});

  const selectedDateStr = useMemo(() => selectedDate.toISOString().split('T')[0], [selectedDate]);

  const dailyPlan = useMemo(() => 
    menu.dailyPlans.find(p => p.date === selectedDateStr),
    [menu.dailyPlans, selectedDateStr]
  );
  
  const getClonedPlans = () => JSON.parse(JSON.stringify(menu.dailyPlans)) as DailyPlan[];
  
  const updateDailyPlans = (newPlans: DailyPlan[]) => {
    onUpdateMenu({ dailyPlans: newPlans });
  };

  const handleCreatePlan = () => {
    const newPlans = getClonedPlans();
    newPlans.push({
      date: selectedDateStr,
      mealPeriods: [],
    });
    updateDailyPlans(newPlans);
  };
  
  const handleAddMealPeriod = (periodName: MealPeriodNameKey) => {
    const newPlans = getClonedPlans();
    let plan = newPlans.find(p => p.date === selectedDateStr);
    if (plan && !plan.mealPeriods.some(p => p.name === periodName)) {
      plan.mealPeriods.push({
        id: `mp${Date.now()}`,
        name: periodName,
        categories: []
      });
      // Sort meal periods according to the predefined order
      // Fix: Changed sort to use MEAL_PERIOD_NAME_KEYS array.
      plan.mealPeriods.sort((a, b) => MEAL_PERIOD_NAME_KEYS.indexOf(a.name) - MEAL_PERIOD_NAME_KEYS.indexOf(b.name));
      updateDailyPlans(newPlans);
    }
  };
  
  const handleAddCategory = (periodId: string) => {
    const categoryName = newCategoryNames[periodId]?.trim();
    if (!categoryName) return;

    const newPlans = getClonedPlans();
    const plan = newPlans.find(p => p.date === selectedDateStr);
    const period = plan?.mealPeriods.find(p => p.id === periodId);

    if (period) {
        period.categories.push({
            id: `cat${Date.now()}`,
            name: categoryName,
            recipes: [],
        });
        updateDailyPlans(newPlans);
        setNewCategoryNames(prev => ({ ...prev, [periodId]: '' }));
    }
  };

  const handleRemoveCategory = (periodId: string, categoryId: string) => {
     const newPlans = getClonedPlans();
     const plan = newPlans.find(p => p.date === selectedDateStr);
     const period = plan?.mealPeriods.find(p => p.id === periodId);
     if (period) {
        period.categories = period.categories.filter(c => c.id !== categoryId);
        updateDailyPlans(newPlans);
     }
  };

  const handleAddRecipe = (periodId: string, categoryId: string) => {
    const recipeIdToAdd = recipeToAdd[categoryId];
    if (!recipeIdToAdd) return;

    const newPlans = getClonedPlans();
    const plan = newPlans.find(p => p.date === selectedDateStr);
    const period = plan?.mealPeriods.find(p => p.id === periodId);
    const category = period?.categories.find(c => c.id === categoryId);

    if (category && !category.recipes.some(r => r.recipeId === recipeIdToAdd)) {
        category.recipes.push({ recipeId: recipeIdToAdd, quantity: menu.pax });
        updateDailyPlans(newPlans);
        setRecipeToAdd(prev => ({...prev, [categoryId]: ''}));
    }
  };

   const handleRemoveRecipe = (periodId: string, categoryId: string, recipeId: string) => {
      const newPlans = getClonedPlans();
      const plan = newPlans.find(p => p.date === selectedDateStr);
      const period = plan?.mealPeriods.find(p => p.id === periodId);
      const category = period?.categories.find(c => c.id === categoryId);
      if (category) {
          category.recipes = category.recipes.filter(r => r.recipeId !== recipeId);
          updateDailyPlans(newPlans);
      }
  };

  const handleQuantityChange = (periodId: string, categoryId: string, recipeId: string, quantity: number) => {
    const newPlans = getClonedPlans();
    const plan = newPlans.find(p => p.date === selectedDateStr);
    const recipe = plan?.mealPeriods.find(p => p.id === periodId)
                          ?.categories.find(c => c.id === categoryId)
                          ?.recipes.find(r => r.recipeId === recipeId);
    if (recipe) {
        recipe.quantity = quantity;
        updateDailyPlans(newPlans);
    }
  };

  if (!dailyPlan) {
    return (
      <div className="text-center py-10">
        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">Δεν υπάρχει πλάνο για αυτή την ημέρα.</p>
        {canManage && (
            <button onClick={handleCreatePlan} className="bg-brand-dark text-white font-semibold px-4 py-2 rounded-full hover:opacity-90">
              Δημιουργία Πλάνου
            </button>
        )}
      </div>
    );
  }

  const existingPeriods = dailyPlan.mealPeriods.map(p => p.name);
  // Fix: Changed filter to use MEAL_PERIOD_NAME_KEYS array.
  const availablePeriods = MEAL_PERIOD_NAME_KEYS.filter(p => !existingPeriods.includes(p));

  return (
    <div className="space-y-6">
      {dailyPlan.mealPeriods.map(period => (
        <div key={period.id} className="p-4 bg-black/5 dark:bg-white/10 rounded-lg">
          <h3 className="text-lg font-bold text-brand-yellow mb-3">{period.name}</h3>
          <div className="space-y-4">
            {period.categories.map(category => {
                 const availableRecipes = recipes.filter(r => !category.recipes.some(cr => cr.recipeId === r.id));
                 return (
                    <div key={category.id} className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">{category.name}</h4>
                            {canManage && <button onClick={() => handleRemoveCategory(period.id, category.id)} className="p-1 text-gray-400 hover:text-red-500"><Icon name="trash-2" className="w-4 h-4" /></button>}
                        </div>
                        <ul className="space-y-2">
                           {category.recipes.map(mr => {
                                const recipe = recipes.find(r => r.id === mr.recipeId);
                                return (
                                    <li key={mr.recipeId} className="flex items-center justify-between text-sm">
                                        <span>{recipe?.name || 'Άγνωστη'}</span>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" 
                                                value={mr.quantity}
                                                onChange={e => handleQuantityChange(period.id, category.id, mr.recipeId, parseInt(e.target.value, 10) || 0)}
                                                readOnly={!canManage}
                                                className="w-16 p-1 text-right rounded bg-light-bg dark:bg-dark-bg border border-gray-300/50 dark:border-gray-600/50 read-only:bg-gray-200 dark:read-only:bg-gray-700"
                                            />
                                            <span>μερίδες</span>
                                            {canManage && <button onClick={() => handleRemoveRecipe(period.id, category.id, mr.recipeId)} className="p-1 text-gray-400 hover:text-red-500"><Icon name="x" className="w-4 h-4" /></button>}
                                        </div>
                                    </li>
                                );
                           })}
                        </ul>
                        {canManage && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200/80 dark:border-gray-700/80">
                                <select
                                    value={recipeToAdd[category.id] || ''}
                                    onChange={e => setRecipeToAdd(prev => ({...prev, [category.id]: e.target.value}))}
                                    className="flex-1 p-2 text-sm rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                                >
                                    <option value="" disabled>Επιλέξτε συνταγή...</option>
                                    {availableRecipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                                <button onClick={() => handleAddRecipe(period.id, category.id)} className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">Προσθήκη</button>
                            </div>
                        )}
                    </div>
                )
            })}
             {canManage && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dashed border-gray-300/80 dark:border-gray-600/80">
                    <input
                        type="text"
                        placeholder="Νέα κατηγορία..."
                        value={newCategoryNames[period.id] || ''}
                        onChange={e => setNewCategoryNames(prev => ({...prev, [period.id]: e.target.value}))}
                        className="flex-1 p-2 text-sm rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                    />
                    <button onClick={() => handleAddCategory(period.id)} className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">Προσθήκη</button>
                </div>
             )}
          </div>
        </div>
      ))}

      {canManage && availablePeriods.length > 0 && (
         <div className="flex items-center gap-2 pt-4 border-t border-gray-200/80 dark:border-gray-700/80">
            <span className="text-sm font-semibold">Προσθήκη Γεύματος:</span>
            {availablePeriods.map(periodName => (
                 <button key={periodName} onClick={() => handleAddMealPeriod(periodName)} className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
                    + {periodName}
                 </button>
            ))}
         </div>
      )}
    </div>
  );
};

export default BuffetPlanEditor;
