import React, { useState } from 'react';
import { HaccpLog, HaccpLogType, HaccpItem } from '../../types';
import { Icon } from '../common/Icon';

interface HaccpLogFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<HaccpLog, 'id'>) => void;
  haccpItems: HaccpItem[];
}

const HaccpLogForm: React.FC<HaccpLogFormProps> = ({ isOpen, onClose, onSave, haccpItems }) => {
  const [type, setType] = useState<HaccpLogType>(HaccpLogType.Temperature);
  const [haccpItemId, setHaccpItemId] = useState<string>(haccpItems[0]?.id || '');
  const [value, setValue] = useState('');
  const [user, setUser] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!haccpItemId || !user.trim()) return;
    
    onSave({
      timestamp: new Date(),
      type,
      haccpItemId,
      value: type === HaccpLogType.Temperature ? value : undefined,
      user,
      teamId: '', // Will be set by parent
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <header className="flex items-center justify-between p-4 border-b border-gray-200/80 dark:border-gray-700/80">
            <h3 className="text-xl font-semibold">Νέα Καταγραφή HACCP</h3>
            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
              <Icon name="x" className="w-6 h-6" />
            </button>
          </header>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Σημείο Ελέγχου</label>
              <select value={haccpItemId} onChange={e => setHaccpItemId(e.target.value)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600" required>
                <option value="" disabled>Επιλέξτε σημείο...</option>
                {haccpItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Τύπος Καταγραφής</label>
              <select value={type} onChange={e => setType(e.target.value as HaccpLogType)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600">
                {Object.values(HaccpLogType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {type === HaccpLogType.Temperature && (
              <div>
                <label className="block text-sm font-medium mb-1">Τιμή (π.χ. 3°C)</label>
                <input type="text" value={value} onChange={e => setValue(e.target.value)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600" />
              </div>
            )}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Όνομα Χρήστη</label>
              <input type="text" value={user} onChange={e => setUser(e.target.value)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600" required />
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

export default HaccpLogForm;
