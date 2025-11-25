import React, { useState, useEffect } from 'react';
import { Recipe, RecipeVariation, VariationType, VARIATION_TYPE_TRANSLATIONS, IngredientModification, Ingredient, Allergen, ALLERGENS_LIST } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

interface CreateVariationModalProps {
  isOpen: boolean;
  parentRecipe: Recipe;
  variationToEdit?: RecipeVariation | null;
  onSave: (variation: Omit<RecipeVariation, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  currentTeamId: string;
}

const CreateVariationModal: React.FC<CreateVariationModalProps> = ({
  isOpen,
  parentRecipe,
  variationToEdit,
  onSave,
  onCancel,
  currentTeamId
}) => {
  const { language, t } = useTranslation();

  const initialState: Omit<RecipeVariation, 'id' | 'createdAt'> = {
    parentRecipeId: parentRecipe.id,
    variationType: 'custom',
    name: '',
    name_en: '',
    description: '',
    scaleFactor: 1.0,
    ingredientModifications: [],
    allergenChanges: [],
    isActive: true,
    teamId: currentTeamId
  };

  const [variation, setVariation] = useState<Omit<RecipeVariation, 'id' | 'createdAt'>>(initialState);
  const [currentTab, setCurrentTab] = useState<'basic' | 'ingredients' | 'allergens'>('basic');

  useEffect(() => {
    if (variationToEdit) {
      setVariation(variationToEdit);
    } else {
      setVariation(initialState);
    }
  }, [variationToEdit]);

  const handleSave = () => {
    if (!variation.name || !variation.name_en) {
      alert(language === 'el' ? 'Παρακαλώ συμπληρώστε το όνομα στα Ελληνικά και Αγγλικά' : 'Please fill in both Greek and English names');
      return;
    }
    onSave(variation);
  };

  const handleAddIngredientMod = () => {
    const newMod: IngredientModification = {
      action: 'add',
      notes: ''
    };
    setVariation(prev => ({
      ...prev,
      ingredientModifications: [...prev.ingredientModifications, newMod]
    }));
  };

  const handleUpdateIngredientMod = (index: number, updated: IngredientModification) => {
    setVariation(prev => ({
      ...prev,
      ingredientModifications: prev.ingredientModifications.map((mod, i) => i === index ? updated : mod)
    }));
  };

  const handleRemoveIngredientMod = (index: number) => {
    setVariation(prev => ({
      ...prev,
      ingredientModifications: prev.ingredientModifications.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {variationToEdit 
                ? (language === 'el' ? 'Επεξεργασία Παραλλαγής' : 'Edit Variation')
                : (language === 'el' ? 'Νέα Παραλλαγή' : 'New Variation')
              }
            </h2>
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
              <Icon name="x" className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {language === 'el' ? 'Βασική συνταγή:' : 'Base recipe:'} {language === 'el' ? parentRecipe.name : parentRecipe.name_en}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-700 px-6">
          {[
            { key: 'basic' as const, label: language === 'el' ? 'Βασικά' : 'Basic', icon: 'info' },
            { key: 'ingredients' as const, label: language === 'el' ? 'Υλικά' : 'Ingredients', icon: 'list' },
            { key: 'allergens' as const, label: language === 'el' ? 'Αλλεργιογόνα' : 'Allergens', icon: 'alert-triangle' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setCurrentTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                currentTab === tab.key
                  ? 'border-brand-yellow text-brand-yellow'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon name={tab.icon as any} className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentTab === 'basic' && (
            <div className="space-y-4">
              {/* Variation Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'el' ? 'Τύπος Παραλλαγής' : 'Variation Type'}
                </label>
                <select
                  value={variation.variationType}
                  onChange={(e) => setVariation({...variation, variationType: e.target.value as VariationType})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  {Object.entries(VARIATION_TYPE_TRANSLATIONS).map(([key, trans]) => (
                    <option key={key} value={key}>{trans[language]}</option>
                  ))}
                </select>
              </div>

              {/* Name (Greek) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'el' ? 'Όνομα (Ελληνικά)' : 'Name (Greek)'}
                </label>
                <input
                  type="text"
                  value={variation.name}
                  onChange={(e) => setVariation({...variation, name: e.target.value})}
                  placeholder="π.χ. Μουσακάς Vegan"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Name (English) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'el' ? 'Όνομα (Αγγλικά)' : 'Name (English)'}
                </label>
                <input
                  type="text"
                  value={variation.name_en}
                  onChange={(e) => setVariation({...variation, name_en: e.target.value})}
                  placeholder="e.g. Vegan Moussaka"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'el' ? 'Περιγραφή' : 'Description'}
                </label>
                <textarea
                  value={variation.description}
                  onChange={(e) => setVariation({...variation, description: e.target.value})}
                  placeholder={language === 'el' ? 'Τι κάνει αυτή την παραλλαγή ξεχωριστή...' : 'What makes this variation special...'}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Scale Factor */}
              {variation.variationType === 'portion-size' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'el' ? 'Συντελεστής Κλίμακας' : 'Scale Factor'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={variation.scaleFactor || 1.0}
                    onChange={(e) => setVariation({...variation, scaleFactor: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'el' ? '0.5 = μισή μερίδα, 2.0 = διπλή μερίδα' : '0.5 = half portion, 2.0 = double portion'}
                  </p>
                </div>
              )}

              {/* Seasonal Period */}
              {variation.variationType === 'seasonal' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'el' ? 'Από Μήνα' : 'From Month'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={variation.seasonalPeriod?.startMonth || 1}
                      onChange={(e) => setVariation({
                        ...variation,
                        seasonalPeriod: {
                          startMonth: parseInt(e.target.value),
                          endMonth: variation.seasonalPeriod?.endMonth || 12
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'el' ? 'Έως Μήνα' : 'To Month'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={variation.seasonalPeriod?.endMonth || 12}
                      onChange={(e) => setVariation({
                        ...variation,
                        seasonalPeriod: {
                          startMonth: variation.seasonalPeriod?.startMonth || 1,
                          endMonth: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Active Status */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={variation.isActive}
                  onChange={(e) => setVariation({...variation, isActive: e.target.checked})}
                  className="w-5 h-5"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  {language === 'el' ? 'Ενεργή Παραλλαγή' : 'Active Variation'}
                </span>
              </label>
            </div>
          )}

          {currentTab === 'ingredients' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'el' 
                    ? 'Προσθέστε, αφαιρέστε ή αντικαταστήστε υλικά από τη βασική συνταγή'
                    : 'Add, remove, or replace ingredients from the base recipe'}
                </p>
                <button
                  onClick={handleAddIngredientMod}
                  className="flex items-center gap-2 px-3 py-2 bg-brand-yellow hover:bg-yellow-500 text-gray-900 rounded-lg text-sm font-medium"
                >
                  <Icon name="plus" className="w-4 h-4" />
                  {language === 'el' ? 'Προσθήκη' : 'Add'}
                </button>
              </div>

              {variation.ingredientModifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {language === 'el' ? 'Δεν υπάρχουν τροποποιήσεις υλικών' : 'No ingredient modifications'}
                </div>
              ) : (
                <div className="space-y-3">
                  {variation.ingredientModifications.map((mod, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                      <div className="flex items-start gap-3">
                        <select
                          value={mod.action}
                          onChange={(e) => handleUpdateIngredientMod(index, {...mod, action: e.target.value as any})}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-sm"
                        >
                          <option value="add">{language === 'el' ? 'Προσθήκη' : 'Add'}</option>
                          <option value="remove">{language === 'el' ? 'Αφαίρεση' : 'Remove'}</option>
                          <option value="replace">{language === 'el' ? 'Αντικατάσταση' : 'Replace'}</option>
                          <option value="scale">{language === 'el' ? 'Κλιμάκωση' : 'Scale'}</option>
                        </select>

                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder={language === 'el' ? 'Σημειώσεις...' : 'Notes...'}
                            value={mod.notes || ''}
                            onChange={(e) => handleUpdateIngredientMod(index, {...mod, notes: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-sm"
                          />
                        </div>

                        <button
                          onClick={() => handleRemoveIngredientMod(index)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <Icon name="trash-2" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentTab === 'allergens' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'el' 
                  ? 'Επιλέξτε νέα αλλεργιογόνα που προστίθενται σε αυτή την παραλλαγή'
                  : 'Select new allergens added in this variation'}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ALLERGENS_LIST.map(allergen => (
                  <label key={allergen} className="flex items-center gap-2 p-3 border border-gray-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
                    <input
                      type="checkbox"
                      checked={variation.allergenChanges?.includes(allergen) || false}
                      onChange={(e) => {
                        const allergens = variation.allergenChanges || [];
                        setVariation({
                          ...variation,
                          allergenChanges: e.target.checked
                            ? [...allergens, allergen]
                            : allergens.filter(a => a !== allergen)
                        });
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{allergen}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            {language === 'el' ? 'Ακύρωση' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-brand-yellow hover:bg-yellow-500 text-gray-900 rounded-lg transition-colors font-medium"
          >
            {language === 'el' ? 'Αποθήκευση' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateVariationModal;
