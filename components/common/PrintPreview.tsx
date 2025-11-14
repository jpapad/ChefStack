import React from 'react';
import { Icon } from './Icon';

interface PrintPreviewProps {
  children: React.ReactNode;
  onClose: () => void;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ children, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="fixed inset-0 bg-light-bg dark:bg-dark-bg z-50 flex flex-col print:hidden">
        {/* Toolbar */}
        <header className="flex-shrink-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border-b border-white/20 dark:border-slate-800/40 p-3 flex justify-between items-center">
          <h2 className="text-xl font-bold">Προεπισκόπηση Εκτύπωσης</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-brand-dark text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
              <Icon name="printer" className="w-5 h-5" />
              <span className="font-semibold text-sm">Εκτύπωση</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <Icon name="x" className="w-5 h-5" />
              <span className="font-semibold text-sm">Κλείσιμο</span>
            </button>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-200 dark:bg-gray-800">
          <div className="max-w-4xl mx-auto bg-white shadow-lg">
            {children}
          </div>
        </main>
      </div>

      {/* Printable content, hidden from screen view but used by print command */}
      <div className="hidden print:block printable-area">
        {children}
      </div>
    </>
  );
};

export default PrintPreview;