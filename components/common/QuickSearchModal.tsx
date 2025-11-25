import React, { useState } from 'react';
import { Icon } from './Icon';
import { useTranslation } from '../../i18n';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}

const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onSearch
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
      setQuery('');
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-32 z-50 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <Icon name="search" className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('quick_search_placeholder')}
            autoFocus
            className="flex-1 bg-transparent text-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
          />
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
              Enter
            </kbd>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('to_search')}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-3 bg-gray-50 dark:bg-gray-900/50">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2">
            {t('keyboard_shortcuts')}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
                  Ctrl
                </kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
                  K
                </kbd>
              </span>
              <span className="text-gray-500 dark:text-gray-400">{t('open_quick_search')}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
                  Esc
                </kbd>
              </span>
              <span className="text-gray-500 dark:text-gray-400">{t('close_modal')}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
                  Ctrl
                </kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
                  N
                </kbd>
              </span>
              <span className="text-gray-500 dark:text-gray-400">{t('new_recipe')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSearchModal;
