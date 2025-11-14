import React from 'react';
import { Menu, Recipe } from '../../types';
import { Icon } from '../common/Icon';

interface RecipeSelectorProps {
    // Fix: Specify that the menu must be of type 'a_la_carte' to safely access recipeIds.
    menu: Extract<Menu, { type: 'a_la_carte' }>;
    menuRecipes: Recipe[];
    availableRecipes: Recipe[];
    onUpdateRecipes: (menuId: string, newRecipeIds: string[]) => void;
    canManage: boolean;
}

const RecipeSelector: React.FC<RecipeSelectorProps> = ({ menu, menuRecipes, availableRecipes, onUpdateRecipes, canManage }) => {

    const addRecipe = (recipeId: string) => {
        const newRecipeIds = [...menu.recipeIds, recipeId];
        onUpdateRecipes(menu.id, newRecipeIds);
    };

    const removeRecipe = (recipeId: string) => {
        const newRecipeIds = menu.recipeIds.filter(id => id !== recipeId);
        onUpdateRecipes(menu.id, newRecipeIds);
    };

    const RecipeListItem: React.FC<{ recipe: Recipe, action: 'add' | 'remove' }> = ({ recipe, action }) => (
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <div>
                <p className="font-semibold">{recipe.name}</p>
                <p className="text-xs text-gray-500">{recipe.category}</p>
            </div>
            {canManage && (action === 'add' ? (
                <button 
                    onClick={() => addRecipe(recipe.id)} 
                    className="p-1.5 text-green-600 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50"
                    title="Προσθήκη στο μενού"
                >
                    <Icon name="plus" className="w-5 h-5"/>
                </button>
            ) : (
                <button 
                    onClick={() => removeRecipe(recipe.id)}
                    className="p-1.5 text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
                    title="Αφαίρεση από το μενού"
                >
                     <Icon name="trash-2" className="w-5 h-5"/>
                </button>
            ))}
        </div>
    );

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4">Διαχείριση Συνταγών Μενού</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Available Recipes */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-bold mb-3 text-center">Διαθέσιμες Συνταγές</h4>
                    <div className="space-y-2 h-64 overflow-y-auto">
                        {availableRecipes.length > 0 ? availableRecipes.map(r => (
                            <RecipeListItem key={r.id} recipe={r} action="add" />
                        )) : <p className="text-center text-sm text-gray-500 pt-4">Όλες οι συνταγές έχουν προστεθεί.</p>}
                    </div>
                </div>

                {/* Recipes in Menu */}
                 <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                    <h4 className="font-bold mb-3 text-center">Συνταγές στο Μενού</h4>
                     <div className="space-y-2 h-64 overflow-y-auto">
                       {menuRecipes.length > 0 ? menuRecipes.map(r => (
                            <RecipeListItem key={r.id} recipe={r} action="remove" />
                        )) : <p className="text-center text-sm text-gray-500 pt-4">Δεν υπάρχουν συνταγές σε αυτό το μενού.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeSelector;
