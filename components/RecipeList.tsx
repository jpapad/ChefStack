import React, { useState } from 'react';
import {
  Recipe,
  RecipeCategoryKey,
  RECIPE_CATEGORY_KEYS,
  Role,
  RolePermissions,
  Allergen
} from '../types';
import { ModernRecipeCard } from './demo/ModernRecipeCard';
import { RecipeListSkeleton } from './common/RecipeListSkeleton';
import { Icon } from './common/Icon';
import { useToast } from '../hooks/use-toast';
import SearchBar from './common/SearchBar';
import FilterPanel, { FilterOptions } from './common/FilterPanel';
import { useTranslation } from '../i18n';
import { exportRecipesToJSON, exportRecipesToCSV } from '../utils/recipeExport';
import { BulkActionsToolbar } from './common/BulkActionsToolbar';
import { NoRecipesEmptyState, NoResultsEmptyState } from './common/EmptyState';
import { EnhancedRecipeCard } from './common/EnhancedRecipeCard';
import { FilterChips, QuickFilters, ActiveFilter } from './common/FilterChips';
import { duplicateRecipe } from '../utils/recipeHelpers';

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
  onBookCategorySelect: (
    category: RecipeCategoryKey | 'All',
    isSelected: boolean
  ) => void;
  onGenerateBook: () => void;
  withApiKeyCheck: (action: () => void) => void;
  onUpdateRecipes: (recipes: Recipe[]) => void; // For bulk operations
  isLoading?: boolean;
}

