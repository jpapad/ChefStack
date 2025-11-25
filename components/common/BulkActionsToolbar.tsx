import React, { useState } from 'react';
import { Icon } from './Icon';
import { useTranslation } from '../../i18n';
import { Recipe, RecipeCategoryKey, Allergen, ALLERGENS_LIST, RECIPE_CATEGORY_KEYS } from '../../types';
import ConfirmationModal from './ConfirmationModal';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkExportJSON: () => void;
  onBulkExportCSV: () => void;
  onBulkCategorize: (category: RecipeCategoryKey) => void;
  onBulkAddAllergens: (allergens: Allergen[]) => void;
  onBulkRemoveAllergens: (allergens: Allergen[]) => void;
}

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkExportJSON,
  onBulkExportCSV,
  onBulkCategorize,
  onBulkAddAllergens,
  onBulkRemoveAllergens
}) => {
  const { t } = useTranslation();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showAllergenDialog, setShowAllergenDialog] = useState(false);
  const [allergenAction, setAllergenAction] = useState<'add' | 'remove'>('add');
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategoryKey>('main_course');
  const [selectedAllergens, setSelectedAllergens] = useState<Allergen[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleBulkDelete = () => {
    onBulkDelete();
    setShowDeleteConfirm(false);
  };

  const handleBulkCategorize = () => {
    onBulkCategorize(selectedCategory);
    setShowCategoryDialog(false);
  };

  const handleBulkAllergens = () => {
    if (allergenAction === 'add') {
      onBulkAddAllergens(selectedAllergens);
    } else {
      onBulkRemoveAllergens(selectedAllergens);
    }
    setShowAllergenDialog(false);
    setSelectedAllergens([]);
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-brand-dark/95 dark:bg-slate-900/95 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10">
        <div className="flex items-center gap-6">
          {/* Selected count */}
          <div className="flex items-center gap-2">
            <Icon name="check-circle" className="w-5 h-5 text-brand-yellow" />
            <span className="font-semibold">
              {selectedCount} {t('bulk_selected')}
            </span>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-white/20" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Export dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/80 hover:bg-blue-600 rounded-lg transition-colors text-sm font-semibold"
              >
                <Icon name="download" className="w-4 h-4" />
                {t('bulk_export')}
              </button>
              {showExportMenu && (
                <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 min-w-[160px]">
                  <button
                    onClick={() => {
                      onBulkExportJSON();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2"
                  >
                    <Icon name="file-json" className="w-4 h-4" />
                    {t('export_json')}
                  </button>
                  <button
                    onClick={() => {
                      onBulkExportCSV();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2"
                  >
                    <Icon name="file-text" className="w-4 h-4" />
                    {t('export_csv')}
                  </button>
                </div>
              )}
            </div>

            {/* Categorize */}
            <button
              onClick={() => setShowCategoryDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600/80 hover:bg-purple-600 rounded-lg transition-colors text-sm font-semibold"
            >
              <Icon name="tag" className="w-4 h-4" />
              {t('bulk_categorize')}
            </button>

            {/* Allergens */}
            <button
              onClick={() => {
                setAllergenAction('add');
                setShowAllergenDialog(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600/80 hover:bg-orange-600 rounded-lg transition-colors text-sm font-semibold"
            >
              <Icon name="alert-triangle" className="w-4 h-4" />
              {t('bulk_allergens')}
            </button>

            {/* Delete */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-lg transition-colors text-sm font-semibold"
            >
              <Icon name="trash-2" className="w-4 h-4" />
              {t('bulk_delete')}
            </button>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-white/20" />

          {/* Clear selection */}
          <button
            onClick={onClearSelection}
            className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm font-semibold"
          >
            <Icon name="x" className="w-4 h-4" />
            {t('bulk_clear')}
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title={t('bulk_delete_confirm_title')}
        body={t('bulk_delete_confirm_body', { count: selectedCount })}
      />

      {/* Category change dialog */}
      {showCategoryDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">{t('bulk_categorize_title')}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {t('bulk_categorize_description', { count: selectedCount })}
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">{t('category')}</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as RecipeCategoryKey)}
                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                {RECIPE_CATEGORY_KEYS.filter(c => c !== 'sub_recipe').map(cat => (
                  <option key={cat} value={cat}>
                    {t(`recipe_category_${cat}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBulkCategorize}
                className="flex-1 px-4 py-3 bg-brand-yellow text-slate-900 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
              >
                {t('apply')}
              </button>
              <button
                onClick={() => setShowCategoryDialog(false)}
                className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-semibold"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Allergen dialog */}
      {showAllergenDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{t('bulk_allergens_title')}</h3>
            
            {/* Action selector */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">{t('action')}</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setAllergenAction('add')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    allergenAction === 'add'
                      ? 'bg-brand-yellow text-slate-900'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t('add_allergens')}
                </button>
                <button
                  onClick={() => setAllergenAction('remove')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    allergenAction === 'remove'
                      ? 'bg-brand-yellow text-slate-900'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t('remove_allergens')}
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {allergenAction === 'add' 
                ? t('bulk_allergens_add_description', { count: selectedCount })
                : t('bulk_allergens_remove_description', { count: selectedCount })
              }
            </p>

            {/* Allergen selection */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {ALLERGENS_LIST.map(allergen => (
                <label
                  key={allergen}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedAllergens.includes(allergen)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAllergens([...selectedAllergens, allergen]);
                      } else {
                        setSelectedAllergens(selectedAllergens.filter(a => a !== allergen));
                      }
                    }}
                    className="w-4 h-4 text-brand-yellow rounded focus:ring-brand-yellow"
                  />
                  <span className="text-sm">{allergen}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBulkAllergens}
                disabled={selectedAllergens.length === 0}
                className="flex-1 px-4 py-3 bg-brand-yellow text-slate-900 rounded-lg hover:bg-yellow-500 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('apply')}
              </button>
              <button
                onClick={() => {
                  setShowAllergenDialog(false);
                  setSelectedAllergens([]);
                }}
                className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-semibold"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
