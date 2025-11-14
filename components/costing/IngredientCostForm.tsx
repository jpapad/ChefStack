import React, { useState, useEffect } from 'react';
import { IngredientCost, PurchaseUnit } from '../../types';
import { Icon } from '../common/Icon';

interface IngredientCostFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<IngredientCost, 'id' | 'teamId'> | IngredientCost) => void;
  costToEdit: IngredientCost | null;
}

const IngredientCostForm: React.FC<IngredientCostFormProps> = ({ isOpen, onClose, onSave, costToEdit }) => {
  const [name, setName] = useState('');
  const [cost, setCost] = useState<number>(0);
  const [purchaseUnit, setPurchaseUnit] = useState<PurchaseUnit>('kg');

  useEffect(() => {
    if (costToEdit) {
      setName(costToEdit.name);
      setCost(costToEdit.cost);
      setPurchaseUnit(costToEdit.purchaseUnit);
    } else {
      setName('');
      setCost(0);
      setPurchaseUnit('kg');
    }
  }, [costToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || cost <= 0) return;
    
    const data = { name, cost, purchaseUnit };
    onSave(costToEdit ? { ...costToEdit, ...data } : data);
  };

  if (!isOpen) return null;

  return (
     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <header className="flex items-center justify-between p-4 border-b border-gray-200/80 dark:border-gray-700/80">
            <h3 className="text-xl font-semibold">{costToEdit ? 'Επεξεργασία Κόστους' : 'Νέο Κόστος Συστατικού'}</h3>
            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
              <Icon name="x" className="w-6 h-6" />
            </button>
          </header>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Όνομα Συστατικού</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium mb-1">Κόστος Αγοράς (€)</label>
                <input type="number" step="0.01" value={cost} onChange={e => setCost(parseFloat(e.target.value) || 0)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ανά Μονάδα</label>
                <select value={purchaseUnit} onChange={e => setPurchaseUnit(e.target.value as PurchaseUnit)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600">
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                    <option value="τεμ">τεμ</option>
                </select>
              </div>
            </div>
          </div>
          <footer className="p-4 flex justify-end gap-4 bg-black/5 dark:bg-white/5 rounded-b-2xl">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 font-semibold">Άκυρο</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-brand-dark text-white hover:opacity-90 font-semibold">Αποθήκευση</button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default IngredientCostForm;
