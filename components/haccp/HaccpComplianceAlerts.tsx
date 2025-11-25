import React from 'react';
import { HaccpLog, HaccpItem, HaccpReminder } from '../../types';
import { useTranslation } from '../../i18n';
import { Icon } from '../common/Icon';
import {
  getNonCompliantLogs,
  getOverdueReminders,
  getMissingChecks,
  isTemperatureOutOfRange,
  getSafeRangeDescription
} from '../../utils/haccpHelpers';

interface HaccpComplianceAlertsProps {
  logs: HaccpLog[];
  haccpItems: HaccpItem[];
  haccpReminders: HaccpReminder[];
}

export const HaccpComplianceAlerts: React.FC<HaccpComplianceAlertsProps> = ({
  logs,
  haccpItems,
  haccpReminders
}) => {
  const { t } = useTranslation();

  // Safe guards for undefined data
  const safeLogs = logs || [];
  const safeItems = haccpItems || [];
  const safeReminders = haccpReminders || [];

  // Get non-compliant logs
  const nonCompliantLogs = getNonCompliantLogs(safeLogs, safeItems);
  const recentNonCompliant = nonCompliantLogs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  // Get overdue reminders
  const overdueReminders = getOverdueReminders(safeReminders);

  // Get missing checks
  const missingChecks = getMissingChecks(safeReminders, safeLogs, 24);

  const totalAlerts = nonCompliantLogs.length + overdueReminders.length + missingChecks.length;

  if (totalAlerts === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <Icon name="check-circle" className="w-8 h-8 text-green-600 dark:text-green-400" />
          <div>
            <h3 className="text-lg font-bold text-green-800 dark:text-green-300">
              {t('haccp_all_compliant')}
            </h3>
            <p className="text-sm text-green-700 dark:text-green-400">
              {t('haccp_no_issues_found')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-white dark:bg-dark-card p-4 rounded-lg border-l-4 border-red-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="alert-triangle" className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="font-bold text-lg">{t('haccp_alerts')}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {totalAlerts} {t('haccp_total_issues')}
              </p>
            </div>
          </div>
          <span className="text-3xl font-bold text-red-500">{totalAlerts}</span>
        </div>
      </div>

      {/* Out of Range Temperatures */}
      {nonCompliantLogs.length > 0 && (
        <div className="bg-white dark:bg-dark-card p-4 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="thermometer" className="w-5 h-5 text-red-500" />
            <h4 className="font-bold text-red-600 dark:text-red-400">
              {t('haccp_out_of_range_temps')} ({nonCompliantLogs.length})
            </h4>
          </div>
          
          <div className="space-y-2">
            {recentNonCompliant.map(log => {
              const item = safeItems.find(i => i.id === log.haccpItemId);
              if (!item) return null;
              
              const safeRange = getSafeRangeDescription(item.name);
              
              return (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {new Date(log.timestamp).toLocaleString('el-GR')}
                    </p>
                    {safeRange && (
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        {t('haccp_safe_range')}: {safeRange}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-red-600">{log.value}°C</p>
                    <p className="text-xs text-red-500">{t('haccp_critical')}</p>
                  </div>
                </div>
              );
            })}
            
            {nonCompliantLogs.length > 5 && (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center pt-2">
                + {nonCompliantLogs.length - 5} {t('haccp_more_issues')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Overdue Checks */}
      {overdueReminders.length > 0 && (
        <div className="bg-white dark:bg-dark-card p-4 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="clock" className="w-5 h-5 text-orange-500" />
            <h4 className="font-bold text-orange-600 dark:text-orange-400">
              {t('haccp_overdue_checks')} ({overdueReminders.length})
            </h4>
          </div>
          
          <div className="space-y-2">
            {overdueReminders.map(reminder => {
              const item = safeItems.find(i => i.id === reminder.haccpItemId);
              if (!item) return null;
              
              return (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {t('haccp_due')}: {reminder.nextCheckDue ? new Date(reminder.nextCheckDue).toLocaleString('el-GR') : '-'}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase">
                    {t('overdue')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Missing Checks */}
      {missingChecks.length > 0 && (
        <div className="bg-white dark:bg-dark-card p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="alert-circle" className="w-5 h-5 text-yellow-500" />
            <h4 className="font-bold text-yellow-600 dark:text-yellow-400">
              {t('haccp_missing_checks')} ({missingChecks.length})
            </h4>
          </div>
          
          <div className="space-y-2">
            {missingChecks.map(({ reminder, hoursSinceLastCheck }) => {
              const item = safeItems.find(i => i.id === reminder.haccpItemId);
              if (!item) return null;
              
              return (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {t('haccp_last_check')}: {hoursSinceLastCheck.toFixed(0)}h {t('ago')}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase">
                    {t('haccp_no_recent_data')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Required */}
      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Icon name="info" className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-sm mb-2">{t('haccp_action_required')}</p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              {nonCompliantLogs.length > 0 && (
                <li>• {t('haccp_action_review_temps')}</li>
              )}
              {overdueReminders.length > 0 && (
                <li>• {t('haccp_action_complete_checks')}</li>
              )}
              {missingChecks.length > 0 && (
                <li>• {t('haccp_action_record_data')}</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
