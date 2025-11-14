import React, { useState } from 'react';
import { WasteLog, InventoryItem, User, Role, RolePermissions } from '../../types';
import { Icon } from '../common/Icon';
import WasteLogList from './WasteLogList';
import WasteLogForm from './WasteLogForm';
import ConfirmationModal from '../common/ConfirmationModal';
import { useTranslation } from '../../i18n';

interface WasteLogViewProps {
  wasteLogs: WasteLog[];
  setWasteLogs: React.Dispatch<React.SetStateAction<WasteLog[]>>;
  inventory: InventoryItem[];
  users: User[];
  onSave: (logData: Omit<WasteLog, 'id' | 'teamId' | 'userId'>) => void;
  currentUserRole?: Role;
  rolePermissions: RolePermissions;
}

const WasteLogView: React.FC<WasteLogViewProps> = ({ wasteLogs, setWasteLogs, inventory, users, onSave, currentUserRole, rolePermissions }) => {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<WasteLog | null>(null);

  const canManage = currentUserRole ? rolePermissions[currentUserRole]?.includes('manage_waste') : false;

  const handleSaveLog = (data: Omit<WasteLog, 'id' | 'teamId' | 'userId'>) => {
    onSave(data);
    setIsFormOpen(false);
  };

  const handleConfirmDelete = () => {
    if (logToDelete) {
      // Note: This only removes the log entry. The inventory adjustment is a separate transaction
      // and is not reverted, which is the correct behavior.
      setWasteLogs(prev => prev.filter(log => log.id !== logToDelete.id));
      setLogToDelete(null);
    }
  };

  return (
    <>
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl h-full flex flex-col">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200/80 dark:border-gray-700/80 flex-wrap gap-2">
          <h2 className="text-3xl font-extrabold font-heading">{t('waste_log_title')}</h2>
          {canManage && (
            <button
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 bg-brand-dark text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
                <Icon name="plus" className="w-5 h-5" />
                <span className="font-semibold text-sm">{t('waste_log_new')}</span>
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto -mr-2 pr-2">
          <WasteLogList 
            logs={wasteLogs}
            inventory={inventory}
            users={users}
            onDelete={setLogToDelete}
            canManage={canManage}
          />
        </div>
      </div>
      
      {canManage && (
        <WasteLogForm
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSave={handleSaveLog}
            inventory={inventory}
        />
      )}

      <ConfirmationModal
        isOpen={!!logToDelete}
        onClose={() => setLogToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={t('waste_log_delete_title')}
        body={<p>{t('waste_log_delete_body')}</p>}
      />
    </>
  );
};

export default WasteLogView;
