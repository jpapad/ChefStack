import React, { useState, useMemo } from 'react';
import { Recipe, RecipeSchedule, User } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

interface ScheduledRecipesListProps {
  schedules: RecipeSchedule[];
  recipes: Recipe[];
  users: User[];
  currentUserId: string;
  onUpdateSchedule: (schedule: RecipeSchedule) => void;
  onDeleteSchedule: (scheduleId: string) => void;
  onViewRecipe: (recipeId: string) => void;
}

export const ScheduledRecipesList: React.FC<ScheduledRecipesListProps> = ({
  schedules,
  recipes,
  users,
  currentUserId,
  onUpdateSchedule,
  onDeleteSchedule,
  onViewRecipe
}) => {
  const { t, language } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'today' | 'completed'>('upcoming');

  const today = new Date().toISOString().split('T')[0];

  const filteredSchedules = useMemo(() => {
    let filtered = [...schedules];

    switch (filter) {
      case 'today':
        filtered = filtered.filter(s => s.scheduledDate === today);
        break;
      case 'upcoming':
        filtered = filtered.filter(s => 
          s.scheduledDate >= today && 
          s.status === 'pending'
        );
        break;
      case 'completed':
        filtered = filtered.filter(s => s.status === 'completed');
        break;
      case 'all':
      default:
        break;
    }

    return filtered.sort((a, b) => {
      // Sort by date, then time
      if (a.scheduledDate !== b.scheduledDate) {
        return a.scheduledDate.localeCompare(b.scheduledDate);
      }
      return (a.scheduledTime || '').localeCompare(b.scheduledTime || '');
    });
  }, [schedules, filter, today]);

  const getRecipe = (recipeId: string) => {
    return recipes.find(r => r.id === recipeId);
  };

  const getUser = (userId: string) => {
    return users.find(u => u.id === userId);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const isToday = dateStr === today;
    const isTomorrow = dateStr === new Date(Date.now() + 86400000).toISOString().split('T')[0];

    if (isToday) return t('today');
    if (isTomorrow) return t('tomorrow');

    return new Intl.DateTimeFormat(language === 'el' ? 'el-GR' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status: RecipeSchedule['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'in_progress':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'cancelled':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  const handleUpdateStatus = (schedule: RecipeSchedule, newStatus: RecipeSchedule['status']) => {
    onUpdateSchedule({
      ...schedule,
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
  };

  if (schedules.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="calendar" className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          {t('no_scheduled_recipes')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'today', 'upcoming', 'completed'] as const).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === filterOption
                ? 'bg-brand-yellow text-black'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {t(`schedule_filter_${filterOption}`)}
          </button>
        ))}
      </div>

      {/* Schedules List */}
      <div className="space-y-3">
        {filteredSchedules.length === 0 ? (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t('no_schedules_found')}
          </p>
        ) : (
          filteredSchedules.map((schedule) => {
            const recipe = getRecipe(schedule.recipeId);
            if (!recipe) return null;

            const recipeName = language === 'el' ? recipe.name : (recipe.name_en || recipe.name);
            const createdBy = getUser(schedule.createdBy);
            const assignedUsers = (schedule.assignedTo || []).map(id => getUser(id)).filter(Boolean) as User[];

            return (
              <div
                key={schedule.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Recipe Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => onViewRecipe(recipe.id)}
                        className="text-lg font-bold text-gray-900 dark:text-white hover:text-brand-yellow transition-colors truncate"
                      >
                        {recipeName}
                      </button>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(schedule.status)}`}>
                        {t(`schedule_status_${schedule.status}`)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="flex items-center gap-1">
                        <Icon name="calendar" className="w-4 h-4" />
                        {formatDate(schedule.scheduledDate)}
                      </span>
                      {schedule.scheduledTime && (
                        <span className="flex items-center gap-1">
                          <Icon name="clock" className="w-4 h-4" />
                          {schedule.scheduledTime}
                        </span>
                      )}
                      {schedule.servings && (
                        <span className="flex items-center gap-1">
                          <Icon name="users" className="w-4 h-4" />
                          {schedule.servings} {t('servings')}
                        </span>
                      )}
                      {schedule.recurrence && schedule.recurrence !== 'none' && (
                        <span className="flex items-center gap-1">
                          <Icon name="refresh-cw" className="w-4 h-4" />
                          {t(`recurrence_${schedule.recurrence}`)}
                        </span>
                      )}
                    </div>

                    {schedule.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <Icon name="file" className="w-3 h-3 inline mr-1" />
                        {schedule.notes}
                      </p>
                    )}

                    {assignedUsers.length > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="user-plus" className="w-4 h-4 text-gray-500" />
                        <div className="flex flex-wrap gap-1">
                          {assignedUsers.map((user) => (
                            <span
                              key={user.id}
                              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300"
                            >
                              {user.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {t('created_by')} {createdBy?.name || 'Unknown'} • {new Date(schedule.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2">
                    {schedule.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(schedule, 'in_progress')}
                        className="p-2 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
                        title={t('start_preparation')}
                      >
                        <Icon name="play" className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      </button>
                    )}
                    {schedule.status === 'in_progress' && (
                      <button
                        onClick={() => handleUpdateStatus(schedule, 'completed')}
                        className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                        title={t('mark_completed')}
                      >
                        <Icon name="check-circle-2" className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </button>
                    )}
                    {(schedule.status === 'pending' || schedule.status === 'in_progress') && (
                      <button
                        onClick={() => handleUpdateStatus(schedule, 'cancelled')}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title={t('cancel')}
                      >
                        <Icon name="x" className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteSchedule(schedule.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title={t('delete')}
                    >
                      <Icon name="trash-2" className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
