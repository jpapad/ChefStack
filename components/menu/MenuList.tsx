import React, { useEffect, useState } from 'react';
import { Menu } from '../../types';
import { Icon } from '../common/Icon';
import { MenuListSkeleton } from './MenuListSkeleton';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

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
  isLoading?: boolean;
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
  isLoading = false,
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
        {isLoading ? (
          <MenuListSkeleton count={6} />
        ) : (
          <div className="space-y-3">
            {menus.map((menu) => {
            const isSelected = selectedMenuId === menu.id;
            const eightySixCount = menu86Counts[menu.id] || 0;

            return (
              <Card
                key={menu.id}
                onClick={() => onSelectMenu(menu.id)}
                className={`cursor-pointer transition-all duration-200 group hover:shadow-lg ${
                  isSelected
                    ? 'border-brand-yellow bg-brand-yellow/10 dark:bg-brand-yellow/20'
                    : 'hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-lg bg-brand-yellow/20 dark:bg-brand-yellow/30 flex items-center justify-center">
                        <Icon
                          name={menu.type === 'buffet' ? 'utensils' : 'list'}
                          className="w-5 h-5 text-brand-yellow"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base mb-1 truncate">{menu.name}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {menu.type === 'a_la_carte'
                            ? 'À la carte'
                            : `Buffet (${menu.pax} pax)`}
                        </Badge>

                        {menu.type === 'a_la_carte' && eightySixCount > 0 && (
                          <Badge variant="destructive" className="gap-1">
                            <Icon name="circle-off" className="w-3 h-3" />
                            {eightySixCount}× 86
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(menu);
                        }}
                        title="Edit"
                      >
                        <Icon name="edit" className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(menu);
                        }}
                        className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                        title="Delete"
                      >
                        <Icon name="trash-2" className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuList;
