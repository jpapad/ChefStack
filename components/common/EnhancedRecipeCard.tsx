import React, { useMemo } from 'react';
import { Recipe } from '../../types';
import { Icon } from './Icon';
import StarRating from './StarRating';
import { Badge } from './Badge';
import { useTranslation } from '../../i18n';
import { Button } from '../ui/button';

interface EnhancedRecipeCardProps {
  recipe: Recipe;
  isSelected: boolean;
  onClick: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onAddToMenu?: () => void;
  onToggleFavorite?: () => void;
  showQuickActions?: boolean;
}

export const EnhancedRecipeCard: React.FC<EnhancedRecipeCardProps> = ({
  recipe,
  isSelected,
  onClick,
  onEdit,
  onDuplicate,
  onAddToMenu,
  onToggleFavorite,
  showQuickActions = true
}) => {
  const { t, language } = useTranslation();

  const displayName = language === 'en' && recipe.name_en ? recipe.name_en : recipe.name;
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  // Calculate average rating
  const averageRating = useMemo(() => {
    if (!recipe.ratings || recipe.ratings.length === 0) return 0;
    const sum = recipe.ratings.reduce((acc, r) => acc + r.rating, 0);
    return sum / recipe.ratings.length;
  }, [recipe.ratings]);

  // Determine badges
  const isPopular = averageRating >= 4.5 && recipe.ratings && recipe.ratings.length >= 5;
  const isQuick = totalTime < 30;
  const isNew = recipe.createdAt && 
    (new Date().getTime() - new Date(recipe.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;

  return (
    <div
      className={`stagger-item card-elevated-1 relative group rounded-2xl overflow-hidden border transition-all cursor-pointer ${
        isSelected
          ? 'border-brand-yellow ring-2 ring-brand-yellow/40 scale-[1.02]'
          : 'border-slate-100 dark:border-slate-800 hover:border-brand-yellow/70 hover:shadow-xl hover:scale-[1.02]'
      }`}
      onClick={onClick}
    >
      {/* Image with badges */}
      <div className="relative h-48 w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
        {recipe.imageUrl ? (
          <>
            <img
              src={recipe.imageUrl}
              alt={displayName}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="utensils" className="w-12 h-12 text-slate-300 dark:text-slate-600" />
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {isNew && <Badge variant="success" size="sm">🆕 Νέο</Badge>}
          {isPopular && <Badge variant="warning" size="sm">🔥 Popular</Badge>}
          {isQuick && <Badge variant="info" size="sm">⚡ Γρήγορο</Badge>}
          {recipe.difficulty === 'easy' && <Badge variant="success" size="sm">Εύκολο</Badge>}
        </div>

        {/* Favorite button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:scale-110 transition-transform"
            aria-label={recipe.isFavorite ? 'Αφαίρεση από αγαπημένα' : 'Προσθήκη στα αγαπημένα'}
          >
            <Icon 
              name={recipe.isFavorite ? 'star' : 'star'} 
              className={`w-5 h-5 ${recipe.isFavorite ? 'text-yellow-500 fill-current' : 'text-slate-400'}`}
            />
          </button>
        )}

        {/* Quick actions (visible on hover) */}
        {showQuickActions && (
          <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {onEdit && (
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="backdrop-blur-sm bg-white/90 dark:bg-slate-800/90"
              >
                <Icon name="edit" className="w-4 h-4 mr-1" />
                Επεξ/σία
              </Button>
            )}
            {onDuplicate && (
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
                className="backdrop-blur-sm bg-white/90 dark:bg-slate-800/90"
              >
                <Icon name="copy" className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
        {/* Title & Category */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 flex-1">
              {displayName}
            </h3>
            {recipe.category && (
              <Badge variant="default" size="sm">
                {t(`recipe_category_${recipe.category}`)}
              </Badge>
            )}
          </div>
          {recipe.name_en && language === 'el' && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {recipe.name_en}
            </p>
          )}
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {totalTime > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent">
              <Icon name="clock" className="w-3 h-3" />
              {totalTime}′
            </span>
          )}
          {recipe.servings && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent">
              <Icon name="users" className="w-3 h-3" />
              {recipe.servings}
            </span>
          )}
          {recipe.price && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success">
              <Icon name="euro" className="w-3 h-3" />
              {recipe.price.toFixed(2)}
            </span>
          )}
          {averageRating > 0 && (
            <div className="flex items-center gap-1">
              <StarRating rating={averageRating} size="sm" readonly />
              <span className="text-xs">({recipe.ratings?.length || 0})</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
              >
                #{tag}
              </span>
            ))}
            {recipe.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{recipe.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Hover preview (ingredient count) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs text-muted-foreground border-t border-border pt-2 mt-2">
          <div className="flex items-center justify-between">
            <span>{recipe.ingredients.length} υλικά</span>
            <span>{recipe.steps.filter(s => s.type === 'step').length} βήματα</span>
            {recipe.allergens && recipe.allergens.length > 0 && (
              <span className="text-warning">{recipe.allergens.length} αλλεργιογόνα</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedRecipeCard;
