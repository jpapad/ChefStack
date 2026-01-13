import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  Recipe,
  IngredientCost,
  Workstation,
  PrepTask,
  HaccpLog,
  HaccpItem,
  HaccpReminder,
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
  WasteLog,
  KitchenServiceOrder,
  KitchenOrderItem,
  KitchenOrder,
  RecipeVariation,
  EmailReport,
  ReportHistory,
  TeamTask,
  ChatMessage
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

const mapIngredientCostToDb = (
  cost: Omit<IngredientCost, 'id'> | IngredientCost
) => {
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

const mapInventoryItemToDb = (
  item: Omit<InventoryItem, 'id'> | InventoryItem
) => {
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
  quantity: Number(row.quantity),
  unit: row.unit,
  reason: row.reason,
  notes: row.notes ?? '',
  timestamp: new Date(row.timestamp)
});

const mapWasteLogToDb = (log: Omit<WasteLog, 'id'> | WasteLog) => {
  const timestamp =
    log.timestamp instanceof Date
      ? log.timestamp
      : new Date(log.timestamp as any);

  const base = {
    team_id: (log as any).teamId,
    user_id: (log as any).userId,
    inventory_item_id: log.inventoryItemId,
    quantity: log.quantity,
    unit: log.unit,
    reason: log.reason,
    notes: log.notes ?? '',
    timestamp: timestamp.toISOString()
  };

  if ('id' in log && (log as any).id) {
    return { id: (log as any).id, ...base };
  }

  return { id: generateId('waste'), ...base };
};

// ---------- Helpers για ShiftSchedule ----------
const mapShiftScheduleToDb = (schedule: Omit<ShiftSchedule, 'id'> | ShiftSchedule) => {
  const base = {
    name: schedule.name,
    team_id: schedule.teamId,
    start_date: schedule.startDate,
    end_date: schedule.endDate,
    user_ids: schedule.userIds
  };

  if ('id' in schedule && schedule.id) {
    return { id: schedule.id, ...base };
  }
  
  // For new schedules, generate UUID
  return { id: generateId('shift_schedule'), ...base };
};

const mapShiftScheduleFromDb = (row: any): ShiftSchedule => ({
  id: row.id,
  name: row.name,
  teamId: row.team_id,
  startDate: row.start_date,
  endDate: row.end_date,
  userIds: row.user_ids ?? []
});

// ---------- Helpers για Messages & Channels ----------
const mapMessageFromDb = (row: any): Message => {
  const createdAt = row.created_at ? new Date(row.created_at) : new Date();

  const msg: any = {
    id: row.id,
    teamId: row.team_id,
    channelId: row.channel_id,
    userId: row.user_id,
    content: row.content,
    text: row.content,
    createdAt,
    timestamp: createdAt
  };

  return msg as Message;
};

const mapChannelFromDb = (row: any): Channel => {
  const createdAt = row.created_at ? new Date(row.created_at) : new Date();

  const ch: any = {
    id: row.id,
    teamId: row.team_id,
    name: row.name,
    createdAt,
    type: row.type ?? undefined,
    relatedOrderId: row.related_order_id ?? undefined
  };

  return ch as Channel;
};

// ---------- Helpers για Kitchen–Service Orders ----------
const mapKitchenOrderItemFromDb = (row: any): KitchenOrderItem => ({
  id: row.id,
  recipeId: row.recipe_id ?? undefined,
  customName: row.custom_name,
  quantity: row.quantity,
  status: row.status,
  workstationId: row.workstation_id ?? undefined,
  notes: row.notes ?? undefined,
  tags: row.tags ?? []
});

const mapKitchenOrderFromDb = (
  row: any,
  items: any[]
): KitchenServiceOrder => ({
  id: row.id,
  teamId: row.team_id,
  channelId: row.channel_id ?? undefined,
  tableNumber: row.table_number ?? undefined,
  externalRef: row.external_ref ?? undefined,
  status: row.status,
  items: items.map(mapKitchenOrderItemFromDb),
  notes: row.notes ?? undefined,
  createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
  createdByUserId: row.created_by_user_id ?? undefined,
  servedByUserId: row.served_by_user_id ?? undefined
});

// Input type για create/update
type KitchenServiceOrderInput = Omit<KitchenServiceOrder, 'createdAt' | 'updatedAt'> & {
  id?: string;
};

