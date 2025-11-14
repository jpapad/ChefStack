import React, { useState, useMemo } from 'react';
import { InventoryItem, Supplier, IngredientCost, Role, InventoryLocation, RolePermissions } from '../../types';
import { Icon } from '../common/Icon';
import ConfirmationModal from '../common/ConfirmationModal';
import InventoryForm from './InventoryForm';
import InventoryList from './InventoryList';
import PrintPreview from '../common/PrintPreview';
import QRCodePrint from './QRCodePrint';
import TransferStockModal from './TransferStockModal';

interface InventoryViewProps {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  suppliers: Supplier[];
  ingredientCosts: IngredientCost[];
  inventoryLocations: InventoryLocation[];
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onBack: () => void;
  currentUserRole?: Role;
  rolePermissions: RolePermissions;
  onTransfer: (itemId: string, fromLocationId: string, toLocationId: string, quantity: number) => void;
  onImportInvoice: () => void;
}

const InventoryView: React.FC<InventoryViewProps> = ({ inventory, setInventory, suppliers, ingredientCosts, selectedItemId, onSelectItem, onBack, currentUserRole, rolePermissions, inventoryLocations, onTransfer, onImportInvoice }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [isQrPrintOpen, setIsQrPrintOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const canManage = currentUserRole ? rolePermissions[currentUserRole]?.includes('manage_inventory') : false;

  const inventoryWithDetails = useMemo(() => {
    return inventory.map(item => {
      const totalQuantity = item.locations.reduce((sum, loc) => sum + loc.quantity, 0);
      return {
      ...item,
      totalQuantity,
      supplierName: suppliers.find(s => s.id === item.supplierId)?.name || 'N/A',
    }}).sort((a, b) => a.name.localeCompare(b.name));
  }, [inventory, suppliers]);
  
  const selectedItem = useMemo(() => 
    inventoryWithDetails.find(i => i.id === selectedItemId), 
    [inventoryWithDetails, selectedItemId]
  );
  
  const handleOpenForm = (item: InventoryItem | null = null) => {
    setItemToEdit(item);
    setIsFormOpen(true);
  };
  
  const handleSaveItem = (data: Omit<InventoryItem, 'id' | 'teamId'> | InventoryItem) => {
    if ('id' in data) { // Editing
      setInventory(prev => prev.map(c => c.id === data.id ? data : c));
    } else { // Creating
      const newItem = { ...data, id: `inv${Date.now()}`, teamId: '' }; // teamId will be set in KitchenInterface
      setInventory(prev => [...prev, newItem as InventoryItem]);
      onSelectItem(newItem.id);
    }
    setIsFormOpen(false);
    setItemToEdit(null);
  };

  const handleRequestDelete = (item: InventoryItem) => {
    setItemToDelete(item);
  };
  
  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setInventory(prev => prev.filter(c => c.id !== itemToDelete.id));
      if (selectedItemId === itemToDelete.id) {
          const remaining = inventory.filter(i => i.id !== itemToDelete.id);
          onSelectItem(remaining.length > 0 ? remaining[0].id : null);
      }
      setItemToDelete(null);
    }
  };

  const handleConfirmTransfer = (fromLocationId: string, toLocationId: string, quantity: number) => {
    if (selectedItem) {
        onTransfer(selectedItem.id, fromLocationId, toLocationId, quantity);
    }
    setIsTransferModalOpen(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
         <div className={`h-full ${selectedItemId ? 'hidden lg:block' : 'lg:col-span-1'}`}>
            <InventoryList
                inventory={inventoryWithDetails}
                selectedItemId={selectedItemId}
                onSelectItem={onSelectItem}
                onAdd={() => handleOpenForm(null)}
                onEdit={handleOpenForm}
                onDelete={handleRequestDelete}
                canManage={canManage}
                onImportInvoice={onImportInvoice}
            />
         </div>
         <div className={`h-full ${!selectedItemId ? 'hidden lg:flex' : 'lg:col-span-2'}`}>
             {selectedItem ? (
                <div className="p-6 h-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl overflow-y-auto">
                    <button onClick={onBack} className="lg:hidden flex items-center mb-4 text-brand-yellow hover:underline">
                        <Icon name="arrow-left" className="w-5 h-5 mr-2" />
                        Πίσω στο Απόθεμα
                    </button>
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold font-heading">{selectedItem.name}</h2>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Προμηθευτής: {selectedItem.supplierName}</p>
                      </div>
                       <div className="flex gap-1 flex-shrink-0 ml-4">
                          <button onClick={() => setIsTransferModalOpen(true)} title="Μεταφορά Αποθέματος" className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                            <Icon name="arrow-right-left" className="w-5 h-5 text-blue-500"/>
                          </button>
                          <button onClick={() => setIsQrPrintOpen(true)} title="Εκτύπωση QR Code" className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                            <Icon name="qr-code" className="w-5 h-5 text-brand-yellow"/>
                          </button>
                          {canManage && (
                            <>
                                <button onClick={() => handleOpenForm(selectedItem)} title="Επεξεργασία" className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                                    <Icon name="edit" className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleRequestDelete(selectedItem)} title="Διαγραφή" className="p-2 rounded-full text-light-text-secondary hover:text-red-600 dark:text-dark-text-secondary dark:hover:text-red-400 hover:bg-red-500/10 transition-colors">
                                    <Icon name="trash-2" className="w-5 h-5" />
                                </button>
                            </>
                          )}
                      </div>
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-4">
                        <div className="bg-black/5 dark:bg-white/5 p-4 rounded-lg">
                            <h4 className="text-md font-semibold font-heading text-light-text-secondary dark:text-dark-text-secondary mb-2">Ανάλυση Αποθέματος ανά Τοποθεσία</h4>
                            <div className="space-y-2">
                              {selectedItem.locations.map(loc => {
                                const locationDetails = inventoryLocations.find(l => l.id === loc.locationId);
                                const isLowHere = loc.quantity <= (selectedItem.reorderPoint / selectedItem.locations.length); // simple logic for now
                                return (
                                  <div key={loc.locationId} className="flex justify-between items-center p-2 bg-light-card dark:bg-dark-card rounded">
                                    <span className="font-semibold">{locationDetails?.name || 'Άγνωστη τοποθεσία'}</span>
                                    <span className={`font-bold font-mono text-lg ${isLowHere ? 'text-red-500' : ''}`}>
                                      {loc.quantity.toFixed(2)} {selectedItem.unit}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                        </div>
                        <div className="bg-black/5 dark:bg-white/5 p-6 rounded-lg text-center">
                            <h4 className="text-md font-semibold font-heading text-light-text-secondary dark:text-dark-text-secondary">Συνολική Ποσότητα</h4>
                            <p className={`text-4xl font-bold ${selectedItem.totalQuantity <= selectedItem.reorderPoint ? 'text-red-500' : 'text-brand-yellow'}`}>
                                {selectedItem.totalQuantity.toFixed(2)} <span className="text-2xl">{selectedItem.unit}</span>
                            </p>
                        </div>
                     </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-light-text-secondary dark:text-dark-text-secondary bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl">
                    <p>Επιλέξτε ή δημιουργήστε ένα είδος αποθήκης</p>
                </div>
            )}
         </div>
      </div>

      <InventoryForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveItem}
        itemToEdit={itemToEdit}
        suppliers={suppliers}
        ingredientCosts={ingredientCosts}
        inventoryLocations={inventoryLocations}
      />
      
       <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Διαγραφή Είδους Αποθήκης"
        body={<p>Είστε σίγουροι ότι θέλετε να διαγράψετε το είδος "{itemToDelete?.name}";</p>}
      />

      {isQrPrintOpen && selectedItem && (
          <PrintPreview onClose={() => setIsQrPrintOpen(false)}>
              <QRCodePrint item={selectedItem} />
          </PrintPreview>
      )}

      <TransferStockModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onConfirm={handleConfirmTransfer}
        item={selectedItem}
        inventoryLocations={inventoryLocations}
      />
    </>
  );
};

export default InventoryView;
