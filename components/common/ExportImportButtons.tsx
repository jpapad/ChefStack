import React, { useState, useRef } from 'react';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';
import {
  exportRecipesToCSV,
  exportRecipesDetailedToCSV,
  exportInventoryToCSV,
  exportIngredientCostsToCSV,
  exportWasteLogsToCSV,
  exportSuppliersToCSV,
  exportMenusToCSV,
  exportRecipesToPDF,
  exportRecipesDetailedToPDF,
  exportInventoryToPDF,
  exportIngredientCostsToPDF,
  exportWasteLogsToPDF,
  exportSuppliersToPDF,
  exportMenusToPDF,
  importRecipesFromCSV,
  importInventoryFromCSV,
} from '../../utils/exportUtils';
import type { Recipe, InventoryItem } from '../../types';

interface ExportImportButtonsProps {
  type: 'recipes' | 'inventory' | 'ingredients' | 'waste' | 'suppliers' | 'menus';
  data: any[];
  onImportComplete?: (importedData: any[]) => void;
  showImport?: boolean;
}

const ExportImportButtons: React.FC<ExportImportButtonsProps> = ({
  type,
  data,
  onImportComplete,
  showImport = false,
}) => {
  const { language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = (detailed: boolean = false, format: 'csv' | 'pdf' = 'csv') => {
    if (data.length === 0) {
      alert(language === 'el' ? 'Δεν υπάρχουν δεδομένα για εξαγωγή' : 'No data to export');
      return;
    }

    try {
      if (format === 'csv') {
        switch (type) {
          case 'recipes':
            if (detailed) {
              exportRecipesDetailedToCSV(data as Recipe[]);
            } else {
              exportRecipesToCSV(data as Recipe[]);
            }
            break;
          case 'inventory':
            exportInventoryToCSV(data as InventoryItem[]);
            break;
          case 'ingredients':
            exportIngredientCostsToCSV(data);
            break;
          case 'waste':
            exportWasteLogsToCSV(data);
            break;
          case 'suppliers':
            exportSuppliersToCSV(data);
            break;
          case 'menus':
            exportMenusToCSV(data);
            break;
        }
      } else {
        // PDF format
        switch (type) {
          case 'recipes':
            if (detailed) {
              exportRecipesDetailedToPDF(data as Recipe[]);
            } else {
              exportRecipesToPDF(data as Recipe[]);
            }
            break;
          case 'inventory':
            exportInventoryToPDF(data as InventoryItem[]);
            break;
          case 'ingredients':
            exportIngredientCostsToPDF(data);
            break;
          case 'waste':
            exportWasteLogsToPDF(data);
            break;
          case 'suppliers':
            exportSuppliersToPDF(data);
            break;
          case 'menus':
            exportMenusToPDF(data);
            break;
        }
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      alert(language === 'el' ? 'Σφάλμα κατά την εξαγωγή' : 'Export error');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert(language === 'el' ? 'Παρακαλώ επιλέξτε αρχείο CSV' : 'Please select a CSV file');
      return;
    }

    setImporting(true);

    try {
      let importedData: any[] = [];

      switch (type) {
        case 'recipes':
          importedData = await importRecipesFromCSV(file);
          break;
        case 'inventory':
          importedData = await importInventoryFromCSV(file);
          break;
        default:
          throw new Error('Import not supported for this data type');
      }

      if (onImportComplete) {
        onImportComplete(importedData);
      }

      alert(
        language === 'el'
          ? `Επιτυχής εισαγωγή ${importedData.length} εγγραφών`
          : `Successfully imported ${importedData.length} records`
      );
    } catch (error: any) {
      console.error('Import error:', error);
      alert(error.message || (language === 'el' ? 'Σφάλμα κατά την εισαγωγή' : 'Import error'));
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const labels = {
    recipes: { el: 'Συνταγές', en: 'Recipes' },
    inventory: { el: 'Απόθεμα', en: 'Inventory' },
    ingredients: { el: 'Κόστη Υλικών', en: 'Ingredient Costs' },
    waste: { el: 'Φθορές', en: 'Waste Logs' },
    suppliers: { el: 'Προμηθευτές', en: 'Suppliers' },
    menus: { el: 'Μενού', en: 'Menus' },
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-md text-sm"
        title={language === 'el' ? 'Εξαγωγή/Εισαγωγή' : 'Export/Import'}
      >
        <Icon name="download" className="w-4 h-4" />
        {language === 'el' ? 'Εξαγωγή/Εισαγωγή' : 'Export/Import'}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-12 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-200 dark:border-slate-700">
              <h3 className="font-semibold text-light-text dark:text-dark-text text-sm flex items-center gap-2">
                <Icon name="download" className="w-4 h-4" />
                {language === 'el' ? 'Εξαγωγή/Εισαγωγή' : 'Export/Import'}
              </h3>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                {labels[type][language]}
              </p>
            </div>

            <div className="p-2 space-y-1">
              {/* Export Options */}
              <div className="pb-2 border-b border-gray-200 dark:border-slate-700">
                <p className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  {language === 'el' ? 'Εξαγωγή' : 'Export'}
                </p>

                {/* CSV Options */}
                <button
                  onClick={() => handleExport(false, 'csv')}
                  disabled={data.length === 0}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-left text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="file-text" className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <div className="flex-1">
                    <div className="font-medium text-light-text dark:text-dark-text">
                      CSV {language === 'el' ? '(Βασικό)' : '(Basic)'}
                    </div>
                    <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                      {data.length} {language === 'el' ? 'εγγραφές' : 'records'}
                    </div>
                  </div>
                </button>

                {type === 'recipes' && (
                  <button
                    onClick={() => handleExport(true, 'csv')}
                    disabled={data.length === 0}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-left text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon name="file-text" className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <div className="flex-1">
                      <div className="font-medium text-light-text dark:text-dark-text">
                        CSV {language === 'el' ? '(Αναλυτικό)' : '(Detailed)'}
                      </div>
                      <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                        {language === 'el' ? 'Με υλικά & οδηγίες' : 'With ingredients & steps'}
                      </div>
                    </div>
                  </button>
                )}

                {/* PDF Options */}
                <button
                  onClick={() => handleExport(false, 'pdf')}
                  disabled={data.length === 0}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-left text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="file" className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <div className="flex-1">
                    <div className="font-medium text-light-text dark:text-dark-text">
                      PDF {language === 'el' ? '(Βασικό)' : '(Basic)'}
                    </div>
                    <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                      {language === 'el' ? 'Έτοιμο για εκτύπωση' : 'Print-ready'}
                    </div>
                  </div>
                </button>

                {type === 'recipes' && (
                  <button
                    onClick={() => handleExport(true, 'pdf')}
                    disabled={data.length === 0}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-left text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon name="file" className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <div className="flex-1">
                      <div className="font-medium text-light-text dark:text-dark-text">
                        PDF {language === 'el' ? '(Αναλυτικό)' : '(Detailed)'}
                      </div>
                      <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                        {language === 'el' ? 'Πλήρεις συνταγές' : 'Full recipes'}
                      </div>
                    </div>
                  </button>
                )}
              </div>

              {/* Import Options */}
              {showImport && (type === 'recipes' || type === 'inventory') && (
                <div className="pt-2">
                  <p className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    {language === 'el' ? 'Εισαγωγή' : 'Import'}
                  </p>

                  <button
                    onClick={handleImportClick}
                    disabled={importing}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-left text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon name={importing ? "loader-2" : "upload"} className={`w-4 h-4 text-purple-600 dark:text-purple-400 ${importing ? 'animate-spin' : ''}`} />
                    <div className="flex-1">
                      <div className="font-medium text-light-text dark:text-dark-text">
                        {importing
                          ? (language === 'el' ? 'Εισαγωγή...' : 'Importing...')
                          : `CSV ${language === 'el' ? 'Αρχείο' : 'File'}`
                        }
                      </div>
                      <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                        {language === 'el' ? 'Μαζική εισαγωγή από αρχείο' : 'Bulk import from file'}
                      </div>
                    </div>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportImportButtons;
