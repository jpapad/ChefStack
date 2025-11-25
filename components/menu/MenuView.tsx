import React, { useState, useMemo } from 'react';
import {
  Menu,
  Recipe,
  PrepTask,
  Workstation,
  Role,
  Team,
  RolePermissions,
  InventoryItem,
  WasteLog,
  IngredientCost,
} from '../../types';
import { api } from '../../services/api';
import MenuList from './MenuList';
import MenuDetail from './MenuDetail';
import MenuForm from './MenuForm';
import AIMenuGenerator from './AIMenuGenerator';
import ConfirmationModal from '../common/ConfirmationModal';
import SmartMenuCoach from './SmartMenuCoach';
import MenuCostAnalysis from './MenuCostAnalysis';
import AutoShoppingList from './AutoShoppingList';

interface MenuViewProps {
  menus: Menu[];
  setMenus: React.Dispatch<React.SetStateAction<Menu[]>>;
  allRecipes: Recipe[];
  setAllRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  tasks: PrepTask[];
  workstations: Workstation[];
  currentUserRole?: Role;
  allTeams: Team[];
  currentTeamId: string;
  rolePermissions: RolePermissions;
  withApiKeyCheck: (action: () => void | Promise<void>) => void;
  inventory: InventoryItem[];
  wasteLogs: WasteLog[];
  ingredientCosts: IngredientCost[];
}

