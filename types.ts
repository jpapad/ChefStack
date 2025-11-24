export type Allergen =
  | 'Gluten'
  | 'Crustaceans'
  | 'Eggs'
  | 'Fish'
  | 'Peanuts'
  | 'Soybeans'
  | 'Milk'
  | 'Nuts'
  | 'Celery'
  | 'Mustard'
  | 'Sesame seeds'
  | 'Sulphur dioxide and sulphites'
  | 'Lupin'
  | 'Molluscs';

export const ALLERGENS_LIST: Allergen[] = [
  'Gluten', 'Crustaceans', 'Eggs', 'Fish', 'Peanuts', 'Soybeans', 'Milk',
  'Nuts', 'Celery', 'Mustard', 'Sesame seeds', 'Sulphur dioxide and sulphites',
  'Lupin', 'Molluscs'
];

export const ALLERGEN_TRANSLATIONS: Record<Allergen, { el: string; en: string; }> = {
  'Gluten': { el: 'Γλουτένη', en: 'Gluten' },
  'Crustaceans': { el: 'Οστρακοειδή', en: 'Crustaceans' },
  'Eggs': { el: 'Αυγά', en: 'Eggs' },
  'Fish': { el: 'Ψάρι', en: 'Fish' },
  'Peanuts': { el: 'Φιστίκια', en: 'Peanuts' },
  'Soybeans': { el: 'Σόγια', en: 'Soybeans' },
  'Milk': { el: 'Γάλα', en: 'Milk' },
  'Nuts': { el: 'Ξηροί Καρποί', en: 'Nuts' },
  'Celery': { el: 'Σέλινο', en: 'Celery' },
  'Mustard': { el: 'Μουστάρδα', en: 'Mustard' },
  'Sesame seeds': { el: 'Σουσάμι', en: 'Sesame seeds' },
  'Sulphur dioxide and sulphites': { el: 'Διοξείδιο του Θείου & Θειώδη', en: 'Sulphur dioxide & Sulphites' },
  'Lupin': { el: 'Λούπινο', en: 'Lupin' },
  'Molluscs': { el: 'Μαλάκια', en: 'Molluscs' },
};

export type RecipeCategoryKey = 'appetizer' | 'main_course' | 'salad' | 'soup' | 'dessert' | 'sub_recipe' | 'other';
export const RECIPE_CATEGORY_KEYS: RecipeCategoryKey[] = ['appetizer', 'main_course', 'salad', 'soup', 'dessert', 'sub_recipe', 'other'];

export type Unit = 'g' | 'kg' | 'ml' | 'L' | 'τεμ' | 'κ.γ.' | 'κ.σ.'; // τεμ = items, κ.γ. = teaspoon, κ.σ. = tablespoon
export type PurchaseUnit = 'kg' | 'L' | 'τεμ';

export interface Ingredient {
  id: string; // Unique ID for each ingredient entry within a recipe
  name: string;
  quantity: number;
  unit: Unit;
  isSubRecipe: boolean;
  recipeId?: string; // ID of the recipe if it's a sub-recipe
}

export type RecipeStep = {
  id: string;
  type: 'step' | 'heading';
  content: string;
};

export interface Recipe {
  id: string;
  name: string;
  name_en: string; // Added for bilingual support
  description: string;
  imageUrl: string;
  category: RecipeCategoryKey;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  allergens: Allergen[];
  teamId: string;
  price?: number; // Selling price
  yield?: { quantity: number; unit: Unit }; // e.g. This recipe produces 1kg of sauce
}

export interface IngredientCost {
  id: string;
  name: string;
  cost: number; // Cost per purchaseUnit
  purchaseUnit: PurchaseUnit;
  teamId: string;
}

export interface Workstation {
  id: string;
  name: string;
  teamId: string;
}

export enum PrepTaskStatus {
  ToDo = 'todo',
  InProgress = 'inprogress',
  Done = 'done',
}

export interface PrepTask {
  id: string;
  description: string;
  recipeName: string;
  workstationId: string;
  status: PrepTaskStatus;
  teamId: string;
}

