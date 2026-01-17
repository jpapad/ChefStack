import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  User,
  Team,
  Recipe,
  IngredientCost,
  Workstation,
  PrepTask,
  HaccpLog,
  Supplier,
  InventoryItem,
  Menu,
  Notification,
  Message,
  Shift,
  ShiftSchedule,
  Channel,
  InventoryLocation,
  InventoryTransaction,
  HaccpItem,
  HaccpReminder,
  WasteLog,
  KitchenOrder,
  RecipeVariation,
  EmailReport,
  ReportHistory,
  TeamTask,
  ChatMessage
} from './types';
import AuthView from './components/auth/AuthView';
import ResetPasswordView from './components/auth/ResetPasswordView';
import KitchenInterface from './components/KitchenInterface';
import { InstallPrompt } from './components/common/InstallPrompt';
import { Toaster } from './components/ui/toaster';
import { useToast } from './hooks/use-toast';
import { api } from './services/api';
import { supabase } from './services/supabaseClient';
import { Icon } from './components/common/Icon';
import { LanguageProvider, useTranslation } from './i18n';

const AppContent: React.FC = () => {
  // Check for password reset code in URL BEFORE any state initialization
  // Supabase uses 'code' param ONLY for recovery flow, not for regular login
  const urlParams = new URLSearchParams(window.location.search);
  const hasResetCode = urlParams.has('code');
  
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>(
    'currentUser',
    null
  );
  const [currentTeamId, setCurrentTeamId] = useLocalStorage<string | null>(
    'currentTeamId',
    null
  );
  const [isResetPasswordMode, setIsResetPasswordMode] = useState(hasResetCode);
  const { t } = useTranslation();
  const { toast } = useToast();

  // Listen for Supabase auth events
  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth event:', event, 'Session user:', session?.user?.id);
      
      // Check if this is a recovery session by looking for 'code' param
      // Supabase ONLY uses code param for password recovery, not regular login
      const urlParams = new URLSearchParams(window.location.search);
      const hasCode = urlParams.has('code');
      
      if (event === 'PASSWORD_RECOVERY') {
        console.log('🔐 PASSWORD_RECOVERY event - showing reset form');
        setIsResetPasswordMode(true);
      } else if (event === 'SIGNED_IN' && hasCode) {
        console.log('🔐 SIGNED_IN with code param (recovery flow) - showing reset form');
        setIsResetPasswordMode(true);
        // Clear the code from URL after detecting it
        window.history.replaceState(null, '', window.location.pathname);
      } else if (event === 'SIGNED_OUT') {
        setIsResetPasswordMode(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
  const [haccpReminders, setHaccpReminders] = useState<HaccpReminder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryLocations, setInventoryLocations] =
    useState<InventoryLocation[]>([]);
  const [inventoryTransactions, setInventoryTransactions] =
    useState<InventoryTransaction[]>([]);
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [shiftSchedules, setShiftSchedules] = useState<ShiftSchedule[]>([]);
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [variations, setVariations] = useState<RecipeVariation[]>([]);
  const [reports, setReports] = useState<EmailReport[]>([]);
  const [reportHistory, setReportHistory] = useState<ReportHistory[]>([]);
  const [teamTasks, setTeamTasks] = useState<TeamTask[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Derived team-scoped data
  const teamRecipes = recipes.filter((r) => r.teamId === currentTeamId);
  const teamMenus = menus.filter((m) => m.teamId === currentTeamId);

  // 🔁 Φορτώνει ΟΛΑ τα δεδομένα + session ΜΟΝΟ στην αρχική φόρτωση
  useEffect(() => {
    const fetchDataAndSession = async () => {
      setIsLoading(true);
      try {
        const data = await api.fetchAllData();

        setAllUsers(data.users || []);
        setAllTeams(data.teams || []);
        setRecipes(data.recipes || []);
        setIngredientCosts(data.ingredientCosts || []);
        setWorkstations(data.workstations || []);
        setTasks(data.tasks || []);
        setHaccpLogs(data.haccpLogs || []);
        setHaccpItems(data.haccpItems || []);
        setHaccpReminders(data.haccpReminders || []);
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
        setOrders(data.orders || []);
        setVariations(data.variations || []);
        setReports(data.reports || []);
        setReportHistory(data.reportHistory || []);
        setTeamTasks(data.teamTasks || []);
        setChatMessages(data.chatMessages || []);

        // Έλεγξε αν υπάρχει ενεργό session
        if (supabase) {
          const sessionInfo = await api.getCurrentUserAndTeams();
          if (sessionInfo) {
            const foundUser =
              data.users.find((u) => u.id === sessionInfo.user.id) ||
              sessionInfo.user;

            setCurrentUser(foundUser);

            if (foundUser.memberships.length > 0) {
              const lastUsedTeam = localStorage.getItem('currentTeamId');
              const lastUsedTeamId = lastUsedTeam
                ? JSON.parse(lastUsedTeam)
                : null;

              if (
                lastUsedTeamId &&
                foundUser.memberships.some(
                  (m) => m.teamId === lastUsedTeamId
                )
              ) {
                setCurrentTeamId(lastUsedTeamId);
              } else {
                setCurrentTeamId(foundUser.memberships[0].teamId);
              }
            } else {
              setCurrentTeamId(null);
            }

            // Συγχρονισμός ομάδων από το session
            setAllTeams((prev) => {
              const merged = [...prev];
              sessionInfo.teams.forEach((team) => {
                const idx = merged.findIndex((t) => t.id === team.id);
                if (idx === -1) merged.push(team);
                else merged[idx] = team;
              });
              return merged;
            });
          }
        } else {
          // Mock mode: auto-login πρώτο mock user
          const mockUser = data.users[0];
          if (mockUser) {
            setCurrentUser(mockUser);
            setCurrentTeamId(mockUser.memberships[0]?.teamId || null);
          }
        }
      } catch (error) {
        console.error('Failed to fetch initial data or session', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataAndSession();
  }, []); // Run once on mount

  const handleAuthSuccess = async (
    email: string,
    pass: string
  ): Promise<boolean> => {
    try {
      console.log('🔐 Login attempt:', email);
      const { user, teams } = await api.login(email, pass);
      console.log('✅ Login successful:', user.name, 'Teams:', teams.length);

      setCurrentUser(user);

      setAllUsers((prev) => {
        const exists = prev.some((u) => u.id === user.id);
        return exists
          ? prev.map((u) => (u.id === user.id ? user : u))
          : [...prev, user];
      });

      setAllTeams((prev) => {
        const merged = [...prev];
        teams.forEach((team) => {
          const idx = merged.findIndex((t) => t.id === team.id);
          if (idx === -1) merged.push(team);
          else merged[idx] = team;
        });
        return merged;
      });

      if (user.memberships.length > 0) {
        const lastUsedTeam = localStorage.getItem('currentTeamId');
        const lastUsedTeamId = lastUsedTeam
          ? JSON.parse(lastUsedTeam)
          : null;

        if (
          lastUsedTeamId &&
          user.memberships.some((m) => m.teamId === lastUsedTeamId)
        ) {
          setCurrentTeamId(lastUsedTeamId);
          console.log('📍 Restored last team:', lastUsedTeamId);
        } else {
          setCurrentTeamId(user.memberships[0].teamId);
          console.log('📍 Using first team:', user.memberships[0].teamId);
        }
      } else {
        setCurrentTeamId(null);
        console.warn('⚠️ User has no team memberships!');
      }

      console.log('✅ Login flow complete, user should be logged in');
      return true;
    } catch (error: any) {
      console.error('❌ Login failed via api.login:', error);
      try {
        toast({ title: t('auth_login_failed_toast') || 'Login failed', description: error?.message || String(error) });
      } catch {};
      // Rethrow so the caller (AuthView) can display error details
      throw error;
    }
  };

  const handleSignUp = async (
    name: string,
    email: string,
    pass: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const { user, team } = await api.signUp(name, email, pass);
      setAllUsers((prev) => [...prev, user]);
      setAllTeams((prev) => [...prev, team]);
      setCurrentUser(user);
      setCurrentTeamId(team.id);
      return { success: true, message: t('signup_success') };
    } catch (error: any) {
      try {
        toast({ title: t('auth_signup_failed_toast') || 'Sign up failed', description: error?.message || String(error) });
      } catch {}
      return { success: false, message: error.message };
    }
  };

  const handleResetPassword = async (
    email: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      await api.resetPassword(email);
      return { success: true, message: t('auth_reset_success') };
    } catch (error: any) {
      try {
        toast({ title: t('auth_reset_failed_toast') || 'Reset failed', description: error?.message || String(error) });
      } catch {}
      return { success: false, message: error?.message || t('auth_reset_error') };
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error('Logout error:', e);
      try {
        toast({ title: t('auth_logout_failed_toast') || 'Logout failed', description: (e as any)?.message || String(e) });
      } catch {}
    } finally {
      setCurrentUser(null);
      setCurrentTeamId(null);
    }
  };

  const handleSetCurrentTeam = (teamId: string) => {
    const userIsMember = currentUser?.memberships.some(
      (m) => m.teamId === teamId
    );
    if (userIsMember) {
      setCurrentTeamId(teamId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-light-bg dark:bg-dark-bg">
        <Icon
          name="loader-2"
          className="w-16 h-16 text-brand-yellow animate-spin mb-4"
        />
        <p className="text-lg font-semibold text-light-text-secondary dark:text-dark-text-secondary">
          {t('loading_kitchen')}
        </p>
      </div>
    );
  }

  if (isResetPasswordMode) {
    return (
      <ResetPasswordView
        onComplete={() => {
          setIsResetPasswordMode(false);
        }}
      />
    );
  }

  if (!currentUser || !currentTeamId) {
    return (
      <AuthView 
        onAuthSuccess={handleAuthSuccess} 
        onSignUp={handleSignUp} 
        onResetPassword={handleResetPassword}
      />
    );
  }

  return (
    <KitchenInterface
      user={currentUser}
      onLogout={handleLogout}
      currentTeamId={currentTeamId}
      onSetCurrentTeam={handleSetCurrentTeam}
      allUsers={allUsers}
      setAllUsers={setAllUsers}
      allTeams={allTeams}
      setAllTeams={setAllTeams}
      recipes={recipes}
      teamRecipes={teamRecipes}
      setRecipes={setRecipes}
      ingredientCosts={ingredientCosts}
      setIngredientCosts={setIngredientCosts}
      workstations={workstations}
      setWorkstations={setWorkstations}
      tasks={tasks}
      setTasks={setTasks}
      haccpLogs={haccpLogs}
      setHaccpLogs={setHaccpLogs}
      haccpItems={haccpItems}
      setHaccpItems={setHaccpItems}
      haccpReminders={haccpReminders}
      setHaccpReminders={setHaccpReminders}
      suppliers={suppliers}
      setSuppliers={setSuppliers}
      inventory={inventory}
      setInventory={setInventory}
      inventoryLocations={inventoryLocations}
      setInventoryLocations={setInventoryLocations}
      inventoryTransactions={inventoryTransactions}
      setInventoryTransactions={setInventoryTransactions}
      wasteLogs={wasteLogs}
      setWasteLogs={setWasteLogs}
      menus={menus}
      teamMenus={teamMenus}
      setMenus={setMenus}
      notifications={notifications}
      setNotifications={setNotifications}
      messages={messages}
      setMessages={setMessages}
      shifts={shifts}
      setShifts={setShifts}
      shiftSchedules={shiftSchedules}
      setShiftSchedules={setShiftSchedules}
      allChannels={allChannels}
      setAllChannels={setAllChannels}
      orders={orders}
      setOrders={setOrders}
      variations={variations}
      setVariations={setVariations}
      reports={reports}
      setReports={setReports}
      reportHistory={reportHistory}
      setReportHistory={setReportHistory}
      teamTasks={teamTasks}
      setTeamTasks={setTeamTasks}
      chatMessages={chatMessages}
      setChatMessages={setChatMessages}
    />
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
      <InstallPrompt />
      <Toaster />
    </LanguageProvider>
  );
};

export default App;
