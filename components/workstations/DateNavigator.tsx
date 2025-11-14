import React from 'react';
import { Icon } from '../common/Icon';

interface DateNavigatorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({ selectedDate, onDateChange }) => {
  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    onDateChange(newDate);
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
        // Input type="date" returns YYYY-MM-DD, which JS interprets as UTC midnight.
        // To avoid timezone issues, create the date from parts.
        const [year, month, day] = dateValue.split('-').map(Number);
        const newDate = new Date(year, month - 1, day);
        onDateChange(newDate);
    }
  };

  const formattedDate = selectedDate.toLocaleDateString('el-GR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex items-center justify-center gap-4 p-2 bg-black/5 dark:bg-white/10 rounded-full">
      <button onClick={() => changeDate(-1)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/20">
        <Icon name="arrow-left" className="w-5 h-5" />
      </button>
      <div className="relative text-center">
        <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={handleDateInputChange}
            // Style the input to be transparent and overlay the text
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <span className="font-semibold text-lg">{formattedDate}</span>
      </div>
      <button onClick={() => changeDate(1)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/20">
        <Icon name="arrow-left" className="w-5 h-5 rotate-180" />
      </button>
    </div>
  );
};

export default DateNavigator;
