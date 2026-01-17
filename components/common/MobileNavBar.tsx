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
    ALL_NAV_ITEMS.find(item => item.view === 'menus')!,
    ALL_NAV_ITEMS.find(item => item.view === 'settings')!,
  ].filter(Boolean);

  // Check if user has permission to view this item
  const hasPermission = (item: NavItem): boolean => {
    if (!item.roles || !currentUserRole) return true;
    if (currentUserRole === 'owner' || currentUserRole === 'admin') return true;
    return item.roles.includes(currentUserRole);
  };

  // Handle navigation with haptic feedback
  const handleNavClick = (view: View) => {
    // Haptic feedback for supported browsers (PWA)
    if ('vibrate' in navigator) {
      navigator.vibrate(10); // 10ms subtle vibration
    }
    onViewChange(view);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-dark-bg/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 safe-bottom shadow-lg"
      role="navigation"
      aria-label="Κύρια πλοήγηση"
    >
      <div className="flex justify-around items-center h-16">
        {primaryNavItems.map((item) => {
          if (!hasPermission(item)) return null;

          const isActive = currentView === item.view;
          
          return (
            <button
              key={item.view}
              onClick={() => handleNavClick(item.view)}
              className={`flex flex-col items-center justify-center flex-1 min-h-[60px] p-3 transition-all duration-200 ${
                isActive
                  ? 'text-brand-yellow scale-110'
                  : 'text-gray-600 dark:text-gray-400 hover:text-brand-yellow hover:scale-105'
              }`}
              aria-label={t(item.labelKey)}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={`transition-transform ${isActive ? 'scale-110' : ''}`}>
                <Icon name={item.icon} className="w-6 h-6 mb-1" aria-hidden="true" />
              </div>
              <span className={`text-xs font-medium transition-opacity ${
                isActive ? 'opacity-100' : 'opacity-80'
              }`}>
                {t(item.labelKey)}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-yellow animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavBar;
