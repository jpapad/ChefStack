import React, { useState } from 'react';
import { HaccpLog, Role, RolePermissions, HaccpItem } from '../../types';
import { Icon } from '../common/Icon';
import HaccpLogList from './HaccpLogList';
import HaccpLogForm from './HaccpLogForm';
import ConfirmationModal from '../common/ConfirmationModal';

interface HaccpViewProps {
  logs: HaccpLog[];
  setLogs: React.Dispatch<React.SetStateAction<HaccpLog[]>>;
  haccpItems: HaccpItem[];
  onNavigateToPrint: () => void;
  currentUserRole?: Role;
  rolePermissions: RolePermissions;
}

const HaccpView: React.FC<HaccpViewProps> = ({ logs, setLogs, haccpItems, onNavigateToPrint, currentUserRole, rolePermissions }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<HaccpLog | null>(null);

  const canManage = currentUserRole ? rolePermissions[currentUserRole]?.includes('manage_team') : false;

  const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleSaveLog = (data: Omit<HaccpLog, 'id'>) => {
    const newLog = { ...data, id: `log${Date.now()}` };
    setLogs(prev => [...prev, newLog as HaccpLog]);
    setIsFormOpen(false);
  };

  const handleConfirmDelete = () => {
    if (logToDelete) {
      setLogs(prev => prev.filter(log => log.id !== logToDelete.id));
      setLogToDelete(null);
    }
  };

  return (
    <>
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl h-full flex flex-col">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200/80 dark:border-gray-700/80 flex-wrap gap-2">
          <h2 className="text-3xl font-extrabold font-heading">Αρχεία HACCP</h2>
          <div className="flex items-center gap-2">
            <button
                onClick={onNavigateToPrint}
                className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary px-4 py-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-opacity"
            >
                <Icon name="printer" className="w-5 h-5" />
                <span className="font-semibold text-sm">Εκτυπώσιμα</span>
            </button>
            <button
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 bg-brand-dark text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
                <Icon name="plus" className="w-5 h-5" />
                <span className="font-semibold text-sm">Νέα Καταγραφή</span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto -mr-2 pr-2">
          <HaccpLogList logs={sortedLogs} haccpItems={haccpItems} onDelete={setLogToDelete} canManage={canManage}/>
        </div>
      </div>
      
      <HaccpLogForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveLog}
        haccpItems={haccpItems}
      />

      <ConfirmationModal
        isOpen={!!logToDelete}
        onClose={() => setLogToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Διαγραφή Καταγραφής HACCP"
        body={<p>Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την καταγραφή; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.</p>}
      />
    </>
  );
};

export default HaccpView;
