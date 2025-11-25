import React from 'react';
import { FilterPreset } from '../../data/filterPresets';
import { useTranslation } from '../../i18n';
import { Icon } from './Icon';

interface FilterPresetSelectorProps {
  presets: FilterPreset[];
  onSelectPreset: (preset: FilterPreset) => void;
  onSaveCustomPreset?: () => void;
  customPresets?: FilterPreset[];
  onDeleteCustomPreset?: (presetId: string) => void;
}

const FilterPresetSelector: React.FC<FilterPresetSelectorProps> = ({
  presets,
  onSelectPreset,
  onSaveCustomPreset,
  customPresets = [],
  onDeleteCustomPreset
}) => {
  const { language } = useTranslation();

  return (
    <div className="space-y-3">
      {/* Default presets */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
          Γρήγορα Φίλτρα
        </h4>
        <div className="flex flex-wrap gap-2">
          {presets.map(preset => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-brand-yellow/10 to-orange-500/10 hover:from-brand-yellow/20 hover:to-orange-500/20 border border-brand-yellow/30 text-gray-900 dark:text-gray-100 text-xs font-medium transition-all hover:scale-105"
            >
              <span>{preset.icon}</span>
              <span>{language === 'el' ? preset.name : preset.name_en}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom presets */}
      {customPresets.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Τα Δικά μου Φίλτρα
          </h4>
          <div className="flex flex-wrap gap-2">
            {customPresets.map(preset => (
              <div key={preset.id} className="relative group">
                <button
                  type="button"
                  onClick={() => onSelectPreset(preset)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-gray-900 dark:text-gray-100 text-xs font-medium transition-all hover:scale-105"
                >
                  <span>{preset.icon}</span>
                  <span>{language === 'el' ? preset.name : preset.name_en}</span>
                </button>
                {onDeleteCustomPreset && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCustomPreset(preset.id);
                    }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                  >
                    <Icon name="x" className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save current filters as preset */}
      {onSaveCustomPreset && (
        <button
          type="button"
          onClick={onSaveCustomPreset}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-brand-yellow hover:text-brand-yellow dark:hover:text-brand-yellow text-xs font-medium transition-all w-full justify-center"
        >
          <Icon name="bookmark-plus" className="w-4 h-4" />
          <span>Αποθήκευση Τρέχοντος Φίλτρου</span>
        </button>
      )}
    </div>
  );
};

export default FilterPresetSelector;
