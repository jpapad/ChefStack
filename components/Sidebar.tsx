import React, { useState } from 'react';
import { Icon, IconName } from './common/Icon';
import { View, User, Role, Team } from '../types';
import { useTranslation } from '../i18n';
import { chefStackLogo } from '../assets';

export type NavItem = { view: View; labelKey: string; icon: IconName; roles?: Role[] };

type NavCategory = {
  id: string;
  labelKey: string;
  icon: IconName;
  items: NavItem[];
};

export const NAV_CATEGORIES: NavCategory[] = [
  {
    id: 'home',
    labelKey: 'nav_category_home',
    icon: 'home',
    items: [
      { view: 'dashboard', labelKey: 'nav_dashboard', icon: 'layout-dashboard' }
    ]
  },
  {
    id: 'menu_recipes',
    labelKey: 'nav_category_menu_recipes',
    icon: 'book-open',
    items: [
      { view: 'recipes', labelKey: 'nav_recipes', icon: 'book-open' },
      { view: 'schedules', labelKey: 'nav_schedules', icon: 'calendar-clock' },
      { view: 'menus', labelKey: 'nav_menus', icon: 'list' },
      {
        view: 'kitchen_service',
        labelKey: 'nav_kitchen_service',
        icon: 'servings',
        roles: ['Admin', 'Sous Chef']
      },
      {
        view: 'kds',
        labelKey: 'nav_kds',
        icon: 'monitor',
        roles: ['Admin', 'Sous Chef', 'Cook']
      }
    ]
  },
  {
    id: 'inventory',
    labelKey: 'nav_category_inventory',
    icon: 'package',
    items: [
      { view: 'shopping_list', labelKey: 'nav_shopping_list', icon: 'shopping-cart', roles: ['Admin', 'Sous Chef'] },
      { view: 'inventory', labelKey: 'nav_inventory', icon: 'package' },
      { view: 'inventory_history', labelKey: 'nav_inventory_history', icon: 'history', roles: ['Admin', 'Sous Chef'] },
      { view: 'stock_take', labelKey: 'nav_stock_take', icon: 'clipboard-check', roles: ['Admin', 'Sous Chef'] },
      { view: 'workstations', labelKey: 'nav_workstations', icon: 'clipboard-list', roles: ['Admin', 'Sous Chef'] }
    ]
  },
  {
    id: 'costing',
    labelKey: 'nav_category_costing',
    icon: 'dollar-sign',
    items: [
      { view: 'costing', labelKey: 'nav_costing', icon: 'scale', roles: ['Admin', 'Sous Chef'] },
      { view: 'suppliers', labelKey: 'nav_suppliers', icon: 'truck', roles: ['Admin', 'Sous Chef'] }
    ]
  },
  {
    id: 'production',
    labelKey: 'nav_category_production',
    icon: 'factory',
    items: [
      { view: 'labels', labelKey: 'nav_labels', icon: 'printer', roles: ['Admin', 'Sous Chef'] },
      { view: 'waste_log', labelKey: 'nav_waste_log', icon: 'trash-2' }
    ]
  },
  {
    id: 'management',
    labelKey: 'nav_category_management',
    icon: 'briefcase',
    items: [
      { view: 'shifts', labelKey: 'nav_shifts', icon: 'calendar' },
      { view: 'haccp', labelKey: 'nav_haccp', icon: 'thermometer' },
      {
        view: 'reports',
        labelKey: 'nav_reports',
        icon: 'mail',
        roles: ['Admin', 'Sous Chef']
      }
    ]
  },
  {
    id: 'tools',
    labelKey: 'nav_category_tools',
    icon: 'wrench',
    items: [
      { view: 'copilot', labelKey: 'nav_copilot', icon: 'sparkles' },
      { view: 'analytics', labelKey: 'nav_analytics', icon: 'bar-chart-2', roles: ['Admin', 'Sous Chef'] }
    ]
  },
  {
    id: 'system',
    labelKey: 'nav_category_system',
    icon: 'settings',
    items: [
      { view: 'collaboration', labelKey: 'nav_collaboration', icon: 'users' },
      { view: 'notifications', labelKey: 'nav_notifications', icon: 'bell' },
      { view: 'user_manual', labelKey: 'nav_user_manual', icon: 'help-circle' },
      { view: 'settings', labelKey: 'nav_settings', icon: 'settings', roles: ['Admin'] }
    ]
  }
];

// Keep for backwards compatibility
export const ALL_NAV_ITEMS: NavItem[] = NAV_CATEGORIES.flatMap(cat => cat.items);

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  user: User;
  onLogout: () => void;
  currentTeam?: Team;
  currentUserRole?: Role;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  /** 🔢 Σύνολο unread Walkie / notifications για badge στο sidebar */
  walkieUnreadCount?: number;
}

const NavItem: React.FC<{
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
  walkieUnreadCount?: number;
  isInCategory?: boolean;
}> = ({ item, isActive, isCollapsed, onClick, walkieUnreadCount = 0, isInCategory = false }) => {
  const { t } = useTranslation();
  const isKitchenService = item.view === 'kitchen_service';
  const hasUnread = isKitchenService && walkieUnreadCount > 0;

  return (
    <button
      onClick={onClick}
      title={isCollapsed ? t(item.labelKey) : ''}
      className={`relative w-full flex items-center text-sm font-semibold rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-brand-yellow text-brand-dark'
          : 'text-dark-text-secondary hover:bg-black/5 dark:text-dark-text-secondary dark:hover:bg-white/5 dark:hover:text-dark-text-primary'
      } ${isCollapsed ? 'justify-center p-3' : isInCategory ? 'px-3 py-2' : 'px-4 py-2.5'}`}
    >
      <Icon name={item.icon} className={`${isInCategory ? 'w-4 h-4' : 'w-5 h-5'} flex-shrink-0`} />
      {!isCollapsed && (
        <>
          <span className={`ml-3 ${isInCategory ? 'text-xs' : ''}`}>{t(item.labelKey)}</span>
          {hasUnread && (
            <span className="ml-auto inline-flex items-center justify-center min-w-[18px] px-1 h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold">
              {walkieUnreadCount}
            </span>
          )}
        </>
      )}

      {/* Collapsed: μικρή κόκκινη τελίτσα πάνω δεξιά στο κουμπί */}
      {isCollapsed && hasUnread && (
        <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500" />
      )}
    </button>
  );
};

const NavCategory: React.FC<{
  category: NavCategory;
  currentView: View;
  currentUserRole?: Role;
  isCollapsed: boolean;
  onViewChange: (view: View) => void;
  walkieUnreadCount: number;
}> = ({ category, currentView, currentUserRole, isCollapsed, onViewChange, walkieUnreadCount }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  
  const visibleItems = category.items.filter(
    (item) => !item.roles || (currentUserRole && item.roles.includes(currentUserRole))
  );
  
  if (visibleItems.length === 0) return null;
  
  const hasActiveItem = visibleItems.some(item => item.view === currentView);
  
  // If collapsed, show all items as individual buttons
  if (isCollapsed) {
    return (
      <>
        {visibleItems.map((item) => (
          <NavItem
            key={item.view}
            item={item}
            isActive={currentView === item.view}
            isCollapsed={isCollapsed}
            onClick={() => onViewChange(item.view)}
            walkieUnreadCount={item.view === 'kitchen_service' ? walkieUnreadCount : 0}
          />
        ))}
      </>
    );
  }
  
  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
          hasActiveItem
            ? 'text-brand-yellow'
            : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
        }`}
      >
        <Icon name={category.icon} className="w-4 h-4 flex-shrink-0" />
        <span className="ml-2 flex-1 text-left">{t(category.labelKey)}</span>
        <Icon 
          name="chevron-down" 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      
      {isOpen && (
        <div className="ml-2 space-y-1 pl-3 border-l-2 border-gray-200 dark:border-gray-700">
          {visibleItems.map((item) => (
            <NavItem
              key={item.view}
              item={item}
              isActive={currentView === item.view}
              isCollapsed={false}
              onClick={() => onViewChange(item.view)}
              walkieUnreadCount={item.view === 'kitchen_service' ? walkieUnreadCount : 0}
              isInCategory={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  user,
  onLogout,
  currentTeam,
  currentUserRole,
  isCollapsed,
  onToggleCollapse,
  walkieUnreadCount = 0
}) => {
  const { t } = useTranslation();

  return (
    <aside
      className={`flex flex-col bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border-r border-white/20 dark:border-slate-800/40 print:hidden transition-all duration-300 ease-in-out
            ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      <div
        className={`flex items-center border-b border-white/20 dark:border-slate-800/40 h-[65px] ${
          isCollapsed ? 'justify-center px-2' : 'justify-start px-4'
        }`}
      >
        {currentTeam?.logoUrl ? (
          <img
            src={currentTeam.logoUrl}
            alt={`${currentTeam.name} Logo`}
            className="object-contain h-full w-auto max-w-full rounded-md"
          />
        ) : (
          <div
            className={`flex items-center ${
              isCollapsed ? 'justify-center' : 'justify-start w-full'
            }`}
          >
            <div
              className={`transition-all duration-300 flex-shrink-0 h-10 w-10`}
              dangerouslySetInnerHTML={{ __html: chefStackLogo }}
            />
            {!isCollapsed && (
              <span className="ml-2 text-xl font-bold font-heading">ChefStack</span>
            )}
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {NAV_CATEGORIES.map((category) => (
          <NavCategory
            key={category.id}
            category={category}
            currentView={currentView}
            currentUserRole={currentUserRole}
            isCollapsed={isCollapsed}
            onViewChange={onViewChange}
            walkieUnreadCount={walkieUnreadCount}
          />
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-white/20 dark:border-slate-800/40">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center p-2 rounded-lg text-sm text-dark-text-secondary hover:bg-black/5 dark:hover:bg-white/5 justify-center mb-2"
        >
          <Icon
            name="arrow-left"
            className={`w-5 h-5 transition-transform duration-300 ${
              isCollapsed ? 'rotate-180' : ''
            }`}
          />
        </button>
        <div className="flex items-center">
          <img
            src={`https://i.pravatar.cc/40?u=${user.email}`}
            alt="User"
            className="w-10 h-10 rounded-full"
          />
          {!isCollapsed && (
            <div className="ml-3 flex-1">
              <p className="font-semibold text-sm truncate">{user.name}</p>
              <button
                onClick={onLogout}
                className="text-xs text-light-text-secondary dark:text-dark-text-secondary hover:underline"
              >
                {t('user_menu_logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
