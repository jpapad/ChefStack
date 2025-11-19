import React, { useState, useMemo } from 'react';
import { Supplier, Role, RolePermissions } from '../../types';
import { Icon } from '../common/Icon';
import ConfirmationModal from '../common/ConfirmationModal';
import SupplierForm from './SupplierForm';
import SupplierList from './SupplierList';
import { api } from '../../services/api';

interface SupplierViewProps {
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  selectedSupplierId: string | null;
  onSelectSupplier: (id: string | null) => void;
  onBack: () => void;
  currentUserRole?: Role;
  rolePermissions: RolePermissions;
  currentTeamId: string;
}

const SupplierView: React.FC<SupplierViewProps> = ({
  suppliers,
  setSuppliers,
  selectedSupplierId,
  onSelectSupplier,
  onBack,
  currentUserRole,
  rolePermissions,
  currentTeamId,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  const canManage = currentUserRole
    ? rolePermissions[currentUserRole]?.includes('manage_inventory')
    : false;

  const sortedSuppliers = useMemo(
    () => [...suppliers].sort((a, b) => a.name.localeCompare(b.name)),
    [suppliers]
  );

  const selectedSupplier = useMemo(
    () => suppliers.find(s => s.id === selectedSupplierId),
    [suppliers, selectedSupplierId]
  );

  const handleOpenForm = (supplier: Supplier | null = null) => {
    setSupplierToEdit(supplier);
    setIsFormOpen(true);
  };

  const handleSaveSupplier = async (
    data: Omit<Supplier, 'id' | 'teamId'> | Supplier
  ) => {
    try {
      const isExisting = 'id' in data;

      // ✅ ΕΔΩ ΦΡΟΝΤΙΖΟΥΜΕ ΝΑ ΥΠΑΡΧΕΙ ΠΑΝΤΑ teamId
      const payload: any = isExisting
        ? {
            ...(data as Supplier),
            teamId: (data as Supplier).teamId ?? currentTeamId,
          }
        : {
            ...(data as any),
            teamId: currentTeamId,
          };

      const savedSupplier = await api.saveSupplier(payload);

      setSuppliers(prev => {
        const exists = prev.some(s => s.id === savedSupplier.id);
        return exists
          ? prev.map(s => (s.id === savedSupplier.id ? savedSupplier : s))
          : [...prev, savedSupplier];
      });

      if (!isExisting) {
        onSelectSupplier(savedSupplier.id);
      }

      setIsFormOpen(false);
      setSupplierToEdit(null);
    } catch (err: any) {
      console.error('Failed to save supplier', err);
      alert(
        `Αποτυχία αποθήκευσης προμηθευτή: ${
          err?.message || 'Άγνωστο σφάλμα'
        }`
      );
    }
  };

  const handleRequestDelete = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
  };

  const handleConfirmDelete = async () => {
    if (supplierToDelete) {
      try {
        await api.deleteSupplier(supplierToDelete.id);

        setSuppliers(prev => prev.filter(s => s.id !== supplierToDelete.id));

        if (selectedSupplierId === supplierToDelete.id) {
          const remaining = suppliers.filter(
            s => s.id !== supplierToDelete.id
          );
          onSelectSupplier(remaining.length > 0 ? remaining[0].id : null);
        }

        setSupplierToDelete(null);
      } catch (err: any) {
        console.error('Failed to delete supplier', err);
        alert(
          `Αποτυχία διαγραφής προμηθευτή: ${
            err?.message || 'Άγνωστο σφάλμα'
          }`
        );
      }
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div
          className={`h-full ${
            selectedSupplierId ? 'hidden lg:block' : 'lg:col-span-1'
          }`}
        >
          <SupplierList
            suppliers={sortedSuppliers}
            selectedSupplierId={selectedSupplierId}
            onSelectSupplier={onSelectSupplier}
            onAdd={() => handleOpenForm(null)}
            onEdit={handleOpenForm}
            onDelete={handleRequestDelete}
            canManage={canManage}
          />
        </div>
        <div
          className={`h-full ${
            !selectedSupplierId ? 'hidden lg:flex' : 'lg:col-span-2'
          }`}
        >
          {selectedSupplier ? (
            <div className="p-6 h-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl overflow-y-auto">
              <button
                onClick={onBack}
                className="lg:hidden flex items-center mb-4 text-brand-yellow hover:underline"
              >
                <Icon name="arrow-left" className="w-5 h-5 mr-2" />
                Πίσω στους Προμηθευτές
              </button>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold font-heading">
                    {selectedSupplier.name}
                  </h2>
                </div>
                <div className="flex gap-1 flex-shrink-0 ml-4">
                  {canManage && (
                    <>
                      <button
                        onClick={() => handleOpenForm(selectedSupplier)}
                        title="Επεξεργασία"
                        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      >
                        <Icon name="edit" className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleRequestDelete(selectedSupplier)}
                        title="Διαγραφή"
                        className="p-2 rounded-full text-light-text-secondary hover:text-red-600 dark:text-dark-text-secondary dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Icon name="trash-2" className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold font-heading text-light-text-secondary dark:text-dark-text-secondary">
                    Υπεύθυνος Επικοινωνίας
                  </h4>
                  <p className="text-lg font-medium">
                    {selectedSupplier.contactPerson || '-'}
                  </p>
                </div>
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold font-heading text-light-text-secondary dark:text-dark-text-secondary">
                    Τηλέφωνο
                  </h4>
                  <p className="text-lg font-medium">
                    {selectedSupplier.phone || '-'}
                  </p>
                </div>
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold font-heading text-light-text-secondary dark:text-dark-text-secondary">
                    Email
                  </h4>
                  <p className="text-lg font-medium">
                    {selectedSupplier.email || '-'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-light-text-secondary dark:text-dark-text-secondary bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl">
              <p>Επιλέξτε ή δημιουργήστε έναν προμηθευτή</p>
            </div>
          )}
        </div>
      </div>

      <SupplierForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveSupplier}
        supplierToEdit={supplierToEdit}
      />

      <ConfirmationModal
        isOpen={!!supplierToDelete}
        onClose={() => setSupplierToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Διαγραφή Προμηθευτή"
        body={
          <p>
            Είστε σίγουροι ότι θέλετε να διαγράψετε τον προμηθευτή "
            {supplierToDelete?.name}";
          </p>
        }
      />
    </>
  );
};

export default SupplierView;
