import React, { useState, useMemo } from 'react';
import { TeamTask, TaskPriority, TaskStatus, User } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

interface TeamTasksProps {
  tasks: TeamTask[];
  users: User[];
  currentUserId: string;
  currentTeamId: string;
  onAddTask: (task: Omit<TeamTask, 'id' | 'createdAt'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<TeamTask>) => void;
  onDeleteTask: (taskId: string) => void;
}

const TeamTasks: React.FC<TeamTasksProps> = ({
  tasks,
  users,
  currentUserId,
  currentTeamId,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}) => {
  const { t, language } = useTranslation();
  const [isCreating, setIsCreating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [newTask, setNewTask] = useState<Omit<TeamTask, 'id' | 'createdAt'>>({
    teamId: currentTeamId,
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    assignedTo: [],
    createdBy: currentUserId,
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
      return true;
    });
  }, [tasks, filterStatus, filterPriority]);

  const groupedTasks = useMemo(() => {
    const pending = filteredTasks.filter(t => t.status === 'pending');
    const inProgress = filteredTasks.filter(t => t.status === 'in-progress');
    const completed = filteredTasks.filter(t => t.status === 'completed');
    return { pending, inProgress, completed };
  }, [filteredTasks]);

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;
    onAddTask(newTask);
    setNewTask({
      teamId: currentTeamId,
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      assignedTo: [],
      createdBy: currentUserId,
    });
    setIsCreating(false);
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
      case 'low': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700';
    }
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'alert-circle';
      case 'high': return 'arrow-up';
      case 'medium': return 'minus';
      case 'low': return 'arrow-down';
    }
  };

  const TaskCard: React.FC<{ task: TeamTask }> = ({ task }) => {
    const assignedUsers = users.filter(u => task.assignedTo.includes(u.id));
    const creatorUser = users.find(u => u.id === task.createdBy);
    const isAssignedToMe = task.assignedTo.includes(currentUserId);

    return (
      <div className={`bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md border-l-4 ${
        task.status === 'completed' ? 'opacity-60' : ''
      } ${isAssignedToMe ? 'border-brand-yellow' : 'border-gray-300 dark:border-slate-600'}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`font-bold text-light-text dark:text-dark-text ${
                task.status === 'completed' ? 'line-through' : ''
              }`}>
                {task.title}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
                <Icon name={getPriorityIcon(task.priority)} className="w-3 h-3 inline mr-1" />
                {task.priority.toUpperCase()}
              </span>
            </div>
            {task.description && (
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">
                {task.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {task.status !== 'completed' && (
              <button
                onClick={() => onUpdateTask(task.id, { 
                  status: task.status === 'pending' ? 'in-progress' : 'completed',
                  ...(task.status === 'in-progress' ? { completedAt: new Date().toISOString(), completedBy: currentUserId } : {})
                })}
                className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400"
                title={task.status === 'pending' ? 'Start Task' : 'Complete Task'}
              >
                <Icon name="check" className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {
                if (confirm(language === 'el' ? 'Διαγραφή εργασίας;' : 'Delete task?')) {
                  onDeleteTask(task.id);
                }
              }}
              className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
            >
              <Icon name="trash-2" className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-light-text-secondary dark:text-dark-text-secondary">
          <div className="flex items-center gap-3">
            {assignedUsers.length > 0 && (
              <div className="flex items-center gap-1">
                <Icon name="user" className="w-3 h-3" />
                <span>{assignedUsers.map(u => u.name).join(', ')}</span>
              </div>
            )}
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Icon name="calendar" className="w-3 h-3" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Icon name="user-check" className="w-3 h-3" />
            <span>{creatorUser?.name || 'Unknown'}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
            className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-sm"
          >
            <option value="all">{language === 'el' ? 'Όλες οι καταστάσεις' : 'All Statuses'}</option>
            <option value="pending">{language === 'el' ? 'Εκκρεμείς' : 'Pending'}</option>
            <option value="in-progress">{language === 'el' ? 'Σε εξέλιξη' : 'In Progress'}</option>
            <option value="completed">{language === 'el' ? 'Ολοκληρωμένες' : 'Completed'}</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as TaskPriority | 'all')}
            className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-sm"
          >
            <option value="all">{language === 'el' ? 'Όλες οι προτεραιότητες' : 'All Priorities'}</option>
            <option value="urgent">{language === 'el' ? 'Επείγον' : 'Urgent'}</option>
            <option value="high">{language === 'el' ? 'Υψηλή' : 'High'}</option>
            <option value="medium">{language === 'el' ? 'Μεσαία' : 'Medium'}</option>
            <option value="low">{language === 'el' ? 'Χαμηλή' : 'Low'}</option>
          </select>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-slate-900 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
        >
          <Icon name="plus" className="w-5 h-5" />
          {language === 'el' ? 'Νέα Εργασία' : 'New Task'}
        </button>
      </div>

      {/* Create Task Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-light-text dark:text-dark-text">
              {language === 'el' ? 'Νέα Εργασία' : 'New Task'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">{language === 'el' ? 'Τίτλος' : 'Title'}</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600"
                  placeholder={language === 'el' ? 'Τίτλος εργασίας...' : 'Task title...'}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">{language === 'el' ? 'Περιγραφή' : 'Description'}</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600"
                  rows={3}
                  placeholder={language === 'el' ? 'Περιγραφή εργασίας...' : 'Task description...'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">{language === 'el' ? 'Προτεραιότητα' : 'Priority'}</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600"
                  >
                    <option value="low">{language === 'el' ? 'Χαμηλή' : 'Low'}</option>
                    <option value="medium">{language === 'el' ? 'Μεσαία' : 'Medium'}</option>
                    <option value="high">{language === 'el' ? 'Υψηλή' : 'High'}</option>
                    <option value="urgent">{language === 'el' ? 'Επείγον' : 'Urgent'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">{language === 'el' ? 'Ανάθεση σε' : 'Assign to'}</label>
                  <select
                    multiple
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ 
                      ...newTask, 
                      assignedTo: Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value)
                    })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600"
                  >
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">{language === 'el' ? 'Προθεσμία' : 'Due Date'}</label>
                <input
                  type="date"
                  value={newTask.dueDate ? newTask.dueDate.split('T')[0] : ''}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateTask}
                disabled={!newTask.title.trim()}
                className="flex-1 px-4 py-2 bg-brand-yellow text-slate-900 rounded-lg hover:bg-yellow-500 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {language === 'el' ? 'Δημιουργία' : 'Create'}
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                {language === 'el' ? 'Ακύρωση' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Board */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Icon name="clock" className="w-5 h-5 text-yellow-600" />
              <h3 className="font-bold text-lg">
                {language === 'el' ? 'Εκκρεμείς' : 'Pending'} ({groupedTasks.pending.length})
              </h3>
            </div>
            <div className="space-y-3">
              {groupedTasks.pending.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
          </div>

          {/* In Progress */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Icon name="loader-2" className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-lg">
                {language === 'el' ? 'Σε Εξέλιξη' : 'In Progress'} ({groupedTasks.inProgress.length})
              </h3>
            </div>
            <div className="space-y-3">
              {groupedTasks.inProgress.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
          </div>

          {/* Completed */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Icon name="check-circle" className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-lg">
                {language === 'el' ? 'Ολοκληρωμένες' : 'Completed'} ({groupedTasks.completed.length})
              </h3>
            </div>
            <div className="space-y-3">
              {groupedTasks.completed.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamTasks;
