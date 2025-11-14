import React from 'react';
import { User, Shift, SHIFT_TYPE_DETAILS, SHIFT_TYPE_KEYS, ShiftSchedule } from '../../types';

interface PrintableScheduleProps {
  schedule: ShiftSchedule;
  allUsers: User[];
  shiftsMap: Map<string, Shift>;
}

const formatDate = (date: Date, options: Intl.DateTimeFormatOptions): string => {
  return new Intl.DateTimeFormat('el-GR', options).format(date);
};

const getDatesInRange = (startDate: string, endDate: string): Date[] => {
    const dates = [];
    let currentDate = new Date(startDate);
    // Adjust for timezone when creating from string
    currentDate.setMinutes(currentDate.getMinutes() + currentDate.getTimezoneOffset());
    const finalDate = new Date(endDate);
    finalDate.setMinutes(finalDate.getMinutes() + finalDate.getTimezoneOffset());

    while(currentDate <= finalDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
}

const PrintableSchedule: React.FC<PrintableScheduleProps> = ({ schedule, allUsers, shiftsMap }) => {
  const teamMembers = allUsers.filter(u => schedule.userIds.includes(u.id));
  const scheduleDates = getDatesInRange(schedule.startDate, schedule.endDate);
  
  const startDate = new Date(schedule.startDate);
  startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
  const endDate = new Date(schedule.endDate);
  endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());
  
  return (
    <div className="font-sans text-black p-4 bg-white">
      <header className="text-center border-b-2 border-black pb-4 mb-4">
        <h1 className="text-3xl font-extrabold">Πρόγραμμα Βαρδιών</h1>
        <h2 className="text-xl font-semibold">{schedule.name}</h2>
        <h3 className="text-lg">
          {formatDate(startDate, { day: 'numeric', month: 'long' })} - {formatDate(endDate, { day: 'numeric', month: 'long', year: 'numeric' })}
        </h3>
        <p className="text-sm mt-2">Ημερομηνία Εκτύπωσης: {formatDate(new Date(), { dateStyle: 'short' })}</p>
      </header>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-2 border-black bg-gray-200">
            <th className="p-2 border-r-2 border-black">Μέλος</th>
            {scheduleDates.map(date => (
              <th key={date.toISOString()} className="p-2 text-center border-r border-black">
                <div>{formatDate(date, { weekday: 'short' })}</div>
                <div className="font-normal">{formatDate(date, { day: 'numeric' })}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {teamMembers.map(user => (
            <tr key={user.id} className="border-b border-black">
              <td className="p-2 font-semibold border-x-2 border-black">{user.name}</td>
              {scheduleDates.map(date => {
                const dateString = date.toISOString().split('T')[0];
                const shift = shiftsMap.get(`${user.id}-${dateString}`);
                return (
                  <td key={dateString} className="p-2 text-center border-r border-black font-semibold">
                    {shift ? SHIFT_TYPE_DETAILS[shift.type].el : '-'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      <footer className="mt-6 text-xs text-gray-700">
        <strong>Υπόμνημα:</strong>
        {SHIFT_TYPE_KEYS.map(key => (
            <span key={key} className="ml-4">
                <strong>{SHIFT_TYPE_DETAILS[key].short_el}:</strong> {SHIFT_TYPE_DETAILS[key].el}
            </span>
        ))}
      </footer>
    </div>
  );
};

export default PrintableSchedule;