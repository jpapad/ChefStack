import React from 'react';
import { InventoryItem } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

interface StockAlertPanelProps {
  lowStockItems: (InventoryItem & { totalQuantity: number })[];
  zeroStockCount: number;
  onSelectItem: (id: string) => void;
}

const StockAlertPanel: React.FC<StockAlertPanelProps> = ({
  lowStockItems,
  zeroStockCount,
  onSelectItem
}) => {
  const { t } = useTranslation();

  if (lowStockItems.length === 0) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Icon name="check-circle" className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">Όλα Εντάξει!</h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Δεν υπάρχουν είδη με χαμηλό απόθεμα
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Critical Alert */}
      {zeroStockCount > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Icon name="alert-triangle" className="w-6 h-6 text-red-600 dark:text-red-400" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-100">Κρίσιμη Έλλειψη!</h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                {zeroStockCount} {zeroStockCount === 1 ? 'είδος έχει' : 'είδη έχουν'} εξαντληθεί
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Low Stock Warnings */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-800 rounded-lg overflow-hidden">
        <div className="bg-amber-100 dark:bg-amber-900/40 px-4 py-3 border-b border-amber-300 dark:border-amber-800">
          <div className="flex items-center gap-3">
            <Icon name="alert-circle" className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-semibold text-amber-900 dark:text-amber-100">
              Χαμηλό Απόθεμα ({lowStockItems.length})
            </h3>
          </div>
        </div>
        <div className="divide-y divide-amber-200 dark:divide-amber-800">
          {lowStockItems.map(item => {
            const percentage = item.reorderPoint
              ? (item.totalQuantity / item.reorderPoint) * 100
              : 100;
            const isZero = item.totalQuantity <= 0.0001;
            const isCritical = percentage < 50;

            return (
              <button
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className="w-full px-4 py-3 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-left"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-amber-900 dark:text-amber-100 truncate">
                        {item.name}
                      </span>
                      {isZero && (
                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-semibold rounded-full">
                          ΕΞΑΝΤΛΗΜΕΝΟ
                        </span>
                      )}
                      {!isZero && isCritical && (
                        <span className="px-2 py-0.5 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs font-semibold rounded-full">
                          ΚΡΙΣΙΜΟ
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-amber-700 dark:text-amber-300">
                      <span className="font-mono">
                        Διαθέσιμο: {item.totalQuantity.toFixed(1)} {item.unit}
                      </span>
                      <span className="font-mono">
                        Όριο: {item.reorderPoint} {item.unit}
                      </span>
                    </div>
                  </div>
                  <Icon name="chevron-right" className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                </div>
                {/* Progress Bar */}
                <div className="mt-2 h-2 bg-amber-200 dark:bg-amber-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isZero
                        ? 'bg-red-600'
                        : isCritical
                        ? 'bg-amber-600'
                        : 'bg-amber-400'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Action Hint */}
      <div className="text-xs text-amber-700 dark:text-amber-400 italic px-2">
        💡 Κάντε κλικ σε ένα είδος για γρήγορη ενημέρωση αποθέματος
      </div>
    </div>
  );
};

export default StockAlertPanel;
