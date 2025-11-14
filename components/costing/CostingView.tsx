import React, { useState, useMemo } from 'react';
import { IngredientCost, Role, RolePermissions } from '../../types';
import { Icon } from '../common/Icon';
import ConfirmationModal from '../common/ConfirmationModal';
import IngredientCostForm from './IngredientCostForm';
import IngredientCostList from './IngredientCostList';

interface CostingViewProps {
  ingredientCosts: IngredientCost[];
  setIngredientCosts: React.Dispatch<React.SetStateAction<IngredientCost[]>>;
  selectedCostId: string | null;
  onSelectCost: (id: string | null) => void;
  onBack: () => void;
  currentUserRole?: Role;
  rolePermissions: RolePermissions;
}

const formatCurrency = (value: number) => value.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' });

const CostingView: React.FC<CostingViewProps> = ({ ingredientCosts, setIngredientCosts, selectedCostId, onSelectCost, onBack, currentUserRole, rolePermissions }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [costToEdit, setCostToEdit] = useState<IngredientCost | null>(null);
  const [costToDelete, setCostToDelete] = useState<IngredientCost | null>(null);

  const canManage = currentUserRole ? rolePermissions[currentUserRole]?.includes('manage_costing') : false;

  const selectedCost = useMemo(() => 
    ingredientCosts.find(c => c.id === selectedCostId), 
    [ingredientCosts, selectedCostId]
  );
  
  const handleOpenForm = (cost: IngredientCost | null = null) => {
    setCostToEdit(cost);
    setIsFormOpen(true);
  };
  
  const handleSaveCost = (data: Omit<IngredientCost, 'id' | 'teamId'> | IngredientCost) => {
    if ('id' in data) { // Editing
      setIngredientCosts(prev => prev.map(c => c.id === data.id ? data : c));
    } else { // Creating
      const newCost = { ...data, id: `ic${Date.now()}`, teamId: '' }; // teamId will be set in KitchenInterface
      setIngredientCosts(prev => [...prev, newCost as IngredientCost].sort((a,b) => a.name.localeCompare(b.name)));
      onSelectCost(newCost.id);
    }
    setIsFormOpen(false);
    setCostToEdit(null);
  };

  const handleRequestDelete = (cost: IngredientCost) => {
    setCostToDelete(cost);
  };
  
  const handleConfirmDelete = () => {
    if (costToDelete) {
      setIngredientCosts(prev => prev.filter(c => c.id !== costToDelete.id));
      if (selectedCostId === costToDelete.id) {
          const remaining = ingredientCosts.filter(c => c.id !== costToDelete.id);
          onSelectCost(remaining.length > 0 ? remaining[0].id : null);
      }
      setCostToDelete(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
         <div className={`h-full ${selectedCostId ? 'hidden lg:block' : 'lg:col-span-1'}`}>
            <IngredientCostList
                ingredientCosts={ingredientCosts}
                selectedCostId={selectedCostId}
                onSelectCost={onSelectCost}
                onAdd={() => handleOpenForm(null)}
                onEdit={handleOpenForm}
                onDelete={handleRequestDelete}
                canManage={canManage}
            />
         </div>
         <div className={`h-full ${!selectedCostId ? 'hidden lg:flex' : 'lg:col-span-2'}`}>
            {selectedCost ? (
                <div className="p-6 h-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl overflow-y-auto">
                    <button onClick={onBack} className="lg:hidden flex items-center mb-4 text-brand-yellow hover:underline">
                        <Icon name="arrow-left" className="w-5 h-5 mr-2" />
                        Πίσω στο Κοστολόγιο
                    </button>
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold font-heading">{selectedCost.name}</h2>
                      </div>
                       <div className="flex gap-1 flex-shrink-0 ml-4">
                          {canManage && (
                            <>
                                <button onClick={() => handleOpenForm(selectedCost)} title="Επεξεργασία" className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                                    <Icon name="edit" className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleRequestDelete(selectedCost)} title="Διαγραφή" className="p-2 rounded-full text-light-text-secondary hover:text-red-600 dark:text-dark-text-secondary dark:hover:text-red-400 hover:bg-red-500/10 transition-colors">
                                    <Icon name="trash-2" className="w-5 h-5" />
                                </button>
                            </>
                          )}
                      </div>
                    </div>
                     <div className="mt-6 bg-black/5 dark:bg-white/5 p-6 rounded-lg text-center">
                        <h4 className="text-md font-semibold font-heading text-light-text-secondary dark:text-dark-text-secondary">Κόστος ανά {selectedCost.purchaseUnit}</h4>
                        <p className="text-4xl font-bold text-brand-yellow">{formatCurrency(selectedCost.cost)}</p>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-light-text-secondary dark:text-dark-text-secondary bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl">
                    <p>Επιλέξτε ή δημιουργήστε ένα συστατικό</p>
                </div>
            )}
         </div>
      </div>

      <IngredientCostForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveCost}
        costToEdit={costToEdit}
      />
      
       <ConfirmationModal
        isOpen={!!costToDelete}
        onClose={() => setCostToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Διαγραφή Κόστους Συστατικού"
        body={<p>Είστε σίγουροι ότι θέλετε να διαγράψετε το κόστος για το "{costToDelete?.name}";</p>}
      />
    </>
  );
};

export default CostingView;
