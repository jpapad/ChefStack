import React from 'react';

export interface LineChartDataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartDataPoint[];
  height?: number;
  color?: string;
  showDots?: boolean;
  showGrid?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 200,
  color = 'stroke-brand-yellow',
  showDots = true,
  showGrid = true
}) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
        Δεν υπάρχουν δεδομένα
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const range = maxValue - minValue || 1;
  
  const padding = 20;
  const chartWidth = 400;
  const chartHeight = height - padding * 2;
  
  const xStep = chartWidth / (data.length - 1 || 1);
  
  const points = data.map((point, idx) => {
    const x = padding + idx * xStep;
    const y = padding + chartHeight - ((point.value - minValue) / range) * chartHeight;
    return { x, y, value: point.value };
  });
  
  const pathD = points.map((p, idx) => {
    return `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
  }).join(' ');

  return (
    <div className="w-full">
      <svg 
        viewBox={`0 0 ${chartWidth + padding * 2} ${height}`}
        className="w-full"
        style={{ height: `${height}px` }}
      >
        {/* Grid lines */}
        {showGrid && (
          <g className="opacity-20">
            {[0, 0.25, 0.5, 0.75, 1].map((fraction, idx) => {
              const y = padding + chartHeight * (1 - fraction);
              return (
                <line
                  key={idx}
                  x1={padding}
                  y1={y}
                  x2={chartWidth + padding}
                  y2={y}
                  stroke="currentColor"
                  className="text-gray-400 dark:text-gray-600"
                  strokeWidth="1"
                />
              );
            })}
          </g>
        )}
        
        {/* Line path */}
        <path
          d={pathD}
          fill="none"
          className={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Dots */}
        {showDots && points.map((point, idx) => (
          <circle
            key={idx}
            cx={point.x}
            cy={point.y}
            r="4"
            className={`${color.replace('stroke-', 'fill-')} stroke-white dark:stroke-gray-900`}
            strokeWidth="2"
          />
        ))}
      </svg>
      
      {/* Labels */}
      <div className="flex justify-between px-2 mt-2">
        {data.map((point, idx) => (
          <div key={idx} className="text-xs text-gray-600 dark:text-gray-400 text-center">
            {point.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LineChart;
