// Fix: Created the component to display a list of HACCP logs.
import React from 'react';
import { HaccpLog, HaccpItem } from '../../types';
import { Icon } from '../common/Icon';
import { HaccpLogListSkeleton } from './HaccpLogListSkeleton';

interface HaccpLogListProps {
  logs: HaccpLog[];
  haccpItems: HaccpItem[];
  onDelete: (log: HaccpLog) => void;
  canManage: boolean;
  isLoading?: boolean;
}

const HaccpLogList: React.FC<HaccpLogListProps> = ({ logs, haccpItems, onDelete, canManage, isLoading = false }) => {
    const formatDateTime = (date: Date) => {
        return new Intl.DateTimeFormat('el-GR', {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(date);
    }
    
    if (isLoading) {
        return <HaccpLogListSkeleton count={10} />;
    }
    
    return (
        <div className="space-y-4">
        {logs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Δεν υπάρχουν καταχωρήσεις.</p>
        ) : (
            logs.map(log => {
                const item = haccpItems.find(i => i.id === log.haccpItemId);
                return (
                    <div key={log.id} className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-sm flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center mb-2">
                                <span className="font-bold text-lg mr-4">{item?.name || 'Άγνωστο Σημείο'}</span>
                                {item && <span className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full">{item.category}</span>}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                                <span className="font-semibold">{log.type}</span>
                                {log.value && <span className="font-mono text-brand-secondary ml-2 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{log.value}</span>}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                {formatDateTime(new Date(log.timestamp))} από <span className="font-medium">{log.user}</span>
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

export default HaccpLogList;
