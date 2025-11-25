import React from 'react';

export interface BarChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  height?: number;
  maxValue?: number;
  showValues?: boolean;
  horizontal?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  maxValue,
  showValues = true,
  horizontal = false
}) => {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);

  if (horizontal) {
    return (
      <div className="w-full space-y-3">
        {data.map((item, idx) => {
          const percentage = (item.value / max) * 100;
          const color = item.color || 'bg-brand-yellow';
          
          return (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-24 text-sm text-gray-700 dark:text-gray-300 truncate text-right">
                {item.label}
              </div>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                <div
                  className={`${color} h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                  style={{ width: `${percentage}%` }}
                >
                  {showValues && percentage > 20 && (
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {item.value}
                    </span>
                  )}
                </div>
              </div>
              {showValues && percentage <= 20 && (
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-8">
                  {item.value}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical bars
  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <div className="h-full flex items-end justify-around gap-2">
        {data.map((item, idx) => {
          const percentage = (item.value / max) * 100;
          const color = item.color || 'bg-brand-yellow';
          
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center justify-end" style={{ height: `${height - 40}px` }}>
                {showValues && (
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {item.value}
                  </span>
                )}
                <div
                  className={`${color} w-full rounded-t transition-all duration-500`}
                  style={{ height: `${percentage}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 text-center truncate w-full">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChart;
