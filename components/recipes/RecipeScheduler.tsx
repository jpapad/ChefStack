import React, { useState, useMemo } from 'react';
import { Recipe, RecipeSchedule, User, ScheduleRecurrence } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

interface RecipeSchedulerProps {
  recipe: Recipe;
  existingSchedules: RecipeSchedule[];
  teamMembers: User[];
  currentUserId: string;
  onSave: (schedule: Omit<RecipeSchedule, 'id'>) => void;
  onCancel: () => void;
}

export const RecipeScheduler: React.FC<RecipeSchedulerProps> = ({
  recipe,
  existingSchedules,
  teamMembers,
  currentUserId,
  onSave,
  onCancel
}) => {
  const { t, language } = useTranslation();
  
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('12:00');
  const [servings, setServings] = useState(recipe.servings);
  const [notes, setNotes] = useState('');
  const [recurrence, setRecurrence] = useState<ScheduleRecurrence>('none');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [assignedTo, setAssignedTo] = useState<string[]>([]);

  const recipeName = language === 'el' ? recipe.name : (recipe.name_en || recipe.name);

  // Check if date already has a schedule for this recipe
  const dateConflict = useMemo(() => {
    return existingSchedules.find(
      s => s.recipeId === recipe.id && 
      s.scheduledDate === scheduledDate &&
      s.status !== 'cancelled'
    );
  }, [existingSchedules, recipe.id, scheduledDate]);

  const handleToggleAssignee = (userId: string) => {
    setAssignedTo(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = () => {
    const schedule: Omit<RecipeSchedule, 'id'> = {
      recipeId: recipe.id,
      teamId: recipe.teamId,
      scheduledDate,
      scheduledTime: scheduledTime || undefined,
      servings: servings !== recipe.servings ? servings : undefined,
      notes: notes.trim() || undefined,
      recurrence: recurrence !== 'none' ? recurrence : undefined,
      recurrenceEndDate: recurrence !== 'none' && recurrenceEndDate ? recurrenceEndDate : undefined,
      assignedTo: assignedTo.length > 0 ? assignedTo : undefined,
      status: 'pending',
      notificationSent: false,
      createdBy: currentUserId,
      createdAt: new Date().toISOString()
    };

    onSave(schedule);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-bg rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-dark-bg border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('schedule_recipe')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {recipeName}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <Icon name="x" className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Icon name="calendar" className="w-4 h-4 inline mr-1" />
                {t('scheduled_date')}
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
              />
              {dateConflict && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 flex items-center">
                  <Icon name="alert-triangle" className="w-3 h-3 mr-1" />
                  Already scheduled for this date
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Icon name="clock" className="w-4 h-4 inline mr-1" />
                {t('scheduled_time')} ({t('optional')})
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
              />
            </div>
          </div>

          {/* Servings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Icon name="users" className="w-4 h-4 inline mr-1" />
              {t('servings')} (Default: {recipe.servings})
            </label>
            <input
              type="number"
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
              min={1}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
            />
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Icon name="repeat" className="w-4 h-4 inline mr-1" />
              {t('recurrence')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['none', 'daily', 'weekly', 'monthly'] as ScheduleRecurrence[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRecurrence(option)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    recurrence === option
                      ? 'bg-brand-yellow text-black'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {t(`recurrence_${option}`)}
                </button>
              ))}
            </div>
            {recurrence !== 'none' && (
              <div className="mt-3">
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {t('recurrence_end_date')} ({t('optional')})
                </label>
                <input
                  type="date"
                  value={recurrenceEndDate}
                  onChange={(e) => setRecurrenceEndDate(e.target.value)}
                  min={scheduledDate}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Assign To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Icon name="user-check" className="w-4 h-4 inline mr-1" />
              {t('assign_to')} ({t('optional')})
            </label>
            <div className="flex flex-wrap gap-2">
              {teamMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => handleToggleAssignee(member.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    assignedTo.includes(member.id)
                      ? 'bg-brand-yellow text-black'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {assignedTo.includes(member.id) && (
                    <Icon name="check" className="w-3 h-3" />
                  )}
                  {member.name}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Icon name="file-text" className="w-4 h-4 inline mr-1" />
              {t('notes')} ({t('optional')})
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={t('schedule_notes_placeholder')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-yellow focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-brand-yellow hover:bg-yellow-500 text-black rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Icon name="check" className="w-5 h-5" />
            {t('schedule_recipe')}
          </button>
        </div>
      </div>
    </div>
  );
};
