import React from 'react';
import { Icon } from './Icon';
import { useTranslation } from '../../i18n';

interface ApiKeyPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ApiKeyPromptModal: React.FC<ApiKeyPromptModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleConfirm = async () => {
    onConfirm();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl w-full max-w-lg m-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand-yellow/20 sm:mx-0 sm:h-10 sm:w-10">
              <Icon name="sparkles" className="h-6 w-6 text-brand-yellow" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary" id="modal-title">
              Απαιτείται Κλειδί API
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <Icon name="x" className="w-6 h-6" />
          </button>
        </div>
        <div className="mt-4 text-light-text-secondary dark:text-dark-text-secondary space-y-3">
            <p>
                Για να χρησιμοποιήσετε τις λειτουργίες τεχνητής νοημοσύνης (AI), πρέπει πρώτα να επιλέξετε ένα κλειδί API του Google Gemini.
            </p>
            <p>
                Η χρήση του API υπόκειται στο δωρεάν όριο της Google και σε πιθανές χρεώσεις "pay-as-you-go" για εκτεταμένη χρήση.
            </p>
            <p>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-brand-yellow hover:underline font-semibold">
                    Μάθετε περισσότερα για τη χρέωση
                </a>
            </p>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 font-semibold"
            onClick={onClose}
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-brand-dark text-white hover:opacity-90 font-semibold flex items-center gap-2"
            onClick={handleConfirm}
          >
             <Icon name="key" className="w-5 h-5"/>
            Επιλογή Κλειδιού API
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyPromptModal;
