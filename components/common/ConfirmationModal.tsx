// components/common/ConfirmationModal.tsx
import React from 'react';
import { Icon } from './Icon';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, body }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl w-full max-w-md m-4 p-6"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                    <Icon name="warning" className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary" id="modal-title">
                    {title}
                </h3>
            </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <Icon name="x" className="w-6 h-6" />
          </button>
        </div>
        <div className="mt-4 text-light-text-secondary dark:text-dark-text-secondary">
          {body}
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 font-semibold"
            onClick={onClose}
          >
            Άκυρο
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold"
            onClick={onConfirm}
          >
            Διαγραφή
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