export enum HaccpLogType {
  Temperature = 'Temperature',
  Cleaning = 'Cleaning',
  Receiving = 'Receiving',
}

export type HaccpLogCategoryKey =
  | 'fridge'
  | 'freezer'
  | 'hot_holding'
  | 'cooking'
  | 'kitchen_area'
  | 'storage'
  | 'supplier_delivery';

export const HACCP_LOG_CATEGORY_KEYS: HaccpLogCategoryKey[] = [
  'fridge',
  'freezer',
  'hot_holding',
  'cooking',
  'kitchen_area',
  'storage',
  'supplier_delivery'
];

export interface HaccpItem {
  id: string;
  name: string;
  category: HaccpLogCategoryKey;
  teamId: string;
}

export interface HaccpLog {
  id: string;
  timestamp: Date;
  type: HaccpLogType;
  haccpItemId: string;
  value?: string; // For temperature, etc.
  user: string;
  teamId: string;
}

export interface InventoryLocation {
  id: string;
  name: string;
  teamId: string;
}

export interface InventoryItemLocation {
  locationId: string;
  quantity: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  locations: InventoryItemLocation[];
  unit: PurchaseUnit;
  reorderPoint: number;
  supplierId?: string;
  ingredientCostId?: string;
  teamId: string;
}

export interface Supplier {
  id: string;
  name:string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  teamId: string;
}

export interface MenuRecipe {
  recipeId: string;
  quantity: number; // Number of servings to produce
}

export interface BuffetCategory {
  id: string;
  name: string;
  recipes: MenuRecipe[];
}

export type MealPeriodNameKey = 'breakfast' | 'lunch' | 'dinner';
export const MEAL_PERIOD_NAME_KEYS: MealPeriodNameKey[] = ['breakfast', 'lunch', 'dinner'];

export interface MealPeriod {
  id: string;
  name: MealPeriodNameKey;
  categories: BuffetCategory[];
}

export interface DailyPlan {
  date: string; // YYYY-MM-DD
  mealPeriods: MealPeriod[];
}

export type MenuType = 'a_la_carte' | 'buffet';

// FIX: Refactored Menu type to be a standard discriminated union instead of an intersection type.
export type Menu =
  | {
      id: string;
      name: string;
      description: string;
      teamId: string;
      type: 'a_la_carte';
      recipeIds: string[];
    }
  | {
      id: string;
      name: string;
      description: string;
      teamId: string;
      type: 'buffet';
      pax: number;
      dailyPlans: DailyPlan[];
      startDate?: string; // YYYY-MM-DD
      endDate?: string;   // YYYY-MM-DD
    };

export type View =
  | 'dashboard'
  | 'recipes'
  | 'workstations'
  | 'kitchen_service'
  | 'haccp'
  | 'costing'
  | 'inventory'
  | 'suppliers'
  | 'menus'
  | 'labels'
  | 'haccp_print'
  | 'settings'
  | 'shopping_list'
  | 'stock_take'
  | 'notifications'
  | 'shifts'
  | 'inventory_history'
  | 'waste_log'
  | 'user_manual'
  | 'copilot';

export type LogoPosition = 'top' | 'bottom' | 'left' | 'right';

export type LanguageMode = 'el' | 'en' | 'both';

export const LANGUAGE_NAMES: Record<Exclude<LanguageMode, 'both'>, string> = {
  el: 'Greek',
  en: 'English',
};

export type Role = 'Admin' | 'Sous Chef' | 'Cook';

