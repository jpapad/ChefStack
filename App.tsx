import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { 
  User, Team, View, Recipe, IngredientCost, Workstation, PrepTask, 
  HaccpLog, Supplier, InventoryItem, Menu, Notification, Message, 
  Role, LanguageMode, Shift, ShiftSchedule, Channel, InventoryLocation, 
  InventoryTransaction, HaccpItem, WasteLog 
} from './types';
import AuthView from './components/auth/AuthView';
import KitchenInterface from './KitchenInterface';
import { api } from './services/api';
import { supabase } from './services/supabaseClient';
import { Icon } from './components/common/Icon';
import { LanguageProvider, useTranslation } from './i18n';

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [currentTeamId, setCurrentTeamId] = useLocalStorage<string | null>('currentTeamId', null);
  const { t } = useTranslation();

  // --- Data State ---
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredientCosts, setIngredientCosts] = useState<IngredientCost[]>([]);
  const [workstations, setWorkstations] = useState<Workstation[]>([]);
  const [tasks, setTasks] = useState<PrepTask[]>([]);
  const [haccpLogs, setHaccpLogs] = useState<HaccpLog[]>([]);
  const [haccpItems, setHaccpItems] = useState<HaccpItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryLocations, setInventoryLocations] = useState<InventoryLocation[]>([]);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [shiftSchedules, setShiftSchedules] = useState<ShiftSchedule[]>([]);
  const [allChannels, setAllChannels] = useState<Channel[]>([]);

  // Derived team-scoped data
  const teamRecipes = recipes.filter(r => r.teamId === currentTeamId);
  const teamMenus = menus.filter(m => m.teamId === currentTeamId);

  useEffect(() => {
    const fetchDataAndSession = async () => {
      setIsLoading(true);
      try {
        // 1. Φέρε όλα τα δεδομένα της εφαρμογής
        const data = await api.fetchAllData();
        setAllUsers(data.users || []);
        setAllTeams(data.teams || []);
        setRecipes(data.recipes || []);
        setIngredientCosts(data.ingredientCosts || []);
        setWorkstations(data.workstations || []);
        setTasks(data.tasks || []);
        setHaccpLogs(data.haccpLogs || []);
        setHaccpItems(data.haccpItems || []);
        setSuppliers(data.suppliers || []);
        setInventory(data.inventory || []);
        setInventoryLocations(data.inventoryLocations || []);
        setInventoryTransactions(data.inventoryTransactions || []);
        setWasteLogs(data.wasteLogs || []);
        setMenus(data.menus || []);
        setNotifications(data.notifications || []);
        setMessages(data.messages || []);
        setShifts(data.shifts || []);
        setShiftSchedules(data.shiftSchedules || []);
        setAllChannels(data.channels || []);
        
        // 2. Έλεγξε αν υπάρχει ενεργό session
        if (supabase) {
          const sessionInfo = await api.getCurrentUserAndTeams();
          if (sessionInfo) {
            // Προσπάθησε να βρεις τον user μέσα στα ήδη φορτωμένα data.users
            const foundUser = data.users.find(u => u.id === sessionInfo.user.id) || sessionInfo.user;

            setCurrentUser(foundUser);

            if (foundUser.memberships.length > 0) {
              const lastUsedTeam = localStorage.getItem('currentTeamId');
              const lastUsedTeamId = lastUsedTeam ? JSON.parse(lastUsedTeam) : null;

              if (lastUsedTeamId && foundUser.memberships.some(m => m.teamId === lastUsedTeamId)) {
                setCurrentTeamId(lastUsedTeamId);
              } else {
                setCurrentTeamId(foundUser.memberships[0].teamId);
              }
            } else {
              setCurrentTeamId(null);
            }

            // Φρόντισε να ενημερώσεις και τις ομάδες αν λείπει καμία
            setAllTeams(prev => {
              const merged = [...prev];
              sessionInfo.teams.forEach(team => {
                const idx = merged.findIndex(t => t.id === team.id);
                if (idx === -1) merged.push(team);
                else merged[idx] = team;
              });
              return merged;
            });
          }
        } else {
          // Mock mode: auto-login τον πρώτο mock user
          const mockUser = data.users[0];
          if (mockUser) {
            setCurrentUser(mockUser);
            setCurrentTeamId(mockUser.memberships[0]?.teamId || null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch initial data or session", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDataAndSession();
  }, []);

  const handleAuthSuccess = async (email: string, pass: string): Promise<boolean> => {
    // Χρησιμοποιούμε το api.login, που από μόνο του κάνει mock ή supabase ανάλογα
    try {
      const { user, teams } = await api.login(email, pass);

      setCurrentUser(user);

      // Ενημέρωση allUsers / allTeams για να είναι σίγουρα μέσα ο user & οι ομάδες του
      setAllUsers(prev => {
        const exists = prev.some(u => u.id === user.id);
        return exists ? prev.map(u => (u.id === user.id ? user : u)) : [...prev, user];
      });

      setAllTeams(prev => {
        const merged = [...prev];
        teams.forEach(team => {
          const idx = merged.findIndex(t => t.id === team.id);
          if (idx === -1) merged.push(team);
          else merged[idx] = team;
        });
        return merged;
      });

      if (user.memberships.length > 0) {
        const lastUsedTeam = localStorage.getItem('currentTeamId');
        const lastUsedTeamId = lastUsedTeam ? JSON.parse(lastUsedTeam) : null;

        if (lastUsedTeamId && user.memberships.some(m => m.teamId === lastUsedTeamId)) {
          setCurrentTeamId(lastUsedTeamId);
        } else {
          setCurrentTeamId(user.memberships[0].teamId);
        }
      } else {
        setCurrentTeamId(null);
      }

      return true;
    } catch (error: any) {
      console.error('Login failed via api.login:', error);
      return false;
    }
  };
  
  const handleSignUp = async (name: string, email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { user, team } = await api.signUp(name, email, pass);
      // Προσθήκη user & team στα state
      setAllUsers(prev => [...prev, user]);
      setAllTeams(prev => [...prev, team]);
      setCurrentUser(user);
      setCurrentTeamId(team.id);
      return { success: true, message: t('signup_success') };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setCurrentUser(null);
      setCurrentTeamId(null);
    }
  };

  const handleSetCurrentTeam = (teamId: string) => {
    const userIsMember = currentUser?.memberships.some(m => m.teamId === teamId);
    if (userIsMember) {
      setCurrentTeamId(teamId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-light-bg dark:bg-dark-bg">
        <Icon name="loader-2" className="w-16 h-16 text-brand-yellow animate-spin mb-4" />
        <p className="text-lg font-semibold text-light-text-secondary dark:text-dark-text-secondary">
          {t('loading_kitchen')}
        </p>
      </div>
    );
  }

  if (!currentUser || !currentTeamId) {
    return <AuthView onAuthSuccess={handleAuthSuccess} onSignUp={handleSignUp} />;
  }

  return (
    <KitchenInterface 
      user={currentUser} 
      onLogout={handleLogout}
      currentTeamId={currentTeamId}
      onSetCurrentTeam={handleSetCurrentTeam}
      // Pass all state and setters
      allUsers={allUsers}
      allTeams={allTeams}
      recipes={recipes}
      teamRecipes={teamRecipes}
      ingredientCosts={ingredientCosts}
      workstations={workstations}
      tasks={tasks}
      haccpLogs={haccpLogs}
      haccpItems={haccpItems}
      suppliers={suppliers}
      inventory={inventory}
      inventoryLocations={inventoryLocations}
      inventoryTransactions={inventoryTransactions}
      wasteLogs={wasteLogs}
      menus={menus}
      teamMenus={teamMenus}
      notifications={notifications}
      messages={messages}
      shifts={shifts}
      shiftSchedules={shiftSchedules}
      allChannels={allChannels}
      setAllUsers={setAllUsers}
      setAllTeams={setAllTeams}
      setRecipes={setRecipes}
      setIngredientCosts={setIngredientCosts}
      setWorkstations={setWorkstations}
      setTasks={setTasks}
      setHaccpLogs={setHaccpLogs}
      setHaccpItems={setHaccpItems}
      setSuppliers={setSuppliers}
      setInventory={setInventory}
      setInventoryLocations={setInventoryLocations}
      setInventoryTransactions={setInventoryTransactions}
      setWasteLogs={setWasteLogs}
      setMenus={setMenus}
      setNotifications={setNotifications}
      setMessages={setMessages}
      setShifts={setShifts}
      setShiftSchedules={setShiftSchedules}
      setAllChannels={setAllChannels}
    />
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
