// components/Header.tsx
import React, { useMemo, useState } from 'react';
import {
  User,
  Team,
  Notification,
  View
} from '../types';
import { useTranslation } from '../i18n';
import { Icon } from './common/Icon';
import KitchenAICoachModal from './common/KitchenAICoachModal';
import { useDarkMode } from '../hooks/useDarkMode';

interface HeaderProps {
  currentViewTitleKey: string;
  user: User;
  allTeams: Team[];
  currentTeamId: string;
  onSetCurrentTeam: (teamId: string) => void;
  notifications: Notification[];
  onViewChange: (view: View) => void;
  withApiKeyCheck: (action: () => void | Promise<void>) => void;
  aiGlobalContext?: string;
}

const Header: React.FC<HeaderProps> = ({
  currentViewTitleKey,
  user,
  allTeams,
  currentTeamId,
  onSetCurrentTeam,
  notifications,
  onViewChange,
  withApiKeyCheck,
  aiGlobalContext
}) => {
  // ALL HOOKS MUST BE CALLED IN THE SAME ORDER EVERY RENDER
  const { t } = useTranslation();
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  const [isCoachOpen, setIsCoachOpen] = useState(false);

  // useMemo hooks after useState/custom hooks
  const currentTeam = useMemo(
    () => allTeams.find((t) => t.id === currentTeamId),
    [allTeams, currentTeamId]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const currentViewTitle = useMemo(
    () => t(currentViewTitleKey),
    [t, currentViewTitleKey]
  );

  const handleOpenNotifications = () => {
    onViewChange('notifications');
  };

  return (
    <>
      <header className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border-b border-white/20 dark:border-slate-800/60">
        {/* Left: View title & team selector */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-heading font-semibold">
              {currentViewTitle}
            </h1>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
              {currentTeam?.name || 'Χωρίς ομάδα'}
            </p>
          </div>

          {/* Team selector (αν έχεις πολλές ομάδες) */}
          {allTeams.length > 1 && (
            <select
              value={currentTeamId}
              onChange={(e) => onSetCurrentTeam(e.target.value)}
              className="text-xs border rounded px-2 py-1 bg-white dark:bg-slate-900"
            >
              {allTeams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Right: Dark mode toggle, AI button, notifications, user */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <Icon name="sun" className="w-5 h-5 text-yellow-500" />
            ) : (
              <Icon name="moon" className="w-5 h-5 text-slate-700" />
            )}
          </button>

          {/* Kitchen AI button */}
          <button
            type="button"
            onClick={() => setIsCoachOpen(true)}
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full border border-purple-400 text-purple-700 text-xs font-semibold hover:bg-purple-50 dark:border-purple-500 dark:text-purple-200 dark:hover:bg-purple-500/10 transition-colors"
          >
            <Icon
              name="sparkles"
              className="w-4 h-4 text-purple-500 dark:text-purple-300"
            />
            <span>Kitchen AI</span>
          </button>

          {/* Notifications */}
          <button
            type="button"
            onClick={handleOpenNotifications}
            className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Ειδοποιήσεις"
          >
            <Icon name="bell" className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User avatar / info */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold">
                {user.name || user.email}
              </span>
              <span className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary">
                {user.email}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-yellow to-amber-500 flex items-center justify-center text-sm font-bold text-black shadow-md">
              {user.name?.[0]?.toUpperCase() ||
                user.email?.[0]?.toUpperCase() ||
                '?'}
            </div>
          </div>
        </div>
      </header>

      {/* Kitchen AI Coach Modal */}
      <KitchenAICoachModal
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        withApiKeyCheck={withApiKeyCheck}
        aiGlobalContext={aiGlobalContext}
        currentViewTitle={currentViewTitle}
        userName={user.name || user.email}
        teamName={currentTeam?.name}
      />
    </>
  );
};

export default Header;
