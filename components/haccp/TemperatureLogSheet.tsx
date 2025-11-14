import React from 'react';
import { LogoPosition } from '../../types';

interface TemperatureLogSheetProps {
  title: string;
  month: number; // 0-11
  year: number;
  targetTemp: string;
  timeColumns: string[];
  logoUrl: string | null;
  logoPosition: LogoPosition;
  logoSize: number;
  visibleColumns: {
    temp: boolean;
    sig: boolean;
    actions: boolean;
    check: boolean;
  };
}

const TemperatureLogSheet: React.FC<TemperatureLogSheetProps> = ({ title, month, year, targetTemp, timeColumns, logoUrl, logoPosition, logoSize, visibleColumns }) => {
  const monthName = new Date(year, month).toLocaleString('el-GR', { month: 'long' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const logoInHeader = logoUrl && (logoPosition === 'top' || logoPosition === 'left' || logoPosition === 'right');
  const logoInFooter = logoUrl && logoPosition === 'bottom';
  
  const logoStyle: React.CSSProperties = {
    maxHeight: `${logoSize}px`,
    maxWidth: '100%',
  };

  return (
    <div className="haccp-log-sheet font-sans text-black bg-white p-4 flex flex-col" style={{ minHeight: '270mm' }}>
      <header className="mb-6">
        <div className={`flex justify-between ${logoPosition === 'top' ? 'flex-col items-center text-center gap-4' : 'flex-row items-start'}`}>
          {logoInHeader && logoPosition === 'left' && <img src={logoUrl} alt="Logo" style={logoStyle} className="max-w-[25%]" />}
          <div className="flex-grow">
            <h1 className="text-2xl font-bold uppercase">Αρχείο Ελέγχου Θερμοκρασίας</h1>
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
          {logoInHeader && logoPosition === 'right' && <img src={logoUrl} alt="Logo" style={logoStyle} className="max-w-[25%]" />}
          {logoInHeader && logoPosition === 'top' && <img src={logoUrl} alt="Logo" style={logoStyle} />}
        </div>
      </header>
      
      <div className="flex justify-between items-center mb-4 text-lg font-semibold border-b-2 border-t-2 border-black py-2">
        <span>Μήνας: {monthName} {year}</span>
        <span>Επιθυμητή Θερμοκρασία: {targetTemp}</span>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th rowSpan={2} className="w-16 align-middle">Ημ/νία</th>
            {timeColumns.map((col, index) => {
              const colSpan = Number(visibleColumns.temp) + Number(visibleColumns.sig);
              if (col.trim() === '' || colSpan === 0) return null;
              return <th key={index} colSpan={colSpan}>{col}</th>
            })}
            {visibleColumns.actions && <th rowSpan={2} className="w-1/3 align-middle">Διορθωτικές Ενέργειες</th>}
            {visibleColumns.check && <th rowSpan={2} className="w-24 align-middle">Έλεγχos (Υπογ.)</th>}
          </tr>
          <tr className="bg-gray-200">
            {timeColumns.map((col, index) => {
              if (col.trim() === '') return null;
              return (
                <React.Fragment key={index}>
                  {visibleColumns.temp && <th>Θερμ.</th>}
                  {visibleColumns.sig && <th>Υπογ.</th>}
                </React.Fragment>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
            <tr key={day}>
              <td className="text-center font-bold">{day}/{month + 1}</td>
               {timeColumns.map((col, index) => {
                if (col.trim() === '') return null;
                return (
                  <React.Fragment key={index}>
                    {visibleColumns.temp && <td style={{ height: '2.5em' }}></td>}
                    {visibleColumns.sig && <td style={{ height: '2.5em' }}></td>}
                  </React.Fragment>
                )
              })}
              {visibleColumns.actions && <td style={{ height: '2.5em' }}></td>}
              {visibleColumns.check && <td style={{ height: '2.5em' }}></td>}
            </tr>
          ))}
        </tbody>
      </table>

      <footer className="mt-auto pt-8 text-xs text-gray-600 flex justify-between items-end">
        <p className="max-w-prose"><strong>Οδηγίες:</strong> 1. Καταγράψτε τη θερμοκρασία στις καθορισμένες ώρες. 2. Εάν η θερμοκρασία είναι εκτός ορίων, προβείτε άμεσα σε διορθωτική ενέργεια και καταγράψτε την. 3. Ο υπεύθυνος βάρδιας ελέγχει και υπογράφει στο τέλος της ημέρας.</p>
        {logoInFooter && (
             <img src={logoUrl} alt="Logo" style={logoStyle} />
        )}
      </footer>
    </div>
  );
};

export default TemperatureLogSheet;
