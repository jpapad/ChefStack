import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface FilterPreset {
  name: string;
  values: Record<string, any>;
}

/**
 * Hook to manage filter presets with localStorage persistence
 */
export function useFilterPresets(storageKey: string) {
  const [presets, setPresets] = useLocalStorage<FilterPreset[]>(`filterPresets_${storageKey}`, []);

  const savePreset = (name: string, values: Record<string, any>) => {
    const existingIndex = presets.findIndex(p => p.name === name);
    if (existingIndex >= 0) {
      // Update existing preset
      const updated = [...presets];
      updated[existingIndex] = { name, values };
      setPresets(updated);
    } else {
      // Add new preset
      setPresets([...presets, { name, values }]);
    }
  };

  const deletePreset = (name: string) => {
    setPresets(presets.filter(p => p.name !== name));
  };

  const getPreset = (name: string): FilterPreset | undefined => {
    return presets.find(p => p.name === name);
  };

  return {
    presets,
    savePreset,
    deletePreset,
    getPreset,
  };
}
