import React from 'react';

export interface DonutChartSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutChartSegment[];
  size?: number;
  thickness?: number;
  showLegend?: boolean;
  centerText?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  size = 180,
  thickness = 35,
  showLegend = true,
  centerText
}) => {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  
  if (total === 0) {
    return (
      <div className="flex items-center justify-center text-gray-400 dark:text-gray-600">
        Δεν υπάρχουν δεδομένα
      </div>
    );
  }

  const radius = size / 2;
  const innerRadius = radius - thickness;
  const circumference = 2 * Math.PI * radius;
  
  let accumulatedPercentage = 0;

  const createArc = (percentage: number, startPercentage: number) => {
    const startAngle = (startPercentage * 360) - 90;
    const endAngle = ((startPercentage + percentage) * 360) - 90;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = radius + radius * Math.cos(startRad);
    const y1 = radius + radius * Math.sin(startRad);
    const x2 = radius + radius * Math.cos(endRad);
    const y2 = radius + radius * Math.sin(endRad);
    
    const largeArc = percentage > 0.5 ? 1 : 0;
    
    return `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={radius}
            cy={radius}
            r={radius}
            fill="none"
            className="stroke-gray-200 dark:stroke-gray-700"
            strokeWidth={thickness}
          />
          
          {/* Segments */}
          {segments.map((segment, idx) => {
            const percentage = segment.value / total;
            const path = createArc(percentage, accumulatedPercentage);
            accumulatedPercentage += percentage;
            
            return (
              <path
                key={idx}
                d={path}
                fill={segment.color}
                className="transition-all duration-300 hover:opacity-80"
              />
            );
          })}
          
          {/* Inner circle (creates donut hole) */}
          <circle
            cx={radius}
            cy={radius}
            r={innerRadius}
            className="fill-white dark:fill-gray-900"
          />
        </svg>
        
        {/* Center text */}
        {centerText && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {centerText}
            </span>
          </div>
        )}
      </div>
      
      {/* Legend */}
      {showLegend && (
        <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
          {segments.map((segment, idx) => {
            const percentage = ((segment.value / total) * 100).toFixed(1);
            return (
              <div key={idx} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                  {segment.label} ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DonutChart;
