import React, { useState, useEffect } from 'react';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';
import { ShiftTypeKey, SHIFT_TYPE_DETAILS } from '../../types';

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (startTime: string, endTime: string) => void;
  shiftType: ShiftTypeKey;
  initialStartTime?: string;
  initialEndTime?: string;
}

const QUICK_TIMES = {
  morning: { start: '08:00', end: '16:00' },
  afternoon: { start: '14:00', end: '22:00' },
  evening: { start: '16:00', end: '00:00' },
  night: { start: '22:00', end: '06:00' },
  standard: { start: '09:00', end: '17:00' },
};

const TimePickerModal: React.FC<TimePickerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  shiftType,
  initialStartTime = '09:00',
  initialEndTime = '17:00',
}) => {
  const { t, language } = useTranslation();
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStartTime(initialStartTime);
      setEndTime(initialEndTime);
      setError('');
    }
  }, [isOpen, initialStartTime, initialEndTime]);

  const validateTime = (time: string): boolean => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(time);
  };

  const calculateDuration = (start: string, end: string): number => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    let startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;
    
    // Handle overnight shifts
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }
    
    return (endMinutes - startMinutes) / 60;
  };

  const handleSave = () => {
    if (!validateTime(startTime)) {
      setError(t('shifts_invalid_time_format'));
      return;
    }
    if (!validateTime(endTime)) {
      setError(t('shifts_invalid_time_format'));
      return;
    }

    const duration = calculateDuration(startTime, endTime);
    if (duration <= 0 || duration > 24) {
      setError(t('shifts_invalid_duration'));
      return;
    }

    onSave(startTime, endTime);
    onClose();
  };

  const handleQuickSelect = (preset: keyof typeof QUICK_TIMES) => {
    setStartTime(QUICK_TIMES[preset].start);
    setEndTime(QUICK_TIMES[preset].end);
    setError('');
  };

  if (!isOpen) return null;

  const duration = calculateDuration(startTime, endTime);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-white/20 dark:border-slate-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-bold">{t('shifts_set_time')}</h3>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
              {SHIFT_TYPE_DETAILS[shiftType][language]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Select Buttons */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-semibold mb-3">{t('shifts_quick_select')}</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickSelect('morning')}
              className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
            >
              {t('shifts_morning_shift')} (08:00-16:00)
            </button>
            <button
              onClick={() => handleQuickSelect('afternoon')}
              className="px-3 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors text-sm font-medium"
            >
              {t('shifts_afternoon_shift')} (14:00-22:00)
            </button>
            <button
              onClick={() => handleQuickSelect('evening')}
              className="px-3 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors text-sm font-medium"
            >
              {t('shifts_evening_shift')} (16:00-00:00)
            </button>
            <button
              onClick={() => handleQuickSelect('night')}
              className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm font-medium"
            >
              {t('shifts_night_shift')} (22:00-06:00)
            </button>
          </div>
        </div>

        {/* Manual Time Input */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">{t('shifts_start_time')}</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-brand-yellow focus:border-transparent text-lg font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">{t('shifts_end_time')}</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-brand-yellow focus:border-transparent text-lg font-mono"
            />
          </div>

          {/* Duration Display */}
          {duration > 0 && duration <= 24 && (
            <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-brand-yellow-dark dark:text-brand-yellow">
                <Icon name="clock" className="w-5 h-5" />
                <span className="font-semibold">
                  {t('shifts_duration')}: {duration.toFixed(1)}h
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-3 text-red-700 dark:text-red-300 text-sm">
              {error}
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
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-brand-yellow hover:bg-brand-yellow-dark text-black rounded-lg font-semibold transition-colors"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimePickerModal;
