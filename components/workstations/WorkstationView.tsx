import React, { useState, useMemo } from 'react';
import { Workstation, PrepTask, Recipe, Menu, PrepTaskStatus, Role, RolePermissions } from '../../types';
import WorkstationList from './WorkstationList';
import PrepList from './PrepList';
import WorkstationForm from './WorkstationForm';
import PrepTaskForm from './PrepTaskForm';
import ConfirmationModal from '../common/ConfirmationModal';
import { Icon } from '../common/Icon';

interface WorkstationViewProps {
  workstations: Workstation[];
  setWorkstations: React.Dispatch<React.SetStateAction<Workstation[]>>;
  tasks: PrepTask[];
  setTasks: React.Dispatch<React.SetStateAction<PrepTask[]>>;
  recipes: Recipe[];
  menus: Menu[];
  currentUserRole?: Role;
  rolePermissions: RolePermissions;
}

const WorkstationView: React.FC<WorkstationViewProps> = ({ workstations, setWorkstations, tasks, setTasks, recipes, menus, currentUserRole, rolePermissions }) => {
  const [selectedWorkstationId, setSelectedWorkstationId] = useState<string | null>(workstations[0]?.id || null);

  // Form Modals State
  const [isWsFormOpen, setIsWsFormOpen] = useState(false);
  const [wsToEdit, setWsToEdit] = useState<Workstation | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<PrepTask | null>(null);

  // Confirmation Modals State
  const [wsToDelete, setWsToDelete] = useState<Workstation | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<PrepTask | null>(null);

  const canManageWorkstations = currentUserRole ? rolePermissions[currentUserRole]?.includes('manage_team') : false;
  const canManageTasks = currentUserRole ? rolePermissions[currentUserRole]?.includes('manage_recipes') : false;

  const selectedWorkstation = useMemo(() =>
    workstations.find(ws => ws.id === selectedWorkstationId),
    [workstations, selectedWorkstationId]
  );
  
  const tasksForSelectedWorkstation = useMemo(() =>
    tasks.filter(task => task.workstationId === selectedWorkstationId),
    [tasks, selectedWorkstationId]
  );

  // --- Workstation CRUD Handlers ---
  const handleSaveWorkstation = (data: Omit<Workstation, 'id' | 'teamId'> | Workstation) => {
    if ('id' in data) { // Editing
      setWorkstations(prev => prev.map(ws => ws.id === data.id ? data : ws));
    } else { // Creating
      const newWs = { ...data, id: `ws${Date.now()}`, teamId: '' }; // teamId will be set in KitchenInterface
      setWorkstations(prev => [...prev, newWs as Workstation]);
      setSelectedWorkstationId(newWs.id);
    }
    setIsWsFormOpen(false);
    setWsToEdit(null);
  };

  const handleConfirmDeleteWorkstation = () => {
    if (wsToDelete) {
      setWorkstations(prev => prev.filter(ws => ws.id !== wsToDelete.id));
      if (selectedWorkstationId === wsToDelete.id) {
        setSelectedWorkstationId(workstations[0]?.id || null);
      }
      setWsToDelete(null);
    }
  };

  // --- Task CRUD Handlers ---
  const handleSaveTask = (data: Omit<PrepTask, 'id' | 'teamId'> | PrepTask) => {
    if ('id' in data) { // Editing
      setTasks(prev => prev.map(t => t.id === data.id ? data : t));
    } else { // Creating
      const newTask = { ...data, id: `pt${Date.now()}`, teamId: '' }; // teamId will be set in KitchenInterface
      setTasks(prev => [...prev, newTask as PrepTask]);
    }
    setIsTaskFormOpen(false);
    setTaskToEdit(null);
  };

  const handleConfirmDeleteTask = () => {
    if (taskToDelete) {
      setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
      setTaskToDelete(null);
    }
  };
  
  const handleTaskStatusChange = (taskId: string, newStatus: PrepTaskStatus) => {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };
  

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        <div className="lg:col-span-1 h-full">
          <WorkstationList
            workstations={workstations}
            selectedWorkstationId={selectedWorkstationId}
            onSelectWorkstation={setSelectedWorkstationId}
            onAdd={() => { setWsToEdit(null); setIsWsFormOpen(true); }}
            onEdit={(ws) => { setWsToEdit(ws); setIsWsFormOpen(true); }}
            onDelete={setWsToDelete}
            canManage={canManageWorkstations}
          />
        </div>
        <div className="lg:col-span-3 h-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl flex flex-col">
          {selectedWorkstation ? (
            <>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200/80 dark:border-gray-700/80 flex-wrap gap-2">
                 <h2 className="text-3xl font-extrabold font-heading">{selectedWorkstation.name}</h2>
                 {canManageTasks && (
                    <button
                        onClick={() => { setTaskToEdit(null); setIsTaskFormOpen(true); }}
                        className="flex items-center gap-2 bg-brand-dark text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
                    >
                        <Icon name="plus" className="w-5 h-5" />
                        <span className="font-semibold text-sm">Νέα Εργασία</span>
                    </button>
                 )}
              </div>
              <div className="flex-1 overflow-y-auto -mr-2 pr-2">
                <PrepList
                  tasks={tasksForSelectedWorkstation}
                  onStatusChange={handleTaskStatusChange}
                  onEdit={(task) => { setTaskToEdit(task); setIsTaskFormOpen(true); }}
                  onDelete={setTaskToDelete}
                  canManage={canManageTasks}
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-light-text-secondary dark:text-dark-text-secondary">
              <p>Επιλέξτε ή δημιουργήστε έναν σταθμό εργασίας.</p>
            </div>
          )}
        </div>
      </div>
      
      <WorkstationForm 
        isOpen={isWsFormOpen}
        onClose={() => setIsWsFormOpen(false)}
        onSave={handleSaveWorkstation}
        workstationToEdit={wsToEdit}
      />
      
      {selectedWorkstationId && (
        <PrepTaskForm
            isOpen={isTaskFormOpen}
            onClose={() => setIsTaskFormOpen(false)}
            onSave={handleSaveTask}
            taskToEdit={taskToEdit}
            recipes={recipes}
            workstationId={selectedWorkstationId}
        />
      )}

      <ConfirmationModal
        isOpen={!!wsToDelete}
        onClose={() => setWsToDelete(null)}
        onConfirm={handleConfirmDeleteWorkstation}
        title="Διαγραφή Σταθμού Εργασίας"
        body={<p>Είστε σίγουροι; Όλες οι εργασίες που ανήκουν σε αυτόν τον σταθμό θα διαγραφούν επίσης.</p>}
      />

      <ConfirmationModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDeleteTask}
        title="Διαγραφή Εργασίας"
        body={<p>Είστε σίγουροι ότι θέλετε να διαγράψετε την εργασία "{taskToDelete?.description}";</p>}
      />
    </>
  );
};

export default WorkstationView;
