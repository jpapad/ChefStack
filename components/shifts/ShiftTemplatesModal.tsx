import React, { useState } from 'react';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';
import { ShiftTypeKey, SHIFT_TYPE_DETAILS, User } from '../../types';

interface ShiftTemplate {
  id: string;
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  assignments: {
    dayOfWeek: number; // 0=Sunday, 1=Monday, etc.
    shiftType: ShiftTypeKey;
    startTime: string;
    endTime: string;
  }[];
}

interface ShiftTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (template: ShiftTemplate, userIds: string[], startDate: string) => void;
  users: User[];
  scheduleStartDate: string;
  scheduleEndDate: string;
}

const PREDEFINED_TEMPLATES: ShiftTemplate[] = [
  {
    id: 'weekday-standard',
    name: 'Καθημερινή Κανονική',
    name_en: 'Weekday Standard',
    description: 'Δευτέρα-Παρασκευή, 8ωρο',
    description_en: 'Monday-Friday, 8 hours',
    assignments: [
      { dayOfWeek: 1, shiftType: 'morning', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 2, shiftType: 'morning', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 3, shiftType: 'morning', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 4, shiftType: 'morning', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 5, shiftType: 'morning', startTime: '09:00', endTime: '17:00' },
    ],
  },
  {
    id: 'weekend-only',
    name: 'Μόνο Σαββατοκύριακο',
    name_en: 'Weekend Only',
    description: 'Σάββατο-Κυριακή, 8ωρο',
    description_en: 'Saturday-Sunday, 8 hours',
    assignments: [
      { dayOfWeek: 6, shiftType: 'morning', startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 0, shiftType: 'morning', startTime: '10:00', endTime: '18:00' },
    ],
  },
  {
    id: 'split-shift',
    name: 'Διπλή Βάρδια',
    name_en: 'Split Shift',
    description: 'Πρωί-Απόγευμα εναλλάξ',
    description_en: 'Morning-Evening alternating',
    assignments: [
      { dayOfWeek: 1, shiftType: 'morning', startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 2, shiftType: 'evening', startTime: '14:00', endTime: '22:00' },
      { dayOfWeek: 3, shiftType: 'morning', startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 4, shiftType: 'evening', startTime: '14:00', endTime: '22:00' },
      { dayOfWeek: 5, shiftType: 'morning', startTime: '08:00', endTime: '16:00' },
    ],
  },
  {
    id: 'full-week',
    name: 'Ολόκληρη Εβδομάδα',
    name_en: 'Full Week',
    description: 'Όλες τις μέρες, πρωινή',
    description_en: 'All days, morning shift',
    assignments: [
      { dayOfWeek: 1, shiftType: 'morning', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 2, shiftType: 'morning', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 3, shiftType: 'morning', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 4, shiftType: 'morning', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 5, shiftType: 'morning', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 6, shiftType: 'morning', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 0, shiftType: 'morning', startTime: '09:00', endTime: '17:00' },
    ],
  },
  {
    id: 'evening-shift',
    name: 'Απογευματινές Βάρδιες',
    name_en: 'Evening Shifts',
    description: 'Δευ-Παρ, 14:00-22:00',
    description_en: 'Mon-Fri, 14:00-22:00',
    assignments: [
      { dayOfWeek: 1, shiftType: 'evening', startTime: '14:00', endTime: '22:00' },
      { dayOfWeek: 2, shiftType: 'evening', startTime: '14:00', endTime: '22:00' },
      { dayOfWeek: 3, shiftType: 'evening', startTime: '14:00', endTime: '22:00' },
      { dayOfWeek: 4, shiftType: 'evening', startTime: '14:00', endTime: '22:00' },
      { dayOfWeek: 5, shiftType: 'evening', startTime: '14:00', endTime: '22:00' },
    ],
  },
];

const ShiftTemplatesModal: React.FC<ShiftTemplatesModalProps> = ({
  isOpen,
  onClose,
  onApply,
  users,
  scheduleStartDate,
  scheduleEndDate,
}) => {
  const { t, language } = useTranslation();
  const [selectedTemplate, setSelectedTemplate] = useState<ShiftTemplate | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(scheduleStartDate);

  const handleApply = () => {
    if (!selectedTemplate || selectedUsers.length === 0) {
      alert(t('shifts_template_select_required'));
      return;
    }

    onApply(selectedTemplate, selectedUsers, startDate);
    onClose();
    setSelectedTemplate(null);
    setSelectedUsers([]);
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(users.map(u => u.id));
  };

  const clearAllUsers = () => {
    setSelectedUsers([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/20 dark:border-slate-700/50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Icon name="layout-template" className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{t('shifts_templates')}</h3>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {t('shifts_templates_description')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-semibold mb-3">{t('shifts_select_template')}</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PREDEFINED_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-brand-yellow bg-brand-yellow/10'
                      : 'border-gray-300 dark:border-gray-600 hover:border-brand-yellow/50'
                  }`}
                >
                  <div className="font-semibold text-lg">
                    {language === 'el' ? template.name : template.name_en}
                  </div>
                  <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                    {language === 'el' ? template.description : template.description_en}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.assignments.map((assignment, idx) => (
                      <span
                        key={idx}
                        className={`text-xs px-2 py-1 rounded ${SHIFT_TYPE_DETAILS[assignment.shiftType].color}`}
                      >
                        {SHIFT_TYPE_DETAILS[assignment.shiftType][language === 'el' ? 'short_el' : 'short_en']}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* User Selection */}
          {selectedTemplate && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold">{t('shifts_select_users')}</label>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllUsers}
                    className="text-xs px-3 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  >
                    {t('shifts_select_all')}
                  </button>
                  <button
                    onClick={clearAllUsers}
                    className="text-xs px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded-full hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    {t('shifts_clear_all')}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                {users.map(user => (
                  <label
                    key={user.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="w-4 h-4 text-brand-yellow focus:ring-brand-yellow rounded"
                    />
                    <span className="text-sm">{user.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Start Date */}
          {selectedTemplate && selectedUsers.length > 0 && (
            <div>
              <label className="block text-sm font-semibold mb-2">{t('shifts_template_start_date')}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={scheduleStartDate}
                max={scheduleEndDate}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
              />
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                {t('shifts_template_start_info')}
              </p>
            </div>
          )}

          {/* Preview */}
          {selectedTemplate && selectedUsers.length > 0 && (
            <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Icon name="info" className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-semibold mb-1">{t('shifts_template_preview')}</p>
                  <p>
                    {language === 'el'
                      ? `${selectedUsers.length} ${selectedUsers.length === 1 ? 'άτομο' : 'άτομα'} θα λάβουν ${selectedTemplate.assignments.length} ${selectedTemplate.assignments.length === 1 ? 'βάρδια' : 'βάρδιες'} την εβδομάδα`
                      : `${selectedUsers.length} ${selectedUsers.length === 1 ? 'person' : 'people'} will receive ${selectedTemplate.assignments.length} ${selectedTemplate.assignments.length === 1 ? 'shift' : 'shifts'} per week`}
                  </p>
                </div>
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
            onClick={handleApply}
            disabled={!selectedTemplate || selectedUsers.length === 0}
            className="flex-1 px-4 py-3 bg-brand-yellow hover:bg-brand-yellow-dark text-black rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Icon name="check" className="w-4 h-4" />
            {t('shifts_apply_template')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftTemplatesModal;