// ---------- API SERVICE ----------
export const api = {
  // -------- Fetch all initial data --------
  fetchAllData: async (): Promise<{
    recipes: Recipe[];
    ingredientCosts: IngredientCost[];
    workstations: Workstation[];
    tasks: PrepTask[];
    haccpLogs: HaccpLog[];
    haccpItems: HaccpItem[];
    haccpReminders: HaccpReminder[];
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
    orders: KitchenOrder[];
    variations: RecipeVariation[];
    reports: EmailReport[];
    reportHistory: ReportHistory[];
    teamTasks: TeamTask[];
    chatMessages: ChatMessage[];
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
            haccpReminders: mockData.mockHaccpReminders,
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
            orders: mockData.mockOrders,
            variations: mockData.mockVariations,
            reports: mockData.mockReports,
            reportHistory: mockData.mockReportHistory,
            teamTasks: mockData.mockTeamTasks,
            chatMessages: mockData.mockChatMessages
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
      haccpRemindersRes,
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
      supabase.from('haccp_reminders').select('*'),
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
        // Special handling for haccp_reminders table not found
        if (label === 'haccp_reminders' && res.error.code === 'PGRST205') {
          console.warn(`⚠️ Table 'haccp_reminders' not found. Create it with:
CREATE TABLE haccp_reminders (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  haccp_item_id TEXT REFERENCES haccp_items(id),
  frequency TEXT NOT NULL,
  next_check_due TIMESTAMP NOT NULL,
  is_overdue BOOLEAN DEFAULT FALSE,
  assigned_user_id TEXT
);`);
          return [];
        }
        console.error(`Error fetching ${label} from Supabase:`, res.error);
        return [];
      }
      return (res?.data || []) as T[];
    };

    const recipeRows = safeData<any>(recipesRes, 'recipes');
    const ingredientCostRows = safeData<any>(
      ingredientCostsRes,
      'ingredient_costs'
    );
    const workstationRows = safeData<Workstation>(
      workstationsRes,
      'workstations'
    );
    const taskRows = safeData<PrepTask>(tasksRes, 'tasks');
    const haccpLogRows = safeData<any>(haccpLogsRes, 'haccp_logs');
    const haccpItemRows = safeData<HaccpItem>(haccpItemsRes, 'haccp_items');
    const haccpReminderRows = safeData<any>(haccpRemindersRes, 'haccp_reminders');
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
    console.log('[api.fetchAllData] wasteLogRows from DB:', wasteLogRows);
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
    const channelRows = safeData<any>(channelsRes, 'channels');

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
      haccpLogs: haccpLogRows.map((l: any) => ({
        id: l.id,
        teamId: l.team_id,
        haccpItemId: l.haccp_item_id,
        type: l.type,
        value: l.value,
        user: l.user,
        notes: l.notes,
        timestamp: new Date(l.timestamp)
      })),
      haccpItems: haccpItemRows.map((item: any) => ({
        id: item.id,
        teamId: item.team_id,
        name: item.name,
        category: item.category
      })),
      haccpReminders: haccpReminderRows.map((r: any) => ({
        ...r,
        nextCheckDue: new Date(r.next_check_due),
        isOverdue: r.is_overdue,
        assignedUserId: r.assigned_user_id,
        haccpItemId: r.haccp_item_id,
        teamId: r.team_id
      })),
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
      messages: messageRows.map(mapMessageFromDb),
      shifts: shiftRows.map((s: any) => ({
        id: s.id,
        userId: s.user_id,
        teamId: s.team_id,
        date: s.date,
        type: s.type,
        startTime: s.start_time || undefined,
        endTime: s.end_time || undefined,
      })),
      shiftSchedules: shiftScheduleRows.map(mapShiftScheduleFromDb),
      channels: channelRows.map(mapChannelFromDb),
      teamTasks: [],  // TODO: Implement when Supabase tables are created
      chatMessages: []  // TODO: Implement when Supabase tables are created
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
  login: async (
    email: string,
    pass: string
  ): Promise<{ user: User; teams: Team[] }> => {
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

  getSession: async () => {
    if (useMockApi) {
      return { data: { session: null }, error: null };
    }
    if (!supabase) throwConfigError();
    return await supabase.auth.getSession();
  },

  resetPassword: async (email: string): Promise<void> => {
    if (useMockApi) {
      console.log('[api.resetPassword] Mock mode - email would be sent to:', email);
      return Promise.resolve();
    }
    if (!supabase) throwConfigError();

    // Redirect to root URL - app will detect type=recovery in hash and show ResetPasswordView
    const redirectUrl = import.meta.env.VITE_PUBLIC_URL || window.location.origin;
    console.log('[api.resetPassword] Sending reset email with redirectTo:', redirectUrl);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });

    if (error) {
      throw new Error(error.message || 'Αποτυχία αποστολής email επαναφοράς κωδικού.');
    }
  },

  updatePassword: async (newPassword: string): Promise<void> => {
    if (useMockApi) {
      console.log('[api.updatePassword] Mock mode - password would be updated');
      return Promise.resolve();
    }
    if (!supabase) throwConfigError();

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw new Error(error.message || 'Αποτυχία ενημέρωσης κωδικού.');
    }
  },

  // --- User Management ---
  updateUserProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
    if (useMockApi) {
      console.log('[api.updateUserProfile] Mock mode - user would be updated:', userId, updates);
      return Promise.resolve({ id: userId, ...updates } as User);
    }
    if (!supabase) throwConfigError();

    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.email) dbUpdates.email = updates.email;
    if (updates.memberships) dbUpdates.memberships = updates.memberships;

    const { data, error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Αποτυχία ενημέρωσης χρήστη.');
    }

    return data as User;
  },

  addUserToTeam: async (userId: string, teamId: string, role: Role): Promise<User> => {
    if (useMockApi) {
      console.log('[api.addUserToTeam] Mock mode - user would be added to team:', userId, teamId, role);
      return Promise.resolve({ id: userId, memberships: [{ teamId, role }] } as User);
    }
    if (!supabase) throwConfigError();

    // Get current user
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) {
      throw new Error(fetchError.message || 'Δεν βρέθηκε ο χρήστης.');
    }

    // Add new membership
    const currentMemberships = (user as any).memberships || [];
    const updatedMemberships = [...currentMemberships, { teamId, role }];

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ memberships: updatedMemberships })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      throw new Error(updateError.message || 'Αποτυχία προσθήκης χρήστη στην ομάδα.');
    }

    return updatedUser as User;
  },

  inviteUserToTeam: async (name: string, email: string, teamId: string, role: Role): Promise<{ user: User; invited: boolean }> => {
    if (useMockApi) {
      console.log('[api.inviteUserToTeam] Mock mode - user would be invited:', name, email, teamId, role);
      const newUser: User = {
        id: `user_${Date.now()}`,
        name,
        email,
        memberships: [{ teamId, role }]
      };
      return Promise.resolve({ user: newUser, invited: true });
    }
    if (!supabase) throwConfigError();

    // Try Edge Function first, fallback to direct database operation
    try {
      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: { name, email, teamId, role }
      });

      if (error) {
        console.warn('[api.inviteUserToTeam] Edge Function error, falling back to direct DB:', error);
        throw error; // Will trigger fallback
      }

      if (data?.error) {
        console.warn('[api.inviteUserToTeam] Edge Function returned error:', data.error);
        throw new Error(data.error);
      }

      return { user: data.user as User, invited: data.invited };
    } catch (edgeFunctionError) {
      console.warn('[api.inviteUserToTeam] Edge Function not available, using fallback method');
      
      // Fallback: Create user directly in database without auth account
      // User will need to sign up separately
      const { data: existingUsers } = await supabase
        .from('users')
        .select('*')
        .eq('email', email);

      if (existingUsers && existingUsers.length > 0) {
        // User exists, add to team
        const user = existingUsers[0];
        const currentMemberships = (user as any).memberships || [];
        const alreadyInTeam = currentMemberships.some((m: any) => m.teamId === teamId);

        if (alreadyInTeam) {
          throw new Error('Ο χρήστης υπάρχει ήδη στην ομάδα.');
        }

        const updatedMemberships = [...currentMemberships, { teamId, role }];
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ memberships: updatedMemberships })
          .eq('id', user.id)
          .select()
          .single();

        if (updateError) {
          throw new Error(updateError.message || 'Αποτυχία προσθήκης χρήστη στην ομάδα.');
        }

        return { user: updatedUser as User, invited: false };
      }

      // Create new user in database
      const newUserData = {
        name,
        email,
        memberships: [{ teamId, role }]
      };

      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert(newUserData)
        .select()
        .single();

      if (createError) {
        throw new Error(createError.message || 'Αποτυχία δημιουργίας χρήστη.');
      }

      // Note: User created in DB but without auth account
      // They'll need to sign up separately
      return { user: createdUser as User, invited: false };
    }
  },

  createUser: async (name: string, email: string, teamId: string, role: Role): Promise<User> => {
    // This now calls inviteUserToTeam which handles the full invite flow
    const result = await api.inviteUserToTeam(name, email, teamId, role);
    return result.user;
  },

  removeUserFromTeam: async (userId: string, teamId: string): Promise<User> => {
    if (useMockApi) {
      console.log('[api.removeUserFromTeam] Mock mode - user would be removed from team:', userId, teamId);
      return Promise.resolve({ id: userId, memberships: [] } as User);
    }
    if (!supabase) throwConfigError();

    // Get current user
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) {
      throw new Error(fetchError.message || 'Δεν βρέθηκε ο χρήστης.');
    }

    // Remove membership
    const currentMemberships = (user as any).memberships || [];
    const updatedMemberships = currentMemberships.filter((m: any) => m.teamId !== teamId);

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ memberships: updatedMemberships })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      throw new Error(updateError.message || 'Αποτυχία αφαίρεσης χρήστη από την ομάδα.');
    }

    return updatedUser as User;
  },

  // --- Team Roles & Permissions ---
  fetchTeamRoles: async (teamId: string): Promise<string[]> => {
    if (useMockApi) {
      console.log('[api.fetchTeamRoles] Mock mode - returning default roles');
      return Promise.resolve(['Admin', 'Sous Chef', 'Cook', 'Trainee']);
    }
    if (!supabase) throwConfigError();

    const { data, error } = await supabase
      .from('team_roles')
      .select('role_name')
      .eq('team_id', teamId)
      .order('role_name');

    if (error) {
      console.error('[api.fetchTeamRoles] Error:', error);
      return ['Admin', 'Sous Chef', 'Cook', 'Trainee']; // Return defaults on error
    }

    return data.map((r: any) => r.role_name);
  },

  createTeamRole: async (teamId: string, roleName: string): Promise<void> => {
    if (useMockApi) {
      console.log('[api.createTeamRole] Mock mode - role would be created:', roleName);
      return Promise.resolve();
    }
    if (!supabase) throwConfigError();

    const { error } = await supabase
      .from('team_roles')
      .insert({
        team_id: teamId,
        role_name: roleName,
        is_custom: true
      });

    if (error) {
      throw new Error(error.message || 'Αποτυχία δημιουργίας ρόλου.');
    }
  },

  deleteTeamRole: async (teamId: string, roleName: string): Promise<void> => {
    if (useMockApi) {
      console.log('[api.deleteTeamRole] Mock mode - role would be deleted:', roleName);
      return Promise.resolve();
    }
    if (!supabase) throwConfigError();

    // Delete role and its permissions
    await supabase.from('role_permissions').delete().eq('team_id', teamId).eq('role_name', roleName);
    
    const { error } = await supabase
      .from('team_roles')
      .delete()
      .eq('team_id', teamId)
      .eq('role_name', roleName);

    if (error) {
      throw new Error(error.message || 'Αποτυχία διαγραφής ρόλου.');
    }
  },

  fetchRolePermissions: async (teamId: string, roleName: string): Promise<string[]> => {
    if (useMockApi) {
      console.log('[api.fetchRolePermissions] Mock mode - returning empty permissions');
      return Promise.resolve([]);
    }
    if (!supabase) throwConfigError();

    const { data, error } = await supabase
      .from('role_permissions')
      .select('permission')
      .eq('team_id', teamId)
      .eq('role_name', roleName);

    if (error) {
      console.error('[api.fetchRolePermissions] Error:', error);
      return [];
    }

    return data.map((p: any) => p.permission);
  },

  updateRolePermissions: async (teamId: string, roleName: string, permissions: string[]): Promise<void> => {
    if (useMockApi) {
      console.log('[api.updateRolePermissions] Mock mode - permissions would be updated');
      return Promise.resolve();
    }
    if (!supabase) throwConfigError();

    // Delete existing permissions
    await supabase
      .from('role_permissions')
      .delete()
      .eq('team_id', teamId)
      .eq('role_name', roleName);

    // Insert new permissions
    if (permissions.length > 0) {
      const permissionRecords = permissions.map(permission => ({
        team_id: teamId,
        role_name: roleName,
        permission
      }));

      const { error } = await supabase
        .from('role_permissions')
        .insert(permissionRecords);

      if (error) {
        throw new Error(error.message || 'Αποτυχία ενημέρωσης δικαιωμάτων.');
      }
    }
  },

  initializeDefaultRoles: async (teamId: string): Promise<void> => {
    if (useMockApi) {
      console.log('[api.initializeDefaultRoles] Mock mode - default roles would be initialized');
      return Promise.resolve();
    }
    if (!supabase) throwConfigError();

    // Check if roles already exist
    const { data: existingRoles } = await supabase
      .from('team_roles')
      .select('role_name')
      .eq('team_id', teamId);

    if (existingRoles && existingRoles.length > 0) {
      return; // Already initialized
    }

    // Insert default roles
    const defaultRoles = ['Admin', 'Sous Chef', 'Cook', 'Trainee'];
    const roleRecords = defaultRoles.map(role => ({
      team_id: teamId,
      role_name: role,
      is_custom: false
    }));

    await supabase.from('team_roles').insert(roleRecords);

    // Initialize default permissions (you can customize these)
    const defaultPermissions = [
      { role: 'Admin', permissions: ['manage_recipes', 'manage_inventory', 'manage_shifts', 'manage_waste', 'manage_users', 'manage_team'] },
      { role: 'Sous Chef', permissions: ['manage_recipes', 'manage_inventory', 'manage_shifts', 'manage_waste'] },
      { role: 'Cook', permissions: [] },
      { role: 'Trainee', permissions: [] }
    ];

    for (const { role, permissions } of defaultPermissions) {
      if (permissions.length > 0) {
        const permRecords = permissions.map(permission => ({
          team_id: teamId,
          role_name: role,
          permission
        }));
        await supabase.from('role_permissions').insert(permRecords);
      }
    }
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
    
    // Map camelCase to snake_case for Supabase
    const dbSchedule = mapShiftScheduleToDb(scheduleData);
    
    console.log('[api.saveShiftSchedule] Sending to Supabase:', dbSchedule);
    
    const { data, error } = await supabase
      .from('shift_schedules')
      .upsert(dbSchedule)
      .select()
      .single();
      
    if (error) {
      console.error('[api.saveShiftSchedule] Supabase error:', error);
      throw error;
    }
    
    console.log('[api.saveShiftSchedule] Received from Supabase:', data);
    
    // Map snake_case back to camelCase
    return mapShiftScheduleFromDb(data);
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

  saveShift: async (shift: Shift): Promise<Shift> => {
    if (useMockApi) return Promise.resolve(shift);
    if (!supabase) throwConfigError();

    const dbShift = {
      id: shift.id,
      user_id: shift.userId,
      team_id: shift.teamId,
      date: shift.date,
      type: shift.type,
      start_time: shift.startTime || null,
      end_time: shift.endTime || null,
    };

    const { data, error } = await supabase
      .from('shifts')
      .upsert(dbShift)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      teamId: data.team_id,
      date: data.date,
      type: data.type,
      startTime: data.start_time || undefined,
      endTime: data.end_time || undefined,
    };
  },

  // --- Channels & Messages (Walkie-Talkie) ---
  fetchChannels: async (teamId: string): Promise<Channel[]> => {
    // Αν δεν υπάρχει Supabase, μπορείς προαιρετικά να γυρνάς mock κανάλια
    if (!supabase || !isSupabaseConfigured) {
      console.warn(
        '[api.fetchChannels] Supabase not configured – returning mock or empty channels.'
      );
      return useMockApi
        ? mockData.mockChannels.filter((c) => c.teamId === teamId)
        : [];
    }

    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[api.fetchChannels] error', error);
      throw error;
    }

    const rows = data ?? [];

    return rows.map(mapChannelFromDb);
  },

  fetchMessages: async (teamId: string): Promise<Message[]> => {
    if (!supabase || !isSupabaseConfigured) {
      console.warn(
        '[api.fetchMessages] Supabase not configured – returning mock or empty messages.'
      );
      if (useMockApi) {
        return mockData.mockMessages
          .filter((m) => (m as any).teamId === teamId)
          .map((m) => ({
            ...(m as any),
            createdAt:
              (m as any).createdAt instanceof Date
                ? (m as any).createdAt
                : new Date((m as any).createdAt),
            timestamp:
              (m as any).timestamp instanceof Date
                ? (m as any).timestamp
                : new Date((m as any).timestamp)
          })) as Message[];
      }
      return [];
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[api.fetchMessages] error', error);
      throw error;
    }

    const rows = data ?? [];

    return rows.map(mapMessageFromDb);
  },

  subscribeToMessages: (
    teamId: string,
    handler: (message: Message) => void
  ): () => void => {
    if (!supabase || !isSupabaseConfigured) {
      console.warn(
        '[api.subscribeToMessages] Supabase not configured – realtime walkie talkie disabled.'
      );
      return () => {};
    }

    const realtimeChannel = supabase
      .channel(`messages-team-${teamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `team_id=eq.${teamId}`
        },
        (payload) => {
          const row: any = payload.new;
          const msg = mapMessageFromDb(row);

          console.log('[api.subscribeToMessages] incoming row', row);
          console.log('[api.subscribeToMessages] mapped message', msg);

          handler(msg);
        }
      )
      .subscribe((status) => {
        console.log('[api.subscribeToMessages] status', status);
      });

    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  },

  subscribeToChannels: (
    teamId: string,
    handler: (channel: Channel) => void
  ): () => void => {
    if (!supabase || !isSupabaseConfigured) {
      console.warn(
        '[api.subscribeToChannels] Supabase not configured – realtime channels disabled.'
      );
      return () => {};
    }

    const realtimeChannel = supabase
      .channel(`channels-team-${teamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'channels',
          filter: `team_id=eq.${teamId}`
        },
        (payload) => {
          const row: any = payload.new;
          const ch = mapChannelFromDb(row);

          console.log('[api.subscribeToChannels] incoming row', row);
          console.log('[api.subscribeToChannels] mapped channel', ch);

          handler(ch);
        }
      )
      .subscribe((status) => {
        console.log('[api.subscribeToChannels] status', status);
      });

    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  },

  saveChannel: async (
    channelData: Omit<Channel, 'id'> | Channel
  ): Promise<Channel> => {
    if (!supabase || !isSupabaseConfigured) {
      if (useMockApi) {
        const isExisting = 'id' in channelData && !!(channelData as any).id;
        if (isExisting) return Promise.resolve(channelData as Channel);
        const newChannel: Channel = {
          ...(channelData as any),
          id: generateId('channel')
        } as Channel;
        return Promise.resolve(newChannel);
      }
      throwConfigError();
    }

    const base = channelData as any;
    const payload: any = {
      team_id: base.teamId,
      name: base.name,
      type: base.type ?? null,
      related_order_id: base.relatedOrderId ?? null
    };

    if (base.id) {
      payload.id = base.id;
    }

    const { data, error } = await supabase
      .from('channels')
      .upsert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('[api.saveChannel] error', error);
      throw error;
    }

    const row: any = data;

    return mapChannelFromDb(row);
  },

  deleteChannel: async (channelId: string): Promise<void> => {
    if (!supabase || !isSupabaseConfigured) {
      if (useMockApi) return Promise.resolve();
      throwConfigError();
    }

    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('id', channelId);

    if (error) {
      console.error('[api.deleteChannel] error', error);
      throw error;
    }
  },

  saveMessage: async (data: Omit<Message, 'id'>): Promise<Message> => {
    if (!supabase || !isSupabaseConfigured) {
      if (useMockApi) {
        const now = new Date();
        const newMsg: any = {
          ...(data as any),
          id: generateId('msg'),
          createdAt: now,
          timestamp: now
        };
        return Promise.resolve(newMsg as Message);
      }
      throwConfigError();
    }

    const payload: any = {
      team_id: (data as any).teamId,
      channel_id: (data as any).channelId,
      user_id: (data as any).userId,
      content: (data as any).content ?? (data as any).text
    };

    const { data: rows, error } = await supabase
      .from('messages')
      .insert([payload])
      .select('*')
      .single();

    if (error) {
      console.error('[api.saveMessage] error', error);
      throw error;
    }

    const row: any = rows;

    return mapMessageFromDb(row);
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
  saveWasteLog: async (logData: Omit<WasteLog, 'id'>): Promise<WasteLog> => {
    if (useMockApi) {
      const newLog: WasteLog = {
        ...(logData as any),
        id: `waste${Date.now()}`
      };
      return Promise.resolve(newLog);
    }

    if (!supabase) throwConfigError();

    const payload = mapWasteLogToDb(logData);
    console.log('[api.saveWasteLog] payload to insert into waste_logs:', payload);

    const { data, error } = await supabase
      .from('waste_logs')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('[api.saveWasteLog] Supabase error:', error);
      throw new Error(error.message || 'Supabase error while saving waste log');
    }

    console.log('[api.saveWasteLog] inserted row from DB:', data);
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
  },

  // --- Kitchen–Service Orders (κουζίνα–σέρβις) ---
  fetchKitchenServiceOrders: async (
    teamId: string
  ): Promise<KitchenServiceOrder[]> => {
    if (useMockApi) {
      console.warn(
        '[api.fetchKitchenServiceOrders] Supabase not configured – returning empty list.'
      );
      return [];
    }
    if (!supabase) throwConfigError();

    const { data: orderRows, error: ordersError } = await supabase
      .from('kitchen_service_orders')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error(
        '[api.fetchKitchenServiceOrders] error loading orders',
        ordersError
      );
      throw ordersError;
    }

    const orders = orderRows || [];
    if (orders.length === 0) return [];

    const orderIds = orders.map((o: any) => o.id);

    const { data: itemRows, error: itemsError } = await supabase
      .from('kitchen_order_items')
      .select('*')
      .in('order_id', orderIds);

    if (itemsError) {
      console.error(
        '[api.fetchKitchenServiceOrders] error loading items',
        itemsError
      );
      throw itemsError;
    }

    const byOrderId: Record<string, any[]> = {};
    (itemRows || []).forEach((row: any) => {
      if (!byOrderId[row.order_id]) byOrderId[row.order_id] = [];
      byOrderId[row.order_id].push(row);
    });

    return orders.map((row: any) =>
      mapKitchenOrderFromDb(row, byOrderId[row.id] || [])
    );
  },

  saveKitchenServiceOrder: async (
    order: KitchenServiceOrder
  ): Promise<KitchenServiceOrder> => {
    if (useMockApi) {
      console.warn(
        '[api.saveKitchenServiceOrder] Supabase not configured – returning input order.'
      );
      return Promise.resolve(order);
    }
    if (!supabase) throwConfigError();

    const createdAt =
      order.createdAt instanceof Date
        ? order.createdAt
        : new Date((order as any).createdAt);
    const updatedAt =
      order.updatedAt instanceof Date
        ? order.updatedAt
        : new Date((order as any).updatedAt);

    // Αν το id είναι "τυχαίο" client-side (π.χ. order_123), αφήνουμε τη βάση να βάλει δικό της uuid
    const isNew =
      !order.id || String(order.id).startsWith('order_');

    const orderPayload: any = {
      team_id: order.teamId,
      channel_id: order.channelId ?? null,
      table_number: order.tableNumber ?? null,
      external_ref: order.externalRef ?? null,
      status: order.status,
      notes: order.notes ?? null,
      created_by_user_id: order.createdByUserId ?? null,
      served_by_user_id: order.servedByUserId ?? null,
      created_at: createdAt.toISOString(),
      updated_at: updatedAt.toISOString()
    };

    if (!isNew && order.id) {
      orderPayload.id = order.id;
    }

    // 1️⃣ Αποθήκευση / ενημέρωση order
    const { data: savedOrderRow, error: orderError } = await supabase
      .from('kitchen_service_orders')
      .upsert(orderPayload)
      .select()
      .single();

    if (orderError || !savedOrderRow) {
      console.error('[api.saveKitchenServiceOrder] orderError', orderError);
      throw orderError || new Error('Failed to save kitchen-service order');
    }

    const orderId: string = savedOrderRow.id;

    // 2️⃣ Σβήνουμε παλιά items αυτού του order (ON DELETE CASCADE θα καθάριζε αν σβήναμε το order,
    //    αλλά εδώ θέλουμε "replace items")
    const { error: delError } = await supabase
      .from('kitchen_order_items')
      .delete()
      .eq('order_id', orderId);

    if (delError) {
      console.error(
        '[api.saveKitchenServiceOrder] delete items error',
        delError
      );
      // δεν κάνουμε throw για να μην σπάσουμε απαραίτητα το flow
    }

    // 3️⃣ Εισαγωγή των τωρινών items
        let savedItemRows: any[] = [];
    if (order.items && order.items.length > 0) {
      const itemsPayload = order.items.map((item) => ({
        // ✅ ΔΙΝΟΥΜΕ ΠΑΝΤΑ id για να μην είναι NULL
        id: generateId('koi'),
        order_id: orderId,
        recipe_id: item.recipeId ?? null,
        custom_name: item.customName,
        quantity: item.quantity,
        status: item.status,
        workstation_id: item.workstationId ?? null,
        notes: item.notes ?? null,
        tags: item.tags ?? []
      }));

      const { data: insertedItems, error: itemsError } = await supabase
        .from('kitchen_order_items')
        .insert(itemsPayload)
        .select();

      if (itemsError) {
        console.error(
          '[api.saveKitchenServiceOrder] itemsError',
          itemsError
        );
        throw itemsError;
      }

      savedItemRows = insertedItems || [];
    }


    // 4️⃣ Mapping πίσω στο domain model
    return mapKitchenOrderFromDb(savedOrderRow, savedItemRows);
  },

  deleteKitchenServiceOrder: async (orderId: string): Promise<void> => {
    if (useMockApi) {
      console.warn(
        '[api.deleteKitchenServiceOrder] Supabase not configured – no-op.'
      );
      return;
    }
    if (!supabase) throwConfigError();

    const { error } = await supabase
      .from('kitchen_service_orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('[api.deleteKitchenServiceOrder] error', error);
      throw error;
    }
  },

  // HACCP Items CRUD
  upsertHaccpItem: async (item: HaccpItem): Promise<HaccpItem> => {
    if (useMockApi) {
      console.warn('[api.upsertHaccpItem] Supabase not configured – returning item as-is.');
      return item;
    }
    if (!supabase) throwConfigError();

    const { data, error } = await supabase
      .from('haccp_items')
      .upsert({
        id: item.id,
        team_id: item.teamId,
        name: item.name,
        category: item.category
      })
      .select()
      .single();

    if (error) {
      console.error('[api.upsertHaccpItem] error', error);
      throw error;
    }

    return {
      id: data.id,
      teamId: data.team_id,
      name: data.name,
      category: data.category
    };
  },

  deleteHaccpItem: async (itemId: string): Promise<void> => {
    if (useMockApi) {
      console.warn('[api.deleteHaccpItem] Supabase not configured – no-op.');
      return;
    }
    if (!supabase) throwConfigError();

    const { error } = await supabase
      .from('haccp_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('[api.deleteHaccpItem] error', error);
      throw error;
    }
  },

  // HACCP Logs CRUD
  createHaccpLog: async (log: HaccpLog): Promise<HaccpLog> => {
    if (useMockApi) {
      console.warn('[api.createHaccpLog] Supabase not configured – returning log as-is.');
      return log;
    }
    if (!supabase) throwConfigError();

    const { data, error } = await supabase
      .from('haccp_logs')
      .insert({
        id: log.id,
        team_id: log.teamId,
        haccp_item_id: log.haccpItemId,
        timestamp: log.timestamp.toISOString(),
        type: log.type,
        value: log.value,
        user: log.user,
        status: log.status,
        notes: log.notes,
        is_out_of_range: log.isOutOfRange
      })
      .select()
      .single();

    if (error) {
      console.error('[api.createHaccpLog] error', error);
      throw error;
    }

    return {
      id: data.id,
      teamId: data.team_id,
      haccpItemId: data.haccp_item_id,
      timestamp: new Date(data.timestamp),
      type: data.type,
      value: data.value,
      user: data.user,
      status: data.status,
      notes: data.notes,
      isOutOfRange: data.is_out_of_range
    };
  },

  updateHaccpLog: async (log: HaccpLog): Promise<HaccpLog> => {
    if (useMockApi) {
      console.warn('[api.updateHaccpLog] Supabase not configured – returning log as-is.');
      return log;
    }
    if (!supabase) throwConfigError();

    const { data, error } = await supabase
      .from('haccp_logs')
      .update({
        team_id: log.teamId,
        haccp_item_id: log.haccpItemId,
        timestamp: log.timestamp.toISOString(),
        type: log.type,
        value: log.value,
        user: log.user,
        status: log.status,
        notes: log.notes,
        is_out_of_range: log.isOutOfRange
      })
      .eq('id', log.id)
      .select()
      .single();

    if (error) {
      console.error('[api.updateHaccpLog] error', error);
      throw error;
    }

    return {
      id: data.id,
      teamId: data.team_id,
      haccpItemId: data.haccp_item_id,
      timestamp: new Date(data.timestamp),
      type: data.type,
      value: data.value,
      user: data.user,
      status: data.status,
      notes: data.notes,
      isOutOfRange: data.is_out_of_range
    };
  },

  deleteHaccpLog: async (logId: string): Promise<void> => {
    if (useMockApi) {
      console.warn('[api.deleteHaccpLog] Supabase not configured – no-op.');
      return;
    }
    if (!supabase) throwConfigError();

    const { error } = await supabase
      .from('haccp_logs')
      .delete()
      .eq('id', logId);

    if (error) {
      console.error('[api.deleteHaccpLog] error', error);
      throw error;
    }
  },

  // ============================================================
  // Kitchen Orders (KDS)
  // ============================================================

  /**
   * Create new kitchen order
   */
  createKitchenOrder: async (order: Omit<KitchenOrder, 'id' | 'createdAt'>): Promise<KitchenOrder> => {
    if (useMockApi) {
      const newOrder: KitchenOrder = {
        ...order,
        id: `order_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      console.log('[api.createKitchenOrder] Mock mode - created order:', newOrder);
      return Promise.resolve(newOrder);
    }
    if (!supabase) throwConfigError();

    const payload = {
      team_id: order.teamId,
      order_number: order.orderNumber,
      table_number: order.tableNumber || null,
      customer_name: order.customerName || null,
      station: order.station || null,
      items: order.items,
      status: order.status,
      priority: order.priority,
      source: order.source || 'manual',
      external_order_id: order.externalOrderId || null,
      started_at: order.startedAt || null,
      ready_at: order.readyAt || null,
      served_at: order.servedAt || null,
      cancelled_at: order.cancelledAt || null,
      estimated_time: order.estimatedTime || null,
      assigned_to: order.assignedTo || null,
      notes: order.notes || null,
    };

    const { data, error } = await supabase
      .from('kitchen_orders')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('[api.createKitchenOrder] error', error);
      throw error;
    }

    return {
      id: data.id,
      teamId: data.team_id,
      orderNumber: data.order_number,
      tableNumber: data.table_number,
      customerName: data.customer_name,
      station: data.station,
      items: data.items,
      status: data.status,
      priority: data.priority,
      source: data.source,
      externalOrderId: data.external_order_id,
      createdAt: data.created_at,
      startedAt: data.started_at,
      readyAt: data.ready_at,
      servedAt: data.served_at,
      cancelledAt: data.cancelled_at,
      estimatedTime: data.estimated_time,
      assignedTo: data.assigned_to,
      notes: data.notes,
    };
  },

  /**
   * Update kitchen order status and timestamps
   */
  updateKitchenOrderStatus: async (
    orderId: string,
    status: OrderStatus,
    updates?: Partial<Pick<KitchenOrder, 'startedAt' | 'readyAt' | 'servedAt' | 'cancelledAt' | 'assignedTo'>>
  ): Promise<KitchenOrder> => {
    if (useMockApi) {
      console.log('[api.updateKitchenOrderStatus] Mock mode - updated order:', orderId, status);
      // Return mock object - in real app this would come from mock data
      return Promise.resolve({} as KitchenOrder);
    }
    if (!supabase) throwConfigError();

    const payload: any = {
      status,
      ...updates,
    };

    const { data, error } = await supabase
      .from('kitchen_orders')
      .update(payload)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('[api.updateKitchenOrderStatus] error', error);
      throw error;
    }

    return {
      id: data.id,
      teamId: data.team_id,
      orderNumber: data.order_number,
      tableNumber: data.table_number,
      customerName: data.customer_name,
      station: data.station,
      items: data.items,
      status: data.status,
      priority: data.priority,
      source: data.source,
      externalOrderId: data.external_order_id,
      createdAt: data.created_at,
      startedAt: data.started_at,
      readyAt: data.ready_at,
      servedAt: data.served_at,
      cancelledAt: data.cancelled_at,
      estimatedTime: data.estimated_time,
      assignedTo: data.assigned_to,
      notes: data.notes,
    };
  },

  /**
   * Delete kitchen order
   */
  deleteKitchenOrder: async (orderId: string): Promise<void> => {
    if (useMockApi) {
      console.warn('[api.deleteKitchenOrder] Mock mode - no-op.');
      return;
    }
    if (!supabase) throwConfigError();

    const { error } = await supabase
      .from('kitchen_orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('[api.deleteKitchenOrder] error', error);
      throw error;
    }
  }
};
