import React, { useState, useMemo } from 'react';
import { Menu, Recipe, PrepTask, Workstation, Role, Team, RolePermissions } from '../../types';
import { api } from '../../services/api';
import MenuList from './MenuList';
import MenuDetail from './MenuDetail';
import MenuForm from './MenuForm';
import AIMenuGenerator from './AIMenuGenerator';
import ConfirmationModal from '../common/ConfirmationModal';

interface MenuViewProps {
  menus: Menu[];
  setMenus: React.Dispatch<React.SetStateAction<Menu[]>>;
  allRecipes: Recipe[];
  setAllRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  tasks: PrepTask[];
  workstations: Workstation[];
  currentUserRole?: Role;
  rolePermissions: RolePermissions;
  allTeams: Team[];
  currentTeamId: string;
  withApiKeyCheck: (action: () => void) => void;
}

const MenuView: React.FC<MenuViewProps> = ({
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
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(menus[0]?.id || null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAiFormOpen, setIsAiFormOpen] = useState(false);
  const [menuToEdit, setMenuToEdit] = useState<Menu | null>(null);
  const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null);

  const canManage = currentUserRole
    ? rolePermissions[currentUserRole]?.includes('manage_recipes')
    : false;

  const selectedMenu = useMemo(
    () => menus.find(m => m.id === selectedMenuId),
    [menus, selectedMenuId]
  );

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

    setMenus(prev => {
      const exists = prev.some(m => m.id === savedMenu.id);
      return exists ? prev.map(m => (m.id === savedMenu.id ? savedMenu : m)) : [...prev, savedMenu];
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
    api.saveMultipleRecipes(recipesForMenu, currentTeamId).then(createdRecipes => {
      // Προσθέτουμε τις νέες συνταγές στο state
      setAllRecipes(prev => [...prev, ...createdRecipes]);

      // Δημιουργούμε ένα a_la_carte menu που δείχνει αυτές τις συνταγές
      const newMenuData: Omit<Menu, 'id'> = {
        name: menuDetails.name,
        description: menuDetails.description,
        type: 'a_la_carte',
        teamId: currentTeamId,
        ...( { recipeIds: createdRecipes.map(r => r.id) } as any ),
      };

      api.saveMenu(newMenuData).then(savedMenu => {
        setMenus(prev => [...prev, savedMenu]);
        setSelectedMenuId(savedMenu.id);
      });

      setIsAiFormOpen(false);
    });
  };

  const handleConfirmDelete = async () => {
    if (menuToDelete) {
      await api.deleteMenu(menuToDelete.id);
      setMenus(prev => prev.filter(m => m.id !== menuToDelete.id));

      if (selectedMenuId === menuToDelete.id) {
        const remainingMenus = menus.filter(m => m.id !== menuToDelete.id);
        setSelectedMenuId(remainingMenus.length > 0 ? remainingMenus[0].id : null);
      }
      setMenuToDelete(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className={`h-full ${selectedMenuId ? 'hidden lg:block' : 'lg:col-span-1'}`}>
          <MenuList
            menus={menus}
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
        <div className={`h-full ${!selectedMenuId ? 'hidden lg:flex' : 'lg:col-span-2'}`}>
          {selectedMenu ? (
            <MenuDetail
              menu={selectedMenu}
              recipes={allRecipes}
              setMenus={setMenus}
              tasks={tasks}
              workstations={workstations}
              onBack={() => setSelectedMenuId(null)}
              onEdit={handleOpenForm}
              canManage={canManage}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-light-text-secondary dark:text-dark-text-secondary bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl">
              <p>Επιλέξτε ή δημιουργήστε ένα μενού.</p>
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
        body={<p>Είστε σίγουροι ότι θέλετε να διαγράψετε το μενού "{menuToDelete?.name}";</p>}
      />
    </>
  );
};

export default MenuView;
