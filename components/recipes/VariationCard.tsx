import React from 'react';
import { RecipeVariation, Recipe, VARIATION_TYPE_TRANSLATIONS } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

interface VariationCardProps {
  variation: RecipeVariation;
  parentRecipe: Recipe;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

const VariationCard: React.FC<VariationCardProps> = ({
  variation,
  parentRecipe,
  onEdit,
  onDelete,
  onToggleActive
}) => {
  const { language } = useTranslation();
  const typeConfig = VARIATION_TYPE_TRANSLATIONS[variation.variationType];

  const getModificationSummary = () => {
    const counts = {
      add: 0,
      remove: 0,
      replace: 0,
      scale: 0
    };

    variation.ingredientModifications.forEach(mod => {
      counts[mod.action]++;
    });

    const parts: string[] = [];
    if (counts.add > 0) parts.push(`+${counts.add}`);
    if (counts.remove > 0) parts.push(`-${counts.remove}`);
    if (counts.replace > 0) parts.push(`~${counts.replace}`);
    if (counts.scale > 0) parts.push(`×${counts.scale}`);

    return parts.join(' ');
  };

  return (
    <div className={`p-4 rounded-lg border-2 transition-all ${
      variation.isActive
        ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
        : 'bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-600 opacity-60'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${
            variation.isActive 
              ? 'bg-blue-100 dark:bg-blue-900' 
              : 'bg-gray-200 dark:bg-gray-700'
          }`}>
            <Icon name={typeConfig.icon as any} className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              {language === 'el' ? variation.name : variation.name_en}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {typeConfig[language]}
            </p>
          </div>
        </div>

        <button
          onClick={onToggleActive}
          className={`px-2 py-1 rounded text-xs font-medium ${
            variation.isActive
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
          }`}
        >
          {variation.isActive 
            ? (language === 'el' ? 'Ενεργή' : 'Active')
            : (language === 'el' ? 'Ανενεργή' : 'Inactive')
          }
        </button>
      </div>

      {/* Description */}
      {variation.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {variation.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 mb-3 text-sm">
        {variation.scaleFactor && variation.scaleFactor !== 1.0 && (
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <Icon name="scale" className="w-4 h-4" />
            <span>{variation.scaleFactor}x</span>
          </div>
        )}

        {variation.ingredientModifications.length > 0 && (
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <Icon name="shuffle" className="w-4 h-4" />
            <span>{getModificationSummary()}</span>
          </div>
        )}

        {variation.allergenChanges && variation.allergenChanges.length > 0 && (
          <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
            <Icon name="alert-triangle" className="w-4 h-4" />
            <span>{variation.allergenChanges.length}</span>
          </div>
        )}
      </div>

      {/* Seasonal Period */}
      {variation.seasonalPeriod && (
        <div className="mb-3 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center gap-2 text-sm">
          <Icon name="sun" className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <span className="text-yellow-700 dark:text-yellow-300">
            {language === 'el' ? 'Μήνες' : 'Months'} {variation.seasonalPeriod.startMonth}-{variation.seasonalPeriod.endMonth}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-slate-700">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          <Icon name="edit" className="w-4 h-4" />
          <span className="text-sm">{language === 'el' ? 'Επεξεργασία' : 'Edit'}</span>
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-lg transition-colors"
        >
          <Icon name="trash-2" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default VariationCard;
