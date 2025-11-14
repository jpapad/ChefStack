// services/api.ts
import { supabase } from './supabaseClient';
import { 
    Recipe, IngredientCost, Workstation, PrepTask, HaccpLog, HaccpItem, Supplier, InventoryItem, Menu, User, Team, Notification, Message, Shift, ShiftSchedule, Channel, InventoryLocation, InventoryTransaction, WasteLog
} from '../types';
import * as mockData from '../data/mockData';

const useMockApi = !supabase;

const throwConfigError = () => {
    throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
};


// --- API SERVICE ---
// Note: Assumes Supabase table names are plural and snake_cased (e.g., 'ingredient_costs').
export const api = {
  fetchAllData: async (): Promise<{
    recipes: Recipe[], ingredientCosts: IngredientCost[], workstations: Workstation[], tasks: PrepTask[], haccpLogs: HaccpLog[], haccpItems: HaccpItem[],
    suppliers: Supplier[], inventory: InventoryItem[], inventoryLocations: InventoryLocation[], inventoryTransactions: InventoryTransaction[], wasteLogs: WasteLog[], menus: Menu[], users: User[], teams: Team[], notifications: Notification[], messages: Message[], shifts: Shift[], shiftSchedules: ShiftSchedule[], channels: Channel[]
  }> => {
      if (useMockApi) {
          console.warn("Supabase not configured, returning mock data.");
          // Return a deep copy to prevent mutation of mock data
          return Promise.resolve(JSON.parse(JSON.stringify({
            recipes: mockData.mockRecipes,
            ingredientCosts: mockData.mockIngredientCosts,
            workstations: mockData.mockWorkstations,
            tasks: mockData.mockPrepTasks,
            haccpLogs: mockData.mockHaccpLogs,
            haccpItems: mockData.mockHaccpItems,
            suppliers: mockData.mockSuppliers,
            inventory: mockData.mockInventory,
            inventoryLocations: mockData.mockInventoryLocations,
            inventoryTransactions: mockData.mockInventoryTransactions,
            wasteLogs: mockData.mockWasteLogs,
            menus: mockData.mockMenus,
            users: mockData.mockUsers,
            teams: mockData.mockTeams,
            notifications: mockData.mockNotifications,
            messages: mockData.mockMessages,
            shifts: mockData.mockShifts,
            shiftSchedules: mockData.mockShiftSchedules,
            channels: mockData.mockChannels,
          })));
      }
      
      const [
        recipesRes, ingredientCostsRes, workstationsRes, tasksRes, haccpLogsRes, haccpItemsRes,
        suppliersRes, inventoryRes, inventoryLocationsRes, inventoryTransactionsRes, wasteLogsRes,
        menusRes, usersRes, teamsRes, notificationsRes, messagesRes, shiftsRes, shiftSchedulesRes, channelsRes
      ] = await Promise.all([
        supabase.from('recipes').select('*'),
        supabase.from('ingredient_costs').select('*'),
        supabase.from('workstations').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('haccp_logs').select('*'),
        supabase.from('haccp_items').select('*'),
        supabase.from('suppliers').select('*'),
        supabase.from('inventory').select('*'),
        supabase.from('inventory_locations').select('*'),
        supabase.from('inventory_transactions').select('*'),
        supabase.from('waste_logs').select('*'),
        supabase.from('menus').select('*'),
        supabase.from('users').select('*'),
        supabase.from('teams').select('*'),
        supabase.from('notifications').select('*'),
        supabase.from('messages').select('*'),
        supabase.from('shifts').select('*'),
        supabase.from('shift_schedules').select('*'),
        supabase.from('channels').select('*'),
      ]);

      const results = {
        recipes: recipesRes.data || [],
        ingredientCosts: ingredientCostsRes.data || [],
        workstations: workstationsRes.data || [],
        tasks: tasksRes.data || [],
        haccpLogs: (haccpLogsRes.data || []).map(l => ({...l, timestamp: new Date(l.timestamp)})),
        haccpItems: haccpItemsRes.data || [],
        suppliers: suppliersRes.data || [],
        inventory: inventoryRes.data || [],
        inventoryLocations: inventoryLocationsRes.data || [],
        inventoryTransactions: (inventoryTransactionsRes.data || []).map(t => ({...t, timestamp: new Date(t.timestamp)})),
        wasteLogs: (wasteLogsRes.data || []).map(w => ({...w, timestamp: new Date(w.timestamp)})),
        menus: menusRes.data || [],
        users: usersRes.data || [],
        teams: teamsRes.data || [],
        notifications: (notificationsRes.data || []).map(n => ({...n, timestamp: new Date(n.timestamp)})),
        messages: (messagesRes.data || []).map(m => ({...m, timestamp: new Date(m.timestamp)})),
        shifts: shiftsRes.data || [],
        shiftSchedules: shiftSchedulesRes.data || [],
        channels: channelsRes.data || [],
      };
      
      const errors = [
          recipesRes.error, ingredientCostsRes.error, workstationsRes.error, tasksRes.error, haccpLogsRes.error,
          haccpItemsRes.error, suppliersRes.error, inventoryRes.error, inventoryLocationsRes.error,
          inventoryTransactionsRes.error, wasteLogsRes.error, menusRes.error, usersRes.error, teamsRes.error,
          notificationsRes.error, messagesRes.error, shiftsRes.error, shiftSchedulesRes.error, channelsRes.error
      ].filter(Boolean);

      if (errors.length > 0) {
          console.error("Errors fetching data from Supabase:", errors);
          throw new Error("One or more Supabase queries failed.");
      }

      return results;
  },

  // --- Auth ---
  signUp: async (name: string, email: string, pass: string): Promise<{ user: User, team: Team }> => {
    if (useMockApi) {
        const newTeamId = `team${Date.now()}`;
        const newUserId = `user${Date.now()}`;
        const newTeam: Team = { id: newTeamId, name: `${name}'s Kitchen` };
        const newUser: User = { id: newUserId, name, email, memberships: [{ teamId: newTeamId, role: 'Admin' }] };
        return Promise.resolve({ user: newUser, team: newTeam });
    }
    if (!supabase) throwConfigError();
    // 1. Sign up the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: pass,
    });
    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Could not sign up user.');
    }

    // 2. Create a new personal team for the user
    const { data: newTeam, error: teamError } = await supabase
      .from('teams')
      .insert({ name: `${name}'s Kitchen` })
      .select()
      .single();
    if (teamError || !newTeam) {
      // In a real app, you might want to clean up the created auth user
      throw new Error(teamError?.message || 'Could not create team.');
    }

    // 3. Create a public user profile linked to the auth user and team
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id, // Link to the auth user's ID
        name,
        email,
        memberships: [{ teamId: newTeam.id, role: 'Admin' }]
      })
      .select()
      .single();
    if (profileError || !userProfile) {
      // In a real app, you might want to clean up the team and auth user
      throw new Error(profileError?.message || 'Could not create user profile.');
    }

    return { user: userProfile, team: newTeam };
  },

  // --- Recipes ---
  saveRecipe: async (recipeData: Omit<Recipe, 'id'> | Recipe): Promise<Recipe> => {
    if (useMockApi) {
        if ('id' in recipeData) return Promise.resolve(recipeData);
        const newRecipe = { ...recipeData, id: `recipe${Date.now()}` } as Recipe;
        return Promise.resolve(newRecipe);
    }
    if (!supabase) throwConfigError();
    const { data, error } = await supabase.from('recipes').upsert(recipeData).select().single();
    if (error) throw error;
    return data;
  },
  deleteRecipe: async (recipeId: string): Promise<void> => {
    if (useMockApi) return Promise.resolve();
    if (!supabase) throwConfigError();
    const { error } = await supabase.from('recipes').delete().eq('id', recipeId);
    if (error) throw error;
  },
  saveMultipleRecipes: async (recipeDatas: Omit<Recipe, 'id' | 'teamId'>[]): Promise<Recipe[]> => {
     if (useMockApi) {
        const newRecipes = recipeDatas.map((r, i) => ({ ...r, id: `recipe${Date.now()}${i}`, teamId: '' } as Recipe));
        return Promise.resolve(newRecipes);
    }
    if (!supabase) throwConfigError();
    const { data, error } = await supabase.from('recipes').insert(recipeDatas).select();
    if (error) throw error;
    return data;
  },

  // --- Menus ---
  saveMenu: async (menuData: Omit<Menu, 'id'> | Menu): Promise<Menu> => {
    if (useMockApi) {
        if ('id' in menuData) return Promise.resolve(menuData);
        const newMenu = { ...menuData, id: `menu${Date.now()}` } as Menu;
        return Promise.resolve(newMenu);
    }
    if (!supabase) throwConfigError();
    const { data, error } = await supabase.from('menus').upsert(menuData).select().single();
    if (error) throw error;
    return data;
  },
  deleteMenu: async (menuId: string): Promise<void> => {
    if (useMockApi) return Promise.resolve();
    if (!supabase) throwConfigError();
    const { error } = await supabase.from('menus').delete().eq('id', menuId);
    if (error) throw error;
  },
  
  // --- Teams ---
  saveTeam: async (teamData: Team): Promise<Team> => {
    if (useMockApi) return Promise.resolve(teamData);
    if (!supabase) throwConfigError();
    const { data, error } = await supabase.from('teams').upsert(teamData).select().single();
    if (error) throw error;
    return data;
  },
  
  // --- Shift Schedules ---
  saveShiftSchedule: async (scheduleData: Omit<ShiftSchedule, 'id'> | ShiftSchedule): Promise<ShiftSchedule> => {
    if (useMockApi) {
        if ('id' in scheduleData) return Promise.resolve(scheduleData);
        const newSchedule = { ...scheduleData, id: `schedule${Date.now()}` } as ShiftSchedule;
        return Promise.resolve(newSchedule);
    }
    if (!supabase) throwConfigError();
    const { data, error } = await supabase.from('shift_schedules').upsert(scheduleData).select().single();
    if (error) throw error;
    return data;
  },
  deleteShiftSchedule: async (scheduleId: string): Promise<void> => {
    if (useMockApi) return Promise.resolve();
    if (!supabase) throwConfigError();
    const { error } = await supabase.from('shift_schedules').delete().eq('id', scheduleId);
    if (error) throw error;
  },
  
  // --- Channels ---
  saveChannel: async (channelData: Omit<Channel, 'id'> | Channel): Promise<Channel> => {
    if (useMockApi) {
        if ('id' in channelData) return Promise.resolve(channelData);
        const newChannel = { ...channelData, id: `channel${Date.now()}` } as Channel;
        return Promise.resolve(newChannel);
    }
    if (!supabase) throwConfigError();
    const { data, error } = await supabase.from('channels').upsert(channelData).select().single();
    if (error) throw error;
    return data;
  },
  deleteChannel: async (channelId: string): Promise<void> => {
    if (useMockApi) return Promise.resolve();
    if (!supabase) throwConfigError();
    const { error } = await supabase.from('channels').delete().eq('id', channelId);
    if (error) throw error;
  },
};