import React from 'react';
import { Menu, Recipe, PrepTask, Workstation, DailyPlan } from '../../types';

interface ProductionSheetViewProps {
  dailyPlan: DailyPlan;
  menuName: string;
  pax: number;
  allRecipes: Recipe[];
  allTasks: PrepTask[];
  allWorkstations: Workstation[];
}

const ProductionSheetView: React.FC<ProductionSheetViewProps> = ({ dailyPlan, menuName, pax, allRecipes, allTasks, allWorkstations }) => {
  const productionTasksByWorkstation = allWorkstations.map(workstation => {
    
    const recipeIdsInPlan = dailyPlan.mealPeriods.flatMap(mp => mp.categories.flatMap(cat => cat.recipes.map(r => r.recipeId)));

    const tasksForStation = allTasks.filter(task => {
        const recipeForTask = allRecipes.find(r => r.name === task.recipeName);
        if (!recipeForTask) return false;

        const isInPlan = recipeIdsInPlan.includes(recipeForTask.id);
        
        return isInPlan && task.workstationId === workstation.id;
    });

    return {
        workstationName: workstation.name,
        tasks: tasksForStation,
    };
  }).filter(group => group.tasks.length > 0);

  const planDate = new Date(dailyPlan.date);
  planDate.setDate(planDate.getDate() + 1); // Adjust for timezone issues

  return (
    <div className="font-sans text-black p-4 bg-white">
      <div className="text-center border-b-2 border-black pb-4 mb-4">
        <h1 className="text-3xl font-extrabold">Λίστα Παραγωγής</h1>
        <h2 className="text-2xl font-bold">{menuName} - {planDate.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
        <p className="text-lg">Για {pax} άτομα (PAX)</p>
        <p className="text-sm">Ημερομηνία Εκτύπωσης: {new Date().toLocaleDateString('el-GR')}</p>
      </div>

      <div className="space-y-8">
        {productionTasksByWorkstation.map(group => (
          <div key={group.workstationName}>
            <h3 className="text-2xl font-bold bg-gray-200 p-2 mb-2 rounded">{group.workstationName}</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="w-12 p-2 text-left"></th>
                  <th className="p-2 text-left">Εργασία</th>
                  <th className="p-2 text-left">Συνταγή</th>
                  <th className="p-2 text-left">Ποσότητα</th>
                </tr>
              </thead>
              <tbody>
                {group.tasks.map(task => {
                    const recipeForTask = allRecipes.find(r => r.name === task.recipeName);
                    const menuRecipeInfo = dailyPlan.mealPeriods
                        .flatMap(mp => mp.categories)
                        .flatMap(cat => cat.recipes)
                        .find(mr => mr.recipeId === recipeForTask?.id);
                  return (
                    <tr key={task.id} className="border-b border-dashed border-gray-400">
                      <td className="p-3">
                          <div className="w-6 h-6 border-2 border-black"></div>
                      </td>
                      <td className="p-2 font-semibold text-lg">{task.description}</td>
                      <td className="p-2">{task.recipeName}</td>
                      <td className="p-2 font-mono text-lg">{menuRecipeInfo?.quantity || 'N/A'} μερίδες</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductionSheetView;