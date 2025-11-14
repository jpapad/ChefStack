import React, { useState } from 'react';
import { HaccpItem } from '../../types';
import { useTranslation } from '../../i18n';
import { Icon } from '../common/Icon';
import ConfirmationModal from '../common/ConfirmationModal';
import HaccpItemForm from './HaccpItemForm';

interface HaccpItemsManagerProps {
    haccpItems: HaccpItem[];
    setHaccpItems: React.Dispatch<React.SetStateAction<HaccpItem[]>>;
}

const HaccpItemsManager: React.FC<HaccpItemsManagerProps> = ({ haccpItems, setHaccpItems }) => {
    const { t } = useTranslation();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<HaccpItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<HaccpItem | null>(null);

    const handleSave = (data: Omit<HaccpItem, 'id' | 'teamId'> | HaccpItem) => {
        if ('id' in data) {
            setHaccpItems(prev => prev.map(item => item.id === data.id ? data : item));
        } else {
            const newItem = { ...data, id: `haccp${Date.now()}`, teamId: '' }; // teamId will be set by parent context
            setHaccpItems(prev => [...prev, newItem as HaccpItem]);
        }
        setIsFormOpen(false);
        setItemToEdit(null);
    };

    const handleDelete = () => {
        if (itemToDelete) {
            setHaccpItems(prev => prev.filter(item => item.id !== itemToDelete.id));
            setItemToDelete(null);
        }
    };

    return (
        <>
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold font-heading">{t('workspace_haccp_items')}</h2>
                    <button onClick={() => { setItemToEdit(null); setIsFormOpen(true); }} className="flex items-center gap-2 bg-brand-dark text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
                        <Icon name="plus" className="w-5 h-5" />
                        <span className="font-semibold text-sm">{t('workspace_new_haccp_item')}</span>
                    </button>
                </div>
                <div className="space-y-2">
                    {haccpItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-xl group hover:bg-black/5 dark:hover:bg-white/5">
                            <div>
                                <span className="font-semibold">{item.name}</span>
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/50 px-2 py-0.5 rounded-full">{item.category}</span>
                            </div>
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setItemToEdit(item); setIsFormOpen(true); }} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/20" title={t('edit')}>
                                    <Icon name="edit" className="w-4 h-4" />
                                </button>
                                <button onClick={() => setItemToDelete(item)} className="p-2 rounded-full text-light-text-secondary hover:text-red-500 hover:bg-red-500/10" title={t('delete')}>
                                    <Icon name="trash-2" className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {haccpItems.length === 0 && (
                        <p className="text-center text-gray-500 py-4">Δεν έχετε ορίσει ακόμη σημεία ελέγχου HACCP.</p>
                    )}
                </div>
            </div>

            <HaccpItemForm 
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSave}
                itemToEdit={itemToEdit}
            />

            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={handleDelete}
                title={t('workspace_delete_haccp_item_title')}
                body={t('workspace_delete_haccp_item_body', { itemName: itemToDelete?.name || '' })}
            />
        </>
    );
};

export default HaccpItemsManager;
