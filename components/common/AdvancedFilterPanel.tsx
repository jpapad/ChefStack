import React, { useState } from 'react';
import { Icon } from './Icon';
import { useTranslation } from '../../i18n';

export interface FilterConfig {
  id: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'boolean';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface FilterValue {
  [key: string]: any;
}

interface AdvancedFilterPanelProps {
  filters: FilterConfig[];
  values: FilterValue;
  onChange: (values: FilterValue) => void;
  onSavePreset?: (name: string, values: FilterValue) => void;
  presets?: { name: string; values: FilterValue }[];
  onLoadPreset?: (values: FilterValue) => void;
  onDeletePreset?: (name: string) => void;
  onClear?: () => void;
}

const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({
  filters,
  values,
  onChange,
  onSavePreset,
  presets = [],
  onLoadPreset,
  onDeletePreset,
  onClear,
}) => {
  const { language } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);

  const handleFilterChange = (filterId: string, value: any) => {
    onChange({ ...values, [filterId]: value });
  };

  const handleClear = () => {
    const clearedValues: FilterValue = {};
    filters.forEach(f => {
      if (f.type === 'multiselect') {
        clearedValues[f.id] = [];
      } else if (f.type === 'boolean') {
        clearedValues[f.id] = false;
      } else if (f.type === 'daterange') {
        clearedValues[f.id] = { from: '', to: '' };
      } else {
        clearedValues[f.id] = '';
      }
    });
    onChange(clearedValues);
    onClear?.();
  };

