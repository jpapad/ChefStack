import React, { useMemo } from 'react';
import { HaccpLog, HaccpItem, HaccpReminder } from '../../types';
import { useTranslation } from '../../i18n';
import { Icon } from '../common/Icon';
import {
  calculateComplianceScore,
  getOverdueReminders,
  getNonCompliantLogs,
  getMissingChecks
} from '../../utils/haccpHelpers';

interface HaccpDashboardWidgetProps {
  logs: HaccpLog[];
  items: HaccpItem[];
  reminders: HaccpReminder[];
  onViewDetails?: () => void;
}

export const HaccpDashboardWidget: React.FC<HaccpDashboardWidgetProps> = ({
  logs,
  items,
  reminders,
  onViewDetails
}) => {
  const { t } = useTranslation();

  // Calculate metrics
  const complianceScore = useMemo(() => calculateComplianceScore(logs, items), [logs, items]);
  const overdueReminders = useMemo(() => getOverdueReminders(reminders), [reminders]);
  const nonCompliantLogs = useMemo(() => getNonCompliantLogs(logs, items), [logs, items]);
  const missingChecks = useMemo(() => getMissingChecks(reminders, logs, 24), [reminders, logs]);

  const upcomingChecks = useMemo(() => {
    return reminders
      .filter(r => !getOverdueReminders([r]).length && r.nextCheckDue)
      .sort((a, b) => {
        const aTime = a.nextCheckDue ? new Date(a.nextCheckDue).getTime() : Infinity;
        const bTime = b.nextCheckDue ? new Date(b.nextCheckDue).getTime() : Infinity;
        return aTime - bTime;
      })
      .slice(0, 3);
  }, [reminders]);

  const totalIssues = overdueReminders.length + nonCompliantLogs.length + missingChecks.length;

  const getComplianceColor = (score: number) => {
    if (score >= 95) return 'text-green-600 dark:text-green-400';
    if (score >= 85) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getComplianceBgColor = (score: number) => {
    if (score >= 95) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 85) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  return (
    <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Icon name="clipboard-check" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold">{t('haccp_monitoring')}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('haccp_food_safety')}
            </p>
          </div>
        </div>
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="text-sm font-semibold text-brand-yellow hover:underline"
          >
            {t('view_details')} →
          </button>
        )}
      </div>

      {/* Compliance Score */}
      <div className={`p-4 rounded-lg mb-4 ${getComplianceBgColor(complianceScore)}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('haccp_compliance_score')}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t('haccp_last_30_days')}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-4xl font-bold ${getComplianceColor(complianceScore)}`}>
              {complianceScore}%
            </p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              complianceScore >= 95
                ? 'bg-green-500'
                : complianceScore >= 85
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${complianceScore}%` }}
          />
        </div>
      </div>

      {/* Alerts Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <Icon name="alert-triangle" className="w-5 h-5 text-red-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {totalIssues}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {t('haccp_total_issues')}
          </p>
        </div>
        
        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <Icon name="clock" className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {overdueReminders.length}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {t('overdue')}
          </p>
        </div>
        
        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <Icon name="thermometer" className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {logs.length}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {t('haccp_total_checks')}
          </p>
        </div>
      </div>

      {/* Upcoming Checks */}
      {upcomingChecks.length > 0 && (
        <div>
          <h4 className="text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">
            {t('haccp_upcoming_checks')}
          </h4>
          <div className="space-y-2">
            {upcomingChecks.map(reminder => {
              const item = items.find(i => i.id === reminder.haccpItemId);
              if (!item) return null;
              
              const dueDate = reminder.nextCheckDue ? new Date(reminder.nextCheckDue) : null;
              const hoursUntilDue = dueDate
                ? (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60)
                : null;
              
              return (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {dueDate ? dueDate.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </p>
                  </div>
                  {hoursUntilDue !== null && hoursUntilDue < 2 && (
                    <span className="text-xs font-semibold text-orange-500 uppercase">
                      {t('haccp_soon')}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Critical Alert */}
      {totalIssues > 0 && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Icon name="alert-circle" className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
              {t('haccp_requires_attention')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
