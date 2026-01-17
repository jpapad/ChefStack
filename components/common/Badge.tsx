import React from 'react';
import { Icon, IconName } from './Icon';

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'status';
  status?: 'active' | 'pending' | 'archived' | 'draft';
  children: React.ReactNode;
  icon?: IconName;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean; // Show colored dot indicator
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  status,
  children,
  icon,
  size = 'md',
  className = '',
  dot = false
}) => {
  const variants = {
    default: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    success: 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 border-success-200 dark:border-success-800',
    warning: 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300 border-warning-200 dark:border-warning-800',
    danger: 'bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300 border-danger-200 dark:border-danger-800',
    info: 'bg-info-100 dark:bg-info-900/30 text-info-700 dark:text-info-300 border-info-200 dark:border-info-800',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    status: status === 'active'
      ? 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 border-success-200'
      : status === 'pending'
      ? 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300 border-warning-200'
      : status === 'draft'
      ? 'bg-info-100 dark:bg-info-900/30 text-info-700 dark:text-info-300 border-info-200'
      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  const dotColors = {
    default: 'bg-gray-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
    info: 'bg-info-500',
    purple: 'bg-purple-500',
    status: status === 'active' 
      ? 'bg-success-500' 
      : status === 'pending' 
      ? 'bg-warning-500'
      : status === 'draft'
      ? 'bg-info-500'
      : 'bg-gray-500'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {dot && (
        <span className={`w-2 h-2 rounded-full ${dotColors[variant]} animate-pulse`} />
      )}
      {icon && <Icon name={icon} className={iconSizes[size]} />}
      {children}
    </span>
  );
};

// Preset badges for common use cases
export const StatusBadge: React.FC<{ status: 'active' | 'pending' | 'archived' | 'draft' }> = ({ status }) => {
  const labels = {
    active: 'Ενεργό',
    pending: 'Εκκρεμεί',
    archived: 'Αρχειοθετημένο',
    draft: 'Πρόχειρο'
  };

  return (
    <Badge variant="status" status={status} dot size="sm">
      {labels[status]}
    </Badge>
  );
};

export const CountBadge: React.FC<{ count: number; max?: number }> = ({ count, max = 99 }) => {
  const displayCount = count > max ? `${max}+` : count;
  const variant = count > 0 ? 'danger' : 'default';

  return (
    <Badge variant={variant} size="sm" className="min-w-[20px] justify-center px-1.5">
      {displayCount}
    </Badge>
  );
};

export const NewBadge: React.FC = () => (
  <Badge variant="success" size="sm" className="animate-pulse">
    ΝΕΟ
  </Badge>
);

export const PromoBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Badge
    variant="warning"
    icon="sparkles"
    size="sm"
    className="bg-gradient-to-r from-warning-400 to-warning-500 border-0 text-white shadow-lg"
  >
    {children}
  </Badge>
);
