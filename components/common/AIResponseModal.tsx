import React from 'react';
import { Icon } from './Icon';

interface AIResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  isLoading: boolean;
  showConfirmButton?: boolean;
  onConfirm?: (content: string) => void;
}

const AIResponseModal: React.FC<AIResponseModalProps> = ({ isOpen, onClose, title, content, isLoading, showConfirmButton, onConfirm }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(content);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl w-full max-w-2xl m-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200/80 dark:border-gray-700/80">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Icon name="sparkles" className="w-6 h-6 text-purple-500"/>
            {title}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10">
            <Icon name="x" className="w-6 h-6" />
          </button>
        </header>
        
        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <Icon name="loader-2" className="w-12 h-12 text-brand-yellow animate-spin"/>
              <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary">Το AI επεξεργάζεται το αίτημά σας...</p>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-light-text-primary dark:text-dark-text-primary text-base leading-relaxed">
                {content}
            </pre>
          )}
        </div>
        
        <footer className="p-4 border-t border-gray-200/80 dark:border-gray-700/80 flex justify-end gap-4">
             {showConfirmButton && !isLoading && (
                 <button
                    type="button"
                    className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-colors flex items-center gap-2"
                    onClick={handleConfirm}
                  >
                    <Icon name="check" className="w-5 h-5"/>
                    Εφαρμογή Αλλαγών
                  </button>
             )}
             <button
                type="button"
                className="px-5 py-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 font-semibold transition-colors"
                onClick={onClose}
              >
                Κλείσιμο
              </button>
        </footer>
      </div>
    </div>
  );
};

export default AIResponseModal;