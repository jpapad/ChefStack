import React, { useState, useEffect } from 'react';
import { ExtractedInvoiceItem, MappedInvoiceItem, InventoryItem, InventoryLocation } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

interface InvoiceConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (mappedItems: MappedInvoiceItem[], targetLocationId: string) => void;
  extractedItems: ExtractedInvoiceItem[];
  inventory: InventoryItem[];
  inventoryLocations: InventoryLocation[];
}

const InvoiceConfirmationModal: React.FC<InvoiceConfirmationModalProps> = ({ isOpen, onClose, onConfirm, extractedItems, inventory, inventoryLocations }) => {
  const { t } = useTranslation();
  const [mappedItems, setMappedItems] = useState<MappedInvoiceItem[]>([]);
  const [targetLocationId, setTargetLocationId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      // Find a "main" warehouse if it exists
      const mainLocation = inventoryLocations.find(l => l.name.toLowerCase().includes('κεντρική')) || inventoryLocations[0];
      setTargetLocationId(mainLocation?.id || '');
      
      const initialMap = extractedItems.map(item => {
        // Simple matching logic: find first inventory item that is a substring
        const bestMatch = inventory.find(invItem => 
          item.itemName.toLowerCase().includes(invItem.name.toLowerCase()) || 
          invItem.name.toLowerCase().includes(item.itemName.toLowerCase())
        );
        return {
          ...item,
          inventoryId: bestMatch?.id || 'new',
          isNew: !bestMatch,
        };
      });
      setMappedItems(initialMap);
    }
  }, [isOpen, extractedItems, inventory, inventoryLocations]);

  const handleMappingChange = (index: number, inventoryId: string) => {
    const newMappedItems = [...mappedItems];
    newMappedItems[index].inventoryId = inventoryId;
    newMappedItems[index].isNew = inventoryId === 'new';
    setMappedItems(newMappedItems);
  };
  
  const handleConfirmClick = () => {
    onConfirm(mappedItems, targetLocationId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200/80 dark:border-gray-700/80">
          <div>
            <h3 className="text-xl font-semibold">{t('invoice_import_confirm_title')}</h3>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{t('invoice_import_confirm_subtitle')}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
            <Icon name="x" className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-grow p-6 overflow-y-auto">
           <div className="mb-4">
              <label className="block text-sm font-medium mb-1">{t('invoice_import_target_location')}</label>
              <select value={targetLocationId} onChange={e => setTargetLocationId(e.target.value)} className="w-full md:w-1/2 p-2 rounded bg-light-bg dark:bg-dark-bg">
                {inventoryLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
              </select>
           </div>

            <div className="space-y-4">
            {mappedItems.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-3 bg-black/5 dark:bg-white/10 rounded-lg">
                    {/* Invoice Item */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-light-text-secondary dark:text-dark-text-secondary">{t('invoice_item')}</label>
                        <p className="font-semibold text-lg">{item.itemName}</p>
                    </div>

                    {/* Inventory Match */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-light-text-secondary dark:text-dark-text-secondary">{t('inventory_match')}</label>
                        <select
                            value={item.inventoryId}
                            onChange={(e) => handleMappingChange(index, e.target.value)}
                            className={`w-full p-2 rounded bg-light-bg dark:bg-dark-bg ${item.isNew ? 'border-2 border-green-500' : ''}`}
                        >
                            <option value="new" className="font-bold text-green-600">{`-- ${t('invoice_create_new_item')} --`}</option>
                            <optgroup label="Existing Items">
                                {inventory.map(invItem => (
                                    <option key={invItem.id} value={invItem.id}>{invItem.name}</option>
                                ))}
                            </optgroup>
                        </select>
                    </div>

                    {/* Details */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-light-text-secondary dark:text-dark-text-secondary">{t('invoice_details')}</label>
                         <p className="font-mono text-base">
                            {item.quantity} {item.unit} @ {item.unitPrice.toFixed(2)}€
                        </p>
                    </div>
                </div>
            ))}
            </div>
        </div>

        <footer className="flex-shrink-0 p-4 flex justify-end gap-4 bg-black/5 dark:bg-white/5 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 font-semibold">{t('cancel')}</button>
          <button type="button" onClick={handleConfirmClick} className="px-4 py-2 rounded-lg bg-brand-dark text-white hover:opacity-90 font-semibold flex items-center gap-2">
            <Icon name="check" className="w-5 h-5" />
            {t('invoice_confirm_and_update')}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default InvoiceConfirmationModal;
