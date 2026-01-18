import React from 'react';
import { RecipeSchedule, Recipe, User } from '../../types';
import { ScheduledRecipesList } from '../recipes/ScheduledRecipesList';
import { useTranslation } from '../../i18n';

interface SchedulesViewProps {
  schedules: RecipeSchedule[];
  recipes: Recipe[];
  users: User[];
  currentUserId: string;
  onUpdateSchedule: (schedule: RecipeSchedule) => void;
  onDeleteSchedule: (scheduleId: string) => void;
}

export const SchedulesView: React.FC<SchedulesViewProps> = ({
  schedules,
  recipes,
  users,
  currentUserId,
  onUpdateSchedule,
  onDeleteSchedule
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('scheduled_recipes')}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {t('manage_recipe_schedules')}
        </p>
      </div>

      {/* Scheduled Recipes List */}
      <ScheduledRecipesList
        schedules={schedules}
        recipes={recipes}
        users={users}
        currentUserId={currentUserId}
        onUpdateStatus={(scheduleId, status) => {
          const schedule = schedules.find(s => s.id === scheduleId);
          if (schedule) {
            onUpdateSchedule({ ...schedule, status });
          }
        }}
        onDelete={onDeleteSchedule}
      />
    </div>
  );
};
