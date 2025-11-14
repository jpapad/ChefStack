import React, { useState, useEffect } from 'react';
import { InventoryItem, Supplier, IngredientCost, PurchaseUnit, InventoryLocation, InventoryItemLocation } from '../../types';
import { Icon } from '../common/Icon';

interface InventoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<InventoryItem, 'id' | 'teamId'> | InventoryItem) => void;
  itemToEdit: InventoryItem | null;
  suppliers: Supplier[];
  ingredientCosts: IngredientCost[];
  inventoryLocations: InventoryLocation[];
}

const InventoryForm: React.FC<InventoryFormProps> = ({ isOpen, onClose, onSave, itemToEdit, suppliers, ingredientCosts, inventoryLocations }) => {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<PurchaseUnit>('kg');
  const [reorderPoint, setReorderPoint] = useState(0);
  const [supplierId, setSupplierId] = useState<string | undefined>(undefined);
  const [ingredientCostId, setIngredientCostId] = useState<string | undefined>(undefined);
  const [locations, setLocations] = useState<InventoryItemLocation[]>([]);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setUnit(itemToEdit.unit);
      setReorderPoint(itemToEdit.reorderPoint);
      setSupplierId(itemToEdit.supplierId);
      setIngredientCostId(itemToEdit.ingredientCostId);
      setLocations(itemToEdit.locations);
    } else {
      setName('');
      setUnit('kg');
      setReorderPoint(0);
      setSupplierId(undefined);
      setIngredientCostId(undefined);
      setLocations(inventoryLocations.length > 0 ? inventoryLocations.map(loc => ({ locationId: loc.id, quantity: 0 })) : []);
    }
  }, [itemToEdit, isOpen, inventoryLocations]);
  
  const handleLocationQuantityChange = (locationId: string, quantity: number) => {
      setLocations(prev => {
          const existing = prev.find(l => l.locationId === locationId);
          if (existing) {
              return prev.map(l => l.locationId === locationId ? { ...l, quantity } : l);
          }
          return [...prev, { locationId, quantity }];
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = { name, unit, reorderPoint, supplierId, ingredientCostId, locations };
    onSave(itemToEdit ? { ...itemToEdit, ...data } : data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <header className="flex items-center justify-between p-4 border-b border-gray-200/80 dark:border-gray-700/80">
            <h3 className="text-xl font-semibold">{itemToEdit ? 'Επεξεργασία Είδους' : 'Νέο Είδος Αποθήκης'}</h3>
            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
              <Icon name="x" className="w-6 h-6" />
            </button>
          </header>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Όνομα Είδους</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600" required />
            </div>
            
            <div className="md:col-span-2">
                <h4 className="text-sm font-medium mb-2">Ποσότητες ανά Τοποθεσία</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-black/5 dark:bg-white/5 rounded">
                    {inventoryLocations.map(loc => {
                        const itemLocation = locations.find(l => l.locationId === loc.id);
                        return (
                            <div key={loc.id} className="grid grid-cols-3 gap-2 items-center">
                                <label className="col-span-1 text-sm">{loc.name}</label>
                                <input 
                                    type="number" 
                                    step="any" 
                                    value={itemLocation?.quantity ?? 0}
                                    onChange={e => handleLocationQuantityChange(loc.id, parseFloat(e.target.value) || 0)}
                                    className="col-span-2 w-full p-1 rounded bg-light-card dark:bg-dark-card border border-gray-300 dark:border-gray-600" 
                                />
                            </div>
                        )
                    })}
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Μονάδα</label>
              <select value={unit} onChange={e => setUnit(e.target.value as PurchaseUnit)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600">
                <option value="kg">kg</option><option value="L">L</option><option value="τεμ">τεμ</option>
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium mb-1">Σημείο Αναπαραγγελίας</label>
              <input type="number" step="any" value={reorderPoint} onChange={e => setReorderPoint(parseFloat(e.target.value) || 0)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Προμηθευτής (Προαιρετικά)</label>
              <select value={supplierId || ''} onChange={e => setSupplierId(e.target.value || undefined)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600">
                <option value="">-- Κανένας --</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
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

export default InventoryForm;
