import React from 'react';
import { Icon } from './Icon';
import { useTranslation } from '../../i18n';

export interface QuickFilter {
  id: string;
  label: string;
  icon?: string;
  color?: string;
  action: () => void;
}

interface QuickFilterChipsProps {
  filters: QuickFilter[];
  activeFilter?: string | null;
}

const QuickFilterChips: React.FC<QuickFilterChipsProps> = ({
  filters,
  activeFilter = null,
}) => {
  const { language } = useTranslation();

  const getColorClasses = (color?: string, isActive?: boolean) => {
    if (isActive) {
      switch (color) {
        case 'red':
          return 'bg-red-600 text-white border-red-600';
        case 'yellow':
          return 'bg-yellow-600 text-white border-yellow-600';
        case 'green':
          return 'bg-green-600 text-white border-green-600';
        case 'blue':
          return 'bg-blue-600 text-white border-blue-600';
        case 'purple':
          return 'bg-purple-600 text-white border-purple-600';
        case 'orange':
          return 'bg-orange-600 text-white border-orange-600';
        default:
          return 'bg-gray-700 text-white border-gray-700';
      }
    }

    switch (color) {
      case 'red':
        return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40';
      case 'yellow':
        return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/40';
      case 'green':
        return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40';
      case 'blue':
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40';
      case 'purple':
        return 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40';
      case 'orange':
        return 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/40';
      default:
        return 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600';
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id;
        const colorClasses = getColorClasses(filter.color, isActive);

        return (
          <button
            key={filter.id}
            onClick={filter.action}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all shadow-sm hover:shadow ${colorClasses}`}
          >
            {filter.icon && <Icon name={filter.icon} className="w-4 h-4" />}
            <span>{filter.label}</span>
            {isActive && (
              <Icon name="check" className="w-3 h-3 ml-1" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default QuickFilterChips;
