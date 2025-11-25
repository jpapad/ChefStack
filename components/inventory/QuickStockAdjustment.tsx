import React, { useState } from 'react';
import { InventoryItem } from '../../types';
import { Icon } from '../common/Icon';

interface QuickStockAdjustmentProps {
  item: InventoryItem & { totalQuantity: number };
  isOpen: boolean;
  onClose: () => void;
  onAdjust: (itemId: string, adjustment: number, reason: string) => void;
}

const QuickStockAdjustment: React.FC<QuickStockAdjustmentProps> = ({
  item,
  isOpen,
  onClose,
  onAdjust
}) => {
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      alert('Παρακαλώ εισάγετε έγκυρη ποσότητα');
      return;
    }

    const finalQty = adjustmentType === 'add' ? qty : -qty;
    onAdjust(item.id, finalQty, reason || `${adjustmentType === 'add' ? 'Προσθήκη' : 'Αφαίρεση'} αποθέματος`);
    
    // Reset form
    setQuantity('');
    setReason('');
    setAdjustmentType('add');
  };

  if (!isOpen) return null;

  const newQuantity = adjustmentType === 'add'
    ? item.totalQuantity + (parseFloat(quantity) || 0)
    : item.totalQuantity - (parseFloat(quantity) || 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-xl font-bold">Γρήγορη Ενημέρωση Αποθέματος</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.name}</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <Icon name="x" className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Current Stock */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">Τρέχον Απόθεμα</div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {item.totalQuantity.toFixed(2)} {item.unit}
              </div>
              {item.reorderPoint && item.totalQuantity <= item.reorderPoint && (
                <div className="mt-2 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                  <Icon name="alert-circle" className="w-4 h-4" />
                  <span>Όριο επαναπαραγγελίας: {item.reorderPoint} {item.unit}</span>
                </div>
              )}
            </div>

            {/* Action Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Τύπος Ενέργειας</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustmentType('add')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    adjustmentType === 'add'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon name="plus-circle" className={`w-8 h-8 mx-auto mb-2 ${
                    adjustmentType === 'add' ? 'text-emerald-600' : 'text-gray-400'
                  }`} />
                  <div className="font-semibold text-sm">Προσθήκη</div>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentType('remove')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    adjustmentType === 'remove'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon name="minus-circle" className={`w-8 h-8 mx-auto mb-2 ${
                    adjustmentType === 'remove' ? 'text-red-600' : 'text-gray-400'
                  }`} />
                  <div className="font-semibold text-sm">Αφαίρεση</div>
                </button>
              </div>
            </div>

            {/* Quantity Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Ποσότητα {adjustmentType === 'add' ? 'Προσθήκης' : 'Αφαίρεσης'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  className="w-full p-3 pr-16 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900"
                  placeholder="0.00"
                  required
                  autoFocus
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  {item.unit}
                </span>
              </div>
            </div>

            {/* Preview */}
            {quantity && (
              <div className={`p-4 rounded-lg border-2 ${
                adjustmentType === 'add'
                  ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-red-200 bg-red-50 dark:bg-red-900/20'
              }`}>
                <div className="text-sm font-medium mb-2">Νέο Απόθεμα</div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">
                    {newQuantity.toFixed(2)} {item.unit}
                  </span>
                  <span className={`text-sm font-medium ${
                    adjustmentType === 'add' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {adjustmentType === 'add' ? '+' : '-'}{parseFloat(quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Reason (Optional) */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Αιτιολογία (προαιρετικό)
              </label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900"
                placeholder="π.χ. Παραλαβή παραγγελίας, Χρήση σε παραγωγή..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold"
            >
              Άκυρο
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-3 rounded-lg font-semibold text-white ${
                adjustmentType === 'add'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {adjustmentType === 'add' ? 'Προσθήκη' : 'Αφαίρεση'} Αποθέματος
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickStockAdjustment;
