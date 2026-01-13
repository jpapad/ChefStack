import React, { useState, useEffect } from 'react';
import { User, Team, Role, ROLE_PERMISSIONS, ROLE_LABELS, Permission, DEFAULT_ROLES, DefaultRole } from '../../types';
import { useTranslation } from '../../i18n';
import { Icon } from '../common/Icon';
import { api } from '../../services/api';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface UserManagementProps {
    currentUser: User;
    allUsers: User[];
    setAllUsers: React.Dispatch<React.SetStateAction<User[]>>;
    allTeams: Team[];
    currentTeamId: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ 
    currentUser, 
    allUsers, 
    setAllUsers, 
    allTeams,
    currentTeamId 
}) => {
    const { t, language } = useTranslation();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role>('Cook');
    
    // Custom roles loaded from database
    const [customRoles, setCustomRoles] = useState<string[]>([]);
    const [isLoadingRoles, setIsLoadingRoles] = useState(true);
    const [isAddingNewRole, setIsAddingNewRole] = useState(false);
    
    // Combine default and custom roles
    const allRoles = [...DEFAULT_ROLES, ...customRoles];
    
    // Add user form state
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserName, setNewUserName] = useState('');
    const [newUserRole, setNewUserRole] = useState<Role>('Cook');
    const [addUserError, setAddUserError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load team roles on mount
    useEffect(() => {
        const loadRoles = async () => {
            try {
                setIsLoadingRoles(true);
                const roles = await api.fetchTeamRoles(currentTeamId);
                const custom = roles.filter(r => !DEFAULT_ROLES.includes(r as DefaultRole));
                setCustomRoles(custom);
            } catch (error) {
                console.error('[UserManagement] Error loading roles:', error);
            } finally {
                setIsLoadingRoles(false);
            }
        };

        loadRoles();
    }, [currentTeamId]);

    // Check if current user is admin
    const currentUserMembership = currentUser.memberships.find(m => m.teamId === currentTeamId);
    const isAdmin = currentUserMembership?.role === 'Admin';

    if (!isAdmin) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-2xl">
                    <Icon name="warning" className="w-8 h-8 text-red-600 mb-2" />
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Μη Εξουσιοδοτημένη Πρόσβαση</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Μόνο οι διαχειριστές μπορούν να δουν αυτή τη σελίδα.
                    </p>
                </div>
            </div>
        );
    }

    // Get team users
    const teamUsers = allUsers.filter(u => 
        u.memberships.some(m => m.teamId === currentTeamId)
    );

    // Filter by search
    const filteredUsers = teamUsers.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRoleChange = (userId: string, newRole: Role) => {
        setAllUsers(prev => prev.map(u => {
            if (u.id === userId) {
                return {
                    ...u,
                    memberships: u.memberships.map(m =>
                        m.teamId === currentTeamId ? { ...m, role: newRole } : m
                    )
                };
            }
            return u;
        }));
    };

    const handleRemoveUser = (userId: string) => {
        if (userId === currentUser.id) {
            alert('Δεν μπορείτε να αφαιρέσετε τον εαυτό σας!');
            return;
        }
        
        if (confirm('Είστε σίγουροι ότι θέλετε να αφαιρέσετε αυτόν τον χρήστη από την ομάδα;')) {
            setAllUsers(prev => prev.map(u => {
                if (u.id === userId) {
                    return {
                        ...u,
                        memberships: u.memberships.filter(m => m.teamId !== currentTeamId)
                    };
                }
                return u;
            }));
        }
    };

    const handleAddUser = async () => {
        setAddUserError('');
        setIsSubmitting(true);
        
        // Validation
        if (!newUserEmail || !newUserName) {
            setAddUserError('Παρακαλώ συμπληρώστε όλα τα πεδία.');
            setIsSubmitting(false);
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newUserEmail)) {
            setAddUserError('Παρακαλώ εισάγετε έγκυρη διεύθυνση email.');
            setIsSubmitting(false);
            return;
        }

        try {
            // Invite user - this creates auth account and sends email
            const result = await api.inviteUserToTeam(
                newUserName.trim(),
                newUserEmail.trim().toLowerCase(),
                currentTeamId,
                newUserRole
            );

            // Update local state
            const existingUserIndex = allUsers.findIndex(u => u.id === result.user.id);
            if (existingUserIndex >= 0) {
                // Update existing user
                setAllUsers(prev => prev.map(u => u.id === result.user.id ? result.user : u));
            } else {
                // Add new user
                setAllUsers(prev => [...prev, result.user]);
            }

            // Show success message
            if (result.invited) {
                alert(`Επιτυχής πρόσκληση! Στάλθηκε email επιβεβαίωσης στο ${newUserEmail}`);
            } else {
                alert(`Ο χρήστης προστέθηκε στην ομάδα.\n\nΣημείωση: Δεν στάλθηκε email πρόσκλησης. Ο χρήστης θα χρειαστεί να εγγραφεί χειροκίνητα.`);
            }
            
            // Reset form and close modal
            setNewUserEmail('');
            setNewUserName('');
            setNewUserRole('Cook');
            setShowAddUserModal(false);
        } catch (error: any) {
            console.error('[UserManagement] Error inviting user:', error);
            setAddUserError(error.message || 'Αποτυχία πρόσκλησης χρήστη. Παρακαλώ δοκιμάστε ξανά.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const showPermissions = (user: User) => {
        setSelectedUser(user);
        const membership = user.memberships.find(m => m.teamId === currentTeamId);
        if (membership) {
            setSelectedRole(membership.role);
            setShowPermissionsModal(true);
        }
    };

    const currentTeam = allTeams.find(t => t.id === currentTeamId);

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold font-heading">Διαχείριση Χρηστών</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Ομάδα: {currentTeam?.name} • {teamUsers.length} χρήστες
                        </p>
                    </div>
                    <button 
                        onClick={() => setShowAddUserModal(true)}
                        className="flex items-center gap-2 bg-brand-yellow text-brand-dark px-4 py-2 rounded-full hover:opacity-90 transition-opacity font-semibold"
                    >
                        <Icon name="plus" className="w-5 h-5" />
                        Προσθήκη Χρήστη
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Icon name="search" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Αναζήτηση χρηστών..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                    />
                </div>
            </div>

            {/* Users List */}
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Χρήστης
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Ρόλος
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Δικαιώματα
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Ενέργειες
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredUsers.map(user => {
                                const membership = user.memberships.find(m => m.teamId === currentTeamId);
                                const role = membership?.role || 'Cook';
                                const isDefaultRole = DEFAULT_ROLES.includes(role as DefaultRole);
                                const roleInfo = isDefaultRole ? ROLE_LABELS[role as DefaultRole] : null;
                                const permissions = isDefaultRole ? ROLE_PERMISSIONS[role as DefaultRole] : [];

                                return (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center text-brand-dark font-bold mr-3">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{user.name}</div>
                                                    {user.id === currentUser.id && (
                                                        <span className="text-xs text-gray-500">(Εσείς)</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                                                disabled={user.id === currentUser.id}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    roleInfo?.color || 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200'
                                                } ${
                                                    user.id === currentUser.id ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                                                }`}
                                            >
                                                {DEFAULT_ROLES.map(r => (
                                                    <option key={r} value={r}>
                                                        {language === 'el' ? ROLE_LABELS[r as DefaultRole].el : ROLE_LABELS[r as DefaultRole].en}
                                                    </option>
                                                ))}
                                                {customRoles.map(r => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => showPermissions(user)}
                                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                            >
                                                <Icon name="key" className="w-4 h-4" />
                                                {permissions.length} δικαιώματα
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            {user.id !== currentUser.id && (
                                                <button
                                                    onClick={() => handleRemoveUser(user.id)}
                                                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                                                    title="Αφαίρεση από ομάδα"
                                                >
                                                    <Icon name="trash-2" className="w-5 h-5" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Permissions Modal */}
            {showPermissionsModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold">Δικαιώματα Χρήστη</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {selectedUser.name} • {language === 'el' ? ROLE_LABELS[selectedRole].el : ROLE_LABELS[selectedRole].en}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowPermissionsModal(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <Icon name="x" className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 overflow-y-auto max-h-[calc(80vh-160px)]">
                            <div className="grid grid-cols-2 gap-3">
                                {ROLE_PERMISSIONS[selectedRole].map(permission => {
                                    const permissionLabels: Record<Permission, { el: string; en: string; icon: any }> = {
                                        'view_dashboard': { el: 'Προβολή Dashboard', en: 'View Dashboard', icon: 'layout-dashboard' },
                                        'view_recipes': { el: 'Προβολή Συνταγών', en: 'View Recipes', icon: 'book-open' },
                                        'edit_recipes': { el: 'Επεξεργασία Συνταγών', en: 'Edit Recipes', icon: 'edit' },
                                        'delete_recipes': { el: 'Διαγραφή Συνταγών', en: 'Delete Recipes', icon: 'trash-2' },
                                        'view_inventory': { el: 'Προβολή Αποθήκης', en: 'View Inventory', icon: 'package' },
                                        'edit_inventory': { el: 'Επεξεργασία Αποθήκης', en: 'Edit Inventory', icon: 'edit' },
                                        'view_menu': { el: 'Προβολή Μενού', en: 'View Menu', icon: 'clipboard-list' },
                                        'edit_menu': { el: 'Επεξεργασία Μενού', en: 'Edit Menu', icon: 'edit' },
                                        'view_haccp': { el: 'Προβολή HACCP', en: 'View HACCP', icon: 'thermometer' },
                                        'edit_haccp': { el: 'Επεξεργασία HACCP', en: 'Edit HACCP', icon: 'edit' },
                                        'view_suppliers': { el: 'Προβολή Προμηθευτών', en: 'View Suppliers', icon: 'truck' },
                                        'edit_suppliers': { el: 'Επεξεργασία Προμηθευτών', en: 'Edit Suppliers', icon: 'edit' },
                                        'view_waste': { el: 'Προβολή Απορριμμάτων', en: 'View Waste', icon: 'trash-2' },
                                        'edit_waste': { el: 'Επεξεργασία Απορριμμάτων', en: 'Edit Waste', icon: 'edit' },
                                        'view_costing': { el: 'Προβολή Κοστολόγησης', en: 'View Costing', icon: 'scale' },
                                        'edit_costing': { el: 'Επεξεργασία Κοστολόγησης', en: 'Edit Costing', icon: 'edit' },
                                        'view_shifts': { el: 'Προβολή Βαρδιών', en: 'View Shifts', icon: 'calendar' },
                                        'edit_shifts': { el: 'Επεξεργασία Βαρδιών', en: 'Edit Shifts', icon: 'edit' },
                                        'view_reports': { el: 'Προβολή Αναφορών', en: 'View Reports', icon: 'clipboard-check' },
                                        'manage_users': { el: 'Διαχείριση Χρηστών', en: 'Manage Users', icon: 'users' },
                                        'manage_team_settings': { el: 'Ρυθμίσεις Ομάδας', en: 'Team Settings', icon: 'settings' },
                                        'view_pos': { el: 'Προβολή POS', en: 'View POS', icon: 'shopping-cart' },
                                        'manage_pos': { el: 'Διαχείριση POS', en: 'Manage POS', icon: 'settings' }
                                    };

                                    const label = permissionLabels[permission];
                                    return (
                                        <div
                                            key={permission}
                                            className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                                        >
                                            <Icon name="check-circle-2" className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                            <span className="text-sm font-medium">
                                                {language === 'el' ? label.el : label.en}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <button
                                onClick={() => setShowPermissionsModal(false)}
                                className="w-full bg-brand-dark text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity font-semibold"
                            >
                                Κλείσιμο
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {showAddUserModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold">Προσθήκη Χρήστη</h3>
                                <button
                                    onClick={() => {
                                        setShowAddUserModal(false);
                                        setAddUserError('');
                                        setNewUserEmail('');
                                        setNewUserName('');
                                        setNewUserRole('Cook');
                                    }}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <Icon name="x" className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {addUserError && (
                                <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 p-3 rounded-lg mb-4">
                                    {addUserError}
                                </div>
                            )}
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Ονοματεπώνυμο</label>
                                    <input
                                        type="text"
                                        value={newUserName}
                                        onChange={(e) => setNewUserName(e.target.value)}
                                        placeholder="π.χ. Γιώργος Παπαδόπουλος"
                                        className="w-full p-2 rounded-lg bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={newUserEmail}
                                        onChange={(e) => setNewUserEmail(e.target.value)}
                                        placeholder="π.χ. user@example.com"
                                        className="w-full p-2 rounded-lg bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Ρόλος</label>
                                    
                                    {isAddingNewRole ? (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={newUserRole}
                                                onChange={(e) => setNewUserRole(e.target.value)}
                                                placeholder="Όνομα νέου ρόλου (π.χ. Pastry Chef)"
                                                className="w-full p-2 rounded-lg bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                                                autoFocus
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={async () => {
                                                        if (newUserRole.trim() && !allRoles.includes(newUserRole.trim())) {
                                                            try {
                                                                await api.createTeamRole(currentTeamId, newUserRole.trim());
                                                                setCustomRoles([...customRoles, newUserRole.trim()]);
                                                                setIsAddingNewRole(false);
                                                            } catch (error: any) {
                                                                alert(error.message || 'Αποτυχία δημιουργίας ρόλου');
                                                            }
                                                        }
                                                    }}
                                                    className="text-sm px-3 py-1 bg-brand-yellow text-brand-dark rounded-lg hover:opacity-90"
                                                >
                                                    <Icon name="check" className="w-4 h-4 inline mr-1" />
                                                    Αποθήκευση
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsAddingNewRole(false);
                                                        setNewUserRole('Cook');
                                                    }}
                                                    className="text-sm px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:opacity-90"
                                                >
                                                    <Icon name="x" className="w-4 h-4 inline mr-1" />
                                                    Ακύρωση
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <select
                                                value={newUserRole}
                                                onChange={(e) => setNewUserRole(e.target.value as Role)}
                                                className="w-full p-2 rounded-lg bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                                            >
                                                {DEFAULT_ROLES.map(role => (
                                                    <option key={role} value={role}>
                                                        {language === 'el' ? ROLE_LABELS[role as DefaultRole].el : ROLE_LABELS[role as DefaultRole].en}
                                                    </option>
                                                ))}
                                                {customRoles.map(role => (
                                                    <option key={role} value={role}>
                                                        {role}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => {
                                                    setNewUserRole('');
                                                    setIsAddingNewRole(true);
                                                }}
                                                className="text-sm text-brand-yellow hover:underline flex items-center gap-1"
                                            >
                                                <Icon name="plus" className="w-4 h-4" />
                                                Προσθήκη νέου ρόλου
                                            </button>
                                        </div>
                                    )}
                                    
                                    <p className="text-xs text-gray-500 mt-1">
                                        {DEFAULT_ROLES.includes(newUserRole as DefaultRole) 
                                            ? `${ROLE_PERMISSIONS[newUserRole as DefaultRole]?.length || 0} δικαιώματα`
                                            : 'Προσαρμοσμένος ρόλος - ορίστε δικαιώματα μετά'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowAddUserModal(false);
                                    setAddUserError('');
                                    setNewUserEmail('');
                                    setNewUserName('');
                                    setNewUserRole('Cook');
                                }}
                                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-full hover:opacity-90 transition-opacity font-semibold"
                            >
                                Ακύρωση
                            </button>
                            <button
                                onClick={handleAddUser}
                                disabled={isSubmitting}
                                className="flex-1 bg-brand-yellow text-brand-dark px-6 py-2 rounded-full hover:opacity-90 transition-opacity font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Icon name="loader-2" className="w-4 h-4 mr-2 animate-spin" />
                                        Αποθήκευση...
                                    </>
                                ) : (
                                    'Προσθήκη'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
