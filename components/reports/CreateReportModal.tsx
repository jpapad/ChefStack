import React, { useState, useEffect } from 'react';
import { EmailReport, ReportType, ReportFrequency, ReportFormat, REPORT_TYPE_TRANSLATIONS, REPORT_FREQUENCY_TRANSLATIONS } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

interface CreateReportModalProps {
  isOpen: boolean;
  reportToEdit?: EmailReport | null;
  onSave: (report: Omit<EmailReport, 'id' | 'createdAt' | 'createdBy'>) => void;
  onCancel: () => void;
  currentTeamId: string;
}

const CreateReportModal: React.FC<CreateReportModalProps> = ({
  isOpen,
  reportToEdit,
  onSave,
  onCancel,
  currentTeamId
}) => {
  const { language } = useTranslation();

  const initialState: Omit<EmailReport, 'id' | 'createdAt' | 'createdBy'> = {
    name: '',
    reportType: 'inventory',
    frequency: 'weekly',
    format: 'pdf',
    recipients: [],
    isActive: true,
    scheduledTime: '09:00',
    includeCharts: true,
    teamId: currentTeamId
  };

  const [report, setReport] = useState<Omit<EmailReport, 'id' | 'createdAt' | 'createdBy'>>(initialState);
  const [emailInput, setEmailInput] = useState('');
  const [currentTab, setCurrentTab] = useState<'basic' | 'schedule' | 'content'>('basic');

  useEffect(() => {
    if (reportToEdit) {
      setReport(reportToEdit);
    } else {
      setReport(initialState);
    }
  }, [reportToEdit]);

  const handleSave = () => {
    if (!report.name) {
      alert(language === 'el' ? 'Παρακαλώ εισάγετε όνομα αναφοράς' : 'Please enter a report name');
      return;
    }
    if (report.recipients.length === 0) {
      alert(language === 'el' ? 'Παρακαλώ προσθέστε τουλάχιστον έναν παραλήπτη' : 'Please add at least one recipient');
      return;
    }
    onSave(report);
  };

  const handleAddEmail = () => {
    const email = emailInput.trim();
    if (!email) return;
    
    // Simple email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert(language === 'el' ? 'Μη έγκυρη διεύθυνση email' : 'Invalid email address');
      return;
    }

    if (report.recipients.includes(email)) {
      alert(language === 'el' ? 'Το email υπάρχει ήδη' : 'Email already exists');
      return;
    }

    setReport(prev => ({ ...prev, recipients: [...prev.recipients, email] }));
    setEmailInput('');
  };

  const handleRemoveEmail = (email: string) => {
    setReport(prev => ({
      ...prev,
      recipients: prev.recipients.filter(e => e !== email)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {reportToEdit 
                ? (language === 'el' ? 'Επεξεργασία Αναφοράς' : 'Edit Report')
                : (language === 'el' ? 'Νέα Αναφορά Email' : 'New Email Report')
              }
            </h2>
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
              <Icon name="x" className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-700 px-6">
          {[
            { key: 'basic' as const, label: language === 'el' ? 'Βασικά' : 'Basic', icon: 'info' },
            { key: 'schedule' as const, label: language === 'el' ? 'Πρόγραμμα' : 'Schedule', icon: 'clock' },
            { key: 'content' as const, label: language === 'el' ? 'Περιεχόμενο' : 'Content', icon: 'file-text' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setCurrentTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                currentTab === tab.key
                  ? 'border-brand-yellow text-brand-yellow'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon name={tab.icon as any} className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentTab === 'basic' && (
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'el' ? 'Όνομα Αναφοράς' : 'Report Name'}
                </label>
                <input
                  type="text"
                  value={report.name}
                  onChange={(e) => setReport({...report, name: e.target.value})}
                  placeholder={language === 'el' ? 'π.χ. Εβδομαδιαία Αναφορά Αποθέματος' : 'e.g. Weekly Inventory Report'}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'el' ? 'Τύπος Αναφοράς' : 'Report Type'}
                </label>
                <select
                  value={report.reportType}
                  onChange={(e) => setReport({...report, reportType: e.target.value as ReportType})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  {Object.entries(REPORT_TYPE_TRANSLATIONS).map(([key, trans]) => (
                    <option key={key} value={key}>{trans[language]}</option>
                  ))}
                </select>
              </div>

              {/* Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'el' ? 'Μορφή Αρχείου' : 'File Format'}
                </label>
                <div className="flex gap-3">
                  {[
                    { value: 'pdf' as ReportFormat, label: 'PDF', icon: 'file-text', color: 'red' },
                    { value: 'csv' as ReportFormat, label: 'CSV', icon: 'file-spreadsheet', color: 'green' },
                    { value: 'both' as ReportFormat, label: language === 'el' ? 'Και τα δύο' : 'Both', icon: 'files', color: 'blue' }
                  ].map(format => (
                    <label key={format.value} className="flex-1">
                      <input
                        type="radio"
                        name="format"
                        value={format.value}
                        checked={report.format === format.value}
                        onChange={(e) => setReport({...report, format: e.target.value as ReportFormat})}
                        className="sr-only"
                      />
                      <div className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        report.format === format.value
                          ? `border-${format.color}-500 bg-${format.color}-50 dark:bg-${format.color}-900/20`
                          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                      }`}>
                        <div className="flex items-center justify-center gap-2">
                          <Icon name={format.icon as any} className="w-5 h-5" />
                          <span className="font-medium">{format.label}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Recipients */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'el' ? 'Παραλήπτες Email' : 'Email Recipients'}
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                    placeholder={language === 'el' ? 'email@example.com' : 'email@example.com'}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={handleAddEmail}
                    className="px-4 py-2 bg-brand-yellow hover:bg-yellow-500 text-gray-900 rounded-lg font-medium"
                  >
                    {language === 'el' ? 'Προσθήκη' : 'Add'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {report.recipients.map(email => (
                    <div key={email} className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-slate-700 rounded-lg">
                      <span className="text-sm">{email}</span>
                      <button
                        onClick={() => handleRemoveEmail(email)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Icon name="x" className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Status */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={report.isActive}
                  onChange={(e) => setReport({...report, isActive: e.target.checked})}
                  className="w-5 h-5"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  {language === 'el' ? 'Ενεργή Αναφορά' : 'Active Report'}
                </span>
              </label>
            </div>
          )}

          {currentTab === 'schedule' && (
            <div className="space-y-4">
              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'el' ? 'Συχνότητα' : 'Frequency'}
                </label>
                <select
                  value={report.frequency}
                  onChange={(e) => setReport({...report, frequency: e.target.value as ReportFrequency})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  {Object.entries(REPORT_FREQUENCY_TRANSLATIONS).map(([key, trans]) => (
                    <option key={key} value={key}>{trans[language]}</option>
                  ))}
                </select>
              </div>

              {report.frequency !== 'manual' && (
                <>
                  {/* Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'el' ? 'Ώρα Αποστολής' : 'Send Time'}
                    </label>
                    <input
                      type="time"
                      value={report.scheduledTime || '09:00'}
                      onChange={(e) => setReport({...report, scheduledTime: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Day of Week (for weekly/biweekly) */}
                  {(report.frequency === 'weekly' || report.frequency === 'biweekly') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {language === 'el' ? 'Ημέρα Εβδομάδας' : 'Day of Week'}
                      </label>
                      <select
                        value={report.scheduledDay || 1}
                        onChange={(e) => setReport({...report, scheduledDay: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      >
                        {(language === 'el' 
                          ? ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο']
                          : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                        ).map((day, idx) => (
                          <option key={idx} value={idx}>{day}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Day of Month (for monthly) */}
                  {report.frequency === 'monthly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {language === 'el' ? 'Ημέρα Μήνα' : 'Day of Month'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={report.scheduledDate || 1}
                        onChange={(e) => setReport({...report, scheduledDate: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {currentTab === 'content' && (
            <div className="space-y-4">
              {/* Include Charts */}
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 dark:border-slate-700 rounded-lg">
                <input
                  type="checkbox"
                  checked={report.includeCharts || false}
                  onChange={(e) => setReport({...report, includeCharts: e.target.checked})}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {language === 'el' ? 'Συμπερίληψη Γραφημάτων' : 'Include Charts'}
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'el' 
                      ? 'Προσθήκη γραφημάτων και οπτικοποιήσεων στην αναφορά' 
                      : 'Add charts and visualizations to the report'}
                  </p>
                </div>
              </label>

              {/* Custom Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'el' ? 'Προσαρμοσμένες Σημειώσεις' : 'Custom Notes'}
                </label>
                <textarea
                  value={report.customNotes || ''}
                  onChange={(e) => setReport({...report, customNotes: e.target.value})}
                  placeholder={language === 'el' ? 'Προσθέστε σημειώσεις που θα εμφανίζονται στην αναφορά...' : 'Add notes that will appear in the report...'}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            {language === 'el' ? 'Ακύρωση' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-brand-yellow hover:bg-yellow-500 text-gray-900 rounded-lg transition-colors font-medium"
          >
            {language === 'el' ? 'Αποθήκευση' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateReportModal;
