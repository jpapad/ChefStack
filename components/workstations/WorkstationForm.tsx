import React, { useState, useEffect } from 'react';
import { Workstation } from '../../types';
import { Icon } from '../common/Icon';

interface WorkstationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Workstation, 'id' | 'teamId'> | Workstation) => void;
  workstationToEdit: Workstation | null;
}

const WorkstationForm: React.FC<WorkstationFormProps> = ({ isOpen, onClose, onSave, workstationToEdit }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (workstationToEdit) {
      setName(workstationToEdit.name);
    } else {
      setName('');
    }
  }, [workstationToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(workstationToEdit ? { ...workstationToEdit, name } : { name });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <header className="flex items-center justify-between p-4 border-b border-gray-200/80 dark:border-gray-700/80">
            <h3 className="text-xl font-semibold">
              {workstationToEdit ? 'Επεξεργασία Σταθμού' : 'Νέος Σταθμός Εργασίας'}
            </h3>
            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
              <Icon name="x" className="w-6 h-6" />
            </button>
          </header>
          <div className="p-6">
            <label htmlFor="ws-name" className="block text-sm font-medium mb-1">Όνομα Σταθμού</label>
            <input
              id="ws-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 focus:ring-brand-yellow focus:border-brand-yellow"
              required
              autoFocus
            />
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

export default WorkstationForm;
