import React from 'react';
// Fix: Added PrepTaskStatus to imports for correct enum comparison.
import { Recipe, PrepTask, HaccpLog, InventoryItem, View, PrepTaskStatus } from '../../types';
import { Icon } from '../common/Icon';
import TaskStatusChart from './TaskStatusChart';
import InventoryStatusChart from './InventoryStatusChart';

interface DashboardViewProps {
  recipes: Recipe[];
  tasks: PrepTask[];
  haccpLogs: HaccpLog[];
  inventory: InventoryItem[];
  onViewChange: (view: View) => void;
}

const StatCard: React.FC<{ title: string, value: string | number, icon: any, color: string, onClick?: () => void }> = ({ title, value, icon, color, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl flex items-center gap-6 ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
  >
    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${color}`}>
      <Icon name={icon} className="w-7 h-7 text-white" />
    </div>
    <div>
      <p className="text-3xl font-extrabold font-heading text-brand-yellow">{value}</p>
      <p className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">{title}</p>
    </div>
  </div>
);

const DashboardView: React.FC<DashboardViewProps> = ({ recipes, tasks, haccpLogs, inventory, onViewChange }) => {
  const latestHaccpLog = [...haccpLogs].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  // Fix: Correctly calculate total quantity from all locations before comparing to reorderPoint.
  const lowStockItems = inventory.filter(i => i.locations.reduce((sum, loc) => sum + loc.quantity, 0) <= i.reorderPoint).length;

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Recipes" value={recipes.length} icon="book-open" color="bg-blue-500" onClick={() => onViewChange('recipes')}/>
        {/* Fix: Changed string 'Done' to enum PrepTaskStatus.Done for type-safe comparison. */}
        <StatCard title="Pending Tasks" value={tasks.filter(t => t.status !== PrepTaskStatus.Done).length} icon="clipboard-list" color="bg-yellow-500" onClick={() => onViewChange('workstations')}/>
        <StatCard title="Low Stock Items" value={lowStockItems} icon="package" color="bg-red-500" onClick={() => onViewChange('inventory')}/>
        <StatCard title="Latest HACCP Log" value={latestHaccpLog ? new Date(latestHaccpLog.timestamp).toLocaleTimeString('el-GR', {hour: '2-digit', minute:'2-digit'}) : '-'} icon="thermometer" color="bg-green-500" onClick={() => onViewChange('haccp')}/>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ minHeight: '400px' }}>
        <TaskStatusChart tasks={tasks} />
        <InventoryStatusChart inventory={inventory} />
      </div>

      {/* Quick Links / Recent Activity could go here */}
    </div>
  );
};

export default DashboardView;
