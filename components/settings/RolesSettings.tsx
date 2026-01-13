import React, { useState, useEffect } from 'react';
import { Role, RolePermissions, ALL_PERMISSIONS, PERMISSION_DESCRIPTIONS, DEFAULT_ROLES, DefaultRole } from '../../types';
import { useTranslation } from '../../i18n';
import { Icon } from '../common/Icon';
import { api } from '../../services/api';

interface RolesSettingsProps {
    rolePermissions: RolePermissions;
    setRolePermissions: React.Dispatch<React.SetStateAction<RolePermissions>>;
    currentTeamId: string;
}

const RolesSettings: React.FC<RolesSettingsProps> = ({ rolePermissions, setRolePermissions, currentTeamId }) => {
    const { t, language } = useTranslation();
    const [customRoles, setCustomRoles] = useState<string[]>([]);
    const [isAddingRole, setIsAddingRole] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [expandedRole, setExpandedRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch team roles and permissions on mount
    useEffect(() => {
        const loadRolesAndPermissions = async () => {
            try {
                setIsLoading(true);
                
                // Initialize default roles if needed
                await api.initializeDefaultRoles(currentTeamId);
                
                // Fetch all roles for this team
                const roles = await api.fetchTeamRoles(currentTeamId);
                const custom = roles.filter(r => !DEFAULT_ROLES.includes(r as DefaultRole));
                setCustomRoles(custom);

                // Fetch permissions for each role
                const newPermissions: RolePermissions = {};
                for (const role of roles) {
                    const permissions = await api.fetchRolePermissions(currentTeamId, role);
                    newPermissions[role] = permissions as any[];
                }
                setRolePermissions(newPermissions);
            } catch (error) {
                console.error('[RolesSettings] Error loading roles:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadRolesAndPermissions();
    }, [currentTeamId]);

    const allRoles = [...DEFAULT_ROLES, ...customRoles];

    const handleAddRole = async () => {
        if (newRoleName.trim() && !allRoles.includes(newRoleName.trim())) {
            try {
                await api.createTeamRole(currentTeamId, newRoleName.trim());
                setCustomRoles([...customRoles, newRoleName.trim()]);
                setRolePermissions(prev => ({ ...prev, [newRoleName.trim()]: [] }));
                setNewRoleName('');
                setIsAddingRole(false);
            } catch (error: any) {
                alert(error.message || 'Αποτυχία δημιουργίας ρόλου');
            }
        }
    };

    const handleDeleteRole = async (role: string) => {
        if (DEFAULT_ROLES.includes(role as DefaultRole)) return; // Can't delete default roles
        if (confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε τον ρόλο "${role}";`)) {
            try {
                await api.deleteTeamRole(currentTeamId, role);
                setCustomRoles(customRoles.filter(r => r !== role));
                setRolePermissions(prev => {
                    const newPerms = { ...prev };
                    delete newPerms[role];
                    return newPerms;
                });
            } catch (error: any) {
                alert(error.message || 'Αποτυχία διαγραφής ρόλου');
            }
        }
    };

    const handlePermissionChange = async (role: Role, permission: typeof ALL_PERMISSIONS[0], checked: boolean) => {
        if (role === 'Admin') return; // Admins cannot be changed

        const currentPermissions = rolePermissions[role] || [];
        const newPermissions = checked
            ? [...currentPermissions, permission]
            : currentPermissions.filter(p => p !== permission);
        
        // Update local state immediately for responsiveness
        setRolePermissions(prev => ({ ...prev, [role]: newPermissions }));

        // Save to database
        try {
            await api.updateRolePermissions(currentTeamId, role, newPermissions);
        } catch (error: any) {
            console.error('[RolesSettings] Error updating permissions:', error);
            // Revert on error
            setRolePermissions(prev => ({ ...prev, [role]: currentPermissions }));
            alert(error.message || 'Αποτυχία ενημέρωσης δικαιωμάτων');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Icon name="loader-2" className="w-8 h-8 animate-spin text-brand-yellow" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold font-heading mb-1">{t('roles_title')}</h2>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">{t('roles_description')}</p>
                    </div>
                    <button
                        onClick={() => setIsAddingRole(true)}
                        className="bg-brand-yellow text-brand-dark px-4 py-2 rounded-full hover:opacity-90 transition-opacity font-semibold flex items-center gap-2"
                    >
                        <Icon name="plus" className="w-5 h-5" />
                        Νέος Ρόλος
                    </button>
                </div>

                {/* Add New Role Form */}
                {isAddingRole && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 p-4 rounded-lg mb-6">
                        <h3 className="font-semibold mb-3">Δημιουργία Νέου Ρόλου</h3>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={newRoleName}
                                onChange={(e) => setNewRoleName(e.target.value)}
                                placeholder="Όνομα ρόλου (π.χ. Pastry Chef)"
                                className="flex-1 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                                autoFocus
                            />
                            <button
                                onClick={handleAddRole}
                                disabled={!newRoleName.trim() || allRoles.includes(newRoleName.trim())}
                                className="bg-brand-yellow text-brand-dark px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                            >
                                <Icon name="check" className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => {
                                    setIsAddingRole(false);
                                    setNewRoleName('');
                                }}
                                className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:opacity-90"
                            >
                                <Icon name="x" className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
                
                <div className="space-y-4">
                    {allRoles.map(role => {
                        const isDefaultRole = DEFAULT_ROLES.includes(role as DefaultRole);
                        const isAdmin = role === 'Admin';
                        const isExpanded = expandedRole === role;
                        const permissionCount = rolePermissions[role]?.length || 0;

                        return (
                            <div key={role} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                {/* Role Header */}
                                <div
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => setExpandedRole(isExpanded ? null : role)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon
                                            name={isExpanded ? 'chevron-down' : 'chevron-right'}
                                            className="w-5 h-5 text-gray-500"
                                        />
                                        <div>
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                {role}
                                                {isAdmin && <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 px-2 py-1 rounded">Διαχειριστής</span>}
                                                {!isDefaultRole && <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 px-2 py-1 rounded">Προσαρμοσμένος</span>}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {isAdmin ? 'Όλα τα δικαιώματα' : `${permissionCount} από ${ALL_PERMISSIONS.length} δικαιώματα`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!isDefaultRole && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteRole(role);
                                                }}
                                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2"
                                                title="Διαγραφή ρόλου"
                                            >
                                                <Icon name="trash-2" className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Permissions Grid */}
                                {isExpanded && (
                                    <div className="p-4 bg-white dark:bg-gray-900/30">
                                        {isAdmin ? (
                                            <div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                                    {ALL_PERMISSIONS.map(permission => (
                                                        <label key={`${role}-${permission}`} className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-not-allowed opacity-60">
                                                            <input type="checkbox" checked readOnly disabled className="h-5 w-5 rounded border-gray-300" />
                                                            <span className="text-sm">{PERMISSION_DESCRIPTIONS[permission][language]}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                                <p className="text-xs italic text-gray-500 dark:text-gray-400">
                                                    {t('roles_admin_note')}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {ALL_PERMISSIONS.map(permission => (
                                                    <label key={`${role}-${permission}`} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                                                        <input
                                                            type="checkbox"
                                                            checked={rolePermissions[role]?.includes(permission) || false}
                                                            onChange={(e) => handlePermissionChange(role, permission, e.target.checked)}
                                                            className="h-5 w-5 rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
                                                        />
                                                        <span className="text-sm">{PERMISSION_DESCRIPTIONS[permission][language]}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default RolesSettings;
