import React from 'react';
import { PrepTask, PrepTaskStatus } from '../../types';

interface TaskStatusChartProps {
  tasks: PrepTask[];
}

const TaskStatusChart: React.FC<TaskStatusChartProps> = ({ tasks }) => {
  const statusCounts = {
    [PrepTaskStatus.ToDo]: tasks.filter(t => t.status === PrepTaskStatus.ToDo).length,
    [PrepTaskStatus.InProgress]: tasks.filter(t => t.status === PrepTaskStatus.InProgress).length,
    [PrepTaskStatus.Done]: tasks.filter(t => t.status === PrepTaskStatus.Done).length,
  };

  const data = [
    { label: 'To Do', value: statusCounts[PrepTaskStatus.ToDo], color: 'fill-gray-400 dark:fill-gray-500' },
    { label: 'In Progress', value: statusCounts[PrepTaskStatus.InProgress], color: 'fill-blue-500 dark:fill-blue-400' },
    { label: 'Done', value: statusCounts[PrepTaskStatus.Done], color: 'fill-green-500 dark:fill-green-400' },
  ];

  const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl h-full flex flex-col">
      <h3 className="text-lg font-bold font-heading mb-4">Κατάσταση Εργασιών</h3>
      <div className="flex-grow flex items-end space-x-4 pt-4">
        {data.map(item => (
          <div key={item.label} className="flex-1 flex flex-col items-center">
            <div className="font-bold text-xl">{item.value}</div>
            <div className="w-full h-48 bg-black/5 dark:bg-white/5 rounded-t-lg flex items-end mt-2">
              <div
                className={`${item.color} w-full rounded-t-lg transition-all duration-700 ease-out`}
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary mt-2">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskStatusChart;