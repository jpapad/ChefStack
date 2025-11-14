import React, { useState } from 'react';
import { InventoryLocation } from '../../types';
import { useTranslation } from '../../i18n';
import { Icon } from '../common/Icon';
import ConfirmationModal from '../common/ConfirmationModal';
import InventoryLocationForm from './InventoryLocationForm';

interface InventoryLocationsManagerProps {
    inventoryLocations: InventoryLocation[];
    setInventoryLocations: React.Dispatch<React.SetStateAction<InventoryLocation[]>>;
}

const InventoryLocationsManager: React.FC<InventoryLocationsManagerProps> = ({ inventoryLocations, setInventoryLocations }) => {
    const { t } = useTranslation();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [locationToEdit, setLocationToEdit] = useState<InventoryLocation | null>(null);
    const [locationToDelete, setLocationToDelete] = useState<InventoryLocation | null>(null);

    const handleSave = (data: Omit<InventoryLocation, 'id' | 'teamId'> | InventoryLocation) => {
        if ('id' in data) {
            setInventoryLocations(prev => prev.map(loc => loc.id === data.id ? data : loc));
        } else {
            const newLocation = { ...data, id: `loc${Date.now()}`, teamId: '' }; // teamId will be set by parent context
            setInventoryLocations(prev => [...prev, newLocation as InventoryLocation]);
        }
        setIsFormOpen(false);
        setLocationToEdit(null);
    };

    const handleDelete = () => {
        if (locationToDelete) {
            setInventoryLocations(prev => prev.filter(loc => loc.id !== locationToDelete.id));
            setLocationToDelete(null);
        }
    };

    return (
        <>
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold font-heading">{t('workspace_inventory_locations')}</h2>
                    <button onClick={() => { setLocationToEdit(null); setIsFormOpen(true); }} className="flex items-center gap-2 bg-brand-dark text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
                        <Icon name="plus" className="w-5 h-5" />
                        <span className="font-semibold text-sm">{t('workspace_new_location')}</span>
                    </button>
                </div>
                <div className="space-y-2">
                    {inventoryLocations.map(loc => (
                        <div key={loc.id} className="flex items-center justify-between p-3 rounded-xl group hover:bg-black/5 dark:hover:bg-white/5">
                            <span className="font-semibold">{loc.name}</span>
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setLocationToEdit(loc); setIsFormOpen(true); }} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/20" title={t('edit')}>
                                    <Icon name="edit" className="w-4 h-4" />
                                </button>
                                <button onClick={() => setLocationToDelete(loc)} className="p-2 rounded-full text-light-text-secondary hover:text-red-500 hover:bg-red-500/10" title={t('delete')}>
                                    <Icon name="trash-2" className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {inventoryLocations.length === 0 && (
                        <p className="text-center text-gray-500 py-4">Δεν έχετε ορίσει ακόμη τοποθεσίες αποθήκης.</p>
                    )}
                </div>
            </div>

            <InventoryLocationForm 
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSave}
                locationToEdit={locationToEdit}
            />

            <ConfirmationModal
                isOpen={!!locationToDelete}
                onClose={() => setLocationToDelete(null)}
                onConfirm={handleDelete}
                title={t('workspace_delete_location_title')}
                body={t('workspace_delete_location_body', { locationName: locationToDelete?.name || '' })}
            />
        </>
    );
};

export default InventoryLocationsManager;
