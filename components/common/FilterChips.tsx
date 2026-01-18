import React from 'react';
import { Icon } from './Icon';
import { RecipeCategoryKey, Allergen, RecipeDifficulty } from '../../types';
import { useTranslation } from '../../i18n';

export interface ActiveFilter {
  type: 'category' | 'allergen' | 'difficulty' | 'tag' | 'prepTime' | 'rating' | 'vegetarian' | 'vegan' | 'search';
  value: string | number;
  label: string;
}

interface FilterChipsProps {
  activeFilters: ActiveFilter[];
  onRemoveFilter: (filter: ActiveFilter) => void;
  onClearAll: () => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  activeFilters,
  onRemoveFilter,
  onClearAll
}) => {
  const { t } = useTranslation();

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-accent/30 rounded-lg border border-border">
      <span className="text-sm font-medium text-muted-foreground flex-shrink-0">
        <Icon name="filter" className="w-4 h-4 inline mr-1" />
        Ενεργά φίλτρα:
      </span>
      
      <div className="flex flex-wrap items-center gap-2 flex-1">
        {activeFilters.map((filter, index) => (
          <div
            key={`${filter.type}-${filter.value}-${index}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/30 rounded-full text-sm font-medium hover:bg-primary/20 transition-colors group"
          >
            <span>{filter.label}</span>
            <button
              type="button"
              onClick={() => onRemoveFilter(filter)}
              className="opacity-60 hover:opacity-100 transition-opacity"
              aria-label={`Αφαίρεση φίλτρου ${filter.label}`}
            >
              <Icon name="x" className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onClearAll}
        className="flex-shrink-0 px-3 py-1 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-full transition-colors"
      >
        Καθαρισμός όλων
      </button>
    </div>
  );
};

/**
 * Quick filter buttons for common filters
 */
interface QuickFiltersProps {
  onApplyFilter: (filter: ActiveFilter) => void;
  activeFilters: ActiveFilter[];
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  onApplyFilter,
  activeFilters
}) => {
  const quickFilters: ActiveFilter[] = [
    { type: 'difficulty', value: 'easy', label: '⚡ Εύκολα' },
    { type: 'prepTime', value: 30, label: '🕐 Γρήγορα (<30\')' },
    { type: 'vegetarian', value: 'true', label: '🥬 Χορτοφαγικά' },
    { type: 'tag', value: 'summer', label: '☀️ Καλοκαιρινά' },
    { type: 'allergen', value: 'none', label: '✅ Χωρίς Αλλεργιογόνα' },
  ];

  const isActive = (filter: ActiveFilter) => {
    return activeFilters.some(
      af => af.type === filter.type && af.value === filter.value
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-sm font-medium text-muted-foreground self-center">
        Γρήγορα φίλτρα:
      </span>
      {quickFilters.map((filter, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onApplyFilter(filter)}
          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
            isActive(filter)
              ? 'bg-primary text-primary-foreground shadow-sm scale-105'
              : 'bg-accent hover:bg-accent/80 text-foreground hover:scale-105'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default FilterChips;
