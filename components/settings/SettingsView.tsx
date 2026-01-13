import React, { useState, useMemo } from 'react';
import { Team, User, Role, RolePermissions, InventoryLocation, HaccpItem } from '../../types';
import { Icon } from '../common/Icon';
import TeamMembers from './TeamMembers';
import TeamForm from './TeamForm';
import ConfirmationModal from '../common/ConfirmationModal';
import ProfileSettings from './ProfileSettings';
import RolesSettings from './RolesSettings';
import UserManagement from './UserManagement';
import { useTranslation } from '../../i18n';
import WorkspaceSettings from './WorkspaceSettings';

interface SettingsViewProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  currentUser: User;
  currentTeamId: string;
  rolePermissions: RolePermissions;
  setRolePermissions: React.Dispatch<React.SetStateAction<RolePermissions>>;
  inventoryLocations: InventoryLocation[];
  setInventoryLocations: React.Dispatch<React.SetStateAction<InventoryLocation[]>>;
  haccpItems: HaccpItem[];
  setHaccpItems: React.Dispatch<React.SetStateAction<HaccpItem[]>>;
}

type SettingsTab = 'profile' | 'teams' | 'users' | 'roles' | 'workspace';

const SettingsView: React.FC<SettingsViewProps> = ({ users, setUsers, teams, setTeams, currentUser, currentTeamId, rolePermissions, setRolePermissions, inventoryLocations, setInventoryLocations, haccpItems, setHaccpItems }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const currentUserRole = useMemo(() => 
    currentUser.memberships.find(m => m.teamId === currentTeamId)?.role,
    [currentUser, currentTeamId]
  );
  
  const isAdmin = currentUserRole === 'Admin';
  const canManageTeam = currentUserRole ? rolePermissions[currentUserRole]?.includes('manage_team') : false;

  const TabButton: React.FC<{ tabId: SettingsTab, labelKey: string, iconName?: string }> = ({ tabId, labelKey, iconName }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-2 font-semibold text-sm rounded-t-lg border-b-2 transition-all flex items-center gap-2 ${
        activeTab === tabId
          ? 'border-brand-yellow text-light-text-primary dark:text-dark-text-primary'
          : 'border-transparent text-light-text-secondary dark:text-dark-text-secondary hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      {iconName && <Icon name={iconName} className="w-4 h-4" />}
      {t(labelKey)}
    </button>
  );

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center gap-2 border-b border-gray-200/80 dark:border-gray-700/80 overflow-x-auto">
        <TabButton tabId="profile" labelKey="nav_settings_profile" iconName="user" />
        <TabButton tabId="teams" labelKey="nav_settings_teams" iconName="users" />
        {isAdmin && <TabButton tabId="users" labelKey="nav_settings_users" iconName="user-plus" />}
        {(isAdmin || canManageTeam) && <TabButton tabId="roles" labelKey="nav_settings_roles" iconName="shield" />}
        {(isAdmin || canManageTeam) && <TabButton tabId="workspace" labelKey="nav_settings_workspace" iconName="settings" />}
      </div>

      <div className="flex-1 min-h-0">
        {activeTab === 'profile' && (
          <ProfileSettings currentUser={currentUser} setUsers={setUsers} />
        )}

        {activeTab === 'teams' && (
          <TeamManagement 
            users={users}
            setUsers={setUsers}
            teams={teams}
            setTeams={setTeams}
            currentUser={currentUser}
            currentTeamId={currentTeamId}
            rolePermissions={rolePermissions}
          />
        )}

        {activeTab === 'users' && isAdmin && (
          <UserManagement
            currentUser={currentUser}
            allUsers={users}
            setAllUsers={setUsers}
            allTeams={teams}
            currentTeamId={currentTeamId}
          />
        )}
        
        {activeTab === 'roles' && (isAdmin || canManageTeam) && (
          <RolesSettings 
            rolePermissions={rolePermissions}
            setRolePermissions={setRolePermissions}
          />
        )}

        {activeTab === 'workspace' && (isAdmin || canManageTeam) && (
          <WorkspaceSettings
            inventoryLocations={inventoryLocations}
            setInventoryLocations={setInventoryLocations}
            haccpItems={haccpItems}
            setHaccpItems={setHaccpItems}
            currentTeamId={currentTeamId}
          />
        )}
      </div>
    </div>
  );
};


// The original content of SettingsView is now a sub-component for the 'Teams' tab
interface TeamManagementProps extends Omit<SettingsViewProps, 'setRolePermissions' | 'rolePermissions' | 'inventoryLocations' | 'setInventoryLocations' | 'haccpItems' | 'setHaccpItems'> {
    rolePermissions: RolePermissions;
};