const MenuView: React.FC<MenuViewProps> = ({
  inventory,
  wasteLogs,
  ingredientCosts,
  menus,
  setMenus,
  allRecipes,
  setAllRecipes,
  tasks,
  workstations,
  currentUserRole,
  rolePermissions,
  currentTeamId,
  withApiKeyCheck,
}) => {
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(
    menus[0]?.id || null
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAiFormOpen, setIsAiFormOpen] = useState(false);
  const [menuToEdit, setMenuToEdit] = useState<Menu | null>(null);
  const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null);
  const [isCostAnalysisOpen, setIsCostAnalysisOpen] = useState(false);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);

  // 🔍 Search & Filter state
  const [menuSearch, setMenuSearch] = useState('');
  const [menuTypeFilter, setMenuTypeFilter] = useState<'all' | Menu['type']>(
    'all'
  );

  const canManage = currentUserRole
    ? rolePermissions[currentUserRole]?.includes('manage_recipes')
    : false;

  const selectedMenu = useMemo(
    () => menus.find((m) => m.id === selectedMenuId),
    [menus, selectedMenuId]
  );

  // 🔎 Εφαρμογή search + filter στα menus
  const filteredMenus = useMemo(() => {
    const q = menuSearch.trim().toLowerCase();
    return menus.filter((m) => {
      if (menuTypeFilter !== 'all' && m.type !== menuTypeFilter) {
        return false;
      }
      if (!q) return true;
      const name = m.name?.toLowerCase() || '';
      const desc = m.description?.toLowerCase() || '';
      return name.includes(q) || desc.includes(q);
    });
  }, [menus, menuSearch, menuTypeFilter]);

  const handleOpenForm = (menu: Menu | null = null) => {
    setMenuToEdit(menu);
    setIsFormOpen(true);
  };

  const handleSaveMenu = async (data: Partial<Omit<Menu, 'id'>>) => {
    const isNew = !menuToEdit;

    const menuData = isNew
      ? { ...data, teamId: currentTeamId }
      : { ...menuToEdit, ...data };

    if (isNew && menuData.type === 'a_la_carte' && !('recipeIds' in menuData)) {
      (menuData as any).recipeIds = [];
    }
    if (isNew && menuData.type === 'buffet' && !('dailyPlans' in menuData)) {
      (menuData as any).dailyPlans = [];
      (menuData as any).pax = (menuData as any).pax || 50;
    }

    const savedMenu = await api.saveMenu(menuData as Menu | Omit<Menu, 'id'>);

    setMenus((prev) => {
      const exists = prev.some((m) => m.id === savedMenu.id);
      return exists
        ? prev.map((m) => (m.id === savedMenu.id ? savedMenu : m))
        : [...prev, savedMenu];
    });

    if (isNew) {
      setSelectedMenuId(savedMenu.id);
    }
    setIsFormOpen(false);
    setMenuToEdit(null);
  };

  // AI Menu -> σώζουμε συνταγές με σωστό teamId και δημιουργούμε a_la_carte menu με recipeIds
  const handleSaveAiMenu = (
    recipesForMenu: Omit<Recipe, 'id' | 'teamId'>[],
    menuDetails: { name: string; description: string; pax: number }
  ) => {
    api
      .saveMultipleRecipes(recipesForMenu, currentTeamId)
      .then((createdRecipes) => {
        // Προσθέτουμε τις νέες συνταγές στο state
        setAllRecipes((prev) => [...prev, ...createdRecipes]);

        // Δημιουργούμε ένα a_la_carte menu που δείχνει αυτές τις συνταγές
        const newMenuData: Omit<Menu, 'id'> = {
          name: menuDetails.name,
          description: menuDetails.description,
          type: 'a_la_carte',
          teamId: currentTeamId,
          ...( { recipeIds: createdRecipes.map((r) => r.id) } as any ),
        };

        api.saveMenu(newMenuData).then((savedMenu) => {
          setMenus((prev) => [...prev, savedMenu]);
          setSelectedMenuId(savedMenu.id);
        });

        setIsAiFormOpen(false);
      });
  };

  const handleConfirmDelete = async () => {
    if (menuToDelete) {
      await api.deleteMenu(menuToDelete.id);
      setMenus((prev) => prev.filter((m) => m.id !== menuToDelete.id));

      if (selectedMenuId === menuToDelete.id) {
        const remainingMenus = menus.filter((m) => m.id !== menuToDelete.id);
        setSelectedMenuId(
          remainingMenus.length > 0 ? remainingMenus[0].id : null
        );
      }
      setMenuToDelete(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Λίστα Menus + φίλτρα */}
        <div
          className={`h-full ${
            selectedMenuId ? 'hidden lg:block' : 'lg:col-span-1'
          }`}
        >
          {/* 🔍 Search & Type filter UI */}
          <div className="mb-3 bg-white/70 dark:bg-slate-900/60 backdrop-blur border border-white/30 dark:border-slate-700/60 rounded-2xl p-3 shadow-sm">
            <div className="mb-2">
              <input
                type="text"
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Αναζήτηση μενού (όνομα ή περιγραφή)..."
                className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold">
                Τύπος:
              </span>
              <button
                type="button"
                onClick={() => setMenuTypeFilter('all')}
                className={`px-2 py-1 rounded-full border text-[11px] ${
                  menuTypeFilter === 'all'
                    ? 'bg-brand-yellow text-brand-dark border-brand-yellow'
                    : 'bg-black/5 dark:bg-white/10 border-transparent text-slate-700 dark:text-slate-200'
                }`}
              >
                Όλα
              </button>
              <button
                type="button"
                onClick={() => setMenuTypeFilter('a_la_carte')}
                className={`px-2 py-1 rounded-full border text-[11px] ${
                  menuTypeFilter === 'a_la_carte'
                    ? 'bg-brand-yellow text-brand-dark border-brand-yellow'
                    : 'bg-black/5 dark:bg-white/10 border-transparent text-slate-700 dark:text-slate-200'
                }`}
              >
                A La Carte
              </button>
              <button
                type="button"
                onClick={() => setMenuTypeFilter('buffet')}
                className={`px-2 py-1 rounded-full border text-[11px] ${
                  menuTypeFilter === 'buffet'
                    ? 'bg-brand-yellow text-brand-dark border-brand-yellow'
                    : 'bg-black/5 dark:bg-white/10 border-transparent text-slate-700 dark:text-slate-200'
                }`}
              >
                Buffet
              </button>
            </div>
          </div>

          <MenuList
            menus={filteredMenus}
            selectedMenuId={selectedMenuId}
            onSelectMenu={setSelectedMenuId}
            onAdd={() => handleOpenForm(null)}
            onStartAICreation={() => setIsAiFormOpen(true)}
            onEdit={handleOpenForm}
            onDelete={setMenuToDelete}
            canManage={canManage}
            withApiKeyCheck={withApiKeyCheck}
          />
        </div>

        {/* Δεξιά στήλη: λεπτομέρειες + SmartMenuCoach */}
        <div
          className={`h-full ${
            !selectedMenuId ? 'hidden lg:flex' : 'lg:col-span-2'
          }`}
        >
          {selectedMenu ? (
            <div className="flex flex-col h-full">
              <MenuDetail
                menu={selectedMenu}
                recipes={allRecipes}
                setMenus={setMenus}
                tasks={tasks}
                workstations={workstations}
                onBack={() => setSelectedMenuId(null)}
                onEdit={handleOpenForm}
                canManage={canManage}
                onOpenCostAnalysis={() => setIsCostAnalysisOpen(true)}
                onOpenShoppingList={() => setIsShoppingListOpen(true)}
              />

              {/* 🔍 SmartMenuCoach κάτω από τις λεπτομέρειες του menu */}
              <div className="mt-6">
                <SmartMenuCoach
                  recipes={allRecipes}
                  inventory={inventory}
                  wasteLogs={wasteLogs}
                  ingredientCosts={ingredientCosts}
                  withApiKeyCheck={withApiKeyCheck}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full w-full">
              <div className="flex-1 flex items-center justify-center text-light-text-secondary dark:text-dark-text-secondary bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl">
                <p>Επιλέξτε ή δημιουργήστε ένα μενού.</p>
              </div>

              {/* 🔍 SmartMenuCoach και στην empty state */}
              <div className="mt-6">
                <SmartMenuCoach
                  recipes={allRecipes}
                  inventory={inventory}
                  wasteLogs={wasteLogs}
                  ingredientCosts={ingredientCosts}
                  withApiKeyCheck={withApiKeyCheck}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <MenuForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveMenu}
        menuToEdit={menuToEdit}
      />

      <AIMenuGenerator
        isOpen={isAiFormOpen}
        onClose={() => setIsAiFormOpen(false)}
        onSave={handleSaveAiMenu}
      />

      <ConfirmationModal
        isOpen={!!menuToDelete}
        onClose={() => setMenuToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Διαγραφή Μενού"
        body={
          <p>
            Είστε σίγουροι ότι θέλετε να διαγράψετε το μενού "
            {menuToDelete?.name}";
          </p>
        }
      />

      {selectedMenu && (
        <>
          <MenuCostAnalysis
            isOpen={isCostAnalysisOpen}
            onClose={() => setIsCostAnalysisOpen(false)}
            menu={selectedMenu}
            recipes={allRecipes}
            ingredientCosts={ingredientCosts}
          />

          <AutoShoppingList
            isOpen={isShoppingListOpen}
            onClose={() => setIsShoppingListOpen(false)}
            menu={selectedMenu}
            recipes={allRecipes}
          />
        </>
      )}
    </>
  );
};

export default MenuView;
