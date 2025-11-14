import React, { useState, useEffect } from 'react';
import { Menu, MenuType } from '../../types';
import { Icon } from '../common/Icon';

interface MenuFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data:
    | Partial<Omit<Extract<Menu, { type: 'a_la_carte' }>, 'id'>>
    | Partial<Omit<Extract<Menu, { type: 'buffet' }>, 'id'>>
  ) => void;
  menuToEdit: Menu | null;
}

const MenuForm: React.FC<MenuFormProps> = ({ isOpen, onClose, onSave, menuToEdit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MenuType>('a_la_carte');
  const [pax, setPax] = useState(50);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (menuToEdit) {
      setName(menuToEdit.name);
      setDescription(menuToEdit.description);
      setType(menuToEdit.type);
      if (menuToEdit.type === 'buffet') {
        setPax(menuToEdit.pax);
        setStartDate(menuToEdit.startDate || '');
        setEndDate(menuToEdit.endDate || '');
      }
    } else {
      setName('');
      setDescription('');
      setType('a_la_carte');
      setPax(50);
      setStartDate('');
      setEndDate('');
    }
  }, [menuToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const baseData = { name, description };
    let data;
    if (type === 'buffet') {
        data = { ...baseData, type, pax, startDate, endDate };
    } else {
        data = { ...baseData, type };
    }
    onSave(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <header className="flex items-center justify-between p-4 border-b border-gray-200/80 dark:border-gray-700/80">
            <h3 className="text-xl font-semibold">{menuToEdit ? 'Επεξεργασία Μενού' : 'Νέο Μενού'}</h3>
            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
              <Icon name="x" className="w-6 h-6" />
            </button>
          </header>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Τύπος Μενού</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setType('a_la_carte')} className={`flex-1 p-2 rounded-lg font-semibold ${type === 'a_la_carte' ? 'bg-brand-dark text-white' : 'bg-black/5 dark:bg-white/10'}`}>À la carte</button>
                <button type="button" onClick={() => setType('buffet')} className={`flex-1 p-2 rounded-lg font-semibold ${type === 'buffet' ? 'bg-brand-dark text-white' : 'bg-black/5 dark:bg-white/10'}`}>Μπουφέ</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Όνομα Μενού</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 focus:shadow-aura-yellow focus:border-brand-yellow" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Περιγραφή</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 focus:shadow-aura-yellow focus:border-brand-yellow" />
            </div>
            {type === 'buffet' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Αριθμός Ατόμων (PAX)</label>
                  <input type="number" value={pax} onChange={e => setPax(parseInt(e.target.value) || 0)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 focus:shadow-aura-yellow focus:border-brand-yellow" required />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Ημερομηνία Έναρξης</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 focus:shadow-aura-yellow focus:border-brand-yellow" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Ημερομηνία Λήξης</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 focus:shadow-aura-yellow focus:border-brand-yellow" />
                    </div>
                 </div>
              </>
            )}
          </div>
          <footer className="p-4 flex justify-end gap-4 bg-black/5 dark:bg-white/5 rounded-b-2xl">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 font-semibold">Άκυρο</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-brand-dark text-white hover:opacity-90 font-semibold lift-on-hover">Αποθήκευση</button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default MenuForm;