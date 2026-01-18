import React, { useMemo } from 'react';
import { Recipe } from '../types';
import { Icon } from './common/Icon';
import StarRating from './common/StarRating';
import { useTranslation } from '../i18n';

// MODERN CARD DESIGN v2.0 - Large image with gradient overlay
interface RecipeGridCardProps {
  recipe: Recipe;
  isSelected: boolean;
  onClick: () => void;
  isBookMode: boolean;
  isBookSelected: boolean;
  onBookSelect: (id: string) => void;
  isBulkMode?: boolean;
  isBulkSelected?: boolean;
  onBulkSelect?: (id: string) => void;
}

const RecipeGridCard: React.FC<RecipeGridCardProps> = React.memo(({
  recipe,
  isSelected,
  onClick,
  isBookMode,
  isBookSelected,
  onBookSelect,
  isBulkMode = false,
  isBulkSelected = false,
  onBulkSelect
}) => {
  const { language, t } = useTranslation();

  const displayName = language === 'en' && recipe.name_en ? recipe.name_en : recipe.name;
  const secondaryName = language === 'en' ? recipe.name : recipe.name_en;

  // Calculate average rating
  const averageRating = useMemo(() => {
    if (!recipe.ratings || recipe.ratings.length === 0) return 0;
    const sum = recipe.ratings.reduce((acc, r) => acc + r.rating, 0);
    return sum / recipe.ratings.length;
  }, [recipe.ratings]);

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const hasImage = !!recipe.imageUrl;

  const handleCardClick = () => {
    if (isBookMode && onBookSelect) {
      onBookSelect(recipe.id);
    } else if (isBulkMode && onBulkSelect) {
      onBulkSelect(recipe.id);
    } else {
      onClick();
    }
  };

  return (
    <div
      className={`stagger-item group rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer
        ${isSelected && !isBookMode && !isBulkMode
          ? 'ring-2 ring-brand-yellow shadow-2xl scale-[1.02]'
          : 'hover:shadow-xl hover:scale-[1.02]'
        }
        ${(isBookSelected || isBulkSelected) ? 'ring-2 ring-brand-yellow shadow-xl' : ''}
      `}
      onClick={handleCardClick}
    >
      {/* Large Image Header with Gradient Overlay */}
      <div className="relative h-48 w-full overflow-hidden">
        {hasImage ? (
          <>
            <img
              src={recipe.imageUrl}
              alt={displayName}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 flex items-center justify-center">
            <Icon name="utensils" className="w-16 h-16 text-white/30" />
          </div>
        )}

        {/* Category Badge - Top Right */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/20 flex items-center gap-2">
            <span className="text-white text-sm font-medium">
              {t(`recipe_category_${recipe.category}`)}
            </span>
            <Icon name="edit" className="w-3 h-3 text-white/70" />
          </div>
        </div>

        {/* Book/Bulk Mode Checkbox - Top Left */}
        {(isBookMode || isBulkMode) && (
          <div className="absolute top-3 left-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
              (isBookSelected || isBulkSelected)
                ? 'bg-brand-yellow text-black'
                : 'bg-black/50 backdrop-blur-sm border border-white/30 text-white'
            }`}>
              {(isBookSelected || isBulkSelected) ? (
                <Icon name="check" className="w-4 h-4" />
              ) : (
                <Icon name="plus" className="w-4 h-4" />
              )}
            </div>
          </div>
        )}

        {/* Title Overlay at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white text-2xl font-bold leading-tight mb-1 drop-shadow-lg">
            {displayName}
          </h3>
          {secondaryName && (
            <p className="text-white/80 text-sm drop-shadow">
              {secondaryName}
            </p>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white dark:bg-slate-900 p-4">
        {/* Metadata Row */}
        <div className="flex items-center gap-4 mb-3 flex-wrap">
          {/* Prep Time */}
          {recipe.prepTime > 0 && (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Icon name="clock" className="w-4 h-4" />
              <span className="text-sm">
                {recipe.prepTime}′ {t('prep')}
              </span>
            </div>
          )}

          {/* Cook Time */}
          {recipe.cookTime > 0 && (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Icon name="thermometer" className="w-4 h-4" />
              <span className="text-sm">
                {recipe.cookTime}′ {t('cook')}
              </span>
            </div>
          )}

          {/* Servings */}
          {recipe.servings && (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Icon name="users" className="w-4 h-4" />
              <span className="text-sm">{recipe.servings}</span>
            </div>
          )}

          {/* Difficulty */}
          {recipe.difficulty && (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Icon name="trending-up" className="w-4 h-4" />
              <span className="text-sm">{t(`difficulty_${recipe.difficulty}`)}</span>
            </div>
          )}

          {/* Rating */}
          {averageRating > 0 && (
            <div className="ml-auto">
              <StarRating
                rating={averageRating}
                size="sm"
                readonly
                showCount
                count={recipe.ratings?.length}
              />
            </div>
          )}
        </div>

        {/* Description */}
        {recipe.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
            {recipe.description}
          </p>
        )}

        {/* Ingredients Preview */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
              {t('ingredients')} ({recipe.ingredients.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {recipe.ingredients.slice(0, 4).map((ing, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  {ing.name}
                </span>
              ))}
              {recipe.ingredients.length > 4 && (
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  +{recipe.ingredients.length - 4} {t('more')}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Allergens */}
        {recipe.allergens && recipe.allergens.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 flex-wrap">
              <Icon name="alert-circle" className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {recipe.allergens.slice(0, 3).join(', ')}
                {recipe.allergens.length > 3 && ` +${recipe.allergens.length - 3}`}
              </span>
            </div>
          </div>
        )}

        {/* Price Badge */}
        {typeof recipe.price === 'number' && recipe.price > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
              <Icon name="euro" className="w-4 h-4" />
              <span className="font-semibold">{recipe.price.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

RecipeGridCard.displayName = 'RecipeGridCard';

export default RecipeGridCard;
