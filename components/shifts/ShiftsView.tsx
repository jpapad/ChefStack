import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Shift, User, Role, ShiftTypeKey, SHIFT_TYPE_KEYS, SHIFT_TYPE_DETAILS, ShiftSchedule, RolePermissions } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';
import PrintPreview from '../common/PrintPreview';
import PrintableSchedule from './PrintableSchedule';
import ScheduleList from './ScheduleList';
import ScheduleForm from './ScheduleForm';
import ConfirmationModal from '../common/ConfirmationModal';
import { api } from '../../services/api';

interface ShiftsViewProps {
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
  shiftSchedules: ShiftSchedule[];
  setShiftSchedules: React.Dispatch<React.SetStateAction<ShiftSchedule[]>>;
  allUsers: User[];
  currentTeamId: string;
  currentUserRole?: Role;
  rolePermissions: RolePermissions;
}

const toISODateString = (date: Date) => date.toISOString().split('T')[0];

const formatDate = (date: Date, options: Intl.DateTimeFormatOptions): string => {
  return new Intl.DateTimeFormat('el-GR', options).format(date);
};

const ShiftsView: React.FC<ShiftsViewProps> = ({ shifts, setShifts, shiftSchedules, setShiftSchedules, allUsers, currentTeamId, currentUserRole, rolePermissions }) => {
  const { t, language } = useTranslation();
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(shiftSchedules[0]?.id || null);

  // Form & Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<ShiftSchedule | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<ShiftSchedule | null>(null);

  const [editingCell, setEditingCell] = useState<{ userId: string; date: string } | null>(null);
  const [printPreviewContent, setPrintPreviewContent] = useState<React.ReactNode | null>(null);
  const selectorRef = useRef<HTMLDivElement>(null);
  
  const canManage = currentUserRole ? rolePermissions[currentUserRole]?.includes('manage_shifts') : false;

  const teamMembers = useMemo(() =>
    allUsers.filter(u => u.memberships.some(m => m.teamId === currentTeamId))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [allUsers, currentTeamId]
  );
  
  const selectedSchedule = useMemo(() =>
      shiftSchedules.find(s => s.id === selectedScheduleId),
      [shiftSchedules, selectedScheduleId]
  );

  const shiftsMap = useMemo(() => {
    const map = new Map<string, Shift>();
    shifts
      .filter(s => s.teamId === currentTeamId)
      .forEach(shift => {
        map.set(`${shift.userId}-${shift.date}`, shift);
      });
    return map;
  }, [shifts, currentTeamId]);


  const handleOpenForm = (schedule: ShiftSchedule | null) => {
    setScheduleToEdit(schedule);
    setIsFormOpen(true);
  };

  const handleSaveSchedule = async (data: Omit<ShiftSchedule, 'id'> | ShiftSchedule) => {
    const savedSchedule = await api.saveShiftSchedule(data);
    setShiftSchedules(prev => {
      const exists = prev.some(s => s.id === savedSchedule.id);
      return exists ? prev.map(s => s.id === savedSchedule.id ? savedSchedule : s) : [...prev, savedSchedule];
    });
    setIsFormOpen(false);
    setScheduleToEdit(null);
    if (!('id' in data)) {
        setSelectedScheduleId(savedSchedule.id);
    }
  };
  
  const handleConfirmDelete = async () => {
    if (scheduleToDelete) {
        await api.deleteShiftSchedule(scheduleToDelete.id);
        setShiftSchedules(prev => prev.filter(s => s.id !== scheduleToDelete.id));
        if(selectedScheduleId === scheduleToDelete.id) {
            setSelectedScheduleId(shiftSchedules[0]?.id || null);
        }
        setScheduleToDelete(null);
    }
  };

  const handleCellClick = (userId: string, date: string) => {
    if (canManage) {
      setEditingCell({ userId, date });
    }
  };

  const handleShiftSelect = (type: ShiftTypeKey) => {
    if (!editingCell) return;
    const { userId, date } = editingCell;
    const existingShift = shiftsMap.get(`${userId}-${date}`);

    if (existingShift) {
      setShifts(prev => prev.map(s => s.id === existingShift.id ? { ...s, type } : s));
    } else {
      const newShift: Shift = { id: `shift-${Date.now()}`, userId, teamId: currentTeamId, date, type };
      setShifts(prev => [...prev, newShift]);
    }
    setEditingCell(null);
  };

  const handlePrint = () => {
    if (selectedSchedule) {
        setPrintPreviewContent(
            <PrintableSchedule
                schedule={selectedSchedule}
                allUsers={allUsers}
                shiftsMap={shiftsMap}
            />
        );
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setEditingCell(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderGrid = (schedule: ShiftSchedule) => {
      const scheduleUsers = teamMembers.filter(u => schedule.userIds.includes(u.id));
      
      const displayDates = [];
      let currentDate = new Date(schedule.startDate);
      currentDate.setMinutes(currentDate.getMinutes() + currentDate.getTimezoneOffset());
      const finalDate = new Date(schedule.endDate);
      finalDate.setMinutes(finalDate.getMinutes() + finalDate.getTimezoneOffset());
      
      while(currentDate <= finalDate) {
          displayDates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
      }

      return (
        <div className="flex-1 overflow-auto">
            <div className="grid gap-px bg-gray-200/80 dark:bg-gray-700/50" style={{ gridTemplateColumns: `minmax(150px, 1.5fr) repeat(${displayDates.length}, minmax(80px, 1fr))`}}>
                {/* Header Row */}
                <div className="p-2 bg-light-card dark:bg-dark-card font-semibold sticky top-0 z-10">{t('schedule_form_team_members')}</div>
                {displayDates.map(date => (
                    <div key={date.toISOString()} className="p-2 text-center bg-light-card dark:bg-dark-card font-semibold sticky top-0 z-10">
                        <div>{formatDate(date, { weekday: 'short' })}</div>
                        <div className="text-lg font-bold">{formatDate(date, { day: 'numeric' })}</div>
                    </div>
                ))}

                {/* Data Rows */}
                {scheduleUsers.map(user => (
                    <React.Fragment key={user.id}>
                        <div className="p-2 bg-light-card dark:bg-dark-card font-medium flex items-center">{user.name}</div>
                        {displayDates.map(date => {
                            const dateString = toISODateString(date);
                            const shift = shiftsMap.get(`${user.id}-${dateString}`);
                            const isEditing = editingCell?.userId === user.id && editingCell?.date === dateString;
                            return (
                                <div
                                    key={dateString}
                                    onClick={() => handleCellClick(user.id, dateString)}
                                    className={`relative p-2 flex items-center justify-center text-center font-bold ${shift ? SHIFT_TYPE_DETAILS[shift.type].color : 'bg-light-card dark:bg-dark-card'} ${canManage ? 'cursor-pointer' : 'cursor-default'}`}
                                >
                                    {shift ? SHIFT_TYPE_DETAILS[shift.type][language === 'el' ? 'short_el' : 'short_en'] : '-'}
                                    {isEditing && (
                                        <div ref={selectorRef} className="absolute top-full mt-1 left-1/2 -translate-x-1/2 z-20 bg-white dark:bg-slate-900 rounded-lg shadow-xl border dark:border-slate-700 p-1 flex flex-col items-stretch">
                                            {SHIFT_TYPE_KEYS.map(type => (
                                                <button key={type} onClick={() => handleShiftSelect(type)} className={`px-3 py-1.5 text-sm font-semibold rounded-md text-left ${SHIFT_TYPE_DETAILS[type].color} hover:ring-2 ring-brand-yellow`}>
                                                    {SHIFT_TYPE_DETAILS[type][language]}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
      )
  };


  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        <div className={`h-full ${selectedScheduleId ? 'hidden lg:block' : 'lg:col-span-1'}`}>
           <ScheduleList 
             schedules={shiftSchedules}
             selectedScheduleId={selectedScheduleId}
             onSelectSchedule={setSelectedScheduleId}
             onAdd={() => handleOpenForm(null)}
             onEdit={handleOpenForm}
             onDelete={setScheduleToDelete}
             currentUserRole={currentUserRole}
           />
        </div>
        <div className={`lg:col-span-3 h-full flex flex-col ${!selectedScheduleId ? 'hidden lg:flex' : 'flex'}`}>
            {selectedSchedule ? (
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl h-full flex flex-col">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200/80 dark:border-gray-700/80 flex-wrap gap-2">
                        <button onClick={() => setSelectedScheduleId(null)} className="lg:hidden flex items-center gap-2 text-brand-yellow">
                            <Icon name="arrow-left" className="w-5 h-5"/>
                            {t('shifts_back_to_list')}
                        </button>
                        <h2 className="text-2xl font-bold font-heading">{selectedSchedule.name}</h2>
                        <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            <Icon name="printer" className="w-5 h-5" />
                            <span className="font-semibold text-sm">{t('shifts_print_schedule')}</span>
                        </button>
                    </div>
                    {renderGrid(selectedSchedule)}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-light-text-secondary dark:text-dark-text-secondary bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl">
                    <p>{t('shifts_select_prompt')}</p>
                </div>
            )}
        </div>
      </div>
      
      {printPreviewContent && (
        <PrintPreview onClose={() => setPrintPreviewContent(null)}>
            {printPreviewContent}
        </PrintPreview>
      )}

      <ScheduleForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveSchedule}
        scheduleToEdit={scheduleToEdit}
        teamId={currentTeamId}
        teamMembers={teamMembers}
      />
      
      <ConfirmationModal
        isOpen={!!scheduleToDelete}
        onClose={() => setScheduleToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={t('shifts_delete_schedule_title')}
        body={<p>{t('shifts_delete_schedule_body', { scheduleName: scheduleToDelete?.name || '' })}</p>}
      />
    </>
  );
};

export default ShiftsView;
