import React, { useMemo } from 'react';
import { Recipe } from '../types';
import { Icon } from './common/Icon';
import StarRating from './common/StarRating';
import { useTranslation } from '../i18n';

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

const RecipeGridCard: React.FC<RecipeGridCardProps> = ({
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
  const { t } = useTranslation();

  // Calculate average rating
  const averageRating = useMemo(() => {
    if (!recipe.ratings || recipe.ratings.length === 0) return 0;
    const sum = recipe.ratings.reduce((acc, r) => acc + r.rating, 0);
    return sum / recipe.ratings.length;
  }, [recipe.ratings]);

  const handleBookToggle = (e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation();
    onBookSelect(recipe.id);
  };

  const handleBulkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBulkSelect) {
      onBulkSelect(recipe.id);
    }
  };

  const handleCardClick = () => {
    if (isBookMode) {
      onBookSelect(recipe.id);
    } else if (isBulkMode && onBulkSelect) {
      onBulkSelect(recipe.id);
    } else {
      onClick();
    }
  };

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const hasImage = !!recipe.imageUrl;

  const allergens = Array.isArray(recipe.allergens) ? recipe.allergens : [];
  const visibleAllergens = allergens.slice(0, 2);
  const extraAllergens = allergens.length - visibleAllergens.length;

  return (
    <div
      className={`relative group rounded-2xl overflow-hidden border shadow-sm transition-all cursor-pointer
      ${
        isSelected && !isBookMode && !isBulkMode
          ? 'border-brand-yellow ring-2 ring-brand-yellow/40'
          : 'border-slate-100 dark:border-slate-800 hover:border-brand-yellow/70 hover:shadow-md'
      } ${(isBookSelected || isBulkSelected) ? 'ring-2 ring-brand-yellow/60' : ''}`}
      onClick={handleCardClick}
    >
      {/* Εικόνα */}
      <div className="relative h-28 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {hasImage ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="w-full h-full object-cover transform group-hover:scale-[1.03] transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="utensils" className="w-6 h-6 text-slate-400" />
          </div>
        )}

        {/* Book mode or bulk mode checkbox επάνω αριστερά */}
        {(isBookMode || isBulkMode) && (
          <button
            type="button"
            onClick={isBookMode ? handleBookToggle : handleBulkToggle}
            className="absolute top-2 left-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/60 text-white border border-white/40"
          >
            {(isBookSelected || isBulkSelected) ? (
              <Icon name="check" className="w-3 h-3" />
            ) : (
              <Icon name="plus" className="w-3 h-3" />
            )}
          </button>
        )}

        {/* Κατηγορία επάνω δεξιά */}
        {recipe.category && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-[10px] text-white flex items-center gap-1">
            <Icon name="tag" className="w-3 h-3" />
            {t(`recipe_category_${recipe.category}`)}
          </div>
        )}
      </div>

      {/* Περιεχόμενο */}
      <div className="p-2.5 flex flex-col gap-1.5 bg-white dark:bg-slate-900">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-[13px] leading-tight truncate">
              {recipe.name}
            </p>
            {recipe.name_en && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {recipe.name_en}
              </p>
            )}
          </div>

          {/* Price badge */}
          {typeof recipe.price === 'number' && recipe.price > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-200 flex-shrink-0">
              <Icon name="euro" className="w-3 h-3" />
              {recipe.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Meta: χρόνοι + μερίδες + rating */}
        <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-600 dark:text-slate-300">
          {totalTime > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10">
              <Icon name="timer" className="w-3 h-3" />
              {totalTime}′
            </span>
          )}
          {recipe.servings && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10">
              <Icon name="users" className="w-3 h-3" />
              {recipe.servings}
            </span>
          )}
          {recipe.yield && typeof recipe.yield.quantity === 'number' && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10">
              <Icon name="scale" className="w-3 h-3" />
              {recipe.yield.quantity}
              {recipe.yield.unit}
            </span>
          )}
          {averageRating > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-yellow-50 dark:bg-yellow-900/30">
              <StarRating
                rating={averageRating}
                size="sm"
                readonly
              />
            </span>
          )}
        </div>

        {/* Allergens */}
        {allergens.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 mt-0.5">
            {visibleAllergens.map((a) => (
              <span
                key={a}
                className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-red-50 dark:bg-red-900/40 text-[9px] text-red-700 dark:text-red-200"
              >
                {a}
              </span>
            ))}
            {extraAllergens > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-red-50 dark:bg-red-900/40 text-[9px] text-red-700 dark:text-red-200">
                +{extraAllergens}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeGridCard;
