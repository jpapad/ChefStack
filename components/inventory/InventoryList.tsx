import React from 'react';
import { InventoryItem } from '../../types';
import { Icon } from '../common/Icon';
import { InventoryListSkeleton } from './InventoryListSkeleton';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useTranslation } from '../../i18n';
import { NoInventoryEmptyState } from '../common/EmptyState';

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
  isLoading?: boolean;
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
  isLoading = false,
}) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl h-full flex flex-col">
       <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200/80 dark:border-gray-700/80 flex-wrap gap-2">
        <h2 className="text-3xl font-extrabold font-heading">Απόθεμα</h2>
         {canManage && (
            <div className="flex items-center gap-2">
                 <Button 
                   onClick={() => withApiKeyCheck(onImportInvoice)} 
                   className="gap-2 bg-blue-600 hover:bg-blue-700"
                 >
                    <Icon name="file-up" className="w-4 h-4" />
                    <span className="font-semibold text-sm">{t('invoice_import_button')}</span>
                </Button>
                <Button onClick={onAdd} className="gap-2">
                    <Icon name="plus" className="w-4 h-4" />
                    <span className="font-semibold text-sm">Νέο Είδος</span>
                </Button>
            </div>
         )}
      </div>

       <div className="flex-1 overflow-y-auto -mr-2 pr-2">
        {isLoading ? (
          <InventoryListSkeleton count={8} />
        ) : inventory.length === 0 ? (
          <NoInventoryEmptyState onAddItem={onAdd} />
        ) : (
          <div className="space-y-3">
            {inventory.map(item => {
            const isLowStock = item.totalQuantity <= item.reorderPoint;
            const itemSelected = isSelected?.(item.id) || false;
            
            return (
                <Card
                key={item.id}
                onClick={() => batchMode && onToggleSelection ? onToggleSelection(item.id) : onSelectItem(item.id)}
                className={`cursor-pointer transition-all duration-200 group hover:shadow-lg ${
                    selectedItemId === item.id
                    ? 'border-brand-yellow bg-brand-yellow/10 dark:bg-brand-yellow/20'
                    : itemSelected && batchMode
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                >
                  <div className="p-4 flex items-center justify-between gap-4">
                    {/* Batch selection checkbox */}
                    {batchMode && onToggleSelection && (
                      <div 
                        className="flex items-center"
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
                    
                    {/* Item info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        {isLowStock && (
                          <div className="flex-shrink-0" title="Low Stock">
                            <Badge variant="destructive" className="gap-1">
                              <Icon name="alert-triangle" className="w-3 h-3" />
                              Χαμηλό
                            </Badge>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-base mb-1 truncate">{item.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="secondary" className="font-mono">
                                {item.totalQuantity.toFixed(2)} {item.unit}
                              </Badge>
                              {item.supplierName && (
                                <span className="text-xs truncate">
                                  <Icon name="package" className="w-3 h-3 inline mr-1" />
                                  {item.supplierName}
                                </span>
                              )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Action buttons */}
                    {canManage && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {onViewHistory && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => { e.stopPropagation(); onViewHistory(item); }}
                                  title="Ιστορικό"
                                >
                                    <Icon name="history" className="w-4 h-4" />
                                </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                              title="Edit"
                            >
                                <Icon name="edit" className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                              className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                              title="Delete"
                            >
                                <Icon name="trash-2" className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                  </div>
                </Card>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryList;