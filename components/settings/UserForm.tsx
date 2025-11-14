import React, { useState, useEffect } from 'react';
import { User, Role } from '../../types';
import { Icon } from '../common/Icon';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: (Omit<User, 'id' | 'memberships'> & { initialRole: Role }) | User) => void;
  userToEdit: User | null;
  teamId: string;
}

const UserForm: React.FC<UserFormProps> = ({ isOpen, onClose, onSave, userToEdit, teamId }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('Cook');

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setEmail(userToEdit.email);
      setRole(userToEdit.memberships.find(m => m.teamId === teamId)?.role || 'Cook');
    } else {
      setName('');
      setEmail('');
      setRole('Cook');
    }
  }, [userToEdit, isOpen, teamId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || (!userToEdit && !name.trim())) return;

    if (userToEdit) {
        const updatedMemberships = userToEdit.memberships.map(m => m.teamId === teamId ? {...m, role} : m);
        onSave({ ...userToEdit, memberships: updatedMemberships });
    } else {
        onSave({ name, email, initialRole: role });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <header className="flex items-center justify-between p-4 border-b border-gray-200/80 dark:border-gray-700/80">
            <h3 className="text-xl font-semibold">{userToEdit ? 'Επεξεργασία Μέλους' : 'Πρόσκληση Νέου Μέλους'}</h3>
            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
              <Icon name="x" className="w-6 h-6" />
            </button>
          </header>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Όνομα</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg" required disabled={!!userToEdit} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg" required disabled={!!userToEdit} />
            </div>
             <div>
              <label className="block text-sm font-medium mb-1">Ρόλος</label>
              <select value={role} onChange={e => setRole(e.target.value as Role)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg">
                <option value="Cook">Cook</option>
                <option value="Sous Chef">Sous Chef</option>
                <option value="Admin">Admin</option>
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

export default UserForm;
