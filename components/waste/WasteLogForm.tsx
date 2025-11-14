import React, { useState, useEffect } from 'react';
import { WasteLog, InventoryItem, WASTE_REASON_KEYS, WASTE_REASON_TRANSLATIONS } from '../../types';
import { Icon } from '../common/Icon';
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
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <header className="flex items-center justify-between p-4 border-b border-gray-200/80 dark:border-gray-700/80">
            <h3 className="text-xl font-semibold">{t('waste_log_new')}</h3>
            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
              <Icon name="x" className="w-6 h-6" />
            </button>
          </header>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">{t('waste_log_item')}</label>
              <select value={inventoryItemId} onChange={e => setInventoryItemId(e.target.value)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg" required>
                <option value="" disabled>Επιλέξτε είδος...</option>
                {inventory.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">{t('waste_log_quantity')}</label>
              <div className="flex items-center">
                <input type="number" step="any" min="0" value={quantity} onChange={e => setQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg" required />
                {selectedItem && <span className="ml-2 font-semibold">{selectedItem.unit}</span>}
              </div>
            </div>

             <div>
              <label className="block text-sm font-medium mb-1">{t('waste_log_reason')}</label>
              <select value={reason} onChange={e => setReason(e.target.value as typeof WASTE_REASON_KEYS[0])} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg" required>
                {WASTE_REASON_KEYS.map(key => <option key={key} value={key}>{WASTE_REASON_TRANSLATIONS[key][language]}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">{t('waste_log_notes')}</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg" />
            </div>
          </div>
          <footer className="p-4 flex justify-end gap-4 bg-black/5 dark:bg-white/5 rounded-b-2xl">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 font-semibold">{t('cancel')}</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-brand-dark text-white hover:opacity-90 font-semibold">{t('save')}</button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default WasteLogForm;
