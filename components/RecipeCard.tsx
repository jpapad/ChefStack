

import React, { useMemo } from 'react';
import { Recipe } from '../types';
import { Icon } from './common/Icon';
import { useTranslation } from '../i18n';
import StarRating from './common/StarRating';

interface RecipeCardProps {
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

const RecipeCard: React.FC<RecipeCardProps> = ({ 
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
  const displayDescription = recipe.description; // Assuming description is not translated for now

  // Calculate average rating
  const averageRating = useMemo(() => {
    if (!recipe.ratings || recipe.ratings.length === 0) return 0;
    const sum = recipe.ratings.reduce((acc, r) => acc + r.rating, 0);
    return sum / recipe.ratings.length;
  }, [recipe.ratings]);

  const handleClick = () => {
    if (isBookMode) {
      onBookSelect(recipe.id);
    } else if (isBulkMode && onBulkSelect) {
      onBulkSelect(recipe.id);
    } else {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
        isSelected && !isBookMode && !isBulkMode
          ? 'bg-brand-yellow/20 dark:bg-brand-yellow/30 border-brand-yellow/50'
          : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
      } ${isBookSelected || isBulkSelected ? 'border-brand-yellow shadow-lg' : ''}`}
    >
        {(isBookMode || isBulkMode) && (
             <div className="absolute top-2 right-2 z-10">
                <Icon name={(isBookSelected || isBulkSelected) ? 'check-square' : 'square'} className={`w-6 h-6 ${(isBookSelected || isBulkSelected) ? 'text-brand-yellow' : 'text-gray-400 dark:text-gray-500'}`} />
            </div>
        )}
      <img
        src={recipe.imageUrl}
        alt={displayName}
        className="w-16 h-16 object-cover rounded-md mr-4"
      />
      <div className="flex-1">
        <h3 className="font-bold text-md text-light-text-primary dark:text-dark-text-primary">{displayName}</h3>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate">{displayDescription}</p>
        <div className="flex items-center text-xs text-light-text-secondary dark:text-dark-text-secondary mt-2 space-x-4">
            <div className="flex items-center">
                <Icon name="clock" className="w-4 h-4 mr-1"/> 
                <span>{recipe.prepTime + recipe.cookTime}'</span>
            </div>
            <div className="flex items-center">
                <Icon name="servings" className="w-4 h-4 mr-1"/> 
                <span>{recipe.servings} {t('recipe_detail_servings')}</span>
            </div>
            {averageRating > 0 && (
              <StarRating
                rating={averageRating}
                size="sm"
                readonly
                showCount
                count={recipe.ratings?.length}
              />
            )}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;