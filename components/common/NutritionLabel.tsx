import React from 'react';
import { NutritionInfo } from '../../types';
import { useTranslation } from '../../i18n';

interface NutritionLabelProps {
  nutrition: NutritionInfo;
  servings: number;
}

export const NutritionLabel: React.FC<NutritionLabelProps> = ({ nutrition, servings }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-dark-card border-2 border-slate-900 dark:border-slate-300 p-2 max-w-sm font-sans text-slate-900 dark:text-dark-text-primary">
      {/* Title */}
      <div className="border-b-8 border-slate-900 dark:border-slate-300 pb-1">
        <h3 className="text-3xl font-bold">{t('nutrition_facts')}</h3>
        <p className="text-sm">{servings} {t('servings_per_recipe')}</p>
      </div>

      {/* Calories */}
      <div className="border-b-4 border-slate-900 dark:border-slate-300 py-1">
        <div className="flex justify-between items-baseline">
          <span className="text-xs font-bold">{t('calories_per_serving')}</span>
          <span className="text-4xl font-bold">{Math.round(nutrition.calories)}</span>
        </div>
      </div>

      {/* % Daily Value header */}
      <div className="border-b border-slate-900 dark:border-slate-300 py-1 text-right">
        <span className="text-xs font-bold">% {t('daily_value')}*</span>
      </div>

      {/* Macronutrients */}
      <div className="border-b-4 border-slate-900 dark:border-slate-300">
        {/* Total Fat */}
        <div className="flex justify-between py-1 border-b border-slate-400 dark:border-slate-600">
          <span className="font-bold text-sm">
            {t('total_fat')} <span className="font-normal">{nutrition.fat.toFixed(1)}g</span>
          </span>
          <span className="font-bold text-sm">{((nutrition.fat / 78) * 100).toFixed(0)}%</span>
        </div>

        {/* Total Carbohydrate */}
        <div className="py-1 border-b border-slate-400 dark:border-slate-600">
          <div className="flex justify-between">
            <span className="font-bold text-sm">
              {t('total_carbs')} <span className="font-normal">{nutrition.carbs.toFixed(1)}g</span>
            </span>
            <span className="font-bold text-sm">{((nutrition.carbs / 275) * 100).toFixed(0)}%</span>
          </div>
          {/* Dietary Fiber */}
          {nutrition.fiber !== undefined && nutrition.fiber > 0 && (
            <div className="flex justify-between pl-4 mt-1">
              <span className="text-sm">
                {t('dietary_fiber')} <span className="font-normal">{nutrition.fiber.toFixed(1)}g</span>
              </span>
              <span className="text-sm">{((nutrition.fiber / 28) * 100).toFixed(0)}%</span>
            </div>
          )}
          {/* Sugars */}
          {nutrition.sugar !== undefined && nutrition.sugar > 0 && (
            <div className="flex justify-between pl-4 mt-1">
              <span className="text-sm">
                {t('sugars')} <span className="font-normal">{nutrition.sugar.toFixed(1)}g</span>
              </span>
            </div>
          )}
        </div>

        {/* Protein */}
        <div className="flex justify-between py-1">
          <span className="font-bold text-sm">
            {t('protein')} <span className="font-normal">{nutrition.protein.toFixed(1)}g</span>
          </span>
          <span className="font-bold text-sm">{((nutrition.protein / 50) * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Sodium */}
      {nutrition.sodium !== undefined && nutrition.sodium > 0 && (
        <div className="border-b-4 border-slate-900 dark:border-slate-300 py-1">
          <div className="flex justify-between">
            <span className="font-bold text-sm">
              {t('sodium')} <span className="font-normal">{Math.round(nutrition.sodium)}mg</span>
            </span>
            <span className="font-bold text-sm">{((nutrition.sodium / 2300) * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-xs pt-2 border-t-4 border-slate-900 dark:border-slate-300">
        <p className="mb-1">* {t('daily_value_disclaimer')}</p>
        {nutrition.isCalculated && (
          <p className="italic text-slate-600 dark:text-slate-400">{t('calculated_nutrition_note')}</p>
        )}
      </div>
    </div>
  );
};
