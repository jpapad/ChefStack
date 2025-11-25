import React, { useState } from 'react';
import { Icon } from './Icon';
import { useTranslation } from '../../i18n';

export interface BatchAction {
  id: string;
  label: string;
  icon: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange';
  dangerous?: boolean;
  requiresConfirmation?: boolean;
  action: () => void;
}

interface BatchActionBarProps {
  selectedCount: number;
  totalCount: number;
  actions: BatchAction[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onCancel: () => void;
}

const BatchActionBar: React.FC<BatchActionBarProps> = ({
  selectedCount,
  totalCount,
  actions,
  onSelectAll,
  onDeselectAll,
  onCancel,
}) => {
  const { language } = useTranslation();
  const [showActions, setShowActions] = useState(false);

  const getColorClasses = (color?: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'green':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'red':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'yellow':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'purple':
        return 'bg-purple-600 hover:bg-purple-700 text-white';
      case 'orange':
        return 'bg-orange-600 hover:bg-orange-700 text-white';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 animate-slide-up">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-2xl border border-blue-400/30 px-6 py-4 flex items-center gap-4 backdrop-blur-lg">
        {/* Selection Info */}
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-2">
            <Icon name="check-square" className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-lg">
              {selectedCount} {language === 'el' ? 'επιλεγμένα' : 'selected'}
            </p>
            <p className="text-xs text-blue-100">
              {language === 'el' ? 'από' : 'of'} {totalCount} {language === 'el' ? 'συνολικά' : 'total'}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-12 w-px bg-white/20" />

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {selectedCount < totalCount && (
            <button
              onClick={onSelectAll}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
              title={language === 'el' ? 'Επιλογή όλων' : 'Select all'}
            >
              <Icon name="check-circle" className="w-4 h-4" />
              {language === 'el' ? 'Όλα' : 'All'}
            </button>
          )}
          
          <button
            onClick={onDeselectAll}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
            title={language === 'el' ? 'Αποεπιλογή όλων' : 'Deselect all'}
          >
            <Icon name="x-circle" className="w-4 h-4" />
            {language === 'el' ? 'Καμία' : 'None'}
          </button>
        </div>

        {/* Divider */}
        <div className="h-12 w-px bg-white/20" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {actions.slice(0, 3).map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className={`px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2 shadow-lg hover:shadow-xl ${getColorClasses(action.color)}`}
              title={action.label}
            >
              <Icon name={action.icon} className="w-4 h-4" />
              <span className="hidden md:inline">{action.label}</span>
            </button>
          ))}

          {actions.length > 3 && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-1"
              >
                <Icon name="more-horizontal" className="w-4 h-4" />
                <span className="text-sm">+{actions.length - 3}</span>
              </button>

              {showActions && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowActions(false)}
                  />
                  <div className="absolute bottom-full mb-2 right-0 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden min-w-48">
                    {actions.slice(3).map((action) => (
                      <button
                        key={action.id}
                        onClick={() => {
                          action.action();
                          setShowActions(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          action.dangerous
                            ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Icon name={action.icon} className="w-4 h-4" />
                        <span className="font-medium">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Cancel */}
        <div className="h-12 w-px bg-white/20" />
        <button
          onClick={onCancel}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title={language === 'el' ? 'Ακύρωση' : 'Cancel'}
        >
          <Icon name="x" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default BatchActionBar;
