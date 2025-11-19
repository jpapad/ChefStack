// services/api.ts
import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  Recipe,
  IngredientCost,
  Workstation,
  PrepTask,
  HaccpLog,
  HaccpItem,
  Supplier,
  InventoryItem,
  Menu,
  User,
  Team,
  Notification,
  Message,
  Shift,
  ShiftSchedule,
  Channel,
  InventoryLocation,
  InventoryTransaction,
  WasteLog
} from '../types';
import * as mockData from '../data/mockData';

const useMockApi = !isSupabaseConfigured;

const throwConfigError = () => {
  throw new Error(
    'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.'
  );
};

// Helper για ids
const generateId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as any).randomUUID();
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

// ---------- Helpers για Recipes ----------
const mapRecipeToDb = (recipe: Omit<Recipe, 'id'> | Recipe) => {
  const base = {
    team_id: recipe.teamId,
    name: recipe.name,
    name_en: recipe.name_en,
    description: recipe.description,
    image_url: recipe.imageUrl,
    category: recipe.category,
    prep_time: recipe.prepTime,
    cook_time: recipe.cookTime,
    servings: recipe.servings,
    price: recipe.price,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    allergens: recipe.allergens,
    yield: recipe.yield
  };

  if ('id' in recipe) {
    return { id: recipe.id, ...base };
  }
  return base;
};

const mapRecipeFromDb = (row: any): Recipe => ({
  id: row.id,
  teamId: row.team_id,
  name: row.name,
  name_en: row.name_en ?? '',
  description: row.description ?? '',
  imageUrl: row.image_url ?? '',
  category: row.category,
  prepTime: row.prep_time ?? 0,
  cookTime: row.cook_time ?? 0,
  servings: row.servings ?? 1,
  price: row.price ?? 0,
  ingredients: row.ingredients ?? [],
  steps: row.steps ?? [],
  allergens: row.allergens ?? [],
  yield: row.yield ?? { quantity: 1, unit: 'kg' }
});

// ---------- Helpers για Suppliers ----------
const mapSupplierFromDb = (row: any): Supplier => ({
  id: row.id,
  name: row.name,
  contactPerson: row.contact_person ?? '',
  phone: row.phone ?? '',
  email: row.email ?? '',
  teamId: row.team_id ?? ''
});

const mapSupplierToDb = (supplier: Omit<Supplier, 'id'> | Supplier) => {
  const base = {
    name: supplier.name,
    contact_person: supplier.contactPerson,
    phone: supplier.phone,
    email: supplier.email,
    team_id: supplier.teamId
  };

  if ('id' in supplier && supplier.id) {
    return { id: supplier.id, ...base };
  }
  return { id: generateId('supplier'), ...base };
};

// ---------- Helpers για Ingredient Costs ----------
const mapIngredientCostFromDb = (row: any): IngredientCost => ({
  id: row.id,
  name: row.name,
  cost: row.cost ?? 0,
  purchaseUnit: row.purchase_unit,
  teamId: row.team_id ?? ''
});

const mapIngredientCostToDb = (cost: Omit<IngredientCost, 'id'> | IngredientCost) => {
  const base = {
    name: cost.name,
    cost: cost.cost,
    purchase_unit: cost.purchaseUnit,
    team_id: cost.teamId
  };

  if ('id' in cost && cost.id) {
    return { id: cost.id, ...base };
  }
  return { id: generateId('cost'), ...base };
};

// ---------- Helpers για Inventory ----------
const mapInventoryItemFromDb = (row: any): InventoryItem => ({
  id: row.id,
  name: row.name,
  unit: row.unit,
  reorderPoint: row.reorder_point ?? 0,
  supplierId: row.supplier_id ?? undefined,
  ingredientCostId: row.ingredient_cost_id ?? undefined,
  locations: row.locations ?? [],
  teamId: row.team_id ?? ''
});

const mapInventoryItemToDb = (item: Omit<InventoryItem, 'id'> | InventoryItem) => {
  const base = {
    name: item.name,
    unit: item.unit,
    reorder_point: item.reorderPoint,
    supplier_id: item.supplierId ?? null,
    ingredient_cost_id: item.ingredientCostId ?? null,
    locations: item.locations ?? [],
    team_id: item.teamId
  };

  if ('id' in item && item.id) {
    return { id: item.id, ...base };
  }

  return { id: generateId('inv'), ...base };
};

