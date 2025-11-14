// services/api.ts
import { 
    mockRecipes, mockIngredientCosts, mockWorkstations, mockPrepTasks, mockHaccpLogs, mockHaccpItems, mockSuppliers, 
    mockInventory, mockMenus, mockUsers, mockTeams, mockNotifications, mockMessages, mockShifts, mockShiftSchedules, mockChannels, mockInventoryLocations, mockInventoryTransactions, mockWasteLogs
} from '../data/mockData';
import { 
    Recipe, IngredientCost, Workstation, PrepTask, HaccpLog, HaccpItem, Supplier, InventoryItem, Menu, User, Team, Notification, Message, Shift, ShiftSchedule, Channel, InventoryLocation, InventoryTransaction, WasteLog
} from '../types';

// --- DATABASE SIMULATION ---
// We use `let` to make them mutable. Data is initialized from localStorage or mockData.
const load = <T,>(key: string, fallback: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        console.error(`Failed to load ${key} from localStorage`, e);
        return fallback;
    }
}

let recipes: Recipe[] = load('recipes', mockRecipes);
let ingredientCosts: IngredientCost[] = load('ingredientCosts', mockIngredientCosts);
let workstations: Workstation[] = load('workstations', mockWorkstations);
let tasks: PrepTask[] = load('tasks', mockPrepTasks);
let haccpLogs: HaccpLog[] = load('haccpLogs', mockHaccpLogs);
let haccpItems: HaccpItem[] = load('haccpItems', mockHaccpItems);
let suppliers: Supplier[] = load('suppliers', mockSuppliers);
let inventory: InventoryItem[] = load('inventory', mockInventory);
let inventoryLocations: InventoryLocation[] = load('inventoryLocations', mockInventoryLocations);
let inventoryTransactions: InventoryTransaction[] = load('inventoryTransactions', mockInventoryTransactions);
let wasteLogs: WasteLog[] = load('wasteLogs', mockWasteLogs);
let menus: Menu[] = load('menus', mockMenus);
let users: User[] = load('users', mockUsers);
let teams: Team[] = load('teams', mockTeams);
let notifications: Notification[] = load('notifications', mockNotifications);
let messages: Message[] = load('messages', mockMessages);
let shifts: Shift[] = load('shifts', mockShifts);
let shiftSchedules: ShiftSchedule[] = load('shiftSchedules', mockShiftSchedules);
let channels: Channel[] = load('channels', mockChannels);

const persist = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch(e) {
    console.error(`Failed to persist ${key} to localStorage`, e);
  }
};

const LATENCY = 200; // ms

const findAndReplace = <T extends {id: string}>(collection: T[], item: T): T[] => {
    const index = collection.findIndex(i => i.id === item.id);
    if (index > -1) {
        collection[index] = item;
    } else {
        collection.push(item);
    }
    return [...collection];
};

