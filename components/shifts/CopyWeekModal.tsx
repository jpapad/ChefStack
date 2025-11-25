import React, { useState, useMemo } from 'react';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';
import { ShiftSchedule } from '../../types';

interface CopyWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopy: (sourceWeekStart: string, targetWeekStart: string, overwrite: boolean) => void;
  schedule: ShiftSchedule;
}

const CopyWeekModal: React.FC<CopyWeekModalProps> = ({
  isOpen,
  onClose,
  onCopy,
  schedule,
}) => {
  const { t } = useTranslation();
  const [sourceWeek, setSourceWeek] = useState('');
  const [targetWeek, setTargetWeek] = useState('');
  const [overwrite, setOverwrite] = useState(false);

  const weeks = useMemo(() => {
    const weekStarts: string[] = [];
    let currentDate = new Date(schedule.startDate);
    currentDate.setMinutes(currentDate.getMinutes() + currentDate.getTimezoneOffset());
    const finalDate = new Date(schedule.endDate);
    finalDate.setMinutes(finalDate.getMinutes() + finalDate.getTimezoneOffset());

    while (currentDate <= finalDate) {
      const dayOfWeek = currentDate.getDay();
      const monday = new Date(currentDate);
      monday.setDate(currentDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      
      const mondayStr = monday.toISOString().split('T')[0];
      if (!weekStarts.includes(mondayStr)) {
        weekStarts.push(mondayStr);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return weekStarts;
  }, [schedule]);

  const formatWeekLabel = (weekStart: string): string => {
    const date = new Date(weekStart);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    const endDate = new Date(date);
    endDate.setDate(date.getDate() + 6);
    
    return `${date.toLocaleDateString('el-GR', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('el-GR', { day: 'numeric', month: 'short' })}`;
  };

  const handleCopy = () => {
    if (!sourceWeek || !targetWeek) {
      alert(t('shifts_select_weeks'));
      return;
    }
    if (sourceWeek === targetWeek) {
      alert(t('shifts_same_week_error'));
      return;
    }
    onCopy(sourceWeek, targetWeek, overwrite);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-white/20 dark:border-slate-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-yellow/20 rounded-lg">
              <Icon name="copy" className="w-5 h-5 text-brand-yellow-dark" />
            </div>
            <h3 className="text-xl font-bold">{t('shifts_copy_week')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300">
            <div className="flex items-start gap-2">
              <Icon name="info" className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{t('shifts_copy_week_info')}</p>
            </div>
          </div>

          {/* Source Week */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              {t('shifts_source_week')}
            </label>
            <select
              value={sourceWeek}
              onChange={(e) => setSourceWeek(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
            >
              <option value="">{t('shifts_select_week')}</option>
              {weeks.map(week => (
                <option key={`source-${week}`} value={week}>
                  {formatWeekLabel(week)}
                </option>
              ))}
            </select>
          </div>

          {/* Target Week */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              {t('shifts_target_week')}
            </label>
            <select
              value={targetWeek}
              onChange={(e) => setTargetWeek(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
            >
              <option value="">{t('shifts_select_week')}</option>
              {weeks.map(week => (
                <option key={`target-${week}`} value={week}>
                  {formatWeekLabel(week)}
                </option>
              ))}
            </select>
          </div>

          {/* Overwrite Option */}
          <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
            <input
              type="checkbox"
              id="overwrite"
              checked={overwrite}
              onChange={(e) => setOverwrite(e.target.checked)}
              className="w-5 h-5 text-brand-yellow focus:ring-brand-yellow rounded"
            />
            <label htmlFor="overwrite" className="text-sm font-medium cursor-pointer flex-1">
              {t('shifts_overwrite_existing')}
            </label>
          </div>

          {!overwrite && (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 text-sm text-yellow-700 dark:text-yellow-300">
              <div className="flex items-start gap-2">
                <Icon name="alert-triangle" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{t('shifts_keep_existing_note')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleCopy}
            disabled={!sourceWeek || !targetWeek}
            className="flex-1 px-4 py-3 bg-brand-yellow hover:bg-brand-yellow-dark text-black rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Icon name="copy" className="w-4 h-4" />
            {t('shifts_copy')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CopyWeekModal;
