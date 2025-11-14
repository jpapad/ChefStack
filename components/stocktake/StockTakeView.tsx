import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../../types';
import { Icon } from '../common/Icon';

interface StockTakeViewProps {
  inventory: InventoryItem[];
  onSaveChanges: (stockLevels: Record<string, number>) => void;
}

const StockTakeView: React.FC<StockTakeViewProps> = ({ inventory, onSaveChanges }) => {
  const [stockLevels, setStockLevels] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const initialLevels: Record<string, number> = {};
    inventory.forEach(item => {
      // For simplicity, we'll track and edit the quantity in the FIRST location.
      initialLevels[item.id] = item.locations[0]?.quantity ?? 0;
    });
    setStockLevels(initialLevels);
  }, [inventory]);

  const handleStockChange = (itemId: string, quantity: number) => {
    setStockLevels(prev => ({ ...prev, [itemId]: quantity }));
  };
  
  const handleSaveChanges = () => {
      if (window.confirm('Είστε σίγουροι ότι θέλετε να αποθηκεύσετε τις νέες ποσότητες; Αυτή η ενέργεια δεν αναιρείται.')) {
        onSaveChanges(stockLevels);
        alert('Η απογραφή αποθηκεύτηκε επιτυχώς!');
      }
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a,b) => a.name.localeCompare(b.name));

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl h-full flex flex-col">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200/80 dark:border-gray-700/80 flex-wrap gap-2">
            <h2 className="text-3xl font-extrabold font-heading">Απογραφή Αποθήκης</h2>
            <button onClick={handleSaveChanges} className="flex items-center gap-2 bg-brand-dark text-white px-4 py-2 rounded-full hover:opacity-90">
                <Icon name="save" className="w-5 h-5" />
                <span className="font-semibold text-sm">Αποθήκευση Αλλαγών</span>
            </button>
        </div>

         <div className="relative mb-4">
          <input
            type="text"
            placeholder="Αναζήτηση είδους..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-black/5 dark:bg-white/10 border-transparent focus:border-brand-yellow focus:ring-brand-yellow"
          />
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left">
                <thead className="sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md">
                    <tr className="border-b-2 border-black/10 dark:border-white/10">
                        <th className="p-2">Είδος</th>
                        <th className="p-2">Συνολικά Καταγεγραμμένο</th>
                        <th className="p-2">Νέα Ποσότητα (στην Κύρια Αποθήκη)</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredInventory.map(item => (
                        <tr key={item.id} className="border-b border-black/5 dark:border-white/5">
                            <td className="p-2 font-semibold">{item.name}</td>
                            <td className="p-2">{item.locations.reduce((sum, loc) => sum + loc.quantity, 0).toFixed(2)} {item.unit}</td>
                            <td className="p-2">
                                <input
                                    type="number"
                                    step="any"
                                    value={stockLevels[item.id] ?? ''}
                                    onChange={e => handleStockChange(item.id, parseFloat(e.target.value) || 0)}
                                    className="w-32 p-1 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                                />
                                <span className="ml-2">{item.unit}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default StockTakeView;
