import React, { useState, useMemo } from 'react';
import { EmailReport, ReportHistory, ReportType, ReportFrequency, REPORT_TYPE_TRANSLATIONS, REPORT_FREQUENCY_TRANSLATIONS } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';
import ReportCard from './ReportCard';
import CreateReportModal from './CreateReportModal';
import ReportHistoryModal from './ReportHistoryModal';

interface EmailReportsViewProps {
  reports: EmailReport[];
  setReports: React.Dispatch<React.SetStateAction<EmailReport[]>>;
  reportHistory: ReportHistory[];
  setReportHistory: React.Dispatch<React.SetStateAction<ReportHistory[]>>;
  currentTeamId: string;
  currentUserId: string;
}

const EmailReportsView: React.FC<EmailReportsViewProps> = ({
  reports,
  setReports,
  reportHistory,
  setReportHistory,
  currentTeamId,
  currentUserId
}) => {
  const { language, t } = useTranslation();
  const [isCreating, setIsCreating] = useState(false);
  const [editingReport, setEditingReport] = useState<EmailReport | null>(null);
  const [selectedHistoryReportId, setSelectedHistoryReportId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<ReportType | 'all'>('all');
  const [filterFrequency, setFilterFrequency] = useState<ReportFrequency | 'all'>('all');
  const [showInactive, setShowInactive] = useState(false);

  const teamReports = useMemo(() => {
    return reports
      .filter(r => r.teamId === currentTeamId)
      .filter(r => filterType === 'all' || r.reportType === filterType)
      .filter(r => filterFrequency === 'all' || r.frequency === filterFrequency)
      .filter(r => showInactive || r.isActive);
  }, [reports, currentTeamId, filterType, filterFrequency, showInactive]);

  const handleCreateReport = (report: Omit<EmailReport, 'id' | 'createdAt' | 'createdBy'>) => {
    const newReport: EmailReport = {
      ...report,
      id: `report_${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: currentUserId
    };
    setReports(prev => [...prev, newReport]);
    setIsCreating(false);
  };

  const handleUpdateReport = (report: EmailReport) => {
    setReports(prev => prev.map(r => r.id === report.id ? report : r));
    setEditingReport(null);
  };

  const handleDeleteReport = (reportId: string) => {
    if (confirm(language === 'el' ? 'Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την αναφορά;' : 'Are you sure you want to delete this report?')) {
      setReports(prev => prev.filter(r => r.id !== reportId));
      // Also delete history
      setReportHistory(prev => prev.filter(h => h.reportId !== reportId));
    }
  };

  const handleToggleActive = (reportId: string) => {
    setReports(prev => prev.map(r => 
      r.id === reportId ? { ...r, isActive: !r.isActive } : r
    ));
  };

  const handleSendNow = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    // Simulate sending report
    const newHistory: ReportHistory = {
      id: `history_${Date.now()}`,
      reportId: report.id,
      status: 'sent',
      sentAt: new Date().toISOString(),
      recipients: report.recipients,
      format: report.format,
      fileSize: Math.floor(Math.random() * 500000) + 100000, // Random size for demo
      downloadUrl: '#',
      teamId: currentTeamId
    };

    setReportHistory(prev => [...prev, newHistory]);
    setReports(prev => prev.map(r => 
      r.id === reportId ? { ...r, lastSent: new Date().toISOString() } : r
    ));

    alert(language === 'el' ? 'Η αναφορά στάλθηκε επιτυχώς!' : 'Report sent successfully!');
  };

  const reportTypeOptions: { value: ReportType | 'all'; label: string }[] = [
    { value: 'all', label: language === 'el' ? 'Όλοι οι Τύποι' : 'All Types' },
    ...Object.entries(REPORT_TYPE_TRANSLATIONS).map(([key, trans]) => ({
      value: key as ReportType,
      label: trans[language]
    }))
  ];

  const frequencyOptions: { value: ReportFrequency | 'all'; label: string }[] = [
    { value: 'all', label: language === 'el' ? 'Όλες οι Συχνότητες' : 'All Frequencies' },
    ...Object.entries(REPORT_FREQUENCY_TRANSLATIONS).map(([key, trans]) => ({
      value: key as ReportFrequency,
      label: trans[language]
    }))
  ];

  const activeReportsCount = teamReports.filter(r => r.isActive).length;
  const scheduledReportsCount = teamReports.filter(r => r.isActive && r.frequency !== 'manual').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {language === 'el' ? 'Αναφορές Email' : 'Email Reports'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {language === 'el' 
                ? 'Προγραμματισμένες αναφορές και ιστορικό αποστολών' 
                : 'Scheduled reports and sending history'}
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-6 py-3 bg-brand-yellow hover:bg-yellow-500 text-gray-900 rounded-lg font-medium transition-colors"
          >
            <Icon name="plus" className="w-5 h-5" />
            {language === 'el' ? 'Νέα Αναφορά' : 'New Report'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Icon name="file-text" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'el' ? 'Σύνολο Αναφορών' : 'Total Reports'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{teamReports.length}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Icon name="check-circle" className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'el' ? 'Ενεργές' : 'Active'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeReportsCount}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Icon name="clock" className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'el' ? 'Προγραμματισμένες' : 'Scheduled'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{scheduledReportsCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {language === 'el' ? 'Τύπος:' : 'Type:'}
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ReportType | 'all')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          >
            {reportTypeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {language === 'el' ? 'Συχνότητα:' : 'Frequency:'}
          </label>
          <select
            value={filterFrequency}
            onChange={(e) => setFilterFrequency(e.target.value as ReportFrequency | 'all')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          >
            {frequencyOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {language === 'el' ? 'Εμφάνιση Ανενεργών' : 'Show Inactive'}
          </span>
        </label>
      </div>

      {/* Reports Grid */}
      {teamReports.length === 0 ? (
        <div className="text-center py-16">
          <Icon name="mail" className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
            {language === 'el' ? 'Δεν υπάρχουν αναφορές' : 'No reports yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mb-6">
            {language === 'el' 
              ? 'Δημιουργήστε προγραμματισμένες αναφορές για απόθεμα, φθορές ή HACCP' 
              : 'Create scheduled reports for inventory, waste, or HACCP'}
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-6 py-3 bg-brand-yellow hover:bg-yellow-500 text-gray-900 rounded-lg font-medium transition-colors"
          >
            {language === 'el' ? 'Δημιουργία Πρώτης Αναφοράς' : 'Create First Report'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamReports.map(report => (
            <ReportCard
              key={report.id}
              report={report}
              reportHistory={reportHistory.filter(h => h.reportId === report.id)}
              onEdit={() => setEditingReport(report)}
              onDelete={() => handleDeleteReport(report.id)}
              onToggleActive={() => handleToggleActive(report.id)}
              onSendNow={() => handleSendNow(report.id)}
              onViewHistory={() => setSelectedHistoryReportId(report.id)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(isCreating || editingReport) && (
        <CreateReportModal
          isOpen={true}
          reportToEdit={editingReport}
          onSave={editingReport ? handleUpdateReport : handleCreateReport}
          onCancel={() => {
            setIsCreating(false);
            setEditingReport(null);
          }}
          currentTeamId={currentTeamId}
        />
      )}

      {/* History Modal */}
      {selectedHistoryReportId && (
        <ReportHistoryModal
          isOpen={true}
          report={reports.find(r => r.id === selectedHistoryReportId)!}
          history={reportHistory.filter(h => h.reportId === selectedHistoryReportId)}
          onClose={() => setSelectedHistoryReportId(null)}
        />
      )}
    </div>
  );
};

export default EmailReportsView;
