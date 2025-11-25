import React from 'react';
import type { InventoryItem } from '../../types';
import BarChart, { BarChartDataPoint } from '../common/BarChart';
import { useTranslation } from '../../i18n';

interface InventoryAlertsWidgetProps {
  inventory: InventoryItem[];
  limit?: number;
}

const InventoryAlertsWidget: React.FC<InventoryAlertsWidgetProps> = ({
  inventory,
  limit = 8
}) => {
  const { t } = useTranslation();

  const alertItems = React.useMemo(() => {
    return inventory
      .map(item => {
        const totalQty = (item.locations || []).reduce((sum, l) => sum + (l.quantity || 0), 0);
        const reorderPoint = item.reorderPoint || 0;
        
        // Calculate urgency level
        let urgency: 'critical' | 'warning' | 'low' = 'low';
        let color = 'bg-green-500';
        
        if (reorderPoint > 0 && totalQty <= reorderPoint) {
          const percentage = (totalQty / reorderPoint) * 100;
          if (percentage <= 25) {
            urgency = 'critical';
            color = 'bg-red-500';
          } else if (percentage <= 50) {
            urgency = 'warning';
            color = 'bg-yellow-500';
          }
        }
        
        return {
          ...item,
          totalQty,
          reorderPoint,
          urgency,
          color,
          percentage: reorderPoint > 0 ? (totalQty / reorderPoint) * 100 : 100
        };
      })
      .filter(item => item.reorderPoint > 0 && item.totalQty <= item.reorderPoint)
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, limit);
  }, [inventory, limit]);

  const chartData: BarChartDataPoint[] = alertItems.map(item => ({
    label: item.name.length > 12 ? item.name.substring(0, 12) + '...' : item.name,
    value: item.totalQty,
    color: item.color
  }));

  if (alertItems.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <span>📦</span>
          {t('dashboard_inventory_alerts')}
        </h3>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          ✅ {t('dashboard_no_alerts')}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <span>📦</span>
        {t('dashboard_inventory_alerts')}
        <span className="ml-auto text-sm font-normal text-red-600 dark:text-red-400">
          {alertItems.length} {t('dashboard_low_stock')}
        </span>
      </h3>
      
      <div className="mb-4">
        <BarChart data={chartData} height={200} showValues horizontal />
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>{t('dashboard_critical')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>{t('dashboard_warning')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>{t('dashboard_ok')}</span>
        </div>
      </div>
    </div>
  );
};

export default InventoryAlertsWidget;
