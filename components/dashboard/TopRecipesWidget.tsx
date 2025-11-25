import React from 'react';
import type { Recipe } from '../../types';
import StarRating from '../common/StarRating';
import { useTranslation } from '../../i18n';

interface TopRecipesWidgetProps {
  recipes: Recipe[];
  limit?: number;
  onRecipeClick?: (recipeId: string) => void;
}

const TopRecipesWidget: React.FC<TopRecipesWidgetProps> = ({
  recipes,
  limit = 5,
  onRecipeClick
}) => {
  const { t, language } = useTranslation();

  // Calculate average rating for each recipe and sort
  const topRecipes = React.useMemo(() => {
    return recipes
      .map(recipe => {
        const ratings = recipe.ratings || [];
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : 0;
        
        return {
          ...recipe,
          avgRating,
          ratingCount: ratings.length
        };
      })
      .filter(r => r.avgRating > 0) // Only show recipes with ratings
      .sort((a, b) => {
        // Sort by rating first, then by number of ratings
        if (b.avgRating !== a.avgRating) {
          return b.avgRating - a.avgRating;
        }
        return b.ratingCount - a.ratingCount;
      })
      .slice(0, limit);
  }, [recipes, limit]);

  if (topRecipes.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <span>🏆</span>
          {t('dashboard_top_recipes')}
        </h3>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          {t('dashboard_no_rated_recipes')}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <span>🏆</span>
        {t('dashboard_top_recipes')}
      </h3>
      
      <div className="space-y-3">
        {topRecipes.map((recipe, idx) => (
          <div
            key={recipe.id}
            onClick={() => onRecipeClick?.(recipe.id)}
            className={`
              flex items-center gap-3 p-3 rounded-lg
              ${onRecipeClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''}
              transition-colors
            `}
          >
            {/* Rank badge */}
            <div className={`
              w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm flex-shrink-0
              ${idx === 0 ? 'bg-yellow-400 text-gray-900' : 
                idx === 1 ? 'bg-gray-300 text-gray-900' : 
                idx === 2 ? 'bg-orange-400 text-gray-900' : 
                'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}
            `}>
              {idx + 1}
            </div>
            
            {/* Recipe info */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {language === 'el' ? recipe.name : recipe.name_en}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <StarRating 
                  rating={recipe.avgRating} 
                  size="sm" 
                  readonly 
                  showCount
                  count={recipe.ratingCount}
                />
              </div>
            </div>
            
            {/* Rating value */}
            <div className="text-right flex-shrink-0">
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {recipe.avgRating.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {recipe.ratingCount} {t('dashboard_ratings')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopRecipesWidget;
