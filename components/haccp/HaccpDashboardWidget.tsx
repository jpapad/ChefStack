import React, { useMemo } from 'react';
import type { HaccpLog, HaccpReminder, HaccpItem } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';
import {
  calculateComplianceScore,
  getNonCompliantLogs,
  isReminderOverdue
} from '../../utils/haccpHelpers';

interface HaccpDashboardWidgetProps {
  logs: HaccpLog[];
  reminders: HaccpReminder[];
  haccpItems: HaccpItem[];
  onViewAll?: () => void;
}

export const HaccpDashboardWidget: React.FC<HaccpDashboardWidgetProps> = ({
  logs,
  reminders,
  haccpItems,
  onViewAll
}) => {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    const complianceScore = calculateComplianceScore(logs || [], haccpItems || []);
    const nonCompliant = getNonCompliantLogs(logs || [], haccpItems || []).length;
    const safeReminders = reminders || [];
    const overdue = safeReminders.filter(r => isReminderOverdue(r)).length;
    const upcomingChecks = safeReminders
      .filter(r => !isReminderOverdue(r))
      .sort((a, b) => a.nextCheckDue.getTime() - b.nextCheckDue.getTime())
      .slice(0, 3);

    return {
      complianceScore,
      nonCompliant,
      overdue,
      upcomingChecks
    };
  }, [logs, reminders, haccpItems]);

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 80) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 95) return 'bg-emerald-50 dark:bg-emerald-900/20';
    if (score >= 80) return 'bg-amber-50 dark:bg-amber-900/20';
    return 'bg-red-50 dark:bg-red-900/20';
  };

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name="shield-check" className="w-5 h-5 text-emerald-500" />
          <h3 className="text-md font-heading font-semibold text-light-text-primary dark:text-dark-text-primary">
            {t('haccp_compliance')}
          </h3>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-brand-yellow hover:underline"
          >
            {t('view_all')}
          </button>
        )}
      </div>

      {/* Compliance Score */}
      <div className={`${getScoreBg(stats.complianceScore)} rounded-xl p-4 mb-4`}>
        <div className="text-center">
          <div className={`text-3xl font-bold ${getScoreColor(stats.complianceScore)}`}>
            {stats.complianceScore.toFixed(1)}%
          </div>
          <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
            {t('compliance_score')}
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="alert-triangle" className="w-4 h-4 text-red-500" />
            <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
              {t('haccp_non_compliant')}
            </span>
          </div>
          <div className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
            {stats.nonCompliant}
          </div>
        </div>

        <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="clock" className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
              {t('haccp_overdue')}
            </span>
          </div>
          <div className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
            {stats.overdue}
          </div>
        </div>
      </div>

      {/* Upcoming Checks */}
      <div>
        <h4 className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2">
          {t('haccp_upcoming_checks')}
        </h4>
        {stats.upcomingChecks.length === 0 ? (
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary italic">
            {t('no_upcoming_checks')}
          </p>
        ) : (
          <div className="space-y-2">
            {stats.upcomingChecks.map((reminder) => {
              const item = haccpItems.find(i => i.id === reminder.haccpItemId);
              const timeUntil = reminder.nextCheckDue.getTime() - Date.now();
              const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
              
              return (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between text-xs bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-2"
                >
                  <span className="truncate mr-2 text-light-text-primary dark:text-dark-text-primary">
                    {item?.name || t('unknown_item')}
                  </span>
                  <span className="text-light-text-secondary dark:text-dark-text-secondary whitespace-nowrap">
                    {hoursUntil < 1 
                      ? t('less_than_1_hour')
                      : `${hoursUntil}h`
                    }
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
