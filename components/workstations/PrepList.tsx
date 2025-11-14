import React from 'react';
import { PrepTask, PrepTaskStatus } from '../../types';
import { Icon } from '../common/Icon';

interface PrepListProps {
  tasks: PrepTask[];
  onStatusChange: (taskId: string, newStatus: PrepTaskStatus) => void;
  onEdit: (task: PrepTask) => void;
  onDelete: (task: PrepTask) => void;
  canManage: boolean;
}

const STATUS_CONFIG = {
  [PrepTaskStatus.ToDo]: {
    icon: 'circle' as const,
    color: 'text-gray-400',
    borderColor: 'border-gray-400',
    label: 'To Do',
  },
  [PrepTaskStatus.InProgress]: {
    icon: 'loader-2' as const,
    color: 'text-blue-500 animate-spin',
    borderColor: 'border-blue-500',
    label: 'In Progress',
  },
  [PrepTaskStatus.Done]: {
    icon: 'check-circle-2' as const,
    color: 'text-green-500',
    borderColor: 'border-green-500',
    label: 'Done',
  },
};

const PrepTaskItem: React.FC<{ task: PrepTask; canManage: boolean; onStatusChange: PrepListProps['onStatusChange'], onEdit: PrepListProps['onEdit'], onDelete: PrepListProps['onDelete'] }> = ({ task, canManage, onStatusChange, onEdit, onDelete }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/10 rounded-lg shadow-sm group">
      <div className="flex-1 mr-4">
        <p className="font-semibold text-lg">{task.description}</p>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
          Για Συνταγή: <span className="font-medium text-light-text-primary dark:text-dark-text-primary">{task.recipeName}</span>
        </p>
      </div>
      <div className="flex items-center space-x-1">
        {/* Status Change Buttons */}
        {(Object.values(PrepTaskStatus) as PrepTaskStatus[]).map(status => (
          <button
            key={status}
            onClick={() => onStatusChange(task.id, status)}
            title={STATUS_CONFIG[status].label}
            className={`p-2 rounded-full transition-colors duration-200 ${
              task.status === status
                ? `${STATUS_CONFIG[status].color} bg-black/10 dark:bg-white/20`
                : 'text-gray-400 hover:bg-black/10 dark:hover:bg-white/20'
            }`}
          >
            <Icon name={STATUS_CONFIG[status].icon} className="w-5 h-5" />
          </button>
        ))}
         {/* Edit/Delete Buttons - appear on hover */}
        {canManage && (
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => onEdit(task)} 
                    className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/20"
                    title="Επεξεργασία"
                   >
                     <Icon name="edit" className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => onDelete(task)} 
                    className="p-2 rounded-full text-light-text-secondary hover:text-red-500 hover:bg-red-500/10"
                    title="Διαγραφή"
                   >
                     <Icon name="trash-2" className="w-4 h-4" />
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

const PrepList: React.FC<PrepListProps> = ({ tasks, onStatusChange, onEdit, onDelete, canManage }) => {
  const columns = {
      [PrepTaskStatus.ToDo]: tasks.filter(t => t.status === PrepTaskStatus.ToDo),
      [PrepTaskStatus.InProgress]: tasks.filter(t => t.status === PrepTaskStatus.InProgress),
      [PrepTaskStatus.Done]: tasks.filter(t => t.status === PrepTaskStatus.Done),
  }
  
  return (
    <>
      {tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            {(Object.keys(columns) as PrepTaskStatus[]).map(status => (
                <div key={status} className="flex flex-col">
                    <h3 className={`font-bold font-heading px-2 pb-2 mb-4 border-b-4 ${STATUS_CONFIG[status].borderColor}`}>
                        {STATUS_CONFIG[status].label} ({columns[status].length})
                    </h3>
                    <div className="space-y-3 overflow-y-auto">
                        {columns[status].map(task => (
                            <PrepTaskItem key={task.id} task={task} canManage={canManage} onStatusChange={onStatusChange} onEdit={onEdit} onDelete={onDelete} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500 text-lg">
          <p>Δεν υπάρχουν εργασίες προετοιμασίας.</p>
        </div>
      )}
    </>
  );
};

export default PrepList;