// ---------- Helpers για Waste Logs ----------
const mapWasteLogFromDb = (row: any): WasteLog => ({
  id: row.id,
  teamId: row.team_id,
  userId: row.user_id,
  inventoryItemId: row.inventory_item_id,
  quantity: row.quantity,
  unit: row.unit,
  reason: row.reason,
  notes: row.notes ?? '',
  timestamp: new Date(row.timestamp)
});

const mapWasteLogToDb = (log: Omit<WasteLog, 'id'> | WasteLog) => {
  const base = {
    team_id: log.teamId,
    user_id: log.userId,
    inventory_item_id: log.inventoryItemId,
    quantity: log.quantity,
    unit: log.unit,
    reason: log.reason,
    notes: log.notes ?? '',
    timestamp: log.timestamp.toISOString()
  };

  if ('id' in log && log.id) {
    return { id: log.id, ...base };
  }

  return { id: generateId('waste'), ...base };
};

// ---------- API SERVICE ----------
export const api = {
  fetchAllData: async (): Promise<{
    recipes: Recipe[];
    ingredientCosts: IngredientCost[];
    workstations: Workstation[];
    tasks: PrepTask[];
    haccpLogs: HaccpLog[];
    haccpItems: HaccpItem[];
    suppliers: Supplier[];
    inventory: InventoryItem[];
    inventoryLocations: InventoryLocation[];
    inventoryTransactions: InventoryTransaction[];
    wasteLogs: WasteLog[];
    menus: Menu[];
    users: User[];
    teams: Team[];
    notifications: Notification[];
    messages: Message[];
    shifts: Shift[];
    shiftSchedules: ShiftSchedule[];
    channels: Channel[];
  }> => {
    if (useMockApi) {
      console.warn('Supabase not configured, returning mock data.');
      return Promise.resolve(
        JSON.parse(
          JSON.stringify({
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
            channels: mockData.mockChannels
          })
        )
      );
    }

    const [
      recipesRes,
      ingredientCostsRes,
      workstationsRes,
      tasksRes,
      haccpLogsRes,
      haccpItemsRes,
      suppliersRes,
      inventoryRes,
      inventoryLocationsRes,
      inventoryTransactionsRes,
      wasteLogsRes,
      menusRes,
      usersRes,
      teamsRes,
      notificationsRes,
      messagesRes,
      shiftsRes,
      shiftSchedulesRes,
      channelsRes
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
      supabase.from('chef_menus').select('*'),
      supabase.from('users').select('*'),
      supabase.from('teams').select('*'),
      supabase.from('notifications').select('*'),
      supabase.from('messages').select('*'),
      supabase.from('shifts').select('*'),
      supabase.from('shift_schedules').select('*'),
      supabase.from('channels').select('*')
    ]);

    const safeData = <T,>(res: any, label: string): T[] => {
      if (res?.error) {
        console.error(`Error fetching ${label} from Supabase:`, res.error);
        return [];
      }
      return (res?.data || []) as T[];
    };

    const recipeRows = safeData<any>(recipesRes, 'recipes');
    const ingredientCostRows = safeData<any>(ingredientCostsRes, 'ingredient_costs');
    const workstationRows = safeData<Workstation>(workstationsRes, 'workstations');
    const taskRows = safeData<PrepTask>(tasksRes, 'tasks');
    const haccpLogRows = safeData<any>(haccpLogsRes, 'haccp_logs');
    const haccpItemRows = safeData<HaccpItem>(haccpItemsRes, 'haccp_items');
    const supplierRows = safeData<any>(suppliersRes, 'suppliers');
    const inventoryRows = safeData<any>(inventoryRes, 'inventory');
    const inventoryLocationRows = safeData<InventoryLocation>(
      inventoryLocationsRes,
      'inventory_locations'
    );
    const inventoryTransactionRows = safeData<any>(
      inventoryTransactionsRes,
      'inventory_transactions'
    );
    const wasteLogRows = safeData<any>(wasteLogsRes, 'waste_logs');
    const menuRows = safeData<any>(menusRes, 'chef_menus');
    const userRows = safeData<User>(usersRes, 'users');
    const teamRows = safeData<Team>(teamsRes, 'teams');
    const notificationRows = safeData<any>(notificationsRes, 'notifications');
    const messageRows = safeData<any>(messagesRes, 'messages');
    const shiftRows = safeData<Shift>(shiftsRes, 'shifts');
    const shiftScheduleRows = safeData<ShiftSchedule>(
      shiftSchedulesRes,
      'shift_schedules'
    );
    const channelRows = safeData<Channel>(channelsRes, 'channels');

    const menus: Menu[] = menuRows.map((row: any) => {
      const stored = row.data as Menu | undefined;

      if (stored) {
        return {
          ...stored,
          id: row.id,
          teamId: row.team_id
        };
      }

      return {
        id: row.id,
        teamId: row.team_id,
        name: row.name ?? '',
        description: row.description ?? '',
        type: (row.type as Menu['type']) ?? 'a_la_carte',
        pax: (row as any).pax ?? 0,
        recipeIds: (row as any).recipe_ids ?? [],
        dailyPlans: (row as any).daily_plans ?? []
      } as Menu;
    });

    const results = {
      recipes: recipeRows.map(mapRecipeFromDb),
      ingredientCosts: ingredientCostRows.map(mapIngredientCostFromDb),
      workstations: workstationRows,
      tasks: taskRows,
      haccpLogs: haccpLogRows.map((l) => ({
        ...l,
        timestamp: new Date(l.timestamp)
      })),
      haccpItems: haccpItemRows,
      suppliers: supplierRows.map(mapSupplierFromDb),
      inventory: inventoryRows.map(mapInventoryItemFromDb),
      inventoryLocations: inventoryLocationRows,
      inventoryTransactions: inventoryTransactionRows.map((t) => ({
        ...t,
        timestamp: new Date(t.timestamp)
      })),
      wasteLogs: wasteLogRows.map(mapWasteLogFromDb),
      menus,
      users: userRows,
      teams: teamRows,
      notifications: notificationRows.map((n) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      })),
      messages: messageRows.map((m) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })),
      shifts: shiftRows,
      shiftSchedules: shiftScheduleRows,
      channels: channelRows
    };

    return results;
  },

  // --- Auth (Sign up) ---
  signUp: async (
    name: string,
    email: string,
    pass: string
  ): Promise<{ user: User; team: Team }> => {
    if (useMockApi) {
      const newTeamId = `team${Date.now()}`;
      const newUserId = `user${Date.now()}`;
      const newTeam: Team = { id: newTeamId, name: `${name}'s Kitchen` };
      const newUser: User = {
        id: newUserId,
        name,
        email,
        memberships: [{ teamId: newTeamId, role: 'Admin' }]
      };
      return Promise.resolve({ user: newUser, team: newTeam });
    }
    if (!supabase) throwConfigError();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: pass
    });
    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Could not sign up user.');
    }

    const { data: newTeam, error: teamError } = await supabase
      .from('teams')
      .insert({ name: `${name}'s Kitchen` })
      .select()
      .single();
    if (teamError || !newTeam) {
      throw new Error(teamError?.message || 'Could not create team.');
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name,
        email,
        memberships: [{ teamId: newTeam.id, role: 'Admin' }]
      })
      .select()
      .single();
    if (profileError || !userProfile) {
      throw new Error(profileError?.message || 'Could not create user profile.');
    }

    return { user: userProfile as User, team: newTeam as Team };
  },

  // --- Auth (login / logout / current user) ---
  login: async (email: string, pass: string): Promise<{ user: User; teams: Team[] }> => {
    if (useMockApi) {
      const mockUser = mockData.mockUsers[0];
      const userTeams = mockData.mockTeams.filter((t) =>
        mockUser.memberships.some((m) => m.teamId === t.id)
      );
      return Promise.resolve({ user: mockUser, teams: userTeams });
    }

    if (!supabase) throwConfigError();

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password: pass
      });
    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Δεν ήταν δυνατή η είσοδος.');
    }

    const userId = authData.user.id;

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new Error(profileError?.message || 'Δεν βρέθηκε user profile.');
    }

    const memberships = (profile as any).memberships || [];
    const teamIds = memberships.map((m: any) => m.teamId);

    let teams: Team[] = [];
    if (teamIds.length > 0) {
      const { data: teamRows, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .in('id', teamIds);

      if (teamsError) {
        throw new Error(teamsError.message || 'Αποτυχία φόρτωσης ομάδων.');
      }
      teams = (teamRows || []) as Team[];
    }

    return { user: profile as User, teams };
  },

  getCurrentUserAndTeams: async (): Promise<{ user: User; teams: Team[] } | null> => {
    if (useMockApi) {
      const mockUser = mockData.mockUsers[0];
      const userTeams = mockData.mockTeams.filter((t) =>
        mockUser.memberships.some((m) => m.teamId === t.id)
      );
      return { user: mockUser, teams: userTeams };
    }

    if (!supabase) throwConfigError();

    const {
      data: { session }
    } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const userId = session.user.id;

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error(
        'Could not load user profile for current session',
        profileError
      );
      return null;
    }

    const memberships = (profile as any).memberships || [];
    const teamIds = memberships.map((m: any) => m.teamId);

    let teams: Team[] = [];
    if (teamIds.length > 0) {
      const { data: teamRows, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .in('id', teamIds);

      if (teamsError) {
        console.error('Error loading teams for current user', teamsError);
      } else {
        teams = (teamRows || []) as Team[];
      }
    }

    return { user: profile as User, teams };
  },

  logout: async (): Promise<void> => {
    if (useMockApi) return Promise.resolve();
    if (!supabase) throwConfigError();
    await supabase.auth.signOut();
  },

  // --- Recipes ---
  saveRecipe: async (recipeData: Omit<Recipe, 'id'> | Recipe): Promise<Recipe> => {
    if (useMockApi) {
      if ('id' in recipeData) return Promise.resolve(recipeData as Recipe);
      const newRecipe = {
        ...recipeData,
        id: `recipe${Date.now()}`
      } as Recipe;
      return Promise.resolve(newRecipe);
    }
    if (!supabase) throwConfigError();

    const payload = mapRecipeToDb(recipeData);
    const { data, error } = await supabase
      .from('recipes')
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    return mapRecipeFromDb(data);
  },

  deleteRecipe: async (recipeId: string): Promise<void> => {
    if (useMockApi) return Promise.resolve();
    if (!supabase) throwConfigError();
    const { error } = await supabase.from('recipes').delete().eq('id', recipeId);
    if (error) throw error;
  },

  // AI / Bulk recipes με teamId
  saveMultipleRecipes: async (
    recipeDatas: Omit<Recipe, 'id' | 'teamId'>[],
    teamId?: string
  ): Promise<Recipe[]> => {
    if (useMockApi) {
      const effectiveTeamId = teamId ?? '';
      const newRecipes = recipeDatas.map((r, i) => ({
        ...r,
        id: `recipe${Date.now()}${i}`,
        teamId: effectiveTeamId
      })) as Recipe[];
      return Promise.resolve(newRecipes);
    }
    if (!supabase) throwConfigError();

    const payloads = recipeDatas.map((r) => ({
      team_id: teamId ?? null,
      name: r.name,
      name_en: r.name_en,
      description: r.description,
      image_url: r.imageUrl,
      category: r.category,
      prep_time: r.prepTime,
      cook_time: r.cookTime,
      servings: r.servings,
      price: r.price,
      ingredients: r.ingredients,
      steps: r.steps,
      allergens: r.allergens,
      yield: r.yield
    }));

    const { data, error } = await supabase
      .from('recipes')
      .insert(payloads)
      .select();
    if (error) throw error;
    return (data || []).map(mapRecipeFromDb);
  },

  // --- Menus ---
  saveMenu: async (menuData: Omit<Menu, 'id'> | Menu): Promise<Menu> => {
    if (useMockApi) {
      if ('id' in menuData) return Promise.resolve(menuData as Menu);
      const newMenu = {
        ...(menuData as any),
        id: `menu${Date.now()}`
      } as Menu;
      return Promise.resolve(newMenu);
    }

    if (!supabase) throwConfigError();

    const isNew = !('id' in menuData);
    const fullMenu: Menu = { ...(menuData as any) };

    const rowToUpsert: any = {
      team_id: fullMenu.teamId,
      data: fullMenu
    };

    if (!isNew) {
      rowToUpsert.id = fullMenu.id;
    }

    const { data, error } = await supabase
      .from('chef_menus')
      .upsert(rowToUpsert)
      .select()
      .single();

    if (error) {
      console.error('Supabase saveMenu failed:', error);
      throw error;
    }

    const savedMenu: Menu = {
      ...(data.data as Menu),
      id: data.id,
      teamId: data.team_id
    };

    return savedMenu;
  },

  deleteMenu: async (menuId: string): Promise<void> => {
    if (useMockApi) return Promise.resolve();
    if (!supabase) throwConfigError();
    const { error } = await supabase.from('chef_menus').delete().eq('id', menuId);
    if (error) throw error;
  },

  // --- Teams ---
  saveTeam: async (teamData: Team): Promise<Team> => {
    if (useMockApi) return Promise.resolve(teamData);
    if (!supabase) throwConfigError();
    const { data, error } = await supabase
      .from('teams')
      .upsert(teamData)
      .select()
      .single();
    if (error) throw error;
    return data as Team;
  },

  // --- Shift Schedules ---
  saveShiftSchedule: async (
    scheduleData: Omit<ShiftSchedule, 'id'> | ShiftSchedule
  ): Promise<ShiftSchedule> => {
    if (useMockApi) {
      if ('id' in scheduleData) return Promise.resolve(scheduleData as ShiftSchedule);
      const newSchedule = {
        ...scheduleData,
        id: `schedule${Date.now()}`
      } as ShiftSchedule;
      return Promise.resolve(newSchedule);
    }
    if (!supabase) throwConfigError();
    const { data, error } = await supabase
      .from('shift_schedules')
      .upsert(scheduleData)
      .select()
      .single();
    if (error) throw error;
    return data as ShiftSchedule;
  },

  deleteShiftSchedule: async (scheduleId: string): Promise<void> => {
    if (useMockApi) return Promise.resolve();
    if (!supabase) throwConfigError();
    const { error } = await supabase
      .from('shift_schedules')
      .delete()
      .eq('id', scheduleId);
    if (error) throw error;
  },

  // --- Channels ---
  saveChannel: async (
    channelData: Omit<Channel, 'id'> | Channel
  ): Promise<Channel> => {
    if (useMockApi) {
      if ('id' in channelData) return Promise.resolve(channelData as Channel);
      const newChannel = {
        ...channelData,
        id: `channel${Date.now()}`
      } as Channel;
      return Promise.resolve(newChannel);
    }
    if (!supabase) throwConfigError();
    const { data, error } = await supabase
      .from('channels')
      .upsert(channelData)
      .select()
      .single();
    if (error) throw error;
    return data as Channel;
  },

  deleteChannel: async (channelId: string): Promise<void> => {
    if (useMockApi) return Promise.resolve();
    if (!supabase) throwConfigError();
    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('id', channelId);
    if (error) throw error;
  },

  // --- Suppliers ---
  saveSupplier: async (
    supplierData: Omit<Supplier, 'id' | 'teamId'> | Supplier,
    teamId?: string
  ): Promise<Supplier> => {
    if (useMockApi) {
      const effectiveTeamId =
        (supplierData as any).teamId ?? teamId ?? 'mock-team';
      const isExisting = 'id' in supplierData;
      const newId = isExisting
        ? (supplierData as Supplier).id
        : `supplier${Date.now()}`;
      const newSupplier: Supplier = {
        ...(supplierData as any),
        id: newId,
        teamId: effectiveTeamId
      };
      return Promise.resolve(newSupplier);
    }
    if (!supabase) throwConfigError();

    let effectiveTeamId = (supplierData as any).teamId ?? teamId;

    if (!effectiveTeamId) {
      try {
        const current = await api.getCurrentUserAndTeams();
        effectiveTeamId = current?.teams?.[0]?.id;
      } catch (e) {
        console.error('Failed to derive teamId in saveSupplier', e);
      }
    }

    if (!effectiveTeamId) {
      throw new Error('Missing teamId for supplier');
    }

    const payload = mapSupplierToDb({
      ...(supplierData as any),
      teamId: effectiveTeamId
    });

    const { data, error } = await supabase
      .from('suppliers')
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    return mapSupplierFromDb(data);
  },

  deleteSupplier: async (supplierId: string): Promise<void> => {
    if (useMockApi) return Promise.resolve();
    if (!supabase) throwConfigError();
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', supplierId);
    if (error) throw error;
  },

  // --- Ingredient Costs ---
  saveIngredientCost: async (
    costData: Omit<IngredientCost, 'id' | 'teamId'> | IngredientCost,
    teamId?: string
  ): Promise<IngredientCost> => {
    if (useMockApi) {
      const effectiveTeamId =
        (costData as any).teamId ?? teamId ?? 'mock-team';
      const isExisting = 'id' in costData;
      const newId = isExisting
        ? (costData as IngredientCost).id
        : `cost${Date.now()}`;
      const newCost: IngredientCost = {
        ...(costData as any),
        id: newId,
        teamId: effectiveTeamId
      };
      return Promise.resolve(newCost);
    }
    if (!supabase) throwConfigError();

    let effectiveTeamId = (costData as any).teamId ?? teamId;

    if (!effectiveTeamId) {
      try {
        const current = await api.getCurrentUserAndTeams();
        effectiveTeamId = current?.teams?.[0]?.id;
      } catch (e) {
        console.error('Failed to derive teamId in saveIngredientCost', e);
      }
    }

    if (!effectiveTeamId) {
      throw new Error('Missing teamId for ingredient cost');
    }

    const payload = mapIngredientCostToDb({
      ...(costData as any),
      teamId: effectiveTeamId
    });

    const { data, error } = await supabase
      .from('ingredient_costs')
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    return mapIngredientCostFromDb(data);
  },

  deleteIngredientCost: async (costId: string): Promise<void> => {
    if (useMockApi) return Promise.resolve();
    if (!supabase) throwConfigError();
    const { error } = await supabase
      .from('ingredient_costs')
      .delete()
      .eq('id', costId);
    if (error) throw error;
  },

  // --- Inventory Items ---
  saveInventoryItem: async (
    itemData: Omit<InventoryItem, 'id' | 'teamId'> | InventoryItem,
    teamId?: string
  ): Promise<InventoryItem> => {
    if (useMockApi) {
      const effectiveTeamId =
        (itemData as any).teamId ?? teamId ?? 'mock-team';
      const isExisting = 'id' in itemData;
      const newId = isExisting
        ? (itemData as InventoryItem).id
        : `inv${Date.now()}`;
      const newItem: InventoryItem = {
        ...(itemData as any),
        id: newId,
        teamId: effectiveTeamId
      };
      return Promise.resolve(newItem);
    }
    if (!supabase) throwConfigError();

    let effectiveTeamId = (itemData as any).teamId ?? teamId;

    if (!effectiveTeamId) {
      try {
        const current = await api.getCurrentUserAndTeams();
        effectiveTeamId = current?.teams?.[0]?.id;
      } catch (e) {
        console.error('Failed to derive teamId in saveInventoryItem', e);
      }
    }

    if (!effectiveTeamId) {
      throw new Error('Missing teamId for inventory item');
    }

    const payload = mapInventoryItemToDb({
      ...(itemData as any),
      teamId: effectiveTeamId
    });

    const { data, error } = await supabase
      .from('inventory')
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    return mapInventoryItemFromDb(data);
  },

  deleteInventoryItem: async (itemId: string): Promise<void> => {
    if (useMockApi) return Promise.resolve();
    if (!supabase) throwConfigError();
    const { error } = await supabase.from('inventory').delete().eq('id', itemId);
    if (error) throw error;
  },

  // --- Waste Logs ---
  saveWasteLog: async (
    logData: Omit<WasteLog, 'id'>
  ): Promise<WasteLog> => {
    if (useMockApi) {
      const newLog: WasteLog = {
        ...(logData as any),
        id: `waste${Date.now()}`
      };
      return Promise.resolve(newLog);
    }

    if (!supabase) throwConfigError();

    const payload = mapWasteLogToDb(logData);
    const { data, error } = await supabase
      .from('waste_logs')
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    return mapWasteLogFromDb(data);
  },

  deleteWasteLog: async (logId: string): Promise<void> => {
    if (useMockApi) return Promise.resolve();

    if (!supabase) throwConfigError();
    const { error } = await supabase
      .from('waste_logs')
      .delete()
      .eq('id', logId);
    if (error) throw error;
  }
};
