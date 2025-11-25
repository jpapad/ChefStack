import React, { useState, useEffect } from 'react';
import { ShiftSchedule, User } from '../../types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
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
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{scheduleToEdit ? t('schedule_form_edit_title') : t('schedule_form_create_title')}</DialogTitle>
          <DialogDescription>
            {t('schedule_form_description') || 'Ορίστε τα μέλη της ομάδας και το χρονικό διάστημα'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 overflow-y-auto max-h-[60vh]">
            <div className="grid gap-2">
              <Label htmlFor="name">{t('schedule_form_name')} *</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="π.χ. Βάρδια Εβδομάδας 1"
                required
              />
            </div>
            <div className="grid gap-2">
                <Label>{t('schedule_form_date_range')}</Label>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startDate" className="text-xs text-muted-foreground">Έναρξη</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endDate" className="text-xs text-muted-foreground">Λήξη</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                      />
                    </div>
                </div>
            </div>
            <div className="grid gap-2">
                <Label>{t('schedule_form_team_members')}</Label>
                 <div className="max-h-48 overflow-y-auto space-y-2 rounded-md border p-3">
                    {teamMembers.map(user => (
                        <div key={user.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer">
                            <Checkbox
                                id={`user-${user.id}`}
                                checked={userIds.includes(user.id)}
                                onCheckedChange={() => handleUserToggle(user.id)}
                            />
                            <Label
                              htmlFor={`user-${user.id}`}
                              className="flex-1 cursor-pointer font-normal"
                            >
                              {user.name}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit">
              {t('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleForm;
