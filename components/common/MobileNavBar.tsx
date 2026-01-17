import React from 'react';
import { View, Role } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';
import { ALL_NAV_ITEMS, NavItem } from '../Sidebar';

interface MobileNavBarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  currentUserRole?: Role;
}

const MobileNavBar: React.FC<MobileNavBarProps> = ({
  currentView,
  onViewChange,
  currentUserRole
}) => {
  const { t } = useTranslation();

  // Primary navigation items for mobile (most used features)
  const primaryNavItems: NavItem[] = [
    ALL_NAV_ITEMS.find(item => item.view === 'dashboard')!,
    ALL_NAV_ITEMS.find(item => item.view === 'recipes')!,
    ALL_NAV_ITEMS.find(item => item.view === 'inventory')!,
    ALL_NAV_ITEMS.find(item => item.view === 'menu')!,
    ALL_NAV_ITEMS.find(item => item.view === 'settings')!,
  ].filter(Boolean);

  // Check if user has permission to view this item
  const hasPermission = (item: NavItem): boolean => {
    if (!item.requiredPermissions || !currentUserRole) return true;
    if (currentUserRole === 'owner' || currentUserRole === 'admin') return true;
    return item.requiredPermissions.every(perm =>
      currentUserRole.permissions?.includes(perm)
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-dark-bg border-t border-gray-200 dark:border-gray-700 safe-bottom">
      <div className="flex justify-around items-center h-16">
        {primaryNavItems.map((item) => {
          if (!hasPermission(item)) return null;

          const isActive = currentView === item.view;
          
          return (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-brand-yellow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-brand-yellow'
              }`}
              aria-label={t(item.labelKey)}
            >
              <Icon name={item.icon} className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavBar;
