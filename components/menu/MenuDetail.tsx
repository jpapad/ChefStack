import React, { useState, useMemo } from 'react';
import {
  Menu,
  Recipe,
  DailyPlan,
  PrepTask,
  Workstation,
  Role,
  MenuPrintCustomizations
} from '../../types';
import { Icon } from '../common/Icon';
import RecipeSelector from './RecipeSelector';
import PrintPreview from '../common/PrintPreview';
import ProductionSheetView from './ProductionSheetView';
import MenuPrintView from './MenuPrintView';
import DateNavigator from '../workstations/DateNavigator';
import BuffetPlanEditor from './BuffetPlanEditor';
import CustomerMenuPrintView from './CustomerMenuPrintView';
import MenuPrintCustomizer from './MenuPrintCustomizer';

interface MenuDetailProps {
  menu: Menu;
  recipes: Recipe[];
  setMenus: React.Dispatch<React.SetStateAction<Menu[]>>;
  tasks: PrepTask[];
  workstations: Workstation[];
  onBack: () => void;
  onEdit: (menu: Menu) => void;
  canManage: boolean;
}

const MenuDetail: React.FC<MenuDetailProps> = ({
  menu,
  recipes,
  setMenus,
  tasks,
  workstations,
  onBack,
  onEdit,
  canManage
}) => {
  const [printPreviewContent, setPrintPreviewContent] =
    useState<React.ReactNode | null>(null);
  const [isPrintCustomizerOpen, setIsPrintCustomizerOpen] = useState(false);

  /**
   * Updates the recipe IDs for an 'a_la_carte' menu.
   * @param menuId The ID of the menu to update.
   * @param newRecipeIds The new array of recipe IDs.
   */
  const handleUpdateAlaCarteRecipes = (
    menuId: string,
    newRecipeIds: string[]
  ) => {
    setMenus((prevMenus) =>
      prevMenus.map((m) =>
        m.id === menuId && m.type === 'a_la_carte'
          ? { ...m, recipeIds: newRecipeIds }
          : m
      )
    );
  };

  /**
   * Sets the content to be displayed in the print preview overlay.
   * @param content The React component/node to print.
   */
  const handlePrint = (content: React.ReactNode) => {
    setPrintPreviewContent(content);
  };

  // Memoized calculations for a la carte recipe selector
  const { menuRecipes, availableRecipes } = useMemo(() => {
    if (menu.type === 'a_la_carte') {
      const selectedRecipes = recipes.filter((r) =>
        (menu as any).recipeIds?.includes(r.id)
      );
      const unselectedRecipes = recipes.filter(
        (r) => !(menu as any).recipeIds?.includes(r.id)
      );
      return { menuRecipes: selectedRecipes, availableRecipes: unselectedRecipes };
    }
    return { menuRecipes: [] as Recipe[], availableRecipes: recipes };
  }, [menu, recipes]);

  // 🔢 Quick stats για A La Carte
  const alaCarteStats = useMemo(() => {
    if (menu.type !== 'a_la_carte') return null;
    const count = menuRecipes.length;
    const priced = menuRecipes.filter((r) => typeof r.price === 'number');
    let minPrice: number | null = null;
    let maxPrice: number | null = null;

    if (priced.length > 0) {
      minPrice = priced.reduce(
        (min, r) => (r.price! < min ? r.price! : min),
        priced[0].price!
      );
      maxPrice = priced.reduce(
        (max, r) => (r.price! > max ? r.price! : max),
        priced[0].price!
      );
    }

    return { count, minPrice, maxPrice };
  }, [menu, menuRecipes]);

  // State and handlers for buffet view
  const initialDate = useMemo(() => {
    const today = new Date();
    if (menu.type === 'buffet' && menu.startDate && menu.endDate) {
      const startDate = new Date(menu.startDate);
      // Adjust for timezone when creating Date from string
      startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
      const endDate = new Date(menu.endDate);
      endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());
      // Set date to today if it's within range, otherwise default to start date
      if (today >= startDate && today <= endDate) {
        return today;
      }
      return startDate;
    }
    return today;
  }, [menu]);

  const [selectedDate, setSelectedDate] = useState(initialDate);

  const selectedDailyPlan = useMemo(() => {
    if (menu.type !== 'buffet') return null;
    const dateStr = selectedDate.toISOString().split('T')[0];
    return (menu as any).dailyPlans?.find((p: DailyPlan) => p.date === dateStr) || null;
  }, [menu, selectedDate]);

  const handleConfirmPrintCustomization = (
    customizations: MenuPrintCustomizations
  ) => {
    setIsPrintCustomizerOpen(false);
    handlePrint(
      <CustomerMenuPrintView
        menu={menu}
        recipes={menuRecipes}
        customizations={customizations}
      />
    );
  };

  // Renders the view for an 'a_la_carte' menu
  const renderAlaCarteView = () => {
    const typedMenu = menu as Extract<Menu, { type: 'a_la_carte' }>;
    return (
      <RecipeSelector
        menu={typedMenu}
        menuRecipes={menuRecipes}
        availableRecipes={availableRecipes}
        onUpdateRecipes={handleUpdateAlaCarteRecipes}
        canManage={canManage}
      />
    );
  };

  // Renders the view for a 'buffet' menu
  const renderBuffetView = () => {
    const typedMenu = menu as Extract<Menu, { type: 'buffet' }>;

    const handleUpdateBuffetMenu = (
      updatedData: Partial<Extract<Menu, { type: 'buffet' }>>
    ) => {
      setMenus((prevMenus) =>
        prevMenus.map((m) => {
          if (m.id === menu.id && m.type === 'buffet') {
            return { ...m, ...updatedData };
          }
          return m;
        })
      );
    };

    const totalDays =
      Array.isArray(typedMenu.dailyPlans) ? typedMenu.dailyPlans.length : 0;

    return (
      <div className="space-y-6">
        {/* Action bar για buffet */}
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h3 className="text-xl font-semibold font-heading">Ημερήσιο Πλάνο</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                handlePrint(
                  <MenuPrintView
                    menu={typedMenu}
                    dailyPlansToPrint={selectedDailyPlan ? [selectedDailyPlan] : []}
                    allRecipes={recipes}
                  />
                )
              }
              disabled={!selectedDailyPlan}
              className="flex items-center gap-2 text-sm font-semibold bg-gray-200/80 dark:bg-gray-700/80 px-3 py-1.5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Εκτύπωση Μενού Ημέρας"
            >
              <Icon name="printer" className="w-4 h-4" />
              Εκτύπωση Ημέρας
            </button>
            <button
              onClick={() =>
                handlePrint(
                  <MenuPrintView
                    menu={typedMenu}
                    dailyPlansToPrint={typedMenu.dailyPlans}
                    allRecipes={recipes}
                  />
                )
              }
              disabled={totalDays === 0}
              className="flex items-center gap-2 text-sm font-semibold bg-gray-200/80 dark:bg-gray-700/80 px-3 py-1.5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Εκτύπωση Μενού Περιόδου"
            >
              <Icon name="printer" className="w-4 h-4" />
              Εκτύπωση Περιόδου
            </button>
            <button
              onClick={() =>
                handlePrint(
                  <ProductionSheetView
                    dailyPlan={selectedDailyPlan!}
                    menuName={menu.name}
                    pax={typedMenu.pax}
                    allRecipes={recipes}
                    allTasks={tasks}
                    allWorkstations={workstations}
                  />
                )
              }
              disabled={!selectedDailyPlan}
              className="flex items-center gap-2 text-sm font-semibold bg-gray-200/80 dark:bg-gray-700/80 px-3 py-1.5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Εκτύπωση Λίστας Παραγωγής"
            >
              <Icon name="clipboard-list" className="w-4 h-4" />
              Λίστα Παραγωγής
            </button>
          </div>
        </div>

        <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />

        <div className="mt-4">
          <BuffetPlanEditor
            menu={typedMenu}
            selectedDate={selectedDate}
            recipes={recipes}
            onUpdateMenu={handleUpdateBuffetMenu}
            canManage={canManage}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="p-6 h-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl overflow-y-auto print:hidden">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="lg:hidden flex items-center mb-4 text-brand-yellow hover:underline"
          >
            <Icon name="arrow-left" className="w-5 h-5 mr-2" />
            Πίσω στα Μενού
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0">
                <h2 className="text-3xl lg:text-4xl font-extrabold font-heading mb-2 truncate">
                  {menu.name}
                </h2>
                {menu.description && (
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">
                    {menu.description}
                  </p>
                )}
                <div className="mt-1 text-xs font-semibold inline-flex items-center gap-2 bg-brand-yellow/20 text-brand-yellow px-3 py-1 rounded-full">
                  <Icon
                    name={menu.type === 'buffet' ? 'servings' : 'list'}
                    className="w-4 h-4"
                  />
                  {menu.type === 'a_la_carte'
                    ? 'À la carte'
                    : `Μπουφέ (${menu.pax ?? '-'} PAX)`}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                {menu.type === 'a_la_carte' && (
                  <button
                    onClick={() => setIsPrintCustomizerOpen(true)}
                    title="Εκτύπωση Καταλόγου"
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  >
                    <Icon
                      name="printer"
                      className="w-5 h-5 text-brand-yellow"
                    />
                  </button>
                )}
                {canManage && (
                  <button
                    onClick={() => onEdit(menu)}
                    title="Επεξεργασία Μενού"
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  >
                    <Icon name="edit" className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick stats strip */}
            {menu.type === 'a_la_carte' && alaCarteStats && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="bg-black/5 dark:bg-white/5 rounded-lg px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase text-light-text-secondary dark:text-dark-text-secondary">
                    Πιάτα Μενού
                  </p>
                  <p className="text-lg font-bold">
                    {alaCarteStats.count}
                  </p>
                </div>
                <div className="bg-black/5 dark:bg:white/5 rounded-lg px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase text-light-text-secondary dark:text-dark-text-secondary">
                    Ελάχιστη Τιμή
                  </p>
                  <p className="text-lg font-bold">
                    {alaCarteStats.minPrice != null
                      ? `${alaCarteStats.minPrice.toFixed(2)}€`
                      : '-'}
                  </p>
                </div>
                <div className="bg-black/5 dark:bg-white/5 rounded-lg px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase text-light-text-secondary dark:text-dark-text-secondary">
                    Μέγιστη Τιμή
                  </p>
                  <p className="text-lg font-bold">
                    {alaCarteStats.maxPrice != null
                      ? `${alaCarteStats.maxPrice.toFixed(2)}€`
                      : '-'}
                  </p>
                </div>
              </div>
            )}

            {menu.type === 'buffet' && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="bg-black/5 dark:bg:white/5 rounded-lg px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase text-light-text-secondary dark:text-dark-text-secondary">
                    Ημέρες Προγράμματος
                  </p>
                  <p className="text-lg font-bold">
                    {Array.isArray((menu as any).dailyPlans)
                      ? (menu as any).dailyPlans.length
                      : 0}
                  </p>
                </div>
                <div className="bg-black/5 dark:bg:white/5 rounded-lg px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase text-light-text-secondary dark:text-dark-text-secondary">
                    PAX Ανά Ημέρα
                  </p>
                  <p className="text-lg font-bold">
                    {(menu as any).pax ?? '-'}
                  </p>
                </div>
                <div className="bg-black/5 dark:bg:white/5 rounded-lg px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase text-light-text-secondary dark:text-dark-text-secondary">
                    Ενεργή Ημερομηνία
                  </p>
                  <p className="text-lg font-bold">
                    {selectedDailyPlan
                      ? selectedDailyPlan.date
                      : 'Χωρίς πλάνο για την ημέρα'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Main content area */}
          <div className="mt-8">
            {menu.type === 'a_la_carte'
              ? renderAlaCarteView()
              : renderBuffetView()}
          </div>
        </div>
      </div>

      {printPreviewContent && (
        <PrintPreview onClose={() => setPrintPreviewContent(null)}>
          {printPreviewContent}
        </PrintPreview>
      )}

      <MenuPrintCustomizer
        isOpen={isPrintCustomizerOpen}
        onClose={() => setIsPrintCustomizerOpen(false)}
        onConfirm={handleConfirmPrintCustomization}
        defaultTitle={menu.name}
      />
    </>
  );
};

export default MenuDetail;
