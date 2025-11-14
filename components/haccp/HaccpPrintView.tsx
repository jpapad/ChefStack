import React, { useState } from 'react';
import { LogoPosition } from '../../types';
import { Icon } from '../common/Icon';
import PrintPreview from '../common/PrintPreview';
import TemperatureLogSheet from './TemperatureLogSheet';

interface HaccpPrintViewProps {
  onBack: () => void;
}

const HaccpPrintView: React.FC<HaccpPrintViewProps> = ({ onBack }) => {
  const [printPreviewContent, setPrintPreviewContent] = useState<React.ReactNode | null>(null);

  // Form State
  const [title, setTitle] = useState('Ψυγείο Συντήρησης #1');
  const [targetTemp, setTargetTemp] = useState('0°C - 5°C');
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [timeColumns, setTimeColumns] = useState(['08:00', '14:00', '20:00']);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPosition, setLogoPosition] = useState<LogoPosition>('right');
  const [logoSize, setLogoSize] = useState(80);
  const [visibleColumns, setVisibleColumns] = useState({
      temp: true, sig: true, actions: true, check: true
  });

  const handlePrint = () => {
    setPrintPreviewContent(
      <TemperatureLogSheet
        title={title}
        month={month}
        year={year}
        targetTemp={targetTemp}
        timeColumns={timeColumns}
        logoUrl={logoUrl}
        logoPosition={logoPosition}
        logoSize={logoSize}
        visibleColumns={visibleColumns}
      />
    );
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center mb-4 text-brand-yellow hover:underline">
            <Icon name="arrow-left" className="w-5 h-5 mr-2" />
            Πίσω στα Αρχεία HACCP
        </button>

        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl">
           <h2 className="text-2xl font-bold font-heading mb-6">Εκτύπωση Αρχείου Θερμοκρασιών</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="md:col-span-2 space-y-4">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Τίτλος (π.χ. Ψυγείο #1)" className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg" />
                    <input type="text" value={targetTemp} onChange={e => setTargetTemp(e.target.value)} placeholder="Επιθυμητή Θερμοκρασία" className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg" />
                    <div className="grid grid-cols-2 gap-4">
                        <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg">
                            {Array.from({length: 12}, (_, i) => <option key={i} value={i}>{new Date(0, i).toLocaleString('el-GR', {month: 'long'})}</option>)}
                        </select>
                        <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value))} placeholder="Έτος" className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg" />
                    </div>
                </div>

                {/* Columns */}
                <div>
                    <h3 className="font-semibold mb-2">Στήλες Ελέγχου</h3>
                    <div className="space-y-2">
                        {timeColumns.map((time, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input type="text" value={time} onChange={e => {
                                    const newTimes = [...timeColumns];
                                    newTimes[index] = e.target.value;
                                    setTimeColumns(newTimes);
                                }} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg" placeholder={`Ώρα ${index + 1}`} />
                                <button onClick={() => setTimeColumns(timeColumns.filter((_, i) => i !== index))} className="p-2 text-red-500"><Icon name="trash-2" className="w-5 h-5"/></button>
                            </div>
                        ))}
                         <button onClick={() => setTimeColumns([...timeColumns, ''])} className="text-sm font-semibold text-brand-secondary">+ Προσθήκη Ώρας</button>
                    </div>
                </div>

                {/* Logo */}
                <div>
                     <h3 className="font-semibold mb-2">Λογότυπο</h3>
                     <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-yellow/20 file:text-brand-yellow hover:file:bg-brand-yellow/30"/>
                     {logoUrl && (
                        <div className="mt-2 space-y-2">
                             <select value={logoPosition} onChange={e => setLogoPosition(e.target.value as LogoPosition)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg">
                                <option value="right">Δεξιά (Header)</option>
                                <option value="left">Αριστερά (Header)</option>
                                <option value="top">Κέντρο (Header)</option>
                                <option value="bottom">Κάτω (Footer)</option>
                             </select>
                             <div className="flex items-center gap-2">
                                <label className="text-sm">Μέγεθος:</label>
                                <input type="range" min="30" max="150" value={logoSize} onChange={e => setLogoSize(parseInt(e.target.value))} className="w-full"/>
                             </div>
                        </div>
                    )}
                </div>
            </div>
             <button onClick={handlePrint} className="w-full mt-8 flex items-center justify-center gap-2 bg-brand-dark text-white px-4 py-3 rounded-full hover:opacity-90">
                <Icon name="printer" className="w-5 h-5"/>
                <span className="font-semibold">Προεπισκόπηση & Εκτύπωση</span>
            </button>
        </div>
      </div>
      {printPreviewContent && (
        <PrintPreview onClose={() => setPrintPreviewContent(null)}>
          {printPreviewContent}
        </PrintPreview>
      )}
    </>
  );
};

export default HaccpPrintView;
