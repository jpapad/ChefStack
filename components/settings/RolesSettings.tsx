import React from 'react';
import { Role, RolePermissions, ALL_PERMISSIONS, PERMISSION_DESCRIPTIONS } from '../../types';
import { useTranslation } from '../../i18n';
import { Icon } from '../common/Icon';

interface RolesSettingsProps {
    rolePermissions: RolePermissions;
    setRolePermissions: React.Dispatch<React.SetStateAction<RolePermissions>>;
}

const RolesSettings: React.FC<RolesSettingsProps> = ({ rolePermissions, setRolePermissions }) => {
    const { t, language } = useTranslation();

    const handlePermissionChange = (role: Role, permission: typeof ALL_PERMISSIONS[0], checked: boolean) => {
        if (role === 'Admin') return; // Admins cannot be changed

        setRolePermissions(prev => {
            const currentPermissions = prev[role] || [];
            const newPermissions = checked
                ? [...currentPermissions, permission]
                : currentPermissions.filter(p => p !== permission);
            return { ...prev, [role]: newPermissions };
        });
    };

    const rolesToManage: Role[] = ['Sous Chef', 'Cook'];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold font-heading mb-2">{t('roles_title')}</h2>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">{t('roles_description')}</p>
                
                <div className="space-y-8">
                    {/* Admin Role (Display Only) */}
                    <div>
                        <h3 className="text-xl font-semibold mb-3">Admin</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {ALL_PERMISSIONS.map(permission => (
                                <label key={`admin-${permission}`} className="flex items-center gap-3 p-3 bg-black/5 dark:bg-white/10 rounded-lg cursor-not-allowed opacity-60">
                                    <input type="checkbox" checked readOnly disabled className="h-5 w-5 rounded border-gray-300 text-brand-secondary focus:ring-brand-primary" />
                                    <span>{PERMISSION_DESCRIPTIONS[permission][language]}</span>
                                </label>
                            ))}
                        </div>
                        <p className="text-xs italic text-light-text-secondary dark:text-dark-text-secondary mt-2">{t('roles_admin_note')}</p>
                    </div>

                    {/* Other Roles */}
                    {rolesToManage.map(role => (
                        <div key={role}>
                            <h3 className="text-xl font-semibold mb-3">{role}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {ALL_PERMISSIONS.map(permission => (
                                    <label key={`${role}-${permission}`} className="flex items-center gap-3 p-3 bg-black/5 dark:bg-white/10 rounded-lg cursor-pointer hover:bg-black/10 dark:hover:bg-white/20">
                                        <input
                                            type="checkbox"
                                            checked={rolePermissions[role]?.includes(permission)}
                                            onChange={(e) => handlePermissionChange(role, permission, e.target.checked)}
                                            className="h-5 w-5 rounded border-gray-300 text-brand-secondary focus:ring-brand-primary"
                                        />
                                        <span>{PERMISSION_DESCRIPTIONS[permission][language]}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RolesSettings;
