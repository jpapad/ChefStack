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
    <div className="haccp-log-sheet font-sans text-black bg-white p-4 flex flex-col" style={{ minHeight: '270mm', maxWidth: '210mm', margin: '0 auto' }}>
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }
            body * {
              visibility: hidden;
            }
            .printable-area,
            .printable-area * {
              visibility: visible;
            }
            .printable-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .haccp-log-sheet {
              margin: 0 !important;
              padding: 0 !important;
              max-width: 100% !important;
            }
          }
          .haccp-log-sheet table {
            border-collapse: collapse;
            width: 100%;
          }
          .haccp-log-sheet th,
          .haccp-log-sheet td {
            border: 1px solid #000;
            padding: 4px 6px;
            text-align: center;
          }
          .haccp-log-sheet thead th {
            background-color: #e5e7eb;
            font-weight: bold;
            font-size: 11px;
          }
          .haccp-log-sheet tbody td {
            min-height: 2.5em;
            font-size: 10px;
          }
          .haccp-log-sheet .date-col {
            font-weight: 600;
            background-color: #f9fafb;
          }
        `}
      </style>
      <header className="mb-4">
        <div className={`flex justify-between ${logoPosition === 'top' ? 'flex-col items-center text-center gap-3' : 'flex-row items-start'}`}>
          {logoInHeader && logoPosition === 'left' && <img src={logoUrl} alt="Logo" style={logoStyle} className="max-w-[25%]" />}
          <div className="flex-grow">
            <h1 className="text-xl font-bold uppercase mb-1">Αρχείο Ελέγχου Θερμοκρασίας</h1>
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          {logoInHeader && logoPosition === 'right' && <img src={logoUrl} alt="Logo" style={logoStyle} className="max-w-[25%]" />}
          {logoInHeader && logoPosition === 'top' && <img src={logoUrl} alt="Logo" style={logoStyle} />}
        </div>
      </header>
      
      <div className="flex justify-between items-center mb-3 text-sm font-semibold border border-black px-2 py-1" style={{ backgroundColor: '#f3f4f6' }}>
        <span>Μήνας: {monthName} {year}</span>
        <span>Επιθυμητή Θερμοκρασία: {targetTemp}</span>
      </div>

      <table>
        <thead>
          <tr>
            <th rowSpan={2} style={{ width: '50px' }}>Ημ/νία</th>
            {timeColumns.map((col, index) => {
              const colSpan = Number(visibleColumns.temp) + Number(visibleColumns.sig);
              if (col.trim() === '' || colSpan === 0) return null;
              return <th key={index} colSpan={colSpan}>{col}</th>
            })}
            {visibleColumns.actions && <th rowSpan={2} style={{ width: '35%' }}>Διορθωτικές Ενέργειες</th>}
            {visibleColumns.check && <th rowSpan={2} style={{ width: '70px' }}>Έλεγχος<br/>(Υπογ.)</th>}
          </tr>
          <tr>
            {timeColumns.map((col, index) => {
              if (col.trim() === '') return null;
              return (
                <React.Fragment key={index}>
                  {visibleColumns.temp && <th style={{ width: '50px' }}>Θερμ.</th>}
                  {visibleColumns.sig && <th style={{ width: '50px' }}>Υπογ.</th>}
                </React.Fragment>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
            <tr key={day}>
              <td className="date-col">{day}/{month + 1}</td>
               {timeColumns.map((col, index) => {
                if (col.trim() === '') return null;
                return (
                  <React.Fragment key={index}>
                    {visibleColumns.temp && <td style={{ height: '2em' }}></td>}
                    {visibleColumns.sig && <td style={{ height: '2em' }}></td>}
                  </React.Fragment>
                )
              })}
              {visibleColumns.actions && <td style={{ height: '2em' }}></td>}
              {visibleColumns.check && <td style={{ height: '2em' }}></td>}
            </tr>
          ))}
        </tbody>
      </table>

      <footer className="mt-4 pt-3 text-[9px] text-gray-700 flex justify-between items-end border-t border-gray-300">
        <p className="max-w-[70%]"><strong>Οδηγίες:</strong> 1. Καταγράψτε τη θερμοκρασία στις καθορισμένες ώρες. 2. Εάν η θερμοκρασία είναι εκτός ορίων, προβείτε άμεσα σε διορθωτική ενέργεια και καταγράψτε την. 3. Ο υπεύθυνος βάρδιας ελέγχει και υπογράφει στο τέλος της ημέρας.</p>
        {logoInFooter && (
             <img src={logoUrl} alt="Logo" style={logoStyle} />
        )}
      </footer>
    </div>
  );
};

export default TemperatureLogSheet;
