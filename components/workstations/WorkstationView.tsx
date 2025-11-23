import React, { useState, useMemo } from 'react';
import {
  Workstation,
  PrepTask,
  Recipe,
  Menu,
  PrepTaskStatus,
  Role,
  RolePermissions,
} from '../../types';
import WorkstationList from './WorkstationList';
import PrepList from './PrepList';
import WorkstationForm from './WorkstationForm';
import PrepTaskForm from './PrepTaskForm';
import ConfirmationModal from '../common/ConfirmationModal';
import { Icon } from '../common/Icon';
import { api } from '../../services/api';

interface WorkstationViewProps {
  workstations: Workstation[];
  setWorkstations: React.Dispatch<React.SetStateAction<Workstation[]>>;
  tasks: PrepTask[];
  setTasks: React.Dispatch<React.SetStateAction<PrepTask[]>>;
  recipes: Recipe[];
  menus: Menu[];
  currentUserRole?: Role;
  rolePermissions: RolePermissions;
  currentTeamId: string;
}

const WorkstationView: React.FC<WorkstationViewProps> = ({
  workstations,
  setWorkstations,
  tasks,
  setTasks,
  recipes,
  menus,
  currentUserRole,
  rolePermissions,
  currentTeamId,
}) => {
  const [selectedWorkstationId, setSelectedWorkstationId] = useState<string | null>(
    workstations[0]?.id || null
  );

  // Form Modals State
  const [isWsFormOpen, setIsWsFormOpen] = useState(false);
  const [wsToEdit, setWsToEdit] = useState<Workstation | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<PrepTask | null>(null);

  // Confirmation Modals State
  const [wsToDelete, setWsToDelete] = useState<Workstation | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<PrepTask | null>(null);

  const canManageWorkstations = currentUserRole
    ? rolePermissions[currentUserRole]?.includes('manage_team')
    : false;

  const canManageTasks = currentUserRole
    ? rolePermissions[currentUserRole]?.includes('manage_recipes')
    : false;

  const selectedWorkstation = useMemo(
    () => workstations.find(ws => ws.id === selectedWorkstationId),
    [workstations, selectedWorkstationId]
  );

  const tasksForSelectedWorkstation = useMemo(
    () =>
      tasks
        .filter(task => task.workstationId === selectedWorkstationId)
        .sort((a, b) => {
          // 🔧 απλό string-based order για να μην γκρινιάζει η TS
          const order: { [key: string]: number } = {
            pending: 0,
            in_progress: 1,
            done: 2,
          };
          return (order[a.status] ?? 0) - (order[b.status] ?? 0);
        }),
    [tasks, selectedWorkstationId]
  );

  // --- Workstation CRUD Handlers ---

  const handleSaveWorkstation = async (
    data: Omit<Workstation, 'id' | 'teamId'> | Workstation
  ) => {
    try {
      const isExisting = 'id' in data;
      const anyApi = api as any;

      // πάντα βάζουμε teamId
      const payload: Workstation = isExisting
        ? {
            ...(data as Workstation),
            teamId: (data as Workstation).teamId ?? currentTeamId,
          }
        : {
            ...(data as any),
            id: (data as any).id ?? `ws${Date.now()}`,
            teamId: currentTeamId,
          };

      let savedWs: Workstation = payload;

      // αν στο μέλλον προστεθεί api.saveWorkstation, θα χρησιμοποιηθεί αυτό
      if (typeof anyApi.saveWorkstation === 'function') {
        savedWs = await anyApi.saveWorkstation(payload);
      }

      setWorkstations(prev => {
        const exists = prev.some(ws => ws.id === savedWs.id);
        const updated = exists
          ? prev.map(ws => (ws.id === savedWs.id ? savedWs : ws))
          : [...prev, savedWs];

        return updated.sort((a, b) => a.name.localeCompare(b.name));
      });

      if (!isExisting) {
        setSelectedWorkstationId(savedWs.id);
      }

      setIsWsFormOpen(false);
      setWsToEdit(null);
    } catch (err: any) {
      console.error('Failed to save workstation', err);
      alert(
        `Αποτυχία αποθήκευσης σταθμού εργασίας: ${
          err?.message || 'Άγνωστο σφάλμα'
        }`
      );
    }
  };

  const handleConfirmDeleteWorkstation = async () => {
    if (!wsToDelete) return;

    try {
      const anyApi = api as any;

      // αν υπάρχει API, κάλεσέ το – αλλιώς απλά κάνε local delete
      if (typeof anyApi.deleteWorkstation === 'function') {
        await anyApi.deleteWorkstation(wsToDelete.id);
      }

      setWorkstations(prev => {
        const updated = prev.filter(ws => ws.id !== wsToDelete.id);

        if (selectedWorkstationId === wsToDelete.id) {
          setSelectedWorkstationId(updated[0]?.id || null);
        }

        return updated;
      });

      // Διαγραφή όλων των tasks του σταθμού
      setTasks(prev => prev.filter(t => t.workstationId !== wsToDelete.id));

      setWsToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete workstation', err);
      alert(
        `Αποτυχία διαγραφής σταθμού εργασίας: ${
          err?.message || 'Άγνωστο σφάλμα'
        }`
      );
    }
  };

  // --- Task CRUD Handlers ---

  const handleSaveTask = async (
    data: Omit<PrepTask, 'id' | 'teamId'> | PrepTask
  ) => {
    try {
      const isExisting = 'id' in data;
      const anyApi = api as any;

      const payload: PrepTask = isExisting
        ? {
            ...(data as PrepTask),
            teamId: (data as PrepTask).teamId ?? currentTeamId,
          }
        : {
            ...(data as any),
            id: (data as any).id ?? `pt${Date.now()}`,
            teamId: currentTeamId,
          };

      let savedTask: PrepTask = payload;

      if (typeof anyApi.savePrepTask === 'function') {
        savedTask = await anyApi.savePrepTask(payload);
      }

      setTasks(prev => {
        const exists = prev.some(t => t.id === savedTask.id);
        const updated = exists
          ? prev.map(t => (t.id === savedTask.id ? savedTask : t))
          : [...prev, savedTask];

        return updated;
      });

      setIsTaskFormOpen(false);
      setTaskToEdit(null);
    } catch (err: any) {
      console.error('Failed to save prep task', err);
      alert(
        `Αποτυχία αποθήκευσης εργασίας προετοιμασίας: ${
          err?.message || 'Άγνωστο σφάλμα'
        }`
      );
    }
  };

  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      const anyApi = api as any;

      if (typeof anyApi.deletePrepTask === 'function') {
        await anyApi.deletePrepTask(taskToDelete.id);
      }

      setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
      setTaskToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete prep task', err);
      alert(
        `Αποτυχία διαγραφής εργασίας προετοιμασίας: ${
          err?.message || 'Άγνωστο σφάλμα'
        }`
      );
    }
  };

  const handleTaskStatusChange = (taskId: string, newStatus: PrepTaskStatus) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        <div className="lg:col-span-1 h-full">
          <WorkstationList
            workstations={workstations}
            selectedWorkstationId={selectedWorkstationId}
            onSelectWorkstation={setSelectedWorkstationId}
            onAdd={() => {
              setWsToEdit(null);
              setIsWsFormOpen(true);
            }}
            onEdit={ws => {
              setWsToEdit(ws);
              setIsWsFormOpen(true);
            }}
            onDelete={setWsToDelete}
            canManage={canManageWorkstations}
          />
        </div>

        <div className="lg:col-span-3 h-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl flex flex-col">
          {selectedWorkstation ? (
            <>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200/80 dark:border-gray-700/80 flex-wrap gap-2">
                <h2 className="text-3xl font-extrabold font-heading">
                  {selectedWorkstation.name}
                </h2>
                {canManageTasks && (
                  <button
                    onClick={() => {
                      setTaskToEdit(null);
                      setIsTaskFormOpen(true);
                    }}
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
                  onEdit={task => {
                    setTaskToEdit(task);
                    setIsTaskFormOpen(true);
                  }}
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
        body={
          <p>
            Είστε σίγουροι; Όλες οι εργασίες που ανήκουν σε αυτόν τον σταθμό θα
            διαγραφούν επίσης.
          </p>
        }
      />

      <ConfirmationModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDeleteTask}
        title="Διαγραφή Εργασίας"
        body={
          <p>
            Είστε σίγουροι ότι θέλετε να διαγράψετε την εργασία "
            {taskToDelete?.description}";
          </p>
        }
      />
    </>
  );
};

export default WorkstationView;
