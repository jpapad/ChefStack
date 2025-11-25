import React, { useState, useEffect } from 'react';
import { InventoryItem, InventoryLocation } from '../../types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import { useTranslation } from '../../i18n';

interface TransferStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (fromLocationId: string, toLocationId: string, quantity: number) => void;
  item: InventoryItem | null;
  inventoryLocations: InventoryLocation[];
}

const TransferStockModal: React.FC<TransferStockModalProps> = ({ isOpen, onClose, onConfirm, item, inventoryLocations }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState<number | ''>('');
  const [fromLocationId, setFromLocationId] = useState<string>('');
  const [toLocationId, setToLocationId] = useState<string>('');

  useEffect(() => {
    if (isOpen && item) {
      // Reset state when opening
      setQuantity('');
      setFromLocationId(item.locations[0]?.locationId || '');
      setToLocationId('');
    }
  }, [isOpen, item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity !== '' && quantity > 0 && fromLocationId && toLocationId && fromLocationId !== toLocationId) {
      onConfirm(fromLocationId, toLocationId, quantity);
      onClose();
    } else {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ συμπληρώστε όλα τα πεδία και επιλέξτε διαφορετικές τοποθεσίες.",
        variant: "destructive"
      });
    }
  };

  if (!item) return null;
  
  const availableToLocations = inventoryLocations.filter(loc => loc.id !== fromLocationId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{t('transfer_stock_title')}: {item.name}</DialogTitle>
          <DialogDescription>
            Μεταφέρετε ποσότητα μεταξύ τοποθεσιών αποθήκευσης
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="from">{t('transfer_from')} *</Label>
              <Select value={fromLocationId} onValueChange={setFromLocationId} required>
                <SelectTrigger id="from">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {inventoryLocations.map(loc => (
                    <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="to">{t('transfer_to')} *</Label>
              <Select value={toLocationId} onValueChange={setToLocationId} required>
                <SelectTrigger id="to">
                  <SelectValue placeholder="Επιλέξτε..." />
                </SelectTrigger>
                <SelectContent>
                  {availableToLocations.map(loc => (
                    <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">{t('qr_action_quantity')} ({item.unit}) *</Label>
              <Input
                id="quantity"
                type="number"
                step="any"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0"
                required
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit">
              {t('qr_action_confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransferStockModal;
