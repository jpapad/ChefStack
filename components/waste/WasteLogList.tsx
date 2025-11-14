import React from 'react';
import { WasteLog, InventoryItem, User, WASTE_REASON_TRANSLATIONS } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

interface WasteLogListProps {
  logs: WasteLog[];
  inventory: InventoryItem[];
  users: User[];
  onDelete: (log: WasteLog) => void;
  canManage: boolean;
}

const WasteLogList: React.FC<WasteLogListProps> = ({ logs, inventory, users, onDelete, canManage }) => {
    const { language } = useTranslation();

    const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const formatDateTime = (date: Date) => {
        return new Intl.DateTimeFormat('el-GR', {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(date);
    }
    
    return (
        <div className="space-y-3">
        {logs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Δεν υπάρχουν καταγραφές φθορών.</p>
        ) : (
            sortedLogs.map(log => {
                const item = inventory.find(i => i.id === log.inventoryItemId);
                const user = users.find(u => u.id === log.userId);
                return (
                    <div key={log.id} className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-sm flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex flex-wrap items-baseline gap-x-3 mb-1">
                                <span className="font-bold text-lg">{item?.name || 'Άγνωστο Είδος'}</span>
                                <span className="font-mono text-base bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 px-2 py-0.5 rounded">-{log.quantity} {log.unit}</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {WASTE_REASON_TRANSLATIONS[log.reason][language]}
                            </p>
                            {log.notes && <p className="text-sm text-gray-500 italic mt-1">"{log.notes}"</p>}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                {formatDateTime(new Date(log.timestamp))} από <span className="font-medium">{user?.name || 'Άγνωστος'}</span>
                            </p>
                        </div>
                         {canManage && (
                            <button onClick={() => onDelete(log)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                <Icon name="trash-2" className="w-5 h-5"/>
                            </button>
                         )}
                    </div>
                )
            })
        )}
        </div>
    );
};

export default WasteLogList;
