import React, { useState, useEffect } from 'react';
import { InventoryItem, InventoryLocation } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

type Action = 'subtract' | 'add' | 'transfer';

interface QuickActionModalProps {
  item: InventoryItem | null;
  inventoryLocations: InventoryLocation[];
  onClose: () => void;
  onConfirm: (item: InventoryItem, quantity: number, action: Action, fromLocationId?: string, toLocationId?: string) => void;
}

const QuickActionModal: React.FC<QuickActionModalProps> = ({ item, inventoryLocations, onClose, onConfirm }) => {
  const [quantity, setQuantity] = useState<number | ''>('');
  const [action, setAction] = useState<Action>('subtract');
  const [fromLocationId, setFromLocationId] = useState<string>('');
  const [toLocationId, setToLocationId] = useState<string>('');

  const { t } = useTranslation();

  useEffect(() => {
    if (item) {
      setQuantity('');
      setAction('subtract');
      // Pre-select the first location if available
      setFromLocationId(item.locations[0]?.locationId || '');
      setToLocationId('');
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item && quantity !== '' && quantity > 0) {
      if (action === 'transfer') {
        if(fromLocationId && toLocationId && fromLocationId !== toLocationId) {
            onConfirm(item, quantity, action, fromLocationId, toLocationId);
        } else {
            alert('Παρακαλώ επιλέξτε διαφορετικές τοποθεσίες.');
        }
      } else {
         onConfirm(item, quantity, action);
      }
    }
  };

  if (!item) return null;

  const availableToLocations = inventoryLocations.filter(loc => loc.id !== fromLocationId);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <header className="flex items-center justify-between p-4 border-b border-gray-200/80 dark:border-gray-700/80">
            <h3 className="text-xl font-semibold">{t('qr_action_title')}</h3>
            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
              <Icon name="x" className="w-6 h-6" />
            </button>
          </header>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">{t('qr_action_item')}</label>
              <p className="text-2xl font-bold">{item.name}</p>
            </div>

            <div className="flex gap-2">
                <button type="button" onClick={() => setAction('subtract')} className={`flex-1 p-2 rounded-lg font-semibold text-base ${action === 'subtract' ? 'bg-red-600 text-white' : 'bg-black/5 dark:bg-white/10'}`}>
                    {t('qr_action_subtract')}
                </button>
                 <button type="button" onClick={() => setAction('transfer')} className={`flex-1 p-2 rounded-lg font-semibold text-base ${action === 'transfer' ? 'bg-blue-600 text-white' : 'bg-black/5 dark:bg-white/10'}`}>
                    {t('qr_action_transfer')}
                </button>
                <button type="button" onClick={() => setAction('add')} className={`flex-1 p-2 rounded-lg font-semibold text-base ${action === 'add' ? 'bg-green-600 text-white' : 'bg-black/5 dark:bg-white/10'}`}>
                   {t('qr_action_add')}
                </button>
            </div>

            {action === 'transfer' && (
                <div className="space-y-2 p-3 bg-black/5 dark:bg-white/5 rounded-md">
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
                </div>
            )}

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium mb-1">{t('qr_action_quantity')} ({item.unit})</label>
              <input
                id="quantity"
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full p-3 text-2xl font-bold text-center rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                required
                autoFocus
              />
            </div>
          </div>
          <footer className="p-4 bg-black/5 dark:bg-white/5 rounded-b-2xl">
            <button
              type="submit"
              disabled={quantity === '' || quantity <= 0}
              className="w-full px-4 py-3 rounded-lg bg-brand-dark text-white hover:opacity-90 font-semibold text-lg disabled:opacity-50"
            >
              {t('qr_action_confirm')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default QuickActionModal;
