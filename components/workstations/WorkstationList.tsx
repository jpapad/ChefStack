import React from 'react';
import { Workstation } from '../../types';
import { Icon } from '../common/Icon';

interface WorkstationListProps {
  workstations: Workstation[];
  selectedWorkstationId: string | null;
  onSelectWorkstation: (id: string) => void;
  onAdd: () => void;
  onEdit: (workstation: Workstation) => void;
  onDelete: (workstation: Workstation) => void;
  canManage: boolean;
}

const WorkstationList: React.FC<WorkstationListProps> = ({ workstations, selectedWorkstationId, onSelectWorkstation, onAdd, onEdit, onDelete, canManage }) => {
  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200/80 dark:border-gray-700/80 flex-wrap gap-2">
        <h2 className="text-3xl font-extrabold font-heading">Σταθμοί</h2>
        {canManage && (
            <button
                onClick={onAdd}
                className="flex items-center gap-2 bg-brand-dark text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
                <Icon name="plus" className="w-5 h-5" />
                <span className="font-semibold text-sm">Νέος Σταθμός</span>
            </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto -mr-2 pr-2">
        <div className="space-y-2">
          {workstations.map(ws => (
            <div
              key={ws.id}
              onClick={() => onSelectWorkstation(ws.id)}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 group border ${
                selectedWorkstationId === ws.id
                  ? 'bg-brand-yellow/20 dark:bg-brand-yellow/30 border-brand-yellow/50'
                  : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <span className="font-bold text-md flex-1 truncate">{ws.name}</span>
              {canManage && (
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(ws); }} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/20" title="Edit">
                         <Icon name="edit" className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(ws); }} className="p-2 rounded-full text-light-text-secondary hover:text-red-500 hover:bg-red-500/10" title="Delete">
                         <Icon name="trash-2" className="w-4 h-4" />
                    </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkstationList;
