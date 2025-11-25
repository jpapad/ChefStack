import React from 'react';
import { InventoryItem } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

interface InventoryListProps {
  inventory: (InventoryItem & { supplierName: string, totalQuantity: number })[];
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onAdd: () => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  canManage: boolean;
  onImportInvoice: () => void;
  withApiKeyCheck: (action: () => void) => void;
  onViewHistory?: (item: InventoryItem) => void;
  // Batch selection props
  isSelected?: (id: string) => boolean;
  onToggleSelection?: (id: string) => void;
  batchMode?: boolean;
}

const InventoryList: React.FC<InventoryListProps> = ({ 
  inventory, 
  selectedItemId, 
  onSelectItem, 
  onAdd, 
  onEdit, 
  onDelete, 
  canManage, 
  onImportInvoice, 
  withApiKeyCheck, 
  onViewHistory,
  isSelected,
  onToggleSelection,
  batchMode = false,
}) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl h-full flex flex-col">
       <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200/80 dark:border-gray-700/80 flex-wrap gap-2">
        <h2 className="text-3xl font-extrabold font-heading">Απόθεμα</h2>
         {canManage && (
            <div className="flex items-center gap-2">
                 <button onClick={() => withApiKeyCheck(onImportInvoice)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
                    <Icon name="file-up" className="w-5 h-5" />
                    <span className="font-semibold text-sm">{t('invoice_import_button')}</span>
                </button>
                <button onClick={onAdd} className="flex items-center gap-2 bg-brand-dark text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
                    <Icon name="plus" className="w-5 h-5" />
                    <span className="font-semibold text-sm">Νέο Είδος</span>
                </button>
            </div>
         )}
      </div>

       <div className="flex-1 overflow-y-auto -mr-2 pr-2">
        <div className="space-y-2">
          {inventory.map(item => {
            const isLowStock = item.totalQuantity <= item.reorderPoint;
            const itemSelected = isSelected?.(item.id) || false;
            
            return (
                <div
                key={item.id}
                onClick={() => batchMode && onToggleSelection ? onToggleSelection(item.id) : onSelectItem(item.id)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 group border ${
                    selectedItemId === item.id
                    ? 'bg-brand-yellow/20 dark:bg-brand-yellow/30 border-brand-yellow/50'
                    : itemSelected && batchMode
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500/50'
                    : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                }`}
                >
                    {/* Batch selection checkbox */}
                    {batchMode && onToggleSelection && (
                      <div 
                        className="flex items-center mr-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={itemSelected}
                          onChange={() => onToggleSelection(item.id)}
                          className="w-5 h-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 flex-1">
                        {/* Fix: Wrapped Icon in a span to apply the title attribute correctly for tooltips. */}
                        {isLowStock && <span title="Low Stock"><Icon name="warning" className="w-5 h-5 text-red-500 flex-shrink-0"/></span>}
                        <div>
                            <p className="font-bold text-md">{item.name}</p>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                {item.totalQuantity.toFixed(2)} {item.unit}
                            </p>
                        </div>
                    </div>
                    {canManage && (
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {onViewHistory && (
                                <button onClick={(e) => { e.stopPropagation(); onViewHistory(item); }} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/20" title="Ιστορικό">
                                    <Icon name="history" className="w-4 h-4" />
                                </button>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/20" title="Edit">
                                <Icon name="edit" className="w-4 h-4" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(item); }} className="p-2 rounded-full text-light-text-secondary hover:text-red-500 hover:bg-red-500/10" title="Delete">
                                <Icon name="trash-2" className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default InventoryList;