const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  allRecipesForCategory,
  selectedRecipeId,
  isLoading = false,
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
  onGenerateBook,
  withApiKeyCheck,
  onUpdateRecipes
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'prepTime' | 'recent'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    allergens: [],
    difficulties: [],
    prepTimeRange: null,
    costRange: null,
    ratingRange: null,
    vegetarian: null,
    vegan: null,
    tags: []
  });

  // Bulk operations state
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Active filters for FilterChips
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  
  // Update active filters when filters change
  React.useEffect(() => {
    const active: ActiveFilter[] = [];
    
    filters.difficulties.forEach(d => {
      active.push({ type: 'difficulty', value: d, label: d === 'easy' ? 'Εύκολα' : d === 'medium' ? 'Μέτρια' : 'Δύσκολα' });
    });
    
    filters.allergens.forEach(a => {
      active.push({ type: 'allergen', value: a, label: `Χωρίς ${a}` });
    });
    
    filters.categories.forEach(c => {
      active.push({ type: 'category', value: c, label: t(`recipe_category_${c}`) });
    });
    
    if (filters.prepTimeRange) {
      active.push({ 
        type: 'prepTime', 
        value: 'time', 
        label: `${filters.prepTimeRange[0]}-${filters.prepTimeRange[1]} λεπτά` 
      });
    }
    
    if (filters.vegetarian) {
      active.push({ type: 'vegetarian', value: 'vegetarian', label: 'Χορτοφαγικά' });
    }
    
    if (filters.vegan) {
      active.push({ type: 'vegan', value: 'vegan', label: 'Vegan' });
    }
    
    setActiveFilters(active);
  }, [filters, t]);

  const canManage = currentUserRole
    ? rolePermissions[currentUserRole]?.includes('manage_recipes')
    : false;

  // Handle favorite toggle
  const handleToggleFavorite = (recipeId: string) => {
    const updatedRecipes = recipes.map(r =>
      r.id === recipeId ? { ...r, isFavorite: !r.isFavorite } : r
    );
    onUpdateRecipes(updatedRecipes);
    toast({
      title: recipes.find(r => r.id === recipeId)?.isFavorite 
        ? t('recipe_removed_from_favorites') 
        : t('recipe_added_to_favorites'),
      variant: 'success'
    });
  };

  // Handle recipe duplication
  const handleDuplicateRecipe = (recipe: Recipe) => {
    if (!canManage) {
      toast({
        title: t('error_permission_denied'),
        variant: 'danger'
      });
      return;
    }
    
    const userId = 'current-user'; // TODO: Get from auth context
    const duplicated = duplicateRecipe(recipe, userId);
    onUpdateRecipes([...recipes, duplicated]);
    toast({
      title: t('recipe_duplicated'),
      description: duplicated.name,
      variant: 'success'
    });
  };

  const handleCategoryCheckboxChange = (
    category: RecipeCategoryKey | 'All',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onBookCategorySelect(category, e.target.checked);
  };

  const isCategorySelected = (category: RecipeCategoryKey | 'All'): boolean => {
    const categoryRecipeIds = allRecipesForCategory
      .filter((r) => category === 'All' || r.category === category)
      .map((r) => r.id);
    if (categoryRecipeIds.length === 0) return false;
    return categoryRecipeIds.every((id) => bookSelectedIds.includes(id));
  };

  // Πόσες συνταγές έχει συνολικά η κατηγορία (πριν το search)
  const totalInCategory = allRecipesForCategory.length;
  
  // Apply advanced filters
  const filteredRecipes = React.useMemo(() => {
    let result = [...recipes];
    
    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(r => {
        const recipeTags = r.tags || [];
        return (filters.tags || []).some(tag => recipeTags.includes(tag));
      });
    }
    
    // Category filter (already applied via activeCategory, but check advanced filters too)
    if (filters.categories.length > 0) {
      result = result.filter(r => filters.categories.includes(r.category));
    }
    
    // Allergen exclusion
    if (filters.allergens.length > 0) {
      result = result.filter(r => {
        const recipeAllergens = r.allergens || [];
        return !(filters.allergens || []).some(a => recipeAllergens.includes(a));
      });
    }
    
    // Difficulty filter
    if (filters.difficulties.length > 0) {
      result = result.filter(r => {
        // Infer difficulty from prep time (simple heuristic)
        const totalTime = (r.prepTime || 0) + (r.cookTime || 0);
        let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
        if (totalTime <= 30) difficulty = 'easy';
        else if (totalTime > 60) difficulty = 'hard';
        return filters.difficulties.includes(difficulty);
      });
    }
    
    // Prep time range
    if (filters.prepTimeRange) {
      result = result.filter(r => {
        const totalTime = (r.prepTime || 0) + (r.cookTime || 0);
        return totalTime >= filters.prepTimeRange![0] && totalTime <= filters.prepTimeRange![1];
      });
    }
    
    // Rating range
    if (filters.ratingRange) {
      result = result.filter(r => {
        const ratings = r.ratings || [];
        if (ratings.length === 0) return false;
        const avgRating = ratings.reduce((sum, rt) => sum + rt.rating, 0) / ratings.length;
        return avgRating >= filters.ratingRange![0] && avgRating <= filters.ratingRange![1];
      });
    }
    
    // Vegetarian/Vegan filters (simple check based on name/tags - could be enhanced)
    if (filters.vegetarian) {
      result = result.filter(r => 
        !r.allergens?.includes('meat') && !r.allergens?.includes('fish')
      );
    }
    if (filters.vegan) {
      result = result.filter(r => 
        !r.allergens?.includes('meat') && 
        !r.allergens?.includes('fish') && 
        !r.allergens?.includes('eggs') && 
        !r.allergens?.includes('milk')
      );
    }
    
    return result;
  }, [recipes, filters]);
  
  // Apply sorting
  const sortedRecipes = React.useMemo(() => {
    const result = [...filteredRecipes];
    
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'rating': {
          const avgA = a.ratings?.length ? a.ratings.reduce((s, r) => s + r.rating, 0) / a.ratings.length : 0;
          const avgB = b.ratings?.length ? b.ratings.reduce((s, r) => s + r.rating, 0) / b.ratings.length : 0;
          comparison = avgA - avgB;
          break;
        }
        case 'prepTime':
          comparison = ((a.prepTime || 0) + (a.cookTime || 0)) - ((b.prepTime || 0) + (b.cookTime || 0));
          break;
        case 'recent':
          // Assume recipes have createdAt or use ID as proxy
          comparison = a.id.localeCompare(b.id);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [filteredRecipes, sortBy, sortDirection]);
  
  const visibleCount = sortedRecipes.length;

  return (
    <div className="relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl h-full flex flex-col">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200/80 dark:border-gray-700/80">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-extrabold font-heading">
                {t('recipes_title')}
              </h2>
              {/* Μικρό badge με πόσες συνταγές βλέπεις / πόσες έχει η κατηγορία */}
              <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-200">
                {visibleCount}
                {totalInCategory > 0 && visibleCount !== totalInCategory && (
                  <>
                    <span className="mx-1">/</span>
                    <span>{totalInCategory}</span>
                  </>
                )}
              </span>
            </div>
            {/* Optional: μικρή υποσημείωση για το search/filter feeling */}
            {totalInCategory > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {visibleCount === totalInCategory
                  ? t('recipes_search_placeholder')
                  : ''}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleBookMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors lift-on-hover text-sm font-semibold ${
                isBookMode
                  ? 'bg-brand-yellow/90 text-brand-dark shadow-sm'
                  : 'bg-gray-200 dark:bg-gray-700 text-slate-800 dark:text-slate-50 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Icon name="book-open" className="w-5 h-5" />
              <span>{t('recipe_book_mode')}</span>
            </button>

            {canManage && (
              <>
                {/* Bulk select mode toggle */}
                <button
                  onClick={() => {
                    setShowBulkActions(!showBulkActions);
                    if (showBulkActions) {
                      setSelectedRecipeIds([]);
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors lift-on-hover text-sm font-semibold ${
                    showBulkActions
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-gray-200 dark:bg-gray-700 text-slate-800 dark:text-slate-50 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon name="check-square" className="w-5 h-5" />
                  <span>{t('bulk_select_mode')}</span>
                </button>

                {/* Export dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors lift-on-hover text-sm font-semibold"
                  >
                    <Icon name="download" className="w-5 h-5" />
                    <span>{t('export_recipes')}</span>
                  </button>
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 z-10">
                      <button
                        onClick={() => {
                          exportRecipesToJSON(sortedRecipes, `recipes_${new Date().toISOString().split('T')[0]}.json`);
                          setShowExportMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg flex items-center gap-2"
                      >
                        <Icon name="file-json" className="w-4 h-4" />
                        <span>Export JSON</span>
                      </button>
                      <button
                        onClick={() => {
                          exportRecipesToCSV(sortedRecipes, `recipes_${new Date().toISOString().split('T')[0]}.csv`);
                          setShowExportMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg flex items-center gap-2"
                      >
                        <Icon name="file-text" className="w-4 h-4" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => withApiKeyCheck(onStartImport)}
                  className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors lift-on-hover text-sm font-semibold"
                >
                  <Icon name="link" className="w-5 h-5" />
                  <span>{t('import_from_url')}</span>
                </button>
                <button
                  onClick={onStartCreateRecipe}
                  className="flex items-center gap-2 bg-brand-dark text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity lift-on-hover text-sm font-semibold"
                >
                  <Icon name="plus" className="w-5 h-5" />
                  <span>{t('recipes_new')}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search, Filter, and Sort */}
        <div className="space-y-3 mt-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <SearchBar
                value={searchTerm}
                onChange={onSearchChange}
                placeholder={t('recipes_search_placeholder')}
              />
            </div>
            
            {/* Sort dropdown */}
            <select
              value={`${sortBy}-${sortDirection}`}
              onChange={(e) => {
                const [sort, dir] = e.target.value.split('-') as [typeof sortBy, typeof sortDirection];
                setSortBy(sort);
                setSortDirection(dir);
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
            >
              <option value="name-asc">{t('sort_name_asc')}</option>
              <option value="name-desc">{t('sort_name_desc')}</option>
              <option value="rating-desc">{t('sort_rating_high')}</option>
              <option value="rating-asc">{t('sort_rating_low')}</option>
              <option value="prepTime-asc">{t('sort_time_low')}</option>
              <option value="prepTime-desc">{t('sort_time_high')}</option>
              <option value="recent-desc">{t('sort_recent')}</option>
            </select>
          </div>
          
          {/* Filter panel */}
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters({
              categories: [],
              allergens: [],
              difficulties: [],
              prepTimeRange: null,
              costRange: null,
              ratingRange: null,
              vegetarian: null,
              vegan: null,
              tags: []
            })}
            isExpanded={isFilterExpanded}
            onToggle={() => setIsFilterExpanded(!isFilterExpanded)}
          />
          
          {/* Quick Filters */}
          <QuickFilters
            onQuickFilter={(type) => {
              if (type === 'easy') {
                setFilters({ ...filters, difficulties: ['easy'] });
              } else if (type === 'quick') {
                setFilters({ ...filters, prepTimeRange: [0, 30] });
              } else if (type === 'vegetarian') {
                setFilters({ ...filters, vegetarian: true });
              } else if (type === 'seasonal') {
                // Auto-detect current season (simplified)
                const month = new Date().getMonth();
                let season: 'spring' | 'summer' | 'fall' | 'winter' = 'summer';
                if (month >= 2 && month <= 4) season = 'spring';
                else if (month >= 5 && month <= 7) season = 'summer';
                else if (month >= 8 && month <= 10) season = 'fall';
                else season = 'winter';
                // Would filter by season if recipes had seasons field
                toast({ title: `Φίλτρο για ${season}`, variant: 'info' });
              } else if (type === 'allergen-free') {
                setFilters({ ...filters, allergens: [] });
              }
            }}
          />
          
          {/* Active Filters */}
          {(filters.difficulties.length > 0 || 
            filters.allergens.length > 0 || 
            filters.categories.length > 0 ||
            filters.prepTimeRange !== null ||
            filters.vegetarian ||
            filters.vegan) && (
            <FilterChips
              filters={activeFilters}
              onRemoveFilter={(filter) => {
                if (filter.type === 'difficulty') {
                  setFilters({ ...filters, difficulties: filters.difficulties.filter(d => d !== filter.value) });
                } else if (filter.type === 'allergen') {
                  setFilters({ ...filters, allergens: filters.allergens.filter(a => a !== filter.value) });
                } else if (filter.type === 'category') {
                  setFilters({ ...filters, categories: filters.categories.filter(c => c !== filter.value) });
                } else if (filter.type === 'prepTime') {
                  setFilters({ ...filters, prepTimeRange: null });
                } else if (filter.type === 'vegetarian') {
                  setFilters({ ...filters, vegetarian: null });
                } else if (filter.type === 'vegan') {
                  setFilters({ ...filters, vegan: null });
                }
              }}
              onClearAll={() => {
                setFilters({
                  categories: [],
                  allergens: [],
                  difficulties: [],
                  prepTimeRange: null,
                  costRange: null,
                  ratingRange: null,
                  vegetarian: null,
                  vegan: null,
                  tags: []
                });
              }}
            />
          )}
        </div>
      </div>

      {/* Categories row */}
      <div className="py-4 overflow-x-auto border-b border-gray-200/80 dark:border-gray-700/80">
        <div className="flex items-center space-x-2 min-w-max">
          {isBookMode && (
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-gray-300 text-brand-secondary focus:ring-brand-primary mr-1"
              checked={isCategorySelected('All')}
              onChange={(e) => handleCategoryCheckboxChange('All', e)}
            />
          )}
          <button
            onClick={() => onCategoryFilterChange('All')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full flex-shrink-0 ${
              activeCategory === 'All'
                ? 'bg-brand-yellow text-brand-dark'
                : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-800 dark:text-slate-100'
            }`}
          >
            {t('all')}
          </button>
          {RECIPE_CATEGORY_KEYS.map((categoryKey) => (
            <div key={categoryKey} className="flex items-center flex-shrink-0">
              {isBookMode && (
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-300 text-brand-secondary focus:ring-brand-primary mr-1"
                  checked={isCategorySelected(categoryKey)}
                  onChange={(e) =>
                    handleCategoryCheckboxChange(categoryKey, e)
                  }
                />
              )}
              <button
                onClick={() => onCategoryFilterChange(categoryKey)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full ${
                  activeCategory === categoryKey
                    ? 'bg-brand-yellow text-brand-dark'
                    : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-800 dark:text-slate-100'
                }`}
              >
                {t(`recipe_category_${categoryKey}`)}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* View mode toggle */}
      <div className="flex justify-end items-center mb-2 px-1">
        <div className="inline-flex rounded-lg bg-black/5 dark:bg-white/10 overflow-hidden">
          <button
            onClick={() => onRecipeViewModeChange('list')}
            className={`p-2 text-xs flex items-center justify-center ${
              recipeViewMode === 'list'
                ? 'bg-black/10 dark:bg-white/20'
                : 'opacity-70'
            }`}
            aria-label="List view"
          >
            <Icon name="list" className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRecipeViewModeChange('grid')}
            className={`p-2 text-xs flex items-center justify-center ${
              recipeViewMode === 'grid'
                ? 'bg-black/10 dark:bg-white/20'
                : 'opacity-70'
            }`}
            aria-label="Grid view"
          >
            <Icon name="layout-grid" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recipes list / grid */}
      <div className="flex-1 overflow-y-auto -mr-2 pr-2 pb-16">
        {isLoading ? (
          <RecipeListSkeleton mode={recipeViewMode} count={6} />
        ) : sortedRecipes.length > 0 ? (
          recipeViewMode === 'list' ? (
            <div className="space-y-3">
              {sortedRecipes.map((recipe) => (
                <ModernRecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  mode="full"
                  onView={() => onSelectRecipe(recipe.id)}
                  onEdit={() => onSelectRecipe(recipe.id)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {sortedRecipes.map((recipe) => (
                <EnhancedRecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isSelected={selectedRecipeId === recipe.id}
                  onClick={() => onSelectRecipe(recipe.id)}
                  onEdit={canManage ? () => onSelectRecipe(recipe.id) : undefined}
                  onDuplicate={canManage ? () => handleDuplicateRecipe(recipe) : undefined}
                  onToggleFavorite={() => handleToggleFavorite(recipe.id)}
                  showQuickActions={canManage}
                />
              ))}
            </div>
          )
        ) : searchTerm || filters.categories.length > 0 || filters.allergens.length > 0 ? (
          <NoResultsEmptyState
            searchTerm={searchTerm}
            onClearFilters={() => {
              onSearchChange('');
              setFilters({
                categories: [],
                allergens: [],
                difficulties: [],
                prepTimeRange: null,
                costRange: null,
                ratingRange: null,
                vegetarian: null,
                vegan: null,
                tags: []
              });
            }}
          />
        ) : (
          <NoRecipesEmptyState onCreateRecipe={onStartCreateRecipe} />
        )}
      </div>

      {/* Book mode footer bar */}
      {isBookMode && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] bg-brand-dark/90 dark:bg-slate-900/90 backdrop-blur-sm text-white p-3 rounded-xl shadow-2xl flex justify-between items-center">
          <p className="font-semibold">
            {t('recipes_selected_count', { count: bookSelectedIds.length })}
          </p>
          <div className="flex gap-2">
            <button
              onClick={toggleBookMode}
              className="px-4 py-2 text-sm font-semibold bg-gray-600/50 hover:bg-gray-500/50 rounded-lg"
            >
              {t('cancel')}
            </button>
            <button
              onClick={onGenerateBook}
              disabled={bookSelectedIds.length === 0}
              className="px-4 py-2 text-sm font-semibold bg-brand-yellow text-brand-dark rounded-lg hover:bg-amber-300 disabled:opacity-50"
            >
              {t('print')}
            </button>
          </div>
        </div>
      )}

      {/* Bulk actions toolbar */}
      {showBulkActions && selectedRecipeIds.length > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedRecipeIds.length}
          onClearSelection={() => setSelectedRecipeIds([])}
          onBulkDelete={() => {
            const remaining = recipes.filter(r => !selectedRecipeIds.includes(r.id));
            onUpdateRecipes(remaining);
            setSelectedRecipeIds([]);
          }}
          onBulkExportJSON={() => {
            const selectedRecipes = recipes.filter(r => selectedRecipeIds.includes(r.id));
            exportRecipesToJSON(selectedRecipes, `recipes_bulk_${new Date().toISOString().split('T')[0]}.json`);
          }}
          onBulkExportCSV={() => {
            const selectedRecipes = recipes.filter(r => selectedRecipeIds.includes(r.id));
            exportRecipesToCSV(selectedRecipes, `recipes_bulk_${new Date().toISOString().split('T')[0]}.csv`);
          }}
          onBulkCategorize={(category) => {
            const updated = recipes.map(r =>
              selectedRecipeIds.includes(r.id) ? { ...r, category } : r
            );
            onUpdateRecipes(updated);
            setSelectedRecipeIds([]);
          }}
          onBulkAddAllergens={(allergens) => {
            const updated = recipes.map(r => {
              if (!selectedRecipeIds.includes(r.id)) return r;
              const existingAllergens = r.allergens || [];
              const newAllergens = [...new Set([...existingAllergens, ...allergens])];
              return { ...r, allergens: newAllergens };
            });
            onUpdateRecipes(updated);
            setSelectedRecipeIds([]);
          }}
          onBulkRemoveAllergens={(allergens) => {
            const updated = recipes.map(r => {
              if (!selectedRecipeIds.includes(r.id)) return r;
              const existingAllergens = r.allergens || [];
              const filteredAllergens = existingAllergens.filter(a => !allergens.includes(a));
              return { ...r, allergens: filteredAllergens };
            });
            onUpdateRecipes(updated);
            setSelectedRecipeIds([]);
          }}
        />
      )}
    </div>
  );
};

export default RecipeList;
