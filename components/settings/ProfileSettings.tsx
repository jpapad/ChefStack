import React, { useState } from 'react';
import { User } from '../../types';
import { useTranslation } from '../../i18n';
import { Icon } from '../common/Icon';

interface ProfileSettingsProps {
    currentUser: User;
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ currentUser, setUsers }) => {
    const { t } = useTranslation();
    const [name, setName] = useState(currentUser.name);
    
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setUsers(prevUsers => prevUsers.map(u => u.id === currentUser.id ? { ...u, name } : u));
        alert(t('profile_update_success'));
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold font-heading mb-6">{t('profile_title')}</h2>
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-1">{t('profile_name')}</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1">{t('profile_email')}</label>
                            <input
                                id="email"
                                type="email"
                                value={currentUser.email}
                                disabled
                                className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Password Change */}
                    <div className="pt-6 border-t border-gray-200/80 dark:border-gray-700/80">
                         <h3 className="text-lg font-semibold mb-4">{t('profile_password_change')}</h3>
                         <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('profile_current_password')}</label>
                                <input type="password" placeholder="••••••••" className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">{t('profile_new_password')}</label>
                                <input type="password" placeholder="••••••••" className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">{t('profile_confirm_password')}</label>
                                <input type="password" placeholder="••••••••" className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600" />
                            </div>
                         </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" className="flex items-center gap-2 bg-brand-dark text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity">
                            <Icon name="save" className="w-5 h-5" />
                            <span className="font-semibold text-sm">{t('profile_save_changes')}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileSettings;
