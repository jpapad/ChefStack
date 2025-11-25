import React, { useMemo } from 'react';
import { HaccpLog, HaccpItem } from '../../types';
import { useTranslation } from '../../i18n';
import { Icon } from '../common/Icon';
import LineChart from '../common/LineChart';
import { analyzeTemperatureTrends } from '../../utils/haccpHelpers';

interface HaccpTrendAnalysisProps {
  logs: HaccpLog[];
  haccpItems: HaccpItem[];
  selectedItem: HaccpItem | null;
  onSelectItem: (item: HaccpItem | null) => void;
  days?: number; // Number of days to show (default 7)
}

export const HaccpTrendAnalysis: React.FC<HaccpTrendAnalysisProps> = ({
  logs,
  haccpItems,
  selectedItem,
  onSelectItem,
  days = 7
}) => {
  const { t } = useTranslation();

  // Use first item if none selected
  const item = selectedItem || haccpItems[0];
  
  if (!item) {
    return (
      <div className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary">
        {t('no_haccp_items')}
      </div>
    );
  }

  // Filter logs for this item in the time period
  const periodLogs = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return logs
      .filter(log => 
        log.haccpItemId === item.id &&
        log.value &&
        new Date(log.timestamp) >= cutoff
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [logs, item.id, days]);

  // Analyze trends
  const analysis = useMemo(() => analyzeTemperatureTrends(periodLogs, item.id), [periodLogs, item.id]);

  // Prepare data for chart
  const chartData = useMemo(() => {
    return periodLogs.map(log => ({
      label: new Date(log.timestamp).toLocaleDateString('el-GR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      value: parseFloat(log.value!),
      isOutOfRange: log.isOutOfRange || false
    }));
  }, [periodLogs]);

  if (periodLogs.length === 0) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 text-center">
        <Icon name="trending-up" className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
        <p className="text-slate-600 dark:text-slate-400">
          {t('haccp_no_data_for_trend')}
        </p>
      </div>
    );
  }

  const getTrendIcon = (trend: 'stable' | 'rising' | 'falling') => {
    switch (trend) {
      case 'rising':
        return <Icon name="trending-up" className="w-5 h-5 text-red-500" />;
      case 'falling':
        return <Icon name="trending-down" className="w-5 h-5 text-blue-500" />;
      default:
        return <Icon name="minus" className="w-5 h-5 text-green-500" />;
    }
  };

  const getTrendLabel = (trend: 'stable' | 'rising' | 'falling') => {
    switch (trend) {
      case 'rising':
        return t('haccp_trend_rising');
      case 'falling':
        return t('haccp_trend_falling');
      default:
        return t('haccp_trend_stable');
    }
  };

  return (
    <div className="space-y-6">
      {/* Item Selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
          {t('haccp_select_item')}:
        </label>
        <select
          value={item.id}
          onChange={(e) => {
            const selected = haccpItems.find(i => i.id === e.target.value);
            onSelectItem(selected || null);
          }}
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-dark-bg text-sm"
        >
          {haccpItems.map(hItem => (
            <option key={hItem.id} value={hItem.id}>
              {hItem.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-card p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {t('haccp_average')}
          </p>
          <p className="text-2xl font-bold text-brand-yellow">
            {analysis.average.toFixed(1)}°C
          </p>
        </div>
        
        <div className="bg-white dark:bg-dark-card p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {t('haccp_min_max')}
          </p>
          <p className="text-2xl font-bold">
            <span className="text-blue-500">{analysis.min.toFixed(1)}</span>
            <span className="text-slate-400 mx-1">/</span>
            <span className="text-red-500">{analysis.max.toFixed(1)}</span>
          </p>
        </div>
        
        <div className="bg-white dark:bg-dark-card p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {t('haccp_trend')}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {getTrendIcon(analysis.trend)}
            <span className="text-sm font-semibold">
              {getTrendLabel(analysis.trend)}
            </span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-card p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {t('haccp_out_of_range')}
          </p>
          <p className={`text-2xl font-bold ${
            analysis.outOfRangeCount > 0 ? 'text-red-500' : 'text-green-500'
          }`}>
            {analysis.outOfRangeCount}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-dark-card p-6 rounded-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold mb-4">
          {t('haccp_temperature_history')} ({days} {t('days')})
        </h3>
        
        {chartData.length > 0 ? (
          <LineChart
            data={chartData}
            height={250}
            showGrid={true}
            showDots={true}
            lineColor="#fbbf24"
            dotColor="#fbbf24"
            gridColor="rgba(148, 163, 184, 0.1)"
          />
        ) : (
          <p className="text-center text-slate-500 py-8">{t('no_data')}</p>
        )}
      </div>

      {/* Out of range alerts */}
      {analysis.outOfRangeCount > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon name="alert-triangle" className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-800 dark:text-red-300 mb-1">
                {t('haccp_compliance_warning')}
              </p>
              <p className="text-sm text-red-700 dark:text-red-400">
                {t('haccp_out_of_range_count', { count: analysis.outOfRangeCount })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.trend === 'rising' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon name="lightbulb" className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                {t('haccp_recommendation')}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                {t('haccp_rising_temp_warning')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
