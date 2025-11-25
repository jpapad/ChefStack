import React from 'react';
import { Icon } from './Icon';
import { RecipeCategoryKey, RECIPE_CATEGORY_KEYS, ALLERGENS_LIST, Allergen } from '../../types';
import { useTranslation } from '../../i18n';
import FilterPresetSelector from './FilterPresetSelector';
import { DEFAULT_FILTER_PRESETS, FilterPreset } from '../../data/filterPresets';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export interface FilterOptions {
  categories: RecipeCategoryKey[];
  allergens: Allergen[];
  difficulties: ('easy' | 'medium' | 'hard')[];
  prepTimeRange: [number, number] | null; // minutes
  costRange: [number, number] | null; // euros
  ratingRange: [number, number] | null; // 0-5
  vegetarian: boolean | null;
  vegan: boolean | null;
  tags: string[];
}

interface FilterPanelProps {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
  onReset: () => void;
  isExpanded: boolean;
  onToggle: () => void;
  availableTags?: string[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  onReset,
  isExpanded,
  onToggle,
  availableTags = []
}) => {
  const { t, language } = useTranslation();
  const [customPresets, setCustomPresets] = useLocalStorage<FilterPreset[]>('customFilterPresets', []);
  const [showSavePresetModal, setShowSavePresetModal] = React.useState(false);
  const [newPresetName, setNewPresetName] = React.useState('');
  const [newPresetIcon, setNewPresetIcon] = React.useState('📌');

  const handleCategoryToggle = (category: RecipeCategoryKey) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onChange({ ...filters, categories: newCategories });
  };

  const handleAllergenToggle = (allergen: Allergen) => {
    const newAllergens = filters.allergens.includes(allergen)
      ? filters.allergens.filter(a => a !== allergen)
      : [...filters.allergens, allergen];
    onChange({ ...filters, allergens: newAllergens });
  };

  const handleDifficultyToggle = (difficulty: 'easy' | 'medium' | 'hard') => {
    const newDifficulties = filters.difficulties.includes(difficulty)
      ? filters.difficulties.filter(d => d !== difficulty)
      : [...filters.difficulties, difficulty];
    onChange({ ...filters, difficulties: newDifficulties });
  };

  const activeFilterCount = 
    filters.categories.length +
    filters.allergens.length +
    filters.difficulties.length +
    (filters.prepTimeRange ? 1 : 0) +
    (filters.costRange ? 1 : 0) +
    (filters.ratingRange ? 1 : 0) +
    (filters.vegetarian !== null ? 1 : 0) +
    (filters.vegan !== null ? 1 : 0) +
    filters.tags.length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon name="filter" className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {t('filters_advanced')}
          </span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-brand-yellow text-gray-900 text-xs font-semibold">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 underline"
            >
              {t('filters_reset')}
            </button>
          )}
          <Icon 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            className="w-4 h-4 text-gray-600 dark:text-gray-400" 
          />
        </div>
      </button>

      {/* Filter Content */}
      {isExpanded && (
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 space-y-4 max-h-96 overflow-y-auto">
          {/* Filter Presets */}
          <FilterPresetSelector
            presets={DEFAULT_FILTER_PRESETS}
            customPresets={customPresets}
            onSelectPreset={(preset) => {
              onChange(preset.filters);
            }}
            onSaveCustomPreset={() => setShowSavePresetModal(true)}
            onDeleteCustomPreset={(presetId) => {
              setCustomPresets(prev => prev.filter(p => p.id !== presetId));
            }}
          />
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            {/* Categories */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('filters_categories')}
              </h4>
            <div className="flex flex-wrap gap-2">
              {RECIPE_CATEGORY_KEYS.map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    filters.categories.includes(category)
                      ? 'bg-brand-yellow text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {t(`recipe_category_${category}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('filters_difficulty')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {(['easy', 'medium', 'hard'] as const).map(difficulty => (
                <button
                  key={difficulty}
                  type="button"
                  onClick={() => handleDifficultyToggle(difficulty)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    filters.difficulties.includes(difficulty)
                      ? 'bg-brand-yellow text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {t(`filters_difficulty_${difficulty}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Range */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('filters_rating')}
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.ratingRange?.[0] || 0}
                onChange={(e) => {
                  const min = parseFloat(e.target.value);
                  const max = filters.ratingRange?.[1] || 5;
                  onChange({ ...filters, ratingRange: min > 0 || max < 5 ? [min, max] : null });
                }}
                className="flex-1"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 w-16">
                {filters.ratingRange?.[0] || 0}+ ⭐
              </span>
            </div>
          </div>

          {/* Prep Time Range */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('filters_prep_time')}
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="180"
                step="15"
                value={filters.prepTimeRange?.[1] || 180}
                onChange={(e) => {
                  const max = parseInt(e.target.value);
                  onChange({ ...filters, prepTimeRange: max < 180 ? [0, max] : null });
                }}
                className="flex-1"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 w-20">
                ≤ {filters.prepTimeRange?.[1] || 180} {t('filters_minutes')}
              </span>
            </div>
          </div>

          {/* Allergen Exclusions */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('filters_exclude_allergens')}
            </h4>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {ALLERGENS_LIST.slice(0, 10).map(allergen => (
                <button
                  key={allergen}
                  type="button"
                  onClick={() => handleAllergenToggle(allergen)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    filters.allergens.includes(allergen)
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {allergen}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Preferences */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('filters_dietary')}
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onChange({ ...filters, vegetarian: filters.vegetarian ? null : true })}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  filters.vegetarian
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                🌱 {t('filters_vegetarian')}
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...filters, vegan: filters.vegan ? null : true })}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  filters.vegan
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                🥬 {t('filters_vegan')}
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
      
      {/* Save Custom Preset Modal */}
      {showSavePresetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSavePresetModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Αποθήκευση Φίλτρου
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Όνομα
                </label>
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="π.χ. Τα Αγαπημένα μου"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Εικονίδιο
                </label>
                <div className="flex gap-2">
                  {['📌', '⭐', '❤️', '🔥', '✨', '🎯', '💎', '🏆'].map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewPresetIcon(icon)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                        newPresetIcon === icon
                          ? 'bg-brand-yellow ring-2 ring-brand-yellow'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowSavePresetModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Άκυρο
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newPresetName.trim()) {
                    const newPreset: FilterPreset = {
                      id: `custom_${Date.now()}`,
                      name: newPresetName,
                      name_en: newPresetName,
                      icon: newPresetIcon,
                      filters: { ...filters }
                    };
                    setCustomPresets(prev => [...prev, newPreset]);
                    setNewPresetName('');
                    setNewPresetIcon('📌');
                    setShowSavePresetModal(false);
                  }
                }}
                disabled={!newPresetName.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-brand-yellow text-gray-900 font-semibold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Αποθήκευση
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
