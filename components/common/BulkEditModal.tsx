import React, { useState } from 'react';
import { Icon } from './Icon';
import { useTranslation } from '../../i18n';

export interface BulkEditField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'date' | 'boolean';
  options?: { value: string; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

interface BulkEditModalProps {
  isOpen: boolean;
  title: string;
  selectedCount: number;
  fields: BulkEditField[];
  onSave: (changes: Record<string, any>) => void;
  onCancel: () => void;
}

const BulkEditModal: React.FC<BulkEditModalProps> = ({
  isOpen,
  title,
  selectedCount,
  fields,
  onSave,
  onCancel,
}) => {
  const { language } = useTranslation();
  const [changes, setChanges] = useState<Record<string, any>>({});
  const [enabledFields, setEnabledFields] = useState<Set<string>>(new Set());

  const handleToggleField = (fieldId: string) => {
    const newEnabled = new Set(enabledFields);
    if (newEnabled.has(fieldId)) {
      newEnabled.delete(fieldId);
      const newChanges = { ...changes };
      delete newChanges[fieldId];
      setChanges(newChanges);
    } else {
      newEnabled.add(fieldId);
    }
    setEnabledFields(newEnabled);
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setChanges({ ...changes, [fieldId]: value });
  };

  const handleSave = () => {
    const filteredChanges: Record<string, any> = {};
    enabledFields.forEach((fieldId) => {
      if (changes[fieldId] !== undefined) {
        filteredChanges[fieldId] = changes[fieldId];
      }
    });
    onSave(filteredChanges);
    setChanges({});
    setEnabledFields(new Set());
  };

  const handleCancel = () => {
    setChanges({});
    setEnabledFields(new Set());
    onCancel();
  };

  const renderField = (field: BulkEditField) => {
    const value = changes[field.id];

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-light-text dark:text-dark-text focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!enabledFields.has(field.id)}
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-light-text dark:text-dark-text focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!enabledFields.has(field.id)}
          >
            <option value="">{language === 'el' ? 'Επιλέξτε...' : 'Select...'}</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value))}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-light-text dark:text-dark-text focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!enabledFields.has(field.id)}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-light-text dark:text-dark-text focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!enabledFields.has(field.id)}
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              className="rounded text-blue-500 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!enabledFields.has(field.id)}
            />
            <span className="text-light-text dark:text-dark-text">
              {language === 'el' ? 'Ενεργό' : 'Enabled'}
            </span>
          </label>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
                {title}
              </h2>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                {language === 'el' ? 'Μαζική επεξεργασία' : 'Bulk edit'} {selectedCount}{' '}
                {language === 'el' ? 'επιλεγμένων εγγραφών' : 'selected items'}
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Icon name="x" className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
              <Icon name="info" className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {language === 'el'
                  ? 'Επιλέξτε τα πεδία που θέλετε να ενημερώσετε. Μόνο τα ενεργά πεδία θα αλλάξουν.'
                  : 'Select the fields you want to update. Only enabled fields will be changed.'}
              </p>
            </div>

            {fields.map((field) => (
              <div
                key={field.id}
                className={`border rounded-lg p-4 transition-all ${
                  enabledFields.has(field.id)
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                    : 'border-gray-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={enabledFields.has(field.id)}
                    onChange={() => handleToggleField(field.id)}
                    className="rounded text-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="font-medium text-light-text dark:text-dark-text cursor-pointer flex-1">
                    {field.label}
                  </label>
                </div>
                <div className="ml-7">{renderField(field)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-700 text-light-text dark:text-dark-text rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            {language === 'el' ? 'Ακύρωση' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            disabled={enabledFields.size === 0}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Icon name="check" className="w-5 h-5" />
            {language === 'el' ? 'Εφαρμογή Αλλαγών' : 'Apply Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkEditModal;
