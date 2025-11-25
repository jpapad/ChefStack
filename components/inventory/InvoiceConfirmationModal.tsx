import React, { useState, useEffect } from 'react';
import { ExtractedInvoiceItem, MappedInvoiceItem, InventoryItem, InventoryLocation } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{t('invoice_import_confirm_title')}</DialogTitle>
          <DialogDescription>{t('invoice_import_confirm_subtitle')}</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] py-4">
           <div className="mb-4">
              <Label className="mb-2">{t('invoice_import_target_location')}</Label>
              <Select value={targetLocationId} onValueChange={setTargetLocationId}>
                <SelectTrigger className="w-full md:w-1/2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {inventoryLocations.map(loc => (
                    <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button type="button" onClick={handleConfirmClick} className="gap-2">
            <Icon name="check" className="w-4 h-4" />
            {t('invoice_confirm_and_update')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceConfirmationModal;
