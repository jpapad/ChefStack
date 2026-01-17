import React from 'react';
import { Icon } from './Icon';
import { useTranslation } from '../../i18n';

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  actions: BulkAction[];
  className?: string;
}

export interface BulkAction {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Icon>['name'];
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success';
  disabled?: boolean;
  requiresConfirmation?: boolean;
  confirmMessage?: string;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  actions,
  className = ''
}) => {
  const { t } = useTranslation();

  if (selectedCount === 0) return null;

  const handleAction = (action: BulkAction) => {
    if (action.disabled) return;

    if (action.requiresConfirmation) {
      const message = action.confirmMessage || `Είστε σίγουροι ότι θέλετε να εκτελέσετε αυτήν την ενέργεια σε ${selectedCount} στοιχεία;`;
      if (!window.confirm(message)) return;
    }

    action.onClick();
  };

  const variantStyles = {
    default: 'bg-blue-500 hover:bg-blue-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white'
  };

  return (
    <div
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 max-w-4xl w-full mx-4 ${className}`}
      role="toolbar"
      aria-label="Μαζικές ενέργειες"
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Selection Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-yellow/20 flex items-center justify-center">
            <Icon name="check-square" className="w-5 h-5 text-brand-yellow" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {selectedCount} επιλεγμένα
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              από {totalCount} συνολικά
            </p>
          </div>
        </div>

        {/* Selection Controls */}
        <div className="flex items-center gap-2">
          {selectedCount < totalCount ? (
            <button
              onClick={onSelectAll}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Επιλογή όλων"
            >
              Επιλογή όλων
            </button>
          ) : null}
          <button
            onClick={onDeselectAll}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Αποεπιλογή όλων"
          >
            Καθαρισμός
          </button>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-8 bg-gray-300 dark:bg-gray-600" />

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              disabled={action.disabled}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                variantStyles[action.variant || 'default']
              }`}
              aria-label={action.label}
            >
              <Icon name={action.icon} className="w-4 h-4" />
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Progress indicator (optional) */}
      <div className="mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-yellow transition-all duration-300"
          style={{ width: `${(selectedCount / totalCount) * 100}%` }}
        />
      </div>
    </div>
  );
};

// Checkbox for bulk selection in lists/cards
interface BulkCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const BulkCheckbox: React.FC<BulkCheckboxProps> = ({
  checked,
  onChange,
  disabled = false,
  className = ''
}) => {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="peer sr-only"
        aria-label="Επιλογή στοιχείου"
      />
      <div
        className={`w-5 h-5 rounded border-2 transition-all cursor-pointer ${
          checked
            ? 'bg-brand-yellow border-brand-yellow'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-brand-yellow'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && onChange(!checked)}
      >
        {checked && (
          <Icon name="check" className="w-4 h-4 text-dark-bg" />
        )}
      </div>
    </div>
  );
};

// Bulk selection header for tables
interface BulkSelectHeaderProps {
  selectedCount: number;
  totalCount: number;
  onToggleAll: () => void;
  label?: string;
}

export const BulkSelectHeader: React.FC<BulkSelectHeaderProps> = ({
  selectedCount,
  totalCount,
  onToggleAll,
  label = 'Επιλογή'
}) => {
  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const isSomeSelected = selectedCount > 0 && selectedCount < totalCount;

  return (
    <th className="px-4 py-3 text-left">
      <div className="flex items-center gap-2">
        <div
          className="relative flex items-center justify-center cursor-pointer"
          onClick={onToggleAll}
        >
          <div
            className={`w-5 h-5 rounded border-2 transition-all ${
              isAllSelected
                ? 'bg-brand-yellow border-brand-yellow'
                : isSomeSelected
                ? 'bg-brand-yellow/50 border-brand-yellow'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-brand-yellow'
            }`}
          >
            {isAllSelected && (
              <Icon name="check" className="w-4 h-4 text-dark-bg" />
            )}
            {isSomeSelected && (
              <div className="w-3 h-0.5 bg-dark-bg mx-auto" />
            )}
          </div>
        </div>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </span>
      </div>
    </th>
  );
};
