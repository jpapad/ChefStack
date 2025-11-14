import React, { useState, useEffect } from 'react';
import { InventoryItem, InventoryLocation } from '../../types';
import { Icon } from '../common/Icon';
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
    } else {
      alert("Παρακαλώ συμπληρώστε όλα τα πεδία και επιλέξτε διαφορετικές τοποθεσίες.");
    }
  };

  if (!isOpen || !item) return null;
  
  const availableToLocations = inventoryLocations.filter(loc => loc.id !== fromLocationId);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <header className="flex items-center justify-between p-4 border-b border-gray-200/80 dark:border-gray-700/80">
            <h3 className="text-xl font-semibold">{t('transfer_stock_title')}: {item.name}</h3>
            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
              <Icon name="x" className="w-6 h-6" />
            </button>
          </header>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('transfer_from')}</label>
              <select value={fromLocationId} onChange={e => setFromLocationId(e.target.value)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg">
                  {inventoryLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('transfer_to')}</label>
              <select value={toLocationId} onChange={e => setToLocationId(e.target.value)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg">
                  <option value="" disabled>Επιλέξτε...</option>
                  {availableToLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('qr_action_quantity')} ({item.unit})</label>
              <input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                required
                autoFocus
              />
            </div>
          </div>
          <footer className="p-4 flex justify-end gap-4 bg-black/5 dark:bg-white/5 rounded-b-2xl">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 font-semibold">{t('cancel')}</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-brand-dark text-white hover:opacity-90 font-semibold">{t('qr_action_confirm')}</button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default TransferStockModal;
