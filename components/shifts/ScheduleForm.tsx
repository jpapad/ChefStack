import React, { useState, useEffect } from 'react';
import { ShiftSchedule, User } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

interface ScheduleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ShiftSchedule, 'id'> | ShiftSchedule) => void;
  scheduleToEdit: ShiftSchedule | null;
  teamId: string;
  teamMembers: User[];
}

const toISODateString = (date: Date) => date.toISOString().split('T')[0];

const ScheduleForm: React.FC<ScheduleFormProps> = ({ isOpen, onClose, onSave, scheduleToEdit, teamId, teamMembers }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(toISODateString(new Date()));
  const [endDate, setEndDate] = useState(toISODateString(new Date()));
  const [userIds, setUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (scheduleToEdit) {
      setName(scheduleToEdit.name);
      setStartDate(scheduleToEdit.startDate);
      setEndDate(scheduleToEdit.endDate);
      setUserIds(scheduleToEdit.userIds);
    } else {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 6);

      setName('');
      setStartDate(toISODateString(today));
      setEndDate(toISODateString(nextWeek));
      setUserIds(teamMembers.map(m => m.id)); // Default to all members
    }
  }, [scheduleToEdit, isOpen, teamMembers]);

  const handleUserToggle = (userId: string) => {
    setUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = { name, startDate, endDate, userIds, teamId };
    onSave(scheduleToEdit ? { ...scheduleToEdit, ...data } : data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <header className="flex items-center justify-between p-4 border-b border-gray-200/80 dark:border-gray-700/80">
            <h3 className="text-xl font-semibold">{scheduleToEdit ? t('schedule_form_edit_title') : t('schedule_form_create_title')}</h3>
            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
              <Icon name="x" className="w-6 h-6" />
            </button>
          </header>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium mb-1">{t('schedule_form_name')}</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg" required />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">{t('schedule_form_date_range')}</label>
                <div className="grid grid-cols-2 gap-4">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg" />
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">{t('schedule_form_team_members')}</label>
                 <div className="max-h-48 overflow-y-auto space-y-2 rounded-md border dark:border-gray-600 p-2 bg-light-bg dark:bg-dark-bg">
                    {teamMembers.map(user => (
                        <label key={user.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={userIds.includes(user.id)}
                                onChange={() => handleUserToggle(user.id)}
                                className="h-4 w-4 rounded border-gray-300 text-brand-secondary focus:ring-brand-primary"
                            />
                            {user.name}
                        </label>
                    ))}
                </div>
            </div>
          </div>
          <footer className="p-4 flex justify-end gap-4 bg-black/5 dark:bg-white/5 rounded-b-2xl">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 font-semibold">{t('cancel')}</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-brand-dark text-white hover:opacity-90 font-semibold">{t('save')}</button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default ScheduleForm;
