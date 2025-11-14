import React from 'react';
import { Recipe, RecipeCategoryKey, RECIPE_CATEGORY_KEYS, Role, RolePermissions } from '../types';
import RecipeCard from './RecipeCard';
import RecipeGridCard from './RecipeGridCard';
import { Icon } from './common/Icon';
import { useTranslation } from '../i18n';

interface RecipeListProps {
  recipes: Recipe[];
  allRecipesForCategory: Recipe[]; // All recipes before search filter is applied
  selectedRecipeId: string | null;
  onSelectRecipe: (id: string) => void;
  onStartCreateRecipe: () => void;
  onStartImport: () => void;
  activeCategory: RecipeCategoryKey | 'All';
  onCategoryFilterChange: (category: RecipeCategoryKey | 'All') => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  currentUserRole?: Role;
  rolePermissions: RolePermissions;
  recipeViewMode: 'list' | 'grid';
  onRecipeViewModeChange: (mode: 'list' | 'grid') => void;
  isBookMode: boolean;
  toggleBookMode: () => void;
  bookSelectedIds: string[];
  onBookSelect: (id: string) => void;
  onBookCategorySelect: (category: RecipeCategoryKey | 'All', isSelected: boolean) => void;
  onGenerateBook: () => void;
}

const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  allRecipesForCategory,
  selectedRecipeId,
  onSelectRecipe,
  onStartCreateRecipe,
  onStartImport,
  activeCategory,
  onCategoryFilterChange,
  searchTerm,
  onSearchChange,
  currentUserRole,
  rolePermissions,
  recipeViewMode,
  onRecipeViewModeChange,
  isBookMode,
  toggleBookMode,
  bookSelectedIds,
  onBookSelect,
  onBookCategorySelect,
  onGenerateBook
}) => {
    const { t } = useTranslation();

    const canManage = currentUserRole ? rolePermissions[currentUserRole]?.includes('manage_recipes') : false;

    const handleCategoryCheckboxChange = (category: RecipeCategoryKey | 'All', e: React.ChangeEvent<HTMLInputElement>) => {
        onBookCategorySelect(category, e.target.checked);
    };
    
    const isCategorySelected = (category: RecipeCategoryKey | 'All'): boolean => {
        const categoryRecipeIds = allRecipesForCategory
            .filter(r => category === 'All' || r.category === category)
            .map(r => r.id);
        if (categoryRecipeIds.length === 0) return false;
        return categoryRecipeIds.every(id => bookSelectedIds.includes(id));
    };

  return (
    <div className="relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl h-full flex flex-col">
      <div className="pb-4 border-b border-gray-200/80 dark:border-gray-700/80">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="text-3xl font-extrabold font-heading">{t('recipes_title')}</h2>
            <div className="flex items-center gap-2">
                 <button
                    onClick={toggleBookMode}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors lift-on-hover text-sm font-semibold ${isBookMode ? 'bg-brand-yellow/80 text-brand-dark' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                    <Icon name="book-open" className="w-5 h-5" />
                    <span>{t('recipe_book_mode')}</span>
                </button>
                {canManage && (
                    <>
                    <button
                        onClick={onStartImport}
                        className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors lift-on-hover"
                    >
                        <Icon name="link" className="w-5 h-5" />
                        <span className="font-semibold text-sm">{t('import_from_url')}</span>
                    </button>
                    <button
                        onClick={onStartCreateRecipe}
                        className="flex items-center gap-2 bg-brand-dark text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity lift-on-hover"
                    >
                        <Icon name="plus" className="w-5 h-5" />
                        <span className="font-semibold text-sm">{t('recipes_new')}</span>
                    </button>
                    </>
                )}
            </div>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder={t('recipes_search_placeholder')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-black/5 dark:bg-white/10 border-transparent focus:border-brand-yellow focus:shadow-aura-yellow"
          />
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="py-4 overflow-x-auto">
        <div className="flex items-center space-x-2">
            {isBookMode && (
                <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-brand-secondary focus:ring-brand-primary mr-1" 
                 checked={isCategorySelected('All')} onChange={(e) => handleCategoryCheckboxChange('All', e)} />
            )}
          <button
            onClick={() => onCategoryFilterChange('All')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full flex-shrink-0 ${
              activeCategory === 'All' ? 'bg-brand-yellow text-brand-dark' : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20'
            }`}
          >
            {t('all')}
          </button>
          {RECIPE_CATEGORY_KEYS.map((categoryKey) => (
            <div key={categoryKey} className="flex items-center flex-shrink-0">
                {isBookMode && (
                     <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-brand-secondary focus:ring-brand-primary mr-1"
                      checked={isCategorySelected(categoryKey)} onChange={(e) => handleCategoryCheckboxChange(categoryKey, e)} />
                )}
                <button
                onClick={() => onCategoryFilterChange(categoryKey)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full ${
                    activeCategory === categoryKey ? 'bg-brand-yellow text-brand-dark' : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20'
                }`}
                >
                {t(`recipe_category_${categoryKey}`)}
                </button>
            </div>
          ))}
        </div>
      </div>
      
       <div className="flex justify-end items-center mb-2 px-1">
        <button onClick={() => onRecipeViewModeChange('list')} className={`p-2 rounded-l-lg ${recipeViewMode === 'list' ? 'bg-black/10 dark:bg-white/20' : 'bg-black/5 dark:bg-white/10'}`}>
            <Icon name="list" className="w-4 h-4"/>
        </button>
         <button onClick={() => onRecipeViewModeChange('grid')} className={`p-2 rounded-r-lg ${recipeViewMode === 'grid' ? 'bg-black/10 dark:bg-white/20' : 'bg-black/5 dark:bg-white/10'}`}>
            <Icon name="layout-grid" className="w-4 h-4"/>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto -mr-2 pr-2 pb-16">
        {recipes.length > 0 ? (
           recipeViewMode === 'list' ? (
                <div className="space-y-2">
                    {recipes.map((recipe) => (
                        <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        isSelected={selectedRecipeId === recipe.id}
                        onClick={() => onSelectRecipe(recipe.id)}
                        isBookMode={isBookMode}
                        isBookSelected={bookSelectedIds.includes(recipe.id)}
                        onBookSelect={onBookSelect}
                        />
                    ))}
                </div>
           ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                     {recipes.map((recipe) => (
                        <RecipeGridCard
                        key={recipe.id}
                        recipe={recipe}
                        isSelected={selectedRecipeId === recipe.id}
                        onClick={() => onSelectRecipe(recipe.id)}
                        isBookMode={isBookMode}
                        isBookSelected={bookSelectedIds.includes(recipe.id)}
                        onBookSelect={onBookSelect}
                        />
                    ))}
                </div>
           )
        ) : (
          <div className="flex items-center justify-center h-full text-light-text-secondary dark:text-dark-text-secondary">
            <p>{t('recipes_not_found')}</p>
          </div>
        )}
      </div>

       {isBookMode && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] bg-brand-dark/90 dark:bg-slate-900/90 backdrop-blur-sm text-white p-3 rounded-xl shadow-2xl flex justify-between items-center">
                <p className="font-semibold">{t('recipes_selected_count', { count: bookSelectedIds.length })}</p>
                <div className="flex gap-2">
                     <button onClick={toggleBookMode} className="px-4 py-2 text-sm font-semibold bg-gray-600/50 hover:bg-gray-500/50 rounded-lg">{t('cancel')}</button>
                     <button onClick={onGenerateBook} disabled={bookSelectedIds.length === 0} className="px-4 py-2 text-sm font-semibold bg-brand-yellow text-brand-dark rounded-lg hover:bg-amber-300 disabled:opacity-50">{t('print')}</button>
                </div>
            </div>
        )}
    </div>
  );
};

export default RecipeList;
