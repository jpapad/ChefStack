import React, { useMemo } from 'react';
import { Shift, User, ShiftSchedule, SHIFT_TYPE_DETAILS } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

interface ShiftStatisticsPanelProps {
  schedule: ShiftSchedule;
  shifts: Shift[];
  users: User[];
}

interface UserStats {
  userId: string;
  userName: string;
  totalHours: number;
  shiftCount: number;
  warnings: string[];
}

const ShiftStatisticsPanel: React.FC<ShiftStatisticsPanelProps> = ({
  schedule,
  shifts,
  users,
}) => {
  const { t, language } = useTranslation();

  const calculateDuration = (startTime?: string, endTime?: string): number => {
    if (!startTime || !endTime) return 8; // Default 8h if not specified
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;
    
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }
    
    return (endMinutes - startMinutes) / 60;
  };

  const stats: UserStats[] = useMemo(() => {
    const scheduleUsers = users.filter(u => schedule.userIds.includes(u.id));
    const scheduleShifts = shifts.filter(s => 
      schedule.userIds.includes(s.userId) &&
      s.date >= schedule.startDate &&
      s.date <= schedule.endDate
    );

    return scheduleUsers.map(user => {
      const userShifts = scheduleShifts.filter(s => s.userId === user.id);
      const totalHours = userShifts.reduce((sum, shift) => 
        sum + calculateDuration(shift.startTime, shift.endTime), 0
      );

      const warnings: string[] = [];

      // Check for excessive hours (>40h per week)
      const weekCount = Math.ceil(
        (new Date(schedule.endDate).getTime() - new Date(schedule.startDate).getTime()) 
        / (7 * 24 * 60 * 60 * 1000)
      );
      const avgWeeklyHours = totalHours / Math.max(weekCount, 1);
      if (avgWeeklyHours > 40) {
        warnings.push(t('shifts_warning_overtime'));
      }

      // Check for consecutive shifts with <11h gap
      const sortedShifts = [...userShifts].sort((a, b) => a.date.localeCompare(b.date));
      for (let i = 0; i < sortedShifts.length - 1; i++) {
        const current = sortedShifts[i];
        const next = sortedShifts[i + 1];
        
        const currentDate = new Date(current.date);
        const nextDate = new Date(next.date);
        const dayDiff = (nextDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000);
        
        if (dayDiff === 1 && current.endTime && next.startTime) {
          const [endHour, endMin] = current.endTime.split(':').map(Number);
          const [startHour, startMin] = next.startTime.split(':').map(Number);
          
          let endMinutes = endHour * 60 + endMin;
          let startMinutes = startHour * 60 + startMin + 24 * 60; // Next day
          
          const gapHours = (startMinutes - endMinutes) / 60;
          if (gapHours < 11) {
            warnings.push(t('shifts_warning_short_rest'));
            break;
          }
        }
      }

      return {
        userId: user.id,
        userName: user.name,
        totalHours,
        shiftCount: userShifts.length,
        warnings,
      };
    });
  }, [schedule, shifts, users, t]);

  const totalScheduleHours = stats.reduce((sum, s) => sum + s.totalHours, 0);
  const avgHoursPerPerson = totalScheduleHours / Math.max(stats.length, 1);

  // Calculate coverage per day
  const coverage = useMemo(() => {
    const dates: string[] = [];
    let currentDate = new Date(schedule.startDate);
    currentDate.setMinutes(currentDate.getMinutes() + currentDate.getTimezoneOffset());
    const finalDate = new Date(schedule.endDate);
    finalDate.setMinutes(finalDate.getMinutes() + finalDate.getTimezoneOffset());
    
    while (currentDate <= finalDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const lowCoverageDays = dates.filter(date => {
      const dayShifts = shifts.filter(s => s.date === date);
      return dayShifts.length < 2; // Less than 2 people
    });

    return {
      totalDays: dates.length,
      lowCoverageDays: lowCoverageDays.length,
      lowCoverageDates: lowCoverageDays,
    };
  }, [schedule, shifts]);

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl p-6 space-y-6">
      {/* Overview Stats */}
      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Icon name="bar-chart" className="w-5 h-5 text-brand-yellow" />
          {t('shifts_statistics')}
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {totalScheduleHours.toFixed(0)}h
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {t('shifts_total_hours')}
            </div>
          </div>

          <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {avgHoursPerPerson.toFixed(1)}h
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              {t('shifts_avg_per_person')}
            </div>
          </div>

          <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {coverage.totalDays}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              {t('shifts_total_days')}
            </div>
          </div>

          <div className={`rounded-lg p-4 ${coverage.lowCoverageDays > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
            <div className={`text-2xl font-bold ${coverage.lowCoverageDays > 0 ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>
              {coverage.lowCoverageDays}
            </div>
            <div className={`text-xs mt-1 ${coverage.lowCoverageDays > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {t('shifts_low_coverage_days')}
            </div>
          </div>
        </div>
      </div>

      {/* Per Person Stats */}
      <div>
        <h4 className="text-sm font-bold mb-3">{t('shifts_hours_per_person')}</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {stats.map(stat => (
            <div
              key={stat.userId}
              className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex-1">
                <div className="font-semibold">{stat.userName}</div>
                <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  {stat.shiftCount} {t('shifts_shifts_count')}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{stat.totalHours.toFixed(1)}h</div>
                {stat.warnings.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 mt-1">
                    <Icon name="alert-triangle" className="w-3 h-3" />
                    <span>{stat.warnings.length}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warnings */}
      {stats.some(s => s.warnings.length > 0) && (
        <div>
          <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-red-600 dark:text-red-400">
            <Icon name="alert-triangle" className="w-4 h-4" />
            {t('shifts_warnings')}
          </h4>
          <div className="space-y-2">
            {stats.filter(s => s.warnings.length > 0).map(stat => (
              <div
                key={stat.userId}
                className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-3"
              >
                <div className="font-semibold text-red-700 dark:text-red-300">
                  {stat.userName}
                </div>
                <ul className="text-xs text-red-600 dark:text-red-400 mt-1 space-y-1">
                  {stat.warnings.map((warning, idx) => (
                    <li key={idx}>• {warning}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftStatisticsPanel;