const TeamManagement: React.FC<TeamManagementProps> = ({ users, setUsers, teams, setTeams, currentUser, currentTeamId, rolePermissions }) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(currentTeamId);

  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  
  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const currentUserRole = useMemo(() => 
    currentUser.memberships.find(m => m.teamId === selectedTeamId)?.role,
    [currentUser, selectedTeamId]
  );
  const canManage = currentUserRole ? rolePermissions[currentUserRole]?.includes('manage_team') : false;

  const handleSaveTeam = (data: Omit<Team, 'id'> | Team) => {
    if ('id' in data) {
      setTeams(prev => prev.map(t => t.id === data.id ? data : t));
    } else {
      const newTeam = { ...data, id: `team${Date.now()}` };
      setTeams(prev => [...prev, newTeam]);
      setUsers(prevUsers => prevUsers.map(u => u.id === currentUser.id ? { ...u, memberships: [...u.memberships, { teamId: newTeam.id, role: 'Admin' }] } : u));
      setSelectedTeamId(newTeam.id);
    }
    setIsTeamFormOpen(false);
    setTeamToEdit(null);
  };

  const handleConfirmDeleteTeam = () => {
    if (teamToDelete) {
      setTeams(prev => prev.filter(t => t.id !== teamToDelete.id));
      setUsers(prevUsers => prevUsers.map(u => ({
          ...u,
          memberships: u.memberships.filter(m => m.teamId !== teamToDelete.id)
      })).filter(u => u.memberships.length > 0));

      if (selectedTeamId === teamToDelete.id) {
        setSelectedTeamId(currentUser.memberships.find(m => m.teamId !== teamToDelete.id)?.teamId || null);
      }
      setTeamToDelete(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        <div className="lg:col-span-1 h-full">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl h-full flex flex-col">
                 <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200/80 dark:border-gray-700/80">
                    <h2 className="text-2xl font-bold font-heading">Ομάδες</h2>
                    <button onClick={() => { setTeamToEdit(null); setIsTeamFormOpen(true); }} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/20">
                        <Icon name="plus" className="w-5 h-5"/>
                    </button>
                 </div>
                 <div className="flex-1 overflow-y-auto -mr-2 pr-2 space-y-2">
                    {teams.filter(t => currentUser.memberships.some(m => m.teamId === t.id)).map(team => (
                        <div key={team.id} onClick={() => setSelectedTeamId(team.id)} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer group border ${selectedTeamId === team.id ? 'bg-brand-yellow/20 border-brand-yellow/50' : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'}`}>
                            <span className="font-bold">{team.name}</span>
                            {canManage && (
                                <div className="flex items-center opacity-0 group-hover:opacity-100">
                                    <button onClick={(e) => { e.stopPropagation(); setTeamToEdit(team); setIsTeamFormOpen(true);}} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/20">
                                        <Icon name="edit" className="w-4 h-4"/>
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); setTeamToDelete(team);}} className="p-2 rounded-full hover:bg-red-500/10 text-red-500">
                                        <Icon name="trash-2" className="w-4 h-4"/>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                 </div>
            </div>
        </div>
        <div className="lg:col-span-3 h-full">
            {selectedTeam ? (
                <TeamMembers team={selectedTeam} allUsers={users} setAllUsers={setUsers} setTeams={setTeams} currentUserRole={currentUserRole} rolePermissions={rolePermissions} />
            ) : (
                <div className="flex items-center justify-center h-full text-light-text-secondary dark:text-dark-text-secondary">
                    <p>Επιλέξτε ή δημιουργήστε μια ομάδα.</p>
                </div>
            )}
        </div>
      </div>
      
      <TeamForm
        isOpen={isTeamFormOpen}
        onClose={() => setIsTeamFormOpen(false)}
        onSave={handleSaveTeam}
        teamToEdit={teamToEdit}
      />
      
      <ConfirmationModal
        isOpen={!!teamToDelete}
        onClose={() => setTeamToDelete(null)}
        onConfirm={handleConfirmDeleteTeam}
        title="Διαγραφή Ομάδας"
        body={<p>Είστε σίγουροι ότι θέλετε να διαγράψετε την ομάδα "{teamToDelete?.name}"; Αυτή η ενέργεια είναι μόνιμη και θα αφαιρέσει όλα τα μέλη από αυτήν.</p>}
      />
    </>
  );
}


export default SettingsView;
