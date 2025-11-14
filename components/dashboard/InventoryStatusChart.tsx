import React from 'react';
import { InventoryItem } from '../../types';

interface InventoryStatusChartProps {
  inventory: InventoryItem[];
}

const InventoryStatusChart: React.FC<InventoryStatusChartProps> = ({ inventory }) => {
  const needsReorder = inventory.filter(i => {
    const totalQuantity = i.locations.reduce((sum, loc) => sum + loc.quantity, 0);
    return totalQuantity <= i.reorderPoint;
  }).length;
  const okItems = inventory.length - needsReorder;
  const totalItems = inventory.length;

  const percentageOk = totalItems > 0 ? (okItems / totalItems) * 100 : 100;
  
  const circumference = 2 * Math.PI * 45; // r=45
  const strokeDashoffset = circumference - (percentageOk / 100) * circumference;

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl h-full flex flex-col justify-between">
      <h3 className="text-lg font-bold font-heading">Κατάσταση Αποθέματος</h3>
      <div className="relative flex items-center justify-center my-4">
        <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            className="text-red-500/30 dark:text-red-400/30"
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
          />
          <circle
            className="text-green-500 dark:text-green-400"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              transition: 'stroke-dashoffset 0.7s ease-out',
            }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold font-heading">{totalItems}</span>
          <span className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">Είδη</span>
        </div>
      </div>
      <div className="flex justify-around text-center">
        <div>
          <p className="flex items-center font-bold text-xl">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            {okItems}
          </p>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">OK</p>
        </div>
        <div>
          <p className="flex items-center font-bold text-xl">
            <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
            {needsReorder}
          </p>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Για Παραγγελία</p>
        </div>
      </div>
    </div>
  );
};

export default InventoryStatusChart;