import React from 'react';
import { Icon, IconName } from './common/Icon';
import { View, User, Role, Team } from '../types';
import { useTranslation } from '../i18n';
import { chefStackLogo } from '../assets';

export const ALL_NAV_ITEMS: { view: View; labelKey: string; icon: IconName; roles?: Role[] }[] = [
  { view: 'dashboard', labelKey: 'nav_dashboard', icon: 'layout-dashboard' },
  { view: 'recipes', labelKey: 'nav_recipes', icon: 'book-open' },
  { view: 'menus', labelKey: 'nav_menus', icon: 'list' },

  // 🆕 Kitchen–Service (κουζίνα–σέρβις) – μόνο Admin & Sous Chef
  {
    view: 'kitchen_service',
    labelKey: 'nav_kitchen_service',
    icon: 'servings',
    roles: ['Admin', 'Sous Chef']
  },

  // 🆕 Kitchen Display System (KDS)
  {
    view: 'kds',
    labelKey: 'nav_kds',
    icon: 'monitor',
    roles: ['Admin', 'Sous Chef', 'Cook']
  },

  { view: 'shopping_list', labelKey: 'nav_shopping_list', icon: 'shopping-cart' },
  { view: 'labels', labelKey: 'nav_labels', icon: 'printer' },
  { view: 'inventory', labelKey: 'nav_inventory', icon: 'package' },
  { view: 'inventory_history', labelKey: 'nav_inventory_history', icon: 'history' },
  { view: 'stock_take', labelKey: 'nav_stock_take', icon: 'clipboard-check' },
  { view: 'waste_log', labelKey: 'nav_waste_log', icon: 'trash-2' },
  { view: 'workstations', labelKey: 'nav_workstations', icon: 'clipboard-list' },
  { view: 'shifts', labelKey: 'nav_shifts', icon: 'calendar' },
  { view: 'costing', labelKey: 'nav_costing', icon: 'scale' },
  { view: 'suppliers', labelKey: 'nav_suppliers', icon: 'truck' },
  { view: 'haccp', labelKey: 'nav_haccp', icon: 'thermometer' },

  // 📧 Email Reports & Scheduling – Admin & Sous Chef only
  {
    view: 'reports',
    labelKey: 'nav_reports',
    icon: 'mail',
    roles: ['Admin', 'Sous Chef']
  },

  // 🧠 Chef Copilot – διαθέσιμο σε όλους τους ρόλους
  { view: 'copilot', labelKey: 'nav_copilot', icon: 'sparkles' },

  { view: 'analytics', labelKey: 'nav_analytics', icon: 'bar-chart-2' },
  { view: 'collaboration', labelKey: 'nav_collaboration', icon: 'users' },
  { view: 'notifications', labelKey: 'nav_notifications', icon: 'bell' },
  { view: 'user_manual', labelKey: 'nav_user_manual', icon: 'help-circle' },
  { view: 'settings', labelKey: 'nav_settings', icon: 'settings', roles: ['Admin'] }
];

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
  item: (typeof ALL_NAV_ITEMS)[0];
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
  walkieUnreadCount?: number;
}> = ({ item, isActive, isCollapsed, onClick, walkieUnreadCount = 0 }) => {
  const { t } = useTranslation();
  const isKitchenService = item.view === 'kitchen_service';
  const hasUnread = isKitchenService && walkieUnreadCount > 0;

  return (
    <button
      onClick={onClick}
      title={isCollapsed ? t(item.labelKey) : ''}
      className={`relative w-full flex items-center text-sm font-semibold rounded-lg transition-colors.duration-200 ${
        isActive
          ? 'bg-brand-yellow text-brand-dark'
          : 'text-dark-text-secondary hover:bg-black/5 dark:text-dark-text-secondary dark:hover:bg-white/5 dark:hover:text-dark-text-primary'
      } ${isCollapsed ? 'justify-center p-3' : 'px-4 py-2.5'}`}
    >
      <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" />
      {!isCollapsed && (
        <>
          <span className="ml-3">{t(item.labelKey)}</span>
          {hasUnread && (
            <span className="ml-auto inline-flex.items-center justify-center min-w-[18px] px-1 h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold">
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
  const visibleNavItems = ALL_NAV_ITEMS.filter(
    (item) => !item.roles || (currentUserRole && item.roles.includes(currentUserRole))
  );

  return (
    <aside
      className={`flex flex-col bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border-r border-white/20 dark:border-slate-800/40 print:hidden transition-all duration-300.ease-in-out
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
            className={`flex.items-center ${
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
        {visibleNavItems.map((item) => (
          <NavItem
            key={item.view}
            item={item}
            isActive={currentView === item.view}
            isCollapsed={isCollapsed}
            onClick={() => onViewChange(item.view)}
            // Τώρα το badge χρησιμοποιείται για το Kitchen–Service
            walkieUnreadCount={item.view === 'kitchen_service' ? walkieUnreadCount : 0}
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
