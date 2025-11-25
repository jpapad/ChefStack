import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Shift, User, Role, ShiftTypeKey, SHIFT_TYPE_KEYS, SHIFT_TYPE_DETAILS, ShiftSchedule, RolePermissions } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';
import PrintPreview from '../common/PrintPreview';
import PrintableSchedule from './PrintableSchedule';
import ScheduleList from './ScheduleList';
import ScheduleForm from './ScheduleForm';
import ConfirmationModal from '../common/ConfirmationModal';
import TimePickerModal from './TimePickerModal';
import ShiftStatisticsPanel from './ShiftStatisticsPanel';
import CopyWeekModal from './CopyWeekModal';
import ShiftTemplatesModal from './ShiftTemplatesModal';
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

const calculateDuration = (startTime?: string, endTime?: string): number | null => {
  if (!startTime || !endTime) return null;
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;
  
  // Handle overnight shifts
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }
  
  return (endMinutes - startMinutes) / 60;
};

const ShiftsView: React.FC<ShiftsViewProps> = ({ shifts, setShifts, shiftSchedules, setShiftSchedules, allUsers, currentTeamId, currentUserRole, rolePermissions }) => {
  const { t, language } = useTranslation();
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(shiftSchedules[0]?.id || null);

  // Form & Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<ShiftSchedule | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<ShiftSchedule | null>(null);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isCopyWeekOpen, setIsCopyWeekOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');
  const [selectedWeekStart, setSelectedWeekStart] = useState<string | null>(null);
  const [draggedShift, setDraggedShift] = useState<Shift | null>(null);
  
  const [pendingShift, setPendingShift] = useState<{
    userId: string;
    date: string;
    type: ShiftTypeKey;
    existingShift?: Shift;
  } | null>(null);

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
    try {
      const savedSchedule = await api.saveShiftSchedule(data);
      const isNewSchedule = !('id' in data);
      
      setShiftSchedules(prev => {
        const exists = prev.some(s => s.id === savedSchedule.id);
        if (exists) {
          return prev.map(s => s.id === savedSchedule.id ? savedSchedule : s);
        } else {
          return [...prev, savedSchedule];
        }
      });
      
      setIsFormOpen(false);
      setScheduleToEdit(null);
      
      if (isNewSchedule) {
        setSelectedScheduleId(savedSchedule.id);
      }
    } catch (error: any) {
      console.error('[ShiftsView] Error saving schedule:', error);
      console.error('[ShiftsView] Error details:', error?.message || error);
      alert(`Σφάλμα αποθήκευσης: ${error?.message || 'Unknown error'}`);
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

    // Open time picker modal instead of prompts
    setPendingShift({
      userId,
      date,
      type,
      existingShift,
    });
    setIsTimePickerOpen(true);
    setEditingCell(null);
  };

  const handleTimeSave = async (startTime: string, endTime: string) => {
    if (!pendingShift) return;

    const { userId, date, type, existingShift } = pendingShift;

    if (existingShift) {
      const updated = { ...existingShift, type, startTime, endTime };
      await api.saveShift(updated);
      setShifts(prev => prev.map(s => s.id === existingShift.id ? updated : s));
    } else {
      const newShift: Shift = { 
        id: `shift-${Date.now()}`, 
        userId, 
        teamId: currentTeamId, 
        date, 
        type,
        startTime,
        endTime
      };
      await api.saveShift(newShift);
      setShifts(prev => [...prev, newShift]);
    }

    setPendingShift(null);
  };

  const handleApplyTemplate = (template: any, userIds: string[], startDate: string) => {
    if (!selectedSchedule) return;

    const newShifts: Shift[] = [];
    const start = new Date(startDate);
    start.setMinutes(start.getMinutes() + start.getTimezoneOffset());
    const scheduleEnd = new Date(selectedSchedule.endDate);
    scheduleEnd.setMinutes(scheduleEnd.getMinutes() + scheduleEnd.getTimezoneOffset());

    // Apply template for each user
    userIds.forEach(userId => {
      let currentDate = new Date(start);
      
      // Apply pattern weekly until schedule end
      while (currentDate <= scheduleEnd) {
        template.assignments.forEach((assignment: any) => {
          const targetDate = new Date(currentDate);
          const currentDay = currentDate.getDay();
          const daysToAdd = (assignment.dayOfWeek - currentDay + 7) % 7;
          targetDate.setDate(currentDate.getDate() + daysToAdd);

          if (targetDate >= start && targetDate <= scheduleEnd) {
            const dateStr = targetDate.toISOString().split('T')[0];
            const newShift: Shift = {
              id: `shift-${Date.now()}-${Math.random()}`,
              userId,
              teamId: currentTeamId,
              date: dateStr,
              type: assignment.shiftType,
              startTime: assignment.startTime,
              endTime: assignment.endTime,
            };
            newShifts.push(newShift);
          }
        });

        currentDate.setDate(currentDate.getDate() + 7); // Next week
      }
    });

    // Save and update state
    newShifts.forEach(shift => api.saveShift(shift));
    setShifts(prev => [...prev, ...newShifts]);
  };

  const handleCopyWeek = (sourceWeekStart: string, targetWeekStart: string, overwrite: boolean) => {
    if (!selectedSchedule) return;

    const sourceDate = new Date(sourceWeekStart);
    const targetDate = new Date(targetWeekStart);
    
    // Get all shifts for source week (7 days)
    const sourceShifts: Shift[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sourceDate);
      date.setDate(sourceDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayShifts = shifts.filter(s => s.date === dateStr && selectedSchedule.userIds.includes(s.userId));
      sourceShifts.push(...dayShifts);
    }

    // Create new shifts for target week
    const newShifts: Shift[] = [];
    sourceShifts.forEach(sourceShift => {
      const sourceShiftDate = new Date(sourceShift.date);
      const dayOffset = Math.floor((sourceShiftDate.getTime() - sourceDate.getTime()) / (24 * 60 * 60 * 1000));
      
      const targetShiftDate = new Date(targetDate);
      targetShiftDate.setDate(targetDate.getDate() + dayOffset);
      const targetDateStr = targetShiftDate.toISOString().split('T')[0];

      // Check if shift already exists
      const existingShift = shifts.find(s => s.date === targetDateStr && s.userId === sourceShift.userId);
      
      if (!existingShift || overwrite) {
        const newShift: Shift = {
          id: existingShift?.id || `shift-${Date.now()}-${Math.random()}`,
          userId: sourceShift.userId,
          teamId: currentTeamId,
          date: targetDateStr,
          type: sourceShift.type,
          startTime: sourceShift.startTime,
          endTime: sourceShift.endTime,
        };
        newShifts.push(newShift);
      }
    });

    // Save all new shifts
    newShifts.forEach(shift => api.saveShift(shift));

    // Update state
    setShifts(prev => {
      if (overwrite) {
        // Remove existing shifts for target week dates
        const targetDates = newShifts.map(s => `${s.userId}-${s.date}`);
        const filtered = prev.filter(s => !targetDates.includes(`${s.userId}-${s.date}`));
        return [...filtered, ...newShifts];
      } else {
        // Add only new shifts (don't overwrite)
        const existingKeys = new Set(prev.map(s => `${s.userId}-${s.date}`));
        const toAdd = newShifts.filter(s => !existingKeys.has(`${s.userId}-${s.date}`));
        return [...prev, ...toAdd];
      }
    });
  };
      setShifts(prev => [...prev, newShift]);
    }

    setPendingShift(null);
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

  // Calculate available weeks for navigation
  const availableWeeks = useMemo(() => {
    if (!selectedSchedule) return [];
    
    const weeks: string[] = [];
    let currentDate = new Date(selectedSchedule.startDate);
    currentDate.setMinutes(currentDate.getMinutes() + currentDate.getTimezoneOffset());
    const finalDate = new Date(selectedSchedule.endDate);
    finalDate.setMinutes(finalDate.getMinutes() + finalDate.getTimezoneOffset());

    while (currentDate <= finalDate) {
      const dayOfWeek = currentDate.getDay();
      const monday = new Date(currentDate);
      monday.setDate(currentDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      
      const mondayStr = monday.toISOString().split('T')[0];
      if (!weeks.includes(mondayStr)) {
        weeks.push(mondayStr);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return weeks;
  }, [selectedSchedule]);

  // Initialize selectedWeekStart
  useEffect(() => {
    if (viewMode === 'week' && !selectedWeekStart && availableWeeks.length > 0) {
      setSelectedWeekStart(availableWeeks[0]);
    }
  }, [viewMode, selectedWeekStart, availableWeeks]);

  const handlePreviousWeek = () => {
    if (!selectedWeekStart) return;
    const currentIndex = availableWeeks.indexOf(selectedWeekStart);
    if (currentIndex > 0) {
      setSelectedWeekStart(availableWeeks[currentIndex - 1]);
    }
  };

  const handleNextWeek = () => {
    if (!selectedWeekStart) return;
    const currentIndex = availableWeeks.indexOf(selectedWeekStart);
    if (currentIndex < availableWeeks.length - 1) {
      setSelectedWeekStart(availableWeeks[currentIndex + 1]);
    }
  };

  const handleDragStart = (shift: Shift) => {
    if (!canManage) return;
    setDraggedShift(shift);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!canManage || !draggedShift) return;
    e.preventDefault();
  };

  const handleDrop = async (userId: string, date: string) => {
    if (!canManage || !draggedShift) return;
    
    // Don't drop on same cell
    if (draggedShift.userId === userId && draggedShift.date === date) {
      setDraggedShift(null);
      return;
    }

    // Check if target cell already has a shift
    const existingShift = shiftsMap.get(`${userId}-${date}`);
    
    if (existingShift) {
      // Swap shifts
      const updatedDragged = {
        ...draggedShift,
        userId,
        date,
      };
      
      const updatedExisting = {
        ...existingShift,
        userId: draggedShift.userId,
        date: draggedShift.date,
      };
      
      await api.saveShift(updatedDragged);
      await api.saveShift(updatedExisting);
      
      setShifts(prev => prev.map(s => {
        if (s.id === draggedShift.id) return updatedDragged;
        if (s.id === existingShift.id) return updatedExisting;
        return s;
      }));
    } else {
      // Move shift to empty cell
      const updatedShift = {
        ...draggedShift,
        userId,
        date,
      };
      
      await api.saveShift(updatedShift);
      setShifts(prev => prev.map(s => s.id === draggedShift.id ? updatedShift : s));
    }
    
    setDraggedShift(null);
  };

  const renderGrid = (schedule: ShiftSchedule) => {
      const scheduleUsers = teamMembers.filter(u => schedule.userIds.includes(u.id));
      
      let displayDates: Date[] = [];
      let currentDate = new Date(schedule.startDate);
      currentDate.setMinutes(currentDate.getMinutes() + currentDate.getTimezoneOffset());
      const finalDate = new Date(schedule.endDate);
      finalDate.setMinutes(finalDate.getMinutes() + finalDate.getTimezoneOffset());
      
      // Week view: show only selected week
      if (viewMode === 'week' && selectedWeekStart) {
        const weekStart = new Date(selectedWeekStart);
        weekStart.setMinutes(weekStart.getMinutes() + weekStart.getTimezoneOffset());
        for (let i = 0; i < 7; i++) {
          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + i);
          if (date >= currentDate && date <= finalDate) {
            displayDates.push(date);
          }
        }
      } else {
        // Month view: show all dates
        while(currentDate <= finalDate) {
            displayDates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      const cellWidth = viewMode === 'week' ? 'minmax(140px, 1fr)' : 'minmax(80px, 1fr)';

      return (
        <div className="flex-1 overflow-auto">
            <div className="grid gap-px bg-gray-200/80 dark:bg-gray-700/50" style={{ gridTemplateColumns: `minmax(150px, 1.5fr) repeat(${displayDates.length}, ${cellWidth})`}}>
                {/* Header Row */}
                <div className="p-2 bg-light-card dark:bg-dark-card font-semibold sticky top-0 z-10">{t('schedule_form_team_members')}</div>
                {displayDates.map(date => (
                    <div key={date.toISOString()} className="p-2 text-center bg-light-card dark:bg-dark-card font-semibold sticky top-0 z-10">
                        <div className={viewMode === 'week' ? 'text-sm' : 'text-xs'}>{formatDate(date, { weekday: viewMode === 'week' ? 'long' : 'short' })}</div>
                        <div className={`${viewMode === 'week' ? 'text-2xl' : 'text-lg'} font-bold`}>{formatDate(date, { day: 'numeric' })}</div>
                        {viewMode === 'week' && (
                          <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{formatDate(date, { month: 'short' })}</div>
                        )}
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
                            const duration = shift ? calculateDuration(shift.startTime, shift.endTime) : null;
                            
                            return (
                                <div
                                    key={dateString}
                                    onClick={() => handleCellClick(user.id, dateString)}
                                    draggable={!!(canManage && shift)}
                                    onDragStart={(e) => {
                                      if (shift) {
                                        handleDragStart(shift);
                                        e.currentTarget.style.opacity = '0.4';
                                      }
                                    }}
                                    onDragEnd={(e) => {
                                      e.currentTarget.style.opacity = '1';
                                    }}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      handleDrop(user.id, dateString);
                                    }}
                                    className={`relative p-2 flex flex-col items-center justify-center text-center font-bold ${shift ? SHIFT_TYPE_DETAILS[shift.type].color : 'bg-light-card dark:bg-dark-card'} ${canManage ? 'cursor-pointer' : 'cursor-default'} ${canManage && shift ? 'hover:ring-2 ring-brand-yellow' : ''} ${draggedShift && canManage ? 'transition-all' : ''}`}
                                    title={shift ? `${SHIFT_TYPE_DETAILS[shift.type][language]} ${shift.startTime || ''} - ${shift.endTime || ''} ${duration ? `(${duration}h)` : ''}` : ''}
                                >
                                    {shift ? (
                                        <>
                                            <div>{SHIFT_TYPE_DETAILS[shift.type][language === 'el' ? 'short_el' : 'short_en']}</div>
                                            {shift.startTime && shift.endTime && (
                                                <>
                                                    <div className="text-xs opacity-80 mt-0.5">
                                                        {shift.startTime} - {shift.endTime}
                                                    </div>
                                                    {duration && (
                                                        <div className="text-xs font-bold opacity-90 mt-0.5 bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded">
                                                            {duration}h
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    ) : '-'}
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
        <div className={`h-full space-y-4 ${selectedScheduleId ? 'hidden lg:block' : 'lg:col-span-1'}`}>
           <ScheduleList 
             schedules={shiftSchedules}
             selectedScheduleId={selectedScheduleId}
             onSelectSchedule={setSelectedScheduleId}
             onAdd={() => handleOpenForm(null)}
             onEdit={handleOpenForm}
             onDelete={setScheduleToDelete}
             currentUserRole={currentUserRole}
           />
           
           {/* Statistics Panel */}
           {selectedSchedule && (
             <div className="hidden lg:block">
               <button
                 onClick={() => setIsStatsOpen(!isStatsOpen)}
                 className="w-full flex items-center justify-between gap-2 bg-brand-yellow hover:bg-brand-yellow-dark text-black px-4 py-3 rounded-full font-semibold transition-colors"
               >
                 <div className="flex items-center gap-2">
                   <Icon name="bar-chart" className="w-5 h-5" />
                   <span>{t('shifts_statistics')}</span>
                 </div>
                 <Icon name={isStatsOpen ? "chevron-up" : "chevron-down"} className="w-4 h-4" />
               </button>
               
               {isStatsOpen && (
                 <div className="mt-4">
                   <ShiftStatisticsPanel
                     schedule={selectedSchedule}
                     shifts={shifts.filter(s => s.teamId === currentTeamId)}
                     users={teamMembers}
                   />
                 </div>
               )}
             </div>
           )}
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
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* View Mode Toggle */}
                          <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1">
                            <button
                              onClick={() => setViewMode('month')}
                              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                                viewMode === 'month'
                                  ? 'bg-brand-yellow text-black'
                                  : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-gray-300 dark:hover:bg-gray-600'
                              }`}
                            >
                              {t('shifts_month_view')}
                            </button>
                            <button
                              onClick={() => setViewMode('week')}
                              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                                viewMode === 'week'
                                  ? 'bg-brand-yellow text-black'
                                  : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-gray-300 dark:hover:bg-gray-600'
                              }`}
                            >
                              {t('shifts_week_view')}
                            </button>
                          </div>
                          
                          {/* Copy Week Button */}
                          {canManage && (
                            <button 
                              onClick={() => setIsCopyWeekOpen(true)} 
                              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-colors"
                            >
                              <Icon name="copy" className="w-4 h-4" />
                              <span className="font-semibold text-sm hidden sm:inline">{t('shifts_copy_week')}</span>
                            </button>
                          )}
                          
                          {/* Templates Button */}
                          {canManage && (
                            <button 
                              onClick={() => setIsTemplatesOpen(true)} 
                              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full transition-colors"
                            >
                              <Icon name="layout-template" className="w-4 h-4" />
                              <span className="font-semibold text-sm hidden sm:inline">{t('shifts_templates')}</span>
                            </button>
                          )}
                          
                          {/* Print Button */}
                          <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            <Icon name="printer" className="w-4 h-4" />
                            <span className="font-semibold text-sm hidden sm:inline">{t('shifts_print_schedule')}</span>
                          </button>
                          
                          {/* Stats Toggle (Mobile) */}
                          <button
                            onClick={() => setIsStatsOpen(!isStatsOpen)}
                            className="lg:hidden flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellow-dark text-black px-4 py-2 rounded-full transition-colors"
                          >
                            <Icon name="bar-chart" className="w-4 h-4" />
                          </button>
                        </div>
                    </div>
                    
                    {/* Mobile Stats */}
                    {isStatsOpen && (
                      <div className="lg:hidden mt-4">
                        <ShiftStatisticsPanel
                          schedule={selectedSchedule}
                          shifts={shifts.filter(s => s.teamId === currentTeamId)}
                          users={teamMembers}
                        />
                      </div>
                    )}
                    
                    {/* Week Navigation (only in week view) */}
                    {viewMode === 'week' && selectedWeekStart && (
                      <div className="flex items-center justify-center gap-4 py-3 border-b border-gray-200/80 dark:border-gray-700/80">
                        <button
                          onClick={handlePreviousWeek}
                          disabled={availableWeeks.indexOf(selectedWeekStart) === 0}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Icon name="chevron-left" className="w-5 h-5" />
                        </button>
                        
                        <div className="text-center">
                          <div className="font-semibold">
                            {(() => {
                              const weekStart = new Date(selectedWeekStart);
                              weekStart.setMinutes(weekStart.getMinutes() + weekStart.getTimezoneOffset());
                              const weekEnd = new Date(weekStart);
                              weekEnd.setDate(weekStart.getDate() + 6);
                              return `${formatDate(weekStart, { day: 'numeric', month: 'short' })} - ${formatDate(weekEnd, { day: 'numeric', month: 'short', year: 'numeric' })}`;
                            })()}
                          </div>
                          <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                            {language === 'el' ? 'Εβδομάδα' : 'Week'} {availableWeeks.indexOf(selectedWeekStart) + 1} / {availableWeeks.length}
                          </div>
                        </div>
                        
                        <button
                          onClick={handleNextWeek}
                          disabled={availableWeeks.indexOf(selectedWeekStart) === availableWeeks.length - 1}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Icon name="chevron-right" className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    
                    {renderGrid(selectedSchedule)}
                </div>
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
      
      <TimePickerModal
        isOpen={isTimePickerOpen}
        onClose={() => {
          setIsTimePickerOpen(false);
          setPendingShift(null);
        }}
        onSave={handleTimeSave}
        shiftType={pendingShift?.type || 'morning'}
        initialStartTime={pendingShift?.existingShift?.startTime}
        initialEndTime={pendingShift?.existingShift?.endTime}
      />
      
      {selectedSchedule && (
        <CopyWeekModal
          isOpen={isCopyWeekOpen}
          onClose={() => setIsCopyWeekOpen(false)}
          onCopy={handleCopyWeek}
          schedule={selectedSchedule}
        />
      )}
      
      {selectedSchedule && (
        <ShiftTemplatesModal
          isOpen={isTemplatesOpen}
          onClose={() => setIsTemplatesOpen(false)}
          onApply={handleApplyTemplate}
          users={teamMembers}
          scheduleStartDate={selectedSchedule.startDate}
          scheduleEndDate={selectedSchedule.endDate}
        />
      )}
      
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
