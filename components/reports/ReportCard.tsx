import React from 'react';
import { EmailReport, ReportHistory, REPORT_TYPE_TRANSLATIONS, REPORT_FREQUENCY_TRANSLATIONS } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

interface ReportCardProps {
  report: EmailReport;
  reportHistory: ReportHistory[];
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onSendNow: () => void;
  onViewHistory: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({
  report,
  reportHistory,
  onEdit,
  onDelete,
  onToggleActive,
  onSendNow,
  onViewHistory
}) => {
  const { language } = useTranslation();
  const typeConfig = REPORT_TYPE_TRANSLATIONS[report.reportType];
  const frequencyConfig = REPORT_FREQUENCY_TRANSLATIONS[report.frequency];

  const lastHistory = reportHistory.sort((a, b) => 
    new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  )[0];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(language === 'el' ? 'el-GR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`p-4 rounded-lg border-2 transition-all ${
      report.isActive
        ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
        : 'bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-600 opacity-60'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <div className={`p-2 rounded-lg ${
            report.isActive 
              ? 'bg-blue-100 dark:bg-blue-900' 
              : 'bg-gray-200 dark:bg-gray-700'
          }`}>
            <Icon name={typeConfig.icon as any} className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white truncate">
              {report.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {typeConfig[language]} • {frequencyConfig[language]}
            </p>
          </div>
        </div>

        <button
          onClick={onToggleActive}
          className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
            report.isActive
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
          }`}
        >
          {report.isActive 
            ? (language === 'el' ? 'Ενεργή' : 'Active')
            : (language === 'el' ? 'Ανενεργή' : 'Inactive')
          }
        </button>
      </div>

      {/* Recipients */}
      <div className="mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Icon name="mail" className="w-4 h-4" />
          <span>{report.recipients.length} {language === 'el' ? 'παραλήπτες' : 'recipients'}</span>
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {report.recipients.slice(0, 2).map((email, idx) => (
            <span key={idx} className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">
              {email}
            </span>
          ))}
          {report.recipients.length > 2 && (
            <span className="text-xs text-gray-500">
              +{report.recipients.length - 2}
            </span>
          )}
        </div>
      </div>

      {/* Schedule Info */}
      {report.frequency !== 'manual' && report.scheduledTime && (
        <div className="mb-3 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Icon name="clock" className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-purple-700 dark:text-purple-300">
              {report.scheduledTime}
              {report.scheduledDay !== undefined && ` - ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][report.scheduledDay]}`}
              {report.scheduledDate && ` - ${language === 'el' ? 'Ημέρα' : 'Day'} ${report.scheduledDate}`}
            </span>
          </div>
        </div>
      )}

      {/* Last Sent */}
      {lastHistory && (
        <div className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Icon name="check" className="w-3 h-3" />
            <span>
              {language === 'el' ? 'Τελευταία αποστολή:' : 'Last sent:'} {formatDate(lastHistory.sentAt)}
            </span>
          </div>
        </div>
      )}

      {/* Format Badge */}
      <div className="mb-3">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
          report.format === 'pdf' 
            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            : report.format === 'csv'
            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
        }`}>
          <Icon name="file" className="w-3 h-3" />
          {report.format.toUpperCase()}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-slate-700">
        <button
          onClick={onSendNow}
          disabled={!report.isActive}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-brand-yellow hover:bg-yellow-500 disabled:bg-gray-200 disabled:text-gray-400 text-gray-900 rounded-lg transition-colors text-sm font-medium"
        >
          <Icon name="send" className="w-4 h-4" />
          <span>{language === 'el' ? 'Αποστολή' : 'Send'}</span>
        </button>
        <button
          onClick={onViewHistory}
          className="px-3 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          <Icon name="history" className="w-4 h-4" />
        </button>
        <button
          onClick={onEdit}
          className="px-3 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          <Icon name="edit" className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-lg transition-colors"
        >
          <Icon name="trash-2" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ReportCard;
