import React, { useState, useEffect } from 'react';
import { PrepTask, PrepTaskStatus, Recipe } from '../../types';
import { Icon } from '../common/Icon';

interface PrepTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<PrepTask, 'id' | 'teamId'> | PrepTask) => void;
  taskToEdit: PrepTask | null;
  recipes: Recipe[];
  workstationId: string;
}

const PrepTaskForm: React.FC<PrepTaskFormProps> = ({ isOpen, onClose, onSave, taskToEdit, recipes, workstationId }) => {
  const [description, setDescription] = useState('');
  const [recipeName, setRecipeName] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setDescription(taskToEdit.description);
      setRecipeName(taskToEdit.recipeName);
    } else {
      setDescription('');
      setRecipeName('');
    }
  }, [taskToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !recipeName) return;

    const taskData = {
      description,
      recipeName,
      workstationId,
      status: taskToEdit?.status || PrepTaskStatus.ToDo,
    };
    
    onSave(taskToEdit ? { ...taskToEdit, ...taskData } : taskData);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <header className="flex items-center justify-between p-4 border-b border-gray-200/80 dark:border-gray-700/80">
            <h3 className="text-xl font-semibold">
              {taskToEdit ? 'Επεξεργασία Εργασίας' : 'Νέα Εργασία Προετοιμασίας'}
            </h3>
            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
              <Icon name="x" className="w-6 h-6" />
            </button>
          </header>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="task-desc" className="block text-sm font-medium mb-1">Περιγραφή Εργασίας</label>
              <input
                id="task-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                required
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="task-recipe" className="block text-sm font-medium mb-1">Για Συνταγή</label>
              <select
                id="task-recipe"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                required
              >
                <option value="" disabled>Επιλέξτε συνταγή</option>
                {recipes.map(recipe => (
                  <option key={recipe.id} value={recipe.name}>{recipe.name}</option>
                ))}
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

export default PrepTaskForm;
