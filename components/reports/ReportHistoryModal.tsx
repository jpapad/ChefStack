import React from 'react';
import { EmailReport, ReportHistory } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

interface ReportHistoryModalProps {
  isOpen: boolean;
  report: EmailReport;
  history: ReportHistory[];
  onClose: () => void;
}

const ReportHistoryModal: React.FC<ReportHistoryModalProps> = ({
  isOpen,
  report,
  history,
  onClose
}) => {
  const { language } = useTranslation();

  if (!isOpen) return null;

  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(language === 'el' ? 'el-GR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'generating':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { el: string; en: string }> = {
      sent: { el: 'Στάλθηκε', en: 'Sent' },
      generating: { el: 'Δημιουργία', en: 'Generating' },
      failed: { el: 'Αποτυχία', en: 'Failed' },
      scheduled: { el: 'Προγραμματισμένο', en: 'Scheduled' }
    };
    return labels[status]?.[language] || status;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'el' ? 'Ιστορικό Αποστολών' : 'Sending History'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {report.name}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
              <Icon name="x" className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{sortedHistory.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'el' ? 'Σύνολο Αποστολών' : 'Total Sends'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {sortedHistory.filter(h => h.status === 'sent').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'el' ? 'Επιτυχείς' : 'Successful'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {sortedHistory.filter(h => h.status === 'failed').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'el' ? 'Αποτυχίες' : 'Failed'}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {sortedHistory.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="inbox" className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'el' ? 'Δεν υπάρχει ιστορικό αποστολών' : 'No sending history'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedHistory.map(entry => (
                <div key={entry.id} className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(entry.status)}`}>
                          {getStatusLabel(entry.status)}
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white font-medium">
                          {formatDate(entry.sentAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Icon name="mail" className="w-4 h-4" />
                          <span>{entry.recipients.length} {language === 'el' ? 'παραλήπτες' : 'recipients'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon name="file" className="w-4 h-4" />
                          <span>{entry.format.toUpperCase()}</span>
                        </div>
                        {entry.fileSize && (
                          <div className="flex items-center gap-1">
                            <Icon name="hard-drive" className="w-4 h-4" />
                            <span>{formatFileSize(entry.fileSize)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {entry.status === 'sent' && entry.downloadUrl && (
                      <button
                        onClick={() => window.open(entry.downloadUrl, '_blank')}
                        className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <Icon name="download" className="w-4 h-4" />
                        {language === 'el' ? 'Λήψη' : 'Download'}
                      </button>
                    )}
                  </div>

                  {/* Recipients */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {entry.recipients.slice(0, 3).map((email, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 dark:bg-slate-600 px-2 py-0.5 rounded">
                        {email}
                      </span>
                    ))}
                    {entry.recipients.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{entry.recipients.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Error Message */}
                  {entry.errorMessage && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-700 dark:text-red-300">
                      <div className="flex items-start gap-2">
                        <Icon name="alert-circle" className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{entry.errorMessage}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            {language === 'el' ? 'Κλείσιμο' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportHistoryModal;
