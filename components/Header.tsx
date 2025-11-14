import React, { useState } from 'react';
import { Icon } from './common/Icon';
import { useDarkMode } from '../hooks/useDarkMode';
import { View, User, Team, Notification } from '../types';
import { useTranslation } from '../i18n';

interface HeaderProps {
  currentViewTitleKey: string;
  user: User;
  allTeams: Team[];
  currentTeamId: string;
  onSetCurrentTeam: (teamId: string) => void;
  notifications: Notification[];
  onViewChange: (view: View) => void; // For notification bell click
}

const Header: React.FC<HeaderProps> = ({ currentViewTitleKey, user, allTeams, currentTeamId, onSetCurrentTeam, notifications, onViewChange }) => {
    const { language, setLanguage, t } = useTranslation();
    const [isDarkMode, toggleDarkMode] = useDarkMode();
    const [isTeamMenuOpen, setIsTeamMenuOpen] = useState(false);
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

    const currentTeam = allTeams.find(t => t.id === currentTeamId);
    const unreadCount = notifications.filter(n => !n.read).length;
    
    return (
        <header className="flex-shrink-0 px-4 sm:px-6 py-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border-b border-white/20 dark:border-slate-800/40 print:hidden z-20">
            <div className="flex justify-between items-center">
                {/* Left Side: View Title */}
                <h1 className="text-2xl font-bold font-heading text-light-text-primary dark:text-dark-text-primary">
                    {t(currentViewTitleKey)}
                </h1>

                {/* Right Side: Actions */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Language Switcher */}
                    <div className="relative">
                        <button onClick={() => setIsLangMenuOpen(p => !p)} className="p-2 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/5 dark:hover:bg-white/5" title="Change Language">
                            <Icon name="globe" className="w-5 h-5"/>
                        </button>
                        {isLangMenuOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-lg shadow-lg py-1 z-40">
                            <button onClick={() => { setLanguage('el'); setIsLangMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm ${language === 'el' ? 'font-bold text-brand-yellow' : ''}`}>Ελληνικά</button>
                            <button onClick={() => { setLanguage('en'); setIsLangMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm ${language === 'en' ? 'font-bold text-brand-yellow' : ''}`}>English</button>
                       </div>
                        )}
                    </div>
                    
                    <button onClick={toggleDarkMode} className="p-2 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/5 dark:hover:bg-white/5">
                        <Icon name={isDarkMode ? 'sun' : 'moon'} className="w-5 h-5"/>
                    </button>
                    {/* Notification Bell */}
                    <button 
                        onClick={() => onViewChange('notifications')} 
                        className="relative p-2 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/5 dark:hover:bg-white/5"
                        title={t('nav_notifications')}
                    >
                        <Icon name="bell" className="w-5 h-5"/>
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"/>
                        )}
                    </button>
                    {/* Team Switcher */}
                    {user.memberships.length > 1 && (
                        <div className="relative">
                            <button onClick={() => setIsTeamMenuOpen(p => !p)} className="flex items-center gap-2 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 font-semibold">
                                <Icon name="users" className="w-5 h-5" />
                                <span className="hidden md:inline">{currentTeam?.name}</span>
                            </button>
                            {isTeamMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-lg shadow-lg py-1 z-40">
                                {user.memberships.map(membership => {
                                    const team = allTeams.find(t => t.id === membership.teamId);
                                    if (!team) return null;
                                    return (
                                        <button 
                                            key={team.id} 
                                            onClick={() => { onSetCurrentTeam(team.id); setIsTeamMenuOpen(false); }} 
                                            className={`w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-light-text-primary dark:text-dark-text-primary hover:bg-black/5 dark:hover:bg-white/10 ${team.id === currentTeamId ? 'font-bold' : ''}`}
                                        >
                                            {team.name}
                                        </button>
                                    )
                                })}
                           </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
