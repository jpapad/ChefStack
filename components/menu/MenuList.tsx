import React from 'react';
import { Menu } from '../../types';
import { Icon } from '../common/Icon';

interface MenuListProps {
  menus: Menu[];
  selectedMenuId: string | null;
  onSelectMenu: (id: string) => void;
  onAdd: () => void;
  onStartAICreation: () => void;
  onEdit: (menu: Menu) => void;
  onDelete: (menu: Menu) => void;
  canManage: boolean;
  withApiKeyCheck: (action: () => void) => void;
}

const MenuList: React.FC<MenuListProps> = ({
  menus,
  selectedMenuId,
  onSelectMenu,
  onAdd,
  onStartAICreation,
  onEdit,
  onDelete,
  canManage,
  withApiKeyCheck
}) => {
  const totalMenus = menus.length;
  const alaCarteCount = menus.filter(m => m.type === 'a_la_carte').length;
  const buffetCount = menus.filter(m => m.type === 'buffet').length;

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl h-full flex flex-col">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200/80 dark:border-gray-700/80">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="text-3xl font-extrabold font-heading mb-1">Μενού</h2>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
              Σύνολο: <span className="font-semibold">{totalMenus}</span> • A La Carte:{' '}
              <span className="font-semibold">{alaCarteCount}</span> • Buffet:{' '}
              <span className="font-semibold">{buffetCount}</span>
            </p>
          </div>
        </div>

        {canManage && (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={onAdd}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-dark text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
              <Icon name="plus" className="w-5 h-5" />
              <span className="font-semibold text-sm">Νέο Μενού</span>
            </button>
            <button
              onClick={() => withApiKeyCheck(onStartAICreation)}
              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-opacity"
            >
              <Icon name="sparkles" className="w-5 h-5" />
              <span className="font-semibold text-sm">Δημιουργία με AI</span>
            </button>
          </div>
        )}
      </div>

      {/* Λίστα */}
      <div className="flex-1 overflow-y-auto -mr-2 pr-2 pt-4">
        {menus.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-xs text-light-text-secondary dark:text-dark-text-secondary px-4">
            <Icon name="menu" className="w-8 h-8 mb-3 opacity-60" />
            <p className="mb-1">Δεν βρέθηκαν μενού με τα τωρινά φίλτρα.</p>
            {canManage && (
              <p>
                Μπορείς να δημιουργήσεις ένα νέο μενού ή να αφήσεις την AI να
                προτείνει ένα για εσένα.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {menus.map((menu) => {
              const isSelected = selectedMenuId === menu.id;
              const isAlaCarte = menu.type === 'a_la_carte';
              const recipesCount = Array.isArray((menu as any).recipeIds)
                ? (menu as any).recipeIds.length
                : undefined;
              const daysCount = Array.isArray((menu as any).dailyPlans)
                ? (menu as any).dailyPlans.length
                : undefined;

              return (
                <div
                  key={menu.id}
                  onClick={() => onSelectMenu(menu.id)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 group border ${
                    isSelected
                      ? 'bg-brand-yellow/20 dark:bg-brand-yellow/30 border-brand-yellow/50 shadow-sm'
                      : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-yellow/20 text-brand-yellow flex-shrink-0">
                      <Icon
                        name={isAlaCarte ? 'list' : 'servings'}
                        className="w-4 h-4"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{menu.name}</p>
                      <p className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary truncate">
                        {isAlaCarte
                          ? 'À la carte'
                          : `Buffet (${menu.pax ?? '-'} pax)`}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px]">
                        {isAlaCarte && typeof recipesCount === 'number' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10">
                            <Icon name="chef-hat" className="w-3 h-3" />
                            {recipesCount} πιάτα
                          </span>
                        )}
                        {!isAlaCarte && typeof daysCount === 'number' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/5 dark:bg:white/10">
                            <Icon name="calendar" className="w-3 h-3" />
                            {daysCount} ημέρες πλάνου
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(menu);
                        }}
                        className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/20"
                        title="Επεξεργασία"
                      >
                        <Icon name="edit" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(menu);
                        }}
                        className="p-2 rounded-full text-light-text-secondary hover:text-red-500 hover:bg-red-500/10"
                        title="Διαγραφή"
                      >
                        <Icon name="trash-2" className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuList;