export interface Team {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface UserMembership {
  teamId: string;
  role: Role;
}

export interface User {
  id: string;
  name: string;
  email: string;
  memberships: UserMembership[];
}

export interface ShoppingListItem {
  name: string;
  required: number;
  stock: number;
  toBuy: number;
  unit: PurchaseUnit;
  supplierName?: string;
}

export interface Notification {
  id: string;
  userId: string; // The user who receives the notification
  teamId: string;
  senderName: string; // Name of the user or system part that sent it
  title: string;
  body: string;
  read: boolean;
  timestamp: Date;
  link?: {
    view: View;
    itemId: string;
  };
}

// Chat / Channels

export type ChannelType = 'general' | 'team' | 'kitchen' | 'service' | 'order';

export interface Channel {
  id: string;
  name: string;
  teamId: string;
  /** Optional type to distinguish γενικά κανάλια, kitchen pass, service κλπ. */
  type?: ChannelType;
  /** Αν το κανάλι είναι συνδεδεμένο με Order (π.χ. per-table chat). */
  relatedOrderId?: string;
}

export interface Message {
  id: string;
  conversationId: string; // Can be a channelId or a direct message ID (e.g., 'user1-user2')
  teamId: string;
  senderId: string;
  content: string;
  timestamp: Date;
}

export type MenuTemplate = 'classic' | 'modern' | 'elegant';

export interface MenuStyle {
  templateName: MenuTemplate;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

export interface MenuPrintCustomizations {
  title: string;
  footerText: string;
  logoUrl: string | null;
  style: MenuStyle | null;
}

// Shifts
export type ShiftTypeKey = 'morning' | 'evening' | 'split' | 'day_off';
export const SHIFT_TYPE_KEYS: ShiftTypeKey[] = ['morning', 'evening', 'split', 'day_off'];

export const SHIFT_TYPE_DETAILS: Record<
  ShiftTypeKey,
  { el: string; en: string; short_el: string; short_en: string; color: string }
> = {
  morning: {
    el: 'Πρωινή',
    en: 'Morning',
    short_el: 'Π',
    short_en: 'M',
    color: 'bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
  },
  evening: {
    el: 'Απογευματινή',
    en: 'Evening',
    short_el: 'A',
    short_en: 'E',
    color: 'bg-orange-200 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200'
  },
  split: {
    el: 'Σπαστή',
    en: 'Split',
    short_el: 'Σ',
    short_en: 'S',
    color: 'bg-purple-200 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200'
  },
  day_off: {
    el: 'Ρεπό',
    en: 'Day Off',
    short_el: 'Ρ',
    short_en: 'O',
    color: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
};

export interface Shift {
  id: string;
  userId: string;
  teamId: string;
  date: string; // YYYY-MM-DD
  type: ShiftTypeKey;
}

export interface ShiftSchedule {
  id: string;
  name: string;
  teamId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  userIds: string[];
}

// Calls
export type CallStatus = 'idle' | 'calling' | 'connected' | 'ended' | 'error';

export interface CallState {
  isActive: boolean;
  targetUserId: string | null;
  status: CallStatus;
}

// Invoice Import
export interface ExtractedInvoiceItem {
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface MappedInvoiceItem extends ExtractedInvoiceItem {
  inventoryId: string | 'new'; // 'new' or the ID of an existing inventory item
  isNew: boolean;
}

// Inventory History
export type InventoryTransactionType =
  | 'initial'
  | 'invoice_import'
  | 'manual_add'
  | 'manual_subtract'
  | 'transfer_out'
  | 'transfer_in'
  | 'recipe_consumption'
  | 'stock_take_adjustment'
  | 'waste';

export interface InventoryTransaction {
  id: string;
  itemId: string;
  timestamp: Date;
  type: InventoryTransactionType;
  quantityChange: number; // positive for additions, negative for subtractions
  locationId: string;
  relatedTransactionId?: string;
  notes?: string;
  userId: string;
  teamId: string;
}

// Waste Log
export type WasteReasonKey =
  | 'expired'
  | 'spoiled'
  | 'damaged'
  | 'cooking_error'
  | 'overproduction'
  | 'other';

export const WASTE_REASON_KEYS: WasteReasonKey[] = [
  'expired',
  'spoiled',
  'damaged',
  'cooking_error',
  'overproduction',
  'other'
];

export const WASTE_REASON_TRANSLATIONS: Record<
  WasteReasonKey,
  { el: string; en: string }
> = {
  expired: { el: 'Έληξε', en: 'Expired' },
  spoiled: { el: 'Αλλοιώθηκε', en: 'Spoiled' },
  damaged: { el: 'Χτυπημένο/Κατεστραμμένο', en: 'Damaged' },
  cooking_error: { el: 'Λάθος στο μαγείρεμα', en: 'Cooking Error' },
  overproduction: { el: 'Πλεονάζουσα παραγωγή', en: 'Overproduction' },
  other: { el: 'Άλλο', en: 'Other' }
};

export interface WasteLog {
  id: string;
  timestamp: Date;
  inventoryItemId: string;
  quantity: number;
  unit: PurchaseUnit;
  reason: WasteReasonKey;
  notes?: string;
  userId: string;
  teamId: string;
}

/* ------------------------------
   Kitchen–Service Orders
   (επικοινωνία κουζίνα–σερβις)
   ------------------------------ */

export type KitchenServiceOrderStatus =
  | 'new'
  | 'in_progress'
  | 'ready'
  | 'served'
  | 'cancelled';

export type KitchenOrderItemStatus =
  | 'pending'
  | 'prepping'
  | 'ready'
  | 'cancelled';

export interface KitchenOrderItem {
  id: string;
  /** Optional σύνδεση με Recipe για πλήρη ανάλυση/κοστολόγηση */
  recipeId?: string;
  /** Τίτλος που βλέπει κουζίνα & σερβις (π.χ. "Μοσχαράκι Κοκκινιστό") */
  customName: string;
  quantity: number;
  status: KitchenOrderItemStatus;
  /** Προτεινόμενος σταθμός εργασίας (π.χ. Grill, Pastry) */
  workstationId?: string;
  /** Σχόλια τύπου "χωρίς αλάτι", "καλοψημένο" */
  notes?: string;
  /** Tags για φίλτρα / board view ("vegan", "allergy", κ.λπ.) */
  tags?: string[];
}

export interface KitchenServiceOrder {
  id: string;
  teamId: string;
  /** Προαιρετική σύνδεση με chat channel (per-order room) */
  channelId?: string;
  /** Αριθμός τραπεζιού ή άλλος κωδικός (π.χ. "Takeaway #12") */
  tableNumber?: string;
  /** Εξωτερική αναφορά (POS / reservation id κ.λπ.) */
  externalRef?: string;
  status: KitchenServiceOrderStatus;
  items: KitchenOrderItem[];
  /** Γενικές σημειώσεις για την παραγγελία */
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  /** Ποιος χρήστης/σερβιτόρος άνοιξε την παραγγελία */
  createdByUserId?: string;
  /** Ποιος την σερβίρει / κλείνει */
  servedByUserId?: string;
}

// Permissions
export type Permission =
  | 'manage_team'
  | 'manage_recipes'
  | 'manage_inventory'
  | 'manage_costing'
  | 'manage_shifts'
  | 'manage_waste'
  | 'manage_kitchen_service';

export const ALL_PERMISSIONS: Permission[] = [
  'manage_team',
  'manage_recipes',
  'manage_inventory',
  'manage_costing',
  'manage_shifts',
  'manage_waste',
  'manage_kitchen_service'
];

export const PERMISSION_DESCRIPTIONS: Record<
  Permission,
  { el: string; en: string }
> = {
  manage_team: {
    el: 'Διαχείριση Ομάδας & Μελών',
    en: 'Manage Team & Members'
  },
  manage_recipes: {
    el: 'Διαχείριση Συνταγών (Δημιουργία/Επεξεργασία/Διαγραφή)',
    en: 'Manage Recipes (Create/Edit/Delete)'
  },
  manage_inventory: {
    el: 'Διαχείριση Αποθέματος & Προμηθευτών',
    en: 'Manage Inventory & Suppliers'
  },
  manage_costing: {
    el: 'Διαχείριση Κοστολογίου',
    en: 'Manage Costing'
  },
  manage_shifts: {
    el: 'Διαχείριση Βαρδιών',
    en: 'Manage Shifts'
  },
  manage_waste: {
    el: 'Διαχείριση Φθορών',
    en: 'Manage Waste Log'
  },
  manage_kitchen_service: {
    el: 'Διαχείριση Kitchen–Service Orders',
    en: 'Manage Kitchen–Service Orders'
  }
};

export type RolePermissions = Record<Role, Permission[]>;
