import React from 'react';
import { Menu, DailyPlan, Recipe } from '../../types';

interface MenuPrintViewProps {
  menu: Extract<Menu, { type: 'buffet' }>;
  dailyPlansToPrint: DailyPlan[];
  allRecipes: Recipe[];
}

const MenuPrintView: React.FC<MenuPrintViewProps> = ({ menu, dailyPlansToPrint, allRecipes }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1); // Adjust for timezone issues
    return date.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };
  
  const sortedPlans = [...dailyPlansToPrint].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="font-sans text-black p-4 bg-white">
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-3xl font-extrabold">Πλάνο Μενού</h1>
        <h2 className="text-2xl font-bold">{menu.name}</h2>
        <p className="text-lg">Για {menu.pax} άτομα (PAX)</p>
        <p className="text-sm">
            {formatDate(menu.startDate!)} - {formatDate(menu.endDate!)}
        </p>
      </div>

      <div className="space-y-8">
        {sortedPlans.map(plan => (
          <div key={plan.date} className="break-after-page">
            <h3 className="text-2xl font-bold bg-gray-200 p-2 mb-4 rounded text-center">
              {formatDate(plan.date)}
            </h3>
            <div className="space-y-6">
              {plan.mealPeriods.map(mealPeriod => (
                <div key={mealPeriod.id}>
                  <h4 className="text-xl font-semibold border-b border-gray-400 pb-1 mb-2">{mealPeriod.name}</h4>
                  <div className="space-y-3">
                    {mealPeriod.categories.map(category => (
                      <div key={category.id} className="pl-4">
                        <h5 className="text-lg font-bold">{category.name}</h5>
                        <ul className="list-disc list-inside pl-4 text-base">
                          {category.recipes.map(menuRecipe => {
                            const recipe = allRecipes.find(r => r.id === menuRecipe.recipeId);
                            return <li key={menuRecipe.recipeId}>{recipe ? recipe.name : 'Άγνωστη Συνταγή'}</li>;
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuPrintView;