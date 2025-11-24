import React, { useEffect, useState } from 'react';
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
  withApiKeyCheck,
}) => {
  // 🔴 86 status ανά μενού (από localStorage)
  const [menu86Counts, setMenu86Counts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const next: Record<string, number> = {};

    menus.forEach((menu) => {
      const storageKey = `chefstack_service_board_${menu.id}`;
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) return;
        const parsed = JSON.parse(raw) as { eightySixIds?: string[] } | null;
        const count = parsed?.eightySixIds?.length ?? 0;
        if (count > 0) {
          next[menu.id] = count;
        }
      } catch (e) {
        console.error('Failed to read 86 list from localStorage for menu', menu.id, e);
      }
    });

    setMenu86Counts(next);
  }, [menus]);

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl h-full flex flex-col">
      <div className="pb-4 border-b border-gray-200/80 dark:border-gray-700/80">
        <h2 className="text-3xl font-extrabold font-heading mb-4">Μενού</h2>
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

      <div className="flex-1 overflow-y-auto -mr-2 pr-2 pt-4">
        <div className="space-y-2">
          {menus.map((menu) => {
            const isSelected = selectedMenuId === menu.id;
            const eightySixCount = menu86Counts[menu.id] || 0;

            return (
              <div
                key={menu.id}
                onClick={() => onSelectMenu(menu.id)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 group border ${
                  isSelected
                    ? 'bg-brand-yellow/20 dark:bg-brand-yellow/30 border-brand-yellow/50'
                    : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    name={menu.type === 'buffet' ? 'servings' : 'list'}
                    className="w-5 h-5 text-brand-yellow flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-md truncate">{menu.name}</p>
                    <div className="flex items-center gap-2 text-xs text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
                      <span>
                        {menu.type === 'a_la_carte'
                          ? 'À la carte'
                          : `Buffet (${menu.pax} pax)`}
                      </span>

                      {menu.type === 'a_la_carte' && eightySixCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/10 text-red-600 font-semibold">
                          <Icon name="circle-off" className="w-3 h-3" />
                          {eightySixCount}× 86
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {canManage && (
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(menu);
                      }}
                      className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/20"
                      title="Edit"
                    >
                      <Icon name="edit" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(menu);
                      }}
                      className="p-2 rounded-full text-light-text-secondary hover:text-red-500 hover:bg-red-500/10"
                      title="Delete"
                    >
                      <Icon name="trash-2" className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MenuList;
