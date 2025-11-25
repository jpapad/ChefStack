import React, { useState, useEffect } from 'react';
import { WasteLog, InventoryItem, WASTE_REASON_KEYS, WASTE_REASON_TRANSLATIONS } from '../../types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useTranslation } from '../../i18n';

interface WasteLogFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<WasteLog, 'id' | 'teamId' | 'userId'>) => void;
  inventory: InventoryItem[];
}

const WasteLogForm: React.FC<WasteLogFormProps> = ({ isOpen, onClose, onSave, inventory }) => {
  const { t, language } = useTranslation();
  const [inventoryItemId, setInventoryItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [reason, setReason] = useState<typeof WASTE_REASON_KEYS[0]>('spoiled');
  const [notes, setNotes] = useState('');

  const selectedItem = inventory.find(i => i.id === inventoryItemId);

  useEffect(() => {
    if (isOpen) {
      setInventoryItemId(inventory[0]?.id || '');
      setQuantity('');
      setReason('spoiled');
      setNotes('');
    }
  }, [isOpen, inventory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || quantity === '' || quantity <= 0) return;
    
    onSave({
      timestamp: new Date(),
      inventoryItemId,
      quantity,
      unit: selectedItem.unit,
      reason,
      notes,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('waste_log_new')}</DialogTitle>
          <DialogDescription>
            Καταγράψτε τα στοιχεία της απώλειας προϊόντος
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="item">{t('waste_log_item')} *</Label>
              <Select value={inventoryItemId} onValueChange={setInventoryItemId} required>
                <SelectTrigger id="item">
                  <SelectValue placeholder="Επιλέξτε είδος..." />
                </SelectTrigger>
                <SelectContent>
                  {inventory.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">{t('waste_log_quantity')} *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="quantity"
                    type="number"
                    step="any"
                    min="0"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="0"
                    required
                  />
                  {selectedItem && (
                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                      {selectedItem.unit}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="reason">{t('waste_log_reason')} *</Label>
                <Select value={reason} onValueChange={(val) => setReason(val as typeof WASTE_REASON_KEYS[0])} required>
                  <SelectTrigger id="reason">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WASTE_REASON_KEYS.map(key => (
                      <SelectItem key={key} value={key}>
                        {WASTE_REASON_TRANSLATIONS[key][language]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">{t('waste_log_notes')}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Πρόσθετες παρατηρήσεις..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit">
              {t('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WasteLogForm;
