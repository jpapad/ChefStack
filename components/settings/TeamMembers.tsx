import React, { useState, useMemo, useRef } from 'react';
import { User, Team, Role, RolePermissions } from '../../types';
import { Icon } from '../common/Icon';
import ConfirmationModal from '../common/ConfirmationModal';
import UserForm from './UserForm';
import { api } from '../../services/api';

interface TeamMembersProps {
  team: Team;
  allUsers: User[];
  setAllUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  currentUserRole?: Role;
  rolePermissions: RolePermissions;
}

const TeamMembers: React.FC<TeamMembersProps> = ({ team, allUsers, setAllUsers, setTeams, currentUserRole, rolePermissions }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const teamMembers = useMemo(() => {
    return allUsers.filter(u => u.memberships.some(m => m.teamId === team.id));
  }, [allUsers, team.id]);
  
  const canManage = currentUserRole ? rolePermissions[currentUserRole]?.includes('manage_team') : false;

  const handleOpenForm = (user: User | null = null) => {
    setUserToEdit(user);
    setIsFormOpen(true);
  };
  
  const handleSaveUser = (data: (Omit<User, 'id' | 'memberships'> & { initialRole: Role }) | User) => {
    if ('id' in data) { // Editing existing user's role in the current team
        setAllUsers(prev => prev.map(u => u.id === data.id ? data : u));
    } else { // Inviting a new or existing user to the team
        const existingUser = allUsers.find(u => u.email.toLowerCase() === data.email.toLowerCase());
        
        if (existingUser) {
            // User exists, add them to the team if they aren't already a member
            if (existingUser.memberships.some(m => m.teamId === team.id)) {
                alert('A user with this email is already in this team.');
                return;
            }
            setAllUsers(prev => prev.map(u => 
                u.id === existingUser.id 
                ? { ...u, memberships: [...u.memberships, { teamId: team.id, role: data.initialRole }] } 
                : u
            ));
        } else {
            // User doesn't exist, create a new one
            const newUser: User = {
                id: `user${Date.now()}`,
                name: data.name,
                email: data.email,
                memberships: [{ teamId: team.id, role: data.initialRole }]
            };
            setAllUsers(prev => [...prev, newUser]);
        }
    }
    setIsFormOpen(false);
    setUserToEdit(null);
  };

  const handleRequestDelete = (user: User) => {
    setUserToDelete(user);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      // Don't delete user, just remove membership from this team
      setAllUsers(prevUsers => prevUsers.map(u => {
        if (u.id === userToDelete.id) {
          return {
            ...u,
            memberships: u.memberships.filter(m => m.teamId !== team.id),
          };
        }
        return u;
      }).filter(u => u.memberships.length > 0)); // Optional: remove users if they have no teams left
      setUserToDelete(null);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
        const updatedTeam = { ...team, logoUrl: reader.result as string };
        const savedTeam = await api.saveTeam(updatedTeam);
        setTeams(prevTeams => prevTeams.map(t => t.id === savedTeam.id ? savedTeam : t));
    };
    reader.readAsDataURL(file);
  };
    
  const handleRemoveLogo = async () => {
    const updatedTeam = { ...team };
    delete updatedTeam.logoUrl;
    const savedTeam = await api.saveTeam(updatedTeam);
    setTeams(prevTeams => prevTeams.map(t => t.id === savedTeam.id ? savedTeam : t));
  };
  
  return (
    <>
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-200/80 dark:border-gray-700/80 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                className="hidden"
              />
              {team.logoUrl ? (
                <img src={team.logoUrl} alt={`${team.name} Logo`} className="w-20 h-20 rounded-lg object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center">
                  <Icon name="users" className="w-10 h-10 text-gray-400" />
                </div>
              )}
              {canManage && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30" title="Upload Logo">
                    <Icon name="upload-cloud" className="w-5 h-5" />
                  </button>
                  {team.logoUrl && (
                    <button onClick={handleRemoveLogo} className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30" title="Remove Logo">
                      <Icon name="trash-2" className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold font-heading">{team.name}</h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">{teamMembers.length} μέλη</p>
            </div>
          </div>
          {canManage && (
            <button onClick={() => handleOpenForm(null)} className="flex items-center justify-center w-full gap-2 bg-brand-dark text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity mb-4">
              <Icon name="plus" className="w-5 h-5" />
              <span className="font-semibold text-sm">Πρόσκληση Μέλους</span>
            </button>
          )}
        </div>
        
        {/* Members List */}
        <div className="flex-1 overflow-y-auto -mr-2 pr-2">
          <div className="space-y-2">
            {teamMembers.map(user => {
              const role = user.memberships.find(m => m.teamId === team.id)?.role;
              return (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-xl group hover:bg-black/5 dark:hover:bg-white/5">
                  <div className="flex items-center gap-3">
                    <img src={`https://i.pravatar.cc/40?u=${user.email}`} alt={user.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{role}</p>
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenForm(user)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/20" title="Edit Role">
                        <Icon name="edit" className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleRequestDelete(user)} className="p-2 rounded-full text-light-text-secondary hover:text-red-500 hover:bg-red-500/10" title="Remove Member">
                        <Icon name="trash-2" className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <UserForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveUser}
        userToEdit={userToEdit}
        teamId={team.id}
      />
      
      <ConfirmationModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Αφαίρεση Μέλους"
        body={<p>Είστε σίγουροι ότι θέλετε να αφαιρέσετε τον/την "{userToDelete?.name}" από την ομάδα;</p>}
      />
    </>
  );
};

export default TeamMembers;