  const handleSavePreset = () => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset(presetName.trim(), values);
      setPresetName('');
      setShowPresetModal(false);
    }
  };

  const activeFiltersCount = Object.values(values).filter(v => {
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'boolean') return v;
    if (typeof v === 'object' && v !== null) {
      return Object.values(v).some(val => val !== '' && val !== null);
    }
    return v !== '' && v !== null && v !== undefined;
  }).length;

  const renderFilter = (filter: FilterConfig) => {
    const value = values[filter.id];

    switch (filter.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            placeholder={filter.placeholder}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-light-text dark:text-dark-text text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-light-text dark:text-dark-text text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{language === 'el' ? 'Όλα' : 'All'}</option>
            {filter.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {filter.options?.map(opt => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={(value || []).includes(opt.value)}
                  onChange={(e) => {
                    const current = value || [];
                    const updated = e.target.checked
                      ? [...current, opt.value]
                      : current.filter((v: string) => v !== opt.value);
                    handleFilterChange(filter.id, updated);
                  }}
                  className="rounded text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-light-text dark:text-dark-text">{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-light-text dark:text-dark-text text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'daterange':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                {language === 'el' ? 'Από:' : 'From:'}
              </span>
              <input
                type="date"
                value={value?.from || ''}
                onChange={(e) => handleFilterChange(filter.id, { ...(value || {}), from: e.target.value })}
                className="flex-1 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-light-text dark:text-dark-text text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                {language === 'el' ? 'Έως:' : 'To:'}
              </span>
              <input
                type="date"
                value={value?.to || ''}
                onChange={(e) => handleFilterChange(filter.id, { ...(value || {}), to: e.target.value })}
                className="flex-1 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-light-text dark:text-dark-text text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            placeholder={filter.placeholder}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-light-text dark:text-dark-text text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleFilterChange(filter.id, e.target.checked)}
              className="rounded text-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-light-text dark:text-dark-text text-sm">
              {filter.placeholder || filter.label}
            </span>
          </label>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-slate-700">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-light-text dark:text-dark-text font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Icon name={isExpanded ? 'chevron-down' : 'chevron-right'} className="w-4 h-4" />
          <Icon name="filter" className="w-4 h-4" />
          {language === 'el' ? 'Φίλτρα' : 'Filters'}
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          {/* Presets Menu */}
          {presets.length > 0 && onLoadPreset && (
            <div className="relative">
              <button
                onClick={() => setShowPresetsMenu(!showPresetsMenu)}
                className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-light-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-slate-600"
              >
                <Icon name="bookmark" className="w-3 h-3" />
                {language === 'el' ? 'Προεπιλογές' : 'Presets'}
                <Icon name="chevron-down" className="w-3 h-3" />
              </button>

              {showPresetsMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowPresetsMenu(false)}
                  />
                  <div className="absolute right-0 top-8 z-50 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
                    {presets.map(preset => (
                      <div
                        key={preset.name}
                        className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        <button
                          onClick={() => {
                            onLoadPreset(preset.values);
                            setShowPresetsMenu(false);
                          }}
                          className="flex-1 text-left text-sm text-light-text dark:text-dark-text"
                        >
                          {preset.name}
                        </button>
                        {onDeletePreset && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeletePreset(preset.name);
                            }}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                            title={language === 'el' ? 'Διαγραφή' : 'Delete'}
                          >
                            <Icon name="trash-2" className="w-3 h-3 text-red-600 dark:text-red-400" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Save Preset */}
          {onSavePreset && activeFiltersCount > 0 && (
            <button
              onClick={() => setShowPresetModal(true)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
              title={language === 'el' ? 'Αποθήκευση φίλτρων' : 'Save filters'}
            >
              <Icon name="save" className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}

          {/* Clear */}
          {activeFiltersCount > 0 && (
            <button
              onClick={handleClear}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
              title={language === 'el' ? 'Καθαρισμός φίλτρων' : 'Clear filters'}
            >
              <Icon name="x" className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      {isExpanded && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filters.map(filter => (
            <div key={filter.id} className="space-y-1">
              <label className="block text-sm font-medium text-light-text dark:text-dark-text">
                {filter.label}
              </label>
              {renderFilter(filter)}
            </div>
          ))}
        </div>
      )}

      {/* Active Filter Chips */}
      {!isExpanded && activeFiltersCount > 0 && (
        <div className="p-3 flex flex-wrap gap-2 border-t border-gray-200 dark:border-slate-700">
          {Object.entries(values).map(([key, value]) => {
            if (!value || (Array.isArray(value) && value.length === 0)) return null;
            if (typeof value === 'object' && !Array.isArray(value)) {
              const objValue = value as { from?: string; to?: string };
              if (!objValue.from && !objValue.to) return null;
            }
            
            const filter = filters.find(f => f.id === key);
            if (!filter) return null;

            let displayValue = '';
            if (Array.isArray(value)) {
              displayValue = `${value.length} ${language === 'el' ? 'επιλογές' : 'selected'}`;
            } else if (typeof value === 'object' && value !== null) {
              const objValue = value as { from?: string; to?: string };
              if (objValue.from && objValue.to) {
                displayValue = `${objValue.from} - ${objValue.to}`;
              } else if (objValue.from) {
                displayValue = `${language === 'el' ? 'Από' : 'From'} ${objValue.from}`;
              } else if (objValue.to) {
                displayValue = `${language === 'el' ? 'Έως' : 'To'} ${objValue.to}`;
              }
            } else if (typeof value === 'boolean') {
              displayValue = language === 'el' ? 'Ενεργό' : 'Active';
            } else {
              displayValue = String(value);
            }

            return (
              <div
                key={key}
                className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs"
              >
                <span className="font-medium">{filter.label}:</span>
                <span>{displayValue}</span>
                <button
                  onClick={() => handleFilterChange(key, filter.type === 'multiselect' ? [] : filter.type === 'daterange' ? { from: '', to: '' } : '')}
                  className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                >
                  <Icon name="x" className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Save Preset Modal */}
      {showPresetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-96">
            <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
              {language === 'el' ? 'Αποθήκευση Φίλτρων' : 'Save Filter Preset'}
            </h3>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder={language === 'el' ? 'Όνομα προεπιλογής...' : 'Preset name...'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-light-text dark:text-dark-text mb-4"
              onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {language === 'el' ? 'Αποθήκευση' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setShowPresetModal(false);
                  setPresetName('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 text-light-text dark:text-dark-text rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                {language === 'el' ? 'Ακύρωση' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilterPanel;
