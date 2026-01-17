import React from 'react';
import { Icon, IconName } from './Icon';

export interface EnhancedKPICardProps {
  title: string;
  value: string | number;
  icon: IconName;
  trend?: {
    value: number; // e.g., 12 for +12%
    isPositive: boolean;
    label?: string; // e.g., "vs προηγ. μήνα"
  };
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export const EnhancedKPICard: React.FC<EnhancedKPICardProps> = ({
  title,
  value,
  icon,
  trend,
  description,
  variant = 'default',
  loading = false,
  onClick,
  className = ''
}) => {
  const variants = {
    default: {
      bg: 'from-brand-yellow/10 to-transparent',
      iconBg: 'bg-brand-yellow/20',
      iconColor: 'text-brand-yellow'
    },
    success: {
      bg: 'from-success-500/10 to-transparent',
      iconBg: 'bg-success-500/20',
      iconColor: 'text-success-600 dark:text-success-400'
    },
    warning: {
      bg: 'from-warning-500/10 to-transparent',
      iconBg: 'bg-warning-500/20',
      iconColor: 'text-warning-600 dark:text-warning-400'
    },
    danger: {
      bg: 'from-danger-500/10 to-transparent',
      iconBg: 'bg-danger-500/20',
      iconColor: 'text-danger-600 dark:text-danger-400'
    },
    info: {
      bg: 'from-info-500/10 to-transparent',
      iconBg: 'bg-info-500/20',
      iconColor: 'text-info-600 dark:text-info-400'
    }
  };

  const variantStyles = variants[variant];

  if (loading) {
    return (
      <div className={`card-elevated-1 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`card-elevated-1 relative overflow-hidden group p-6 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${variantStyles.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className="relative z-10 space-y-4">
        {/* Header: Title & Icon */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </span>
          <div
            className={`w-12 h-12 rounded-xl ${variantStyles.iconBg} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}
          >
            <Icon name={icon} className={`w-6 h-6 ${variantStyles.iconColor}`} />
          </div>
        </div>

        {/* Value */}
        <div className="text-4xl font-bold text-gray-900 dark:text-white">
          {typeof value === 'number' ? value.toLocaleString('el-GR') : value}
        </div>

        {/* Trend or Description */}
        {trend ? (
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                trend.isPositive
                  ? 'text-success-600 dark:text-success-400'
                  : 'text-danger-600 dark:text-danger-400'
              }`}
            >
              <Icon
                name={trend.isPositive ? 'trending-up' : 'trending-down'}
                className="w-4 h-4"
              />
              <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
            </div>
            {trend.label && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {trend.label}
              </span>
            )}
          </div>
        ) : description ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>

      {/* Subtle border animation on hover */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-gray-200 dark:group-hover:border-gray-700 rounded-2xl transition-colors duration-300" />
    </div>
  );
};

// Grid wrapper for KPI cards
export const KPICardGrid: React.FC<{
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}> = ({ children, columns = 4, className = '' }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>
      {children}
    </div>
  );
};

// Compact KPI variant for smaller spaces
export const CompactKPICard: React.FC<{
  label: string;
  value: string | number;
  icon: IconName;
  color?: 'yellow' | 'green' | 'blue' | 'red' | 'purple';
  onClick?: () => void;
}> = ({ label, value, icon, color = 'yellow', onClick }) => {
  const colors = {
    yellow: 'text-brand-yellow bg-brand-yellow/10',
    green: 'text-success-600 bg-success-500/10',
    blue: 'text-info-600 bg-info-500/10',
    red: 'text-danger-600 bg-danger-500/10',
    purple: 'text-purple-600 bg-purple-500/10'
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center flex-shrink-0`}>
        <Icon name={icon} className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">
          {label}
        </div>
        <div className="text-xl font-bold text-gray-900 dark:text-white truncate">
          {typeof value === 'number' ? value.toLocaleString('el-GR') : value}
        </div>
      </div>
    </div>
  );
};

// Sparkline mini chart (simplified)
export const MiniSparkline: React.FC<{
  data: number[];
  color?: string;
  height?: number;
}> = ({ data, color = '#FBBF24', height = 40 }) => {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = ((max - value) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ height: `${height}px`, width: '100%' }}
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
