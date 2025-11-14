import React, { useState, useMemo } from 'react';
import { Menu, Recipe, DailyPlan, PrepTask, Workstation, Role, MenuPrintCustomizations } from '../../types';
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

const MenuDetail: React.FC<MenuDetailProps> = ({ menu, recipes, setMenus, tasks, workstations, onBack, onEdit, canManage }) => {
  const [printPreviewContent, setPrintPreviewContent] = useState<React.ReactNode | null>(null);
  const [isPrintCustomizerOpen, setIsPrintCustomizerOpen] = useState(false);

  /**
   * Updates the recipe IDs for an 'a_la_carte' menu.
   * @param menuId The ID of the menu to update.
   * @param newRecipeIds The new array of recipe IDs.
   */
  const handleUpdateAlaCarteRecipes = (menuId: string, newRecipeIds: string[]) => {
    setMenus(prevMenus => prevMenus.map(m =>
      (m.id === menuId && m.type === 'a_la_carte') ? { ...m, recipeIds: newRecipeIds } : m
    ));
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
      const selectedRecipes = recipes.filter(r => menu.recipeIds.includes(r.id));
      const unselectedRecipes = recipes.filter(r => !menu.recipeIds.includes(r.id));
      return { menuRecipes: selectedRecipes, availableRecipes: unselectedRecipes };
    }
    return { menuRecipes: [], availableRecipes: recipes };
  }, [menu, recipes]);
  
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
    return menu.dailyPlans.find(p => p.date === dateStr);
  }, [menu, selectedDate]);

  const handleConfirmPrintCustomization = (customizations: MenuPrintCustomizations) => {
    setIsPrintCustomizerOpen(false);
    handlePrint(<CustomerMenuPrintView menu={menu} recipes={menuRecipes} customizations={customizations} />);
  };


  // Renders the view for an 'a_la_carte' menu
  const renderAlaCarteView = () => {
     const typedMenu = menu as Extract<Menu, { type: 'a_la_carte' }>;
     return <RecipeSelector menu={typedMenu} menuRecipes={menuRecipes} availableRecipes={availableRecipes} onUpdateRecipes={handleUpdateAlaCarteRecipes} canManage={canManage} />;
  };

  // Renders the view for a 'buffet' menu
  const renderBuffetView = () => {
    const typedMenu = menu as Extract<Menu, { type: 'buffet' }>;

    const handleUpdateBuffetMenu = (updatedData: Partial<Extract<Menu, { type: 'buffet' }>>) => {
        setMenus(prevMenus =>
            prevMenus.map(m => {
                if (m.id === menu.id && m.type === 'buffet') {
                    return { ...m, ...updatedData };
                }
                return m;
            })
        );
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-xl font-semibold font-heading">Ημερήσιο Πλάνο</h3>
                 <div className="flex items-center gap-2">
                    <button
                        onClick={() => handlePrint(<MenuPrintView menu={typedMenu} dailyPlansToPrint={[selectedDailyPlan!]} allRecipes={recipes} />)}
                        disabled={!selectedDailyPlan}
                        className="flex items-center gap-2 text-sm font-semibold bg-gray-200/80 dark:bg-gray-700/80 px-3 py-1.5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Εκτύπωση Μενού Ημέρας"
                    >
                        <Icon name="printer" className="w-4 h-4" />
                        Εκτύπωση Ημέρας
                    </button>
                    <button
                        onClick={() => handlePrint(<MenuPrintView menu={typedMenu} dailyPlansToPrint={typedMenu.dailyPlans} allRecipes={recipes} />)}
                        disabled={typedMenu.dailyPlans.length === 0}
                        className="flex items-center gap-2 text-sm font-semibold bg-gray-200/80 dark:bg-gray-700/80 px-3 py-1.5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Εκτύπωση Μενού Περιόδου"
                    >
                        <Icon name="printer" className="w-4 h-4" />
                        Εκτύπωση Περιόδου
                    </button>
                    <button
                        onClick={() => handlePrint(<ProductionSheetView dailyPlan={selectedDailyPlan!} menuName={menu.name} pax={typedMenu.pax} allRecipes={recipes} allTasks={tasks} allWorkstations={workstations} />)}
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
          <button onClick={onBack} className="lg:hidden flex items-center mb-4 text-brand-yellow hover:underline">
            <Icon name="arrow-left" className="w-5 h-5 mr-2" />
            Πίσω στα Μενού
          </button>

          <div className="mb-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl lg:text-4xl font-extrabold font-heading mb-2">{menu.name}</h2>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">{menu.description}</p>
                    <div className="mt-2 text-sm font-semibold inline-flex items-center gap-2 bg-brand-yellow/20 text-brand-yellow px-3 py-1 rounded-full">
                    <Icon name={menu.type === 'buffet' ? 'servings' : 'list'} className="w-4 h-4"/>
                    {menu.type === 'a_la_carte' ? 'À la carte' : `Μπουφέ (${menu.pax} PAX)`}
                    </div>
                </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                 {menu.type === 'a_la_carte' && (
                    <button onClick={() => setIsPrintCustomizerOpen(true)} title="Εκτύπωση Καταλόγου" className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                        <Icon name="printer" className="w-5 h-5 text-brand-yellow"/>
                    </button>
                 )}
                 {canManage && (
                    <button onClick={() => onEdit(menu)} title="Επεξεργασία Μενού" className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                        <Icon name="edit" className="w-5 h-5" />
                    </button>
                 )}
              </div>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="mt-8">
            {menu.type === 'a_la_carte' ? renderAlaCarteView() : renderBuffetView()}
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