// --- API SERVICE ---
export const api = {
  fetchAllData: async (): Promise<{
    recipes: Recipe[], ingredientCosts: IngredientCost[], workstations: Workstation[], tasks: PrepTask[], haccpLogs: HaccpLog[], haccpItems: HaccpItem[],
    suppliers: Supplier[], inventory: InventoryItem[], inventoryLocations: InventoryLocation[], inventoryTransactions: InventoryTransaction[], wasteLogs: WasteLog[], menus: Menu[], users: User[], teams: Team[], notifications: Notification[], messages: Message[], shifts: Shift[], shiftSchedules: ShiftSchedule[], channels: Channel[]
  }> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          recipes, ingredientCosts, workstations, tasks, haccpLogs, haccpItems, suppliers, 
          inventory, inventoryLocations, inventoryTransactions, wasteLogs, menus, users, teams, notifications, messages, shifts, shiftSchedules, channels
        });
      }, LATENCY);
    });
  },

  // --- Auth ---
  signUp: async (name: string, email: string, pass: string): Promise<{ user: User, team: Team }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
        if (emailExists) {
            reject(new Error('This email is already in use.'));
            return;
        }

        // 1. Create a new personal team for the user
        const newTeam: Team = {
            // Fix: Replaced template literal with string concatenation to avoid parsing issues.
            id: 'team' + Date.now(),
            name: name + "'s Kitchen"
        };
        teams.push(newTeam);
        persist('teams', teams);

        // 2. Create the new user
        const newUser: User = {
            // Fix: Replaced template literal with string concatenation to avoid parsing issues.
            id: 'user' + Date.now(),
            name,
            email,
            memberships: [{ teamId: newTeam.id, role: 'Admin' }]
        };
        users.push(newUser);
        persist('users', users);

        resolve({ user: newUser, team: newTeam });
      }, LATENCY * 2);
    });
  },


  // --- Recipes ---
  saveRecipe: async (recipeData: Omit<Recipe, 'id'> | Recipe): Promise<Recipe> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const isNew = !('id' in recipeData);
        const recipe: Recipe = isNew
          // Fix: Replaced template literal with string concatenation to avoid parsing issues.
          ? { ...(recipeData as Omit<Recipe, 'id'>), id: 'recipe' + Date.now() }
          : recipeData as Recipe;
        
        recipes = findAndReplace(recipes, recipe);
        persist('recipes', recipes);
        resolve(recipe);
      }, LATENCY);
    });
  },

  deleteRecipe: async (recipeId: string): Promise<void> => {
     return new Promise(resolve => {
       setTimeout(() => {
         recipes = recipes.filter(r => r.id !== recipeId);
         persist('recipes', recipes);
         resolve();
       }, LATENCY);
     });
  },
  
  // A helper to save many recipes at once, for AI generation
  saveMultipleRecipes: async (recipeDatas: Omit<Recipe, 'id' | 'teamId'>[]): Promise<Recipe[]> => {
      return new Promise(resolve => {
          setTimeout(() => {
              const createdRecipes: Recipe[] = [];
              recipeDatas.forEach(rData => {
                  // Fix: Replaced template literal with string concatenation to avoid parsing issues.
                  const newRecipe = { ...rData, id: 'recipe' + Date.now() + Math.random() } as Recipe;
                  recipes.push(newRecipe);
                  createdRecipes.push(newRecipe);
              });
              persist('recipes', recipes);
              resolve(createdRecipes);
          }, LATENCY);
      });
  },


  // --- Menus ---
  saveMenu: async (menuData: Omit<Menu, 'id'> | Menu): Promise<Menu> => {
      return new Promise(resolve => {
          setTimeout(() => {
              const isNew = !('id' in menuData);
              const menu = isNew
                  // Fix: Replaced template literal with string concatenation to avoid parsing issues.
                  ? { ...menuData, id: 'menu' + Date.now() } as Menu
                  : menuData as Menu;
              menus = findAndReplace(menus, menu);
              persist('menus', menus);
              resolve(menu);
          }, LATENCY);
      });
  },

  deleteMenu: async (menuId: string): Promise<void> => {
      return new Promise(resolve => {
          setTimeout(() => {
              menus = menus.filter(m => m.id !== menuId);
              persist('menus', menus);
              resolve();
          }, LATENCY);
      });
  },
  
    // --- Teams ---
  saveTeam: async (teamData: Team): Promise<Team> => {
    return new Promise(resolve => {
      setTimeout(() => {
        teams = findAndReplace(teams, teamData);
        persist('teams', teams);
        resolve(teamData);
      }, LATENCY);
    });
  },
  
  // --- Shift Schedules ---
  saveShiftSchedule: async (scheduleData: Omit<ShiftSchedule, 'id'> | ShiftSchedule): Promise<ShiftSchedule> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const isNew = !('id' in scheduleData);
            const schedule: ShiftSchedule = isNew
                ? { ...(scheduleData as Omit<ShiftSchedule, 'id'>), id: 'schedule' + Date.now() }
                : scheduleData as ShiftSchedule;
            
            shiftSchedules = findAndReplace(shiftSchedules, schedule);
            persist('shiftSchedules', shiftSchedules);
            resolve(schedule);
        }, LATENCY);
    });
  },

  deleteShiftSchedule: async (scheduleId: string): Promise<void> => {
      return new Promise(resolve => {
          setTimeout(() => {
              shiftSchedules = shiftSchedules.filter(s => s.id !== scheduleId);
              persist('shiftSchedules', shiftSchedules);
              resolve();
          }, LATENCY);
      });
  },
  
  // --- Channels ---
  saveChannel: async (channelData: Omit<Channel, 'id'> | Channel): Promise<Channel> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const isNew = !('id' in channelData);
            const channel: Channel = isNew
                ? { ...(channelData as Omit<Channel, 'id'>), id: 'channel' + Date.now() }
                : channelData as Channel;
            
            channels = findAndReplace(channels, channel);
            persist('channels', channels);
            resolve(channel);
        }, LATENCY);
    });
  },

  deleteChannel: async (channelId: string): Promise<void> => {
      return new Promise(resolve => {
          setTimeout(() => {
              channels = channels.filter(c => c.id !== channelId);
              persist('channels', channels);
              resolve();
          }, LATENCY);
      });
  },


  // NOTE: In a real application, there would be many more API functions here for
  // every single CRUD operation (saveIngredientCost, deleteSupplier, etc.).
  // For this simulation, we'll allow direct state updates for simpler entities
  // via the handlers passed down from App.tsx, but the architecture is in place.
  // The Recipe and Menu entities are the most complex and benefit most from this pattern.
};