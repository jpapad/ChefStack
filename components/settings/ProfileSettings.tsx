import React, { useState, useRef } from 'react';
import { User } from '../../types';
import { useTranslation } from '../../i18n';
import { Icon } from '../common/Icon';
import { useDarkMode } from '../../hooks/useDarkMode';
import { api } from '../../services/api';

interface ProfileSettingsProps {
    currentUser: User;
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    onLogout?: () => void;
}

type TabType = 'profile' | 'security' | 'preferences' | 'account';

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ currentUser, setUsers, onLogout }) => {
    const { t, language, setLanguage } = useTranslation();
    const [darkMode, setDarkMode] = useDarkMode();
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    
    // Profile tab state
    const [name, setName] = useState(currentUser.name);
    const [avatar, setAvatar] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Security tab state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    
    // Preferences state
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    
    const handleProfileSave = (e: React.FormEvent) => {
        e.preventDefault();
        setUsers(prevUsers => prevUsers.map(u => u.id === currentUser.id ? { ...u, name } : u));
        alert(t('profile_update_success'));
    };
    
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');
        
        if (newPassword.length < 6) {
            setPasswordError('Ο κωδικός πρέπει να είναι τουλάχιστον 6 χαρακτήρες.');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            setPasswordError('Οι κωδικοί δεν ταιριάζουν.');
            return;
        }
        
        setIsChangingPassword(true);
        try {
            await api.updatePassword(newPassword);
            setPasswordSuccess('Ο κωδικός ενημερώθηκε επιτυχώς!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setPasswordError(error.message || 'Αποτυχία ενημέρωσης κωδικού.');
        } finally {
            setIsChangingPassword(false);
        }
    };
    
    const handleLogoutAll = async () => {
        if (confirm('Είστε σίγουροι ότι θέλετε να αποσυνδεθείτε από όλες τις συσκευές;')) {
            try {
                await api.logout();
                if (onLogout) onLogout();
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
    };
    
    const handleDeleteAccount = () => {
        if (confirm('⚠️ ΠΡΟΣΟΧΗ: Αυτή η ενέργεια δεν μπορεί να αναιρεθεί. Θέλετε να διαγράψετε τον λογαριασμό σας;')) {
            alert('Η λειτουργία διαγραφής λογαριασμού θα υλοποιηθεί σύντομα.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Tabs Navigation */}
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl mb-6 overflow-hidden">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                            activeTab === 'profile'
                                ? 'bg-brand-yellow text-brand-dark border-b-2 border-brand-dark'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                        <Icon name="users" className="w-5 h-5 inline mr-2" />
                        Προφίλ
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                            activeTab === 'security'
                                ? 'bg-brand-yellow text-brand-dark border-b-2 border-brand-dark'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                        <Icon name="key" className="w-5 h-5 inline mr-2" />
                        Ασφάλεια
                    </button>
                    <button
                        onClick={() => setActiveTab('preferences')}
                        className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                            activeTab === 'preferences'
                                ? 'bg-brand-yellow text-brand-dark border-b-2 border-brand-dark'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                        <Icon name="settings" className="w-5 h-5 inline mr-2" />
                        Προτιμήσεις
                    </button>
                    <button
                        onClick={() => setActiveTab('account')}
                        className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                            activeTab === 'account'
                                ? 'bg-brand-yellow text-brand-dark border-b-2 border-brand-dark'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                        <Icon name="warning" className="w-5 h-5 inline mr-2" />
                        Λογαριασμός
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl">
                
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div>
                        <h2 className="text-2xl font-bold font-heading mb-6">Επεξεργασία Προφίλ</h2>
                        <form onSubmit={handleProfileSave} className="space-y-6">
                            {/* Avatar Upload */}
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full bg-brand-yellow flex items-center justify-center text-3xl font-bold text-brand-dark overflow-hidden">
                                        {avatar ? (
                                            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            currentUser.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 bg-brand-dark text-white rounded-full p-2 hover:opacity-90"
                                    >
                                        <Icon name="upload-cloud" className="w-4 h-4" />
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{currentUser.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{currentUser.email}</p>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-sm text-brand-dark hover:underline mt-1"
                                    >
                                        Αλλαγή φωτογραφίας
                                    </button>
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium mb-1">Ονοματεπώνυμο</label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={currentUser.email}
                                        disabled
                                        className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Το email δεν μπορεί να αλλάξει</p>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button type="submit" className="flex items-center gap-2 bg-brand-dark text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity">
                                    <Icon name="save" className="w-5 h-5" />
                                    <span className="font-semibold text-sm">Αποθήκευση Αλλαγών</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div>
                        <h2 className="text-2xl font-bold font-heading mb-6">Ασφάλεια & Κωδικός</h2>
                        
                        {/* Password Change */}
                        <form onSubmit={handlePasswordChange} className="space-y-6 mb-8">
                            <h3 className="text-lg font-semibold">Αλλαγή Κωδικού</h3>
                            
                            {passwordError && (
                                <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 p-3 rounded-lg">
                                    {passwordError}
                                </div>
                            )}
                            
                            {passwordSuccess && (
                                <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 p-3 rounded-lg">
                                    {passwordSuccess}
                                </div>
                            )}
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Τρέχων Κωδικός</label>
                                    <div className="relative">
                                        <input 
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="••••••••" 
                                            className="w-full p-2 pr-10 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600" 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            <Icon name={showCurrentPassword ? "eye-off" : "eye"} className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Νέος Κωδικός</label>
                                    <div className="relative">
                                        <input 
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••" 
                                            className="w-full p-2 pr-10 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600" 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            <Icon name={showNewPassword ? "eye-off" : "eye"} className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Τουλάχιστον 6 χαρακτήρες</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Επιβεβαίωση Κωδικού</label>
                                    <div className="relative">
                                        <input 
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••" 
                                            className="w-full p-2 pr-10 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600" 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            <Icon name={showConfirmPassword ? "eye-off" : "eye"} className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={isChangingPassword}
                                    className="flex items-center gap-2 bg-brand-dark text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {isChangingPassword && <Icon name="loader-2" className="w-5 h-5 animate-spin" />}
                                    <span className="font-semibold text-sm">Ενημέρωση Κωδικού</span>
                                </button>
                            </div>
                        </form>
                        
                        {/* Security Info */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h3 className="text-lg font-semibold mb-4">Πληροφορίες Ασφαλείας</h3>
                            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Icon name="check-circle-2" className="w-5 h-5 text-green-600" />
                                    <span>Τελευταία σύνδεση: Σήμερα</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Icon name="check-circle-2" className="w-5 h-5 text-green-600" />
                                    <span>Ενεργές συσκευές: 1</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                    <div>
                        <h2 className="text-2xl font-bold font-heading mb-6">Προτιμήσεις</h2>
                        
                        <div className="space-y-6">
                            {/* Language */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Γλώσσα</h3>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setLanguage('el')}
                                        className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                                            language === 'el'
                                                ? 'border-brand-yellow bg-brand-yellow/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-brand-yellow/50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <Icon name="globe" className="w-5 h-5" />
                                            <span className="font-semibold">Ελληνικά</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setLanguage('en')}
                                        className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                                            language === 'en'
                                                ? 'border-brand-yellow bg-brand-yellow/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-brand-yellow/50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <Icon name="globe" className="w-5 h-5" />
                                            <span className="font-semibold">English</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Theme */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Θέμα Εμφάνισης</h3>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDarkMode(false)}
                                        className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                                            !darkMode
                                                ? 'border-brand-yellow bg-brand-yellow/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-brand-yellow/50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <Icon name="sun" className="w-5 h-5" />
                                            <span className="font-semibold">Φωτεινό</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setDarkMode(true)}
                                        className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                                            darkMode
                                                ? 'border-brand-yellow bg-brand-yellow/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-brand-yellow/50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <Icon name="moon" className="w-5 h-5" />
                                            <span className="font-semibold">Σκοτεινό</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Notifications */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Ειδοποιήσεις</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                                        <div>
                                            <div className="font-medium">Push Notifications</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Λήψη ειδοποιήσεων στην οθόνη</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notificationsEnabled}
                                            onChange={(e) => setNotificationsEnabled(e.target.checked)}
                                            className="w-5 h-5"
                                        />
                                    </label>
                                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                                        <div>
                                            <div className="font-medium">Email Notifications</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Λήψη ειδοποιήσεων μέσω email</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={emailNotifications}
                                            onChange={(e) => setEmailNotifications(e.target.checked)}
                                            className="w-5 h-5"
                                        />
                                    </label>
                                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                                        <div>
                                            <div className="font-medium">Ήχοι</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Ενεργοποίηση ήχων για ενέργειες</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={soundEnabled}
                                            onChange={(e) => setSoundEnabled(e.target.checked)}
                                            className="w-5 h-5"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                    <div>
                        <h2 className="text-2xl font-bold font-heading mb-6">Διαχείριση Λογαριασμού</h2>
                        
                        <div className="space-y-6">
                            {/* Export Data */}
                            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">Εξαγωγή Δεδομένων</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Κατεβάστε όλα τα δεδομένα σας σε μορφή JSON
                                </p>
                                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    <Icon name="file-up" className="w-5 h-5" />
                                    <span>Εξαγωγή Δεδομένων</span>
                                </button>
                            </div>

                            {/* Logout All Devices */}
                            <div className="p-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">Αποσύνδεση από Όλες τις Συσκευές</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Αποσυνδέστε τον λογαριασμό σας από όλες τις συσκευές
                                </p>
                                <button 
                                    onClick={handleLogoutAll}
                                    className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                                >
                                    <Icon name="phone-off" className="w-5 h-5" />
                                    <span>Αποσύνδεση Παντού</span>
                                </button>
                            </div>

                            {/* Delete Account */}
                            <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2 text-red-700 dark:text-red-400">Διαγραφή Λογαριασμού</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    ⚠️ Προσοχή: Αυτή η ενέργεια δεν μπορεί να αναιρεθεί. Όλα τα δεδομένα σας θα διαγραφούν οριστικά.
                                </p>
                                <button 
                                    onClick={handleDeleteAccount}
                                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <Icon name="trash-2" className="w-5 h-5" />
                                    <span>Διαγραφή Λογαριασμού</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileSettings;
