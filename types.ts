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

// Allergen icon display variants
export type AllergenIconVariant = 'colored' | 'monochrome' | 'outline';

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

export interface RecipeRating {
  userId: string;
  rating: number; // 1-5
  timestamp: string;
}

export interface NutritionInfo {
  calories: number; // kcal per serving
  protein: number; // grams per serving
  carbs: number; // grams per serving
  fat: number; // grams per serving
  fiber?: number; // grams per serving
  sugar?: number; // grams per serving
  sodium?: number; // mg per serving
  isCalculated: boolean; // true if auto-calculated, false if manually entered
}

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
  ratings?: RecipeRating[]; // Team member ratings
  nutrition?: NutritionInfo; // Nutritional information per serving
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
  isOutOfRange?: boolean; // Auto-calculated: true if temperature is outside safe range
  notes?: string; // Additional notes or corrective actions
}

export interface HaccpReminder {
  id: string;
  haccpItemId: string;
  frequency: 'hourly' | 'every_2_hours' | 'every_4_hours' | 'daily' | 'weekly'; // Check frequency
  lastCheckTime?: Date; // Last time this item was checked
  nextCheckDue?: Date; // When next check is due
  assignedUserId?: string; // Who should do this check
  isOverdue: boolean; // Calculated field
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
  | 'kds'
  | 'haccp'
  | 'costing'
  | 'inventory'
  | 'suppliers'
  | 'menus'
  | 'labels'
  | 'labels_print'
  | 'haccp_print'
  | 'settings'
  | 'shopping_list'
  | 'stock_take'
  | 'notifications'
  | 'shifts'
  | 'inventory_history'
  | 'waste_log'
  | 'reports'
  | 'user_manual'
  | 'analytics'
  | 'collaboration'
  | 'copilot';

export type LogoPosition = 'top' | 'bottom' | 'left' | 'right';

export type LanguageMode = 'el' | 'en' | 'both';

export const LANGUAGE_NAMES: Record<Exclude<LanguageMode, 'both'>, string> = {
  el: 'Greek',
  en: 'English',
};

export type Role = 'Admin' | 'Sous Chef' | 'Cook' | 'Trainee';

// Permissions per feature/view
export type Permission = 
  | 'view_dashboard'
  | 'view_recipes'
  | 'edit_recipes'
  | 'delete_recipes'
  | 'view_inventory'
  | 'edit_inventory'
  | 'view_menu'
  | 'edit_menu'
  | 'view_haccp'
  | 'edit_haccp'
  | 'view_suppliers'
  | 'edit_suppliers'
  | 'view_waste'
  | 'edit_waste'
  | 'view_costing'
  | 'edit_costing'
  | 'view_shifts'
  | 'edit_shifts'
  | 'view_reports'
  | 'manage_users'
  | 'manage_team_settings'
  | 'view_pos'
  | 'manage_pos';

// Role definitions with permissions
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  'Admin': [
    'view_dashboard',
    'view_recipes', 'edit_recipes', 'delete_recipes',
    'view_inventory', 'edit_inventory',
    'view_menu', 'edit_menu',
    'view_haccp', 'edit_haccp',
    'view_suppliers', 'edit_suppliers',
    'view_waste', 'edit_waste',
    'view_costing', 'edit_costing',
    'view_shifts', 'edit_shifts',
    'view_reports',
    'manage_users',
    'manage_team_settings',
    'view_pos', 'manage_pos'
  ],
  'Sous Chef': [
    'view_dashboard',
    'view_recipes', 'edit_recipes',
    'view_inventory', 'edit_inventory',
    'view_menu', 'edit_menu',
    'view_haccp', 'edit_haccp',
    'view_suppliers',
    'view_waste', 'edit_waste',
    'view_costing',
    'view_shifts', 'edit_shifts',
    'view_reports',
    'view_pos'
  ],
  'Cook': [
    'view_dashboard',
    'view_recipes',
    'view_inventory',
    'view_menu',
    'view_haccp', 'edit_haccp',
    'view_waste', 'edit_waste',
    'view_shifts',
    'view_pos'
  ],
  'Trainee': [
    'view_dashboard',
    'view_recipes',
    'view_menu',
    'view_shifts'
  ]
};

export const ROLE_LABELS: Record<Role, { el: string; en: string; color: string }> = {
  'Admin': { el: 'Διαχειριστής', en: 'Admin', color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' },
  'Sous Chef': { el: 'Υποσεφ', en: 'Sous Chef', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' },
  'Cook': { el: 'Μάγειρας', en: 'Cook', color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' },
  'Trainee': { el: 'Μαθητευόμενος', en: 'Trainee', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' }
};

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
  startTime?: string; // HH:MM (24-hour format)
  endTime?: string; // HH:MM (24-hour format)
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

// ============================================================
// KITCHEN DISPLAY SYSTEM (KDS) - Order Management
// ============================================================

export type OrderStatus = 'new' | 'in-progress' | 'ready' | 'served' | 'cancelled';

export const ORDER_STATUS_TRANSLATIONS: Record<OrderStatus, { el: string; en: string; color: string }> = {
  'new': { el: 'Νέα', en: 'New', color: 'blue' },
  'in-progress': { el: 'Σε Εξέλιξη', en: 'In Progress', color: 'yellow' },
  'ready': { el: 'Έτοιμη', en: 'Ready', color: 'green' },
  'served': { el: 'Σερβιρισμένη', en: 'Served', color: 'gray' },
  'cancelled': { el: 'Ακυρωμένη', en: 'Cancelled', color: 'red' },
};

export type OrderPriority = 'low' | 'normal' | 'high' | 'urgent';

export const ORDER_PRIORITY_TRANSLATIONS: Record<OrderPriority, { el: string; en: string; color: string }> = {
  'low': { el: 'Χαμηλή', en: 'Low', color: 'gray' },
  'normal': { el: 'Κανονική', en: 'Normal', color: 'blue' },
  'high': { el: 'Υψηλή', en: 'High', color: 'orange' },
  'urgent': { el: 'Επείγουσα', en: 'Urgent', color: 'red' },
};

export interface OrderItem {
  id: string;
  recipeId: string;
  recipeName: string;
  quantity: number;
  notes?: string;
  specialRequests?: string[];
}

export interface KitchenOrder {
  id: string;
  orderNumber: string;
  tableNumber?: string;
  customerName?: string; // For delivery orders
  station?: string; // e.g., 'hot', 'cold', 'grill', 'pastry'
  items: OrderItem[];
  status: OrderStatus;
  priority: OrderPriority;
  source?: 'pos' | 'manual' | 'online' | 'tablet'; // Order source
  externalOrderId?: string; // ID from external system (POS, delivery platform)
  createdAt: string; // ISO timestamp
  startedAt?: string; // When moved to in-progress
  readyAt?: string; // When marked as ready
  servedAt?: string; // When served
  cancelledAt?: string;
  estimatedTime?: number; // minutes
  assignedTo?: string; // User ID
  notes?: string;
  teamId: string;
}

export interface OrderStatusChange {
  id: string;
  orderId: string;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  changedBy: string; // User ID
  changedAt: string;
  notes?: string;
}

// ============================================================
// RECIPE VARIATIONS - Parent/Child Recipe Relationships
// ============================================================

export type VariationType = 'vegan' | 'vegetarian' | 'gluten-free' | 'dairy-free' | 'low-carb' | 'seasonal' | 'portion-size' | 'custom';

export const VARIATION_TYPE_TRANSLATIONS: Record<VariationType, { el: string; en: string; icon: string }> = {
  'vegan': { el: 'Vegan', en: 'Vegan', icon: 'leaf' },
  'vegetarian': { el: 'Χορτοφαγική', en: 'Vegetarian', icon: 'salad' },
  'gluten-free': { el: 'Χωρίς Γλουτένη', en: 'Gluten-Free', icon: 'wheat-off' },
  'dairy-free': { el: 'Χωρίς Γαλακτοκομικά', en: 'Dairy-Free', icon: 'milk-off' },
  'low-carb': { el: 'Χαμηλών Υδατανθράκων', en: 'Low-Carb', icon: 'trending-down' },
  'seasonal': { el: 'Εποχική', en: 'Seasonal', icon: 'sun' },
  'portion-size': { el: 'Διαφορετική Μερίδα', en: 'Portion Size', icon: 'scale' },
  'custom': { el: 'Προσαρμοσμένη', en: 'Custom', icon: 'settings' }
};

export interface RecipeVariation {
  id: string;
  parentRecipeId: string; // The original recipe
  variationType: VariationType;
  name: string; // Greek name (e.g., "Μουσακάς Vegan")
  name_en: string; // English name (e.g., "Vegan Moussaka")
  description?: string; // What makes this variation different
  scaleFactor?: number; // For portion-size variations (e.g., 0.5 for half portion, 2.0 for double)
  ingredientModifications: IngredientModification[]; // Changes to ingredients
  allergenChanges?: Allergen[]; // New allergens (removed ones handled by ingredient mods)
  seasonalPeriod?: { // For seasonal variations
    startMonth: number; // 1-12
    endMonth: number; // 1-12
  };
  isActive: boolean; // Can be toggled on/off
  createdAt: string;
  teamId: string;
}

export interface IngredientModification {
  originalIngredientId?: string; // If replacing, which ingredient
  action: 'add' | 'remove' | 'replace' | 'scale'; // What to do
  newIngredient?: Ingredient; // For add/replace actions
  scaleFactor?: number; // For scale action (e.g., 1.5 for 50% more)
  notes?: string; // Why this change
}

// ============================================================
// EMAIL REPORTS & SCHEDULING - Automated Report Generation
// ============================================================

export type ReportType = 'inventory' | 'waste' | 'haccp' | 'costing' | 'analytics' | 'custom';
export type ReportFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'manual';
export type ReportFormat = 'pdf' | 'csv' | 'both';
export type ReportStatus = 'scheduled' | 'generating' | 'sent' | 'failed';

export const REPORT_TYPE_TRANSLATIONS: Record<ReportType, { el: string; en: string; icon: string }> = {
  'inventory': { el: 'Απόθεμα', en: 'Inventory', icon: 'package' },
  'waste': { el: 'Φθορές', en: 'Waste', icon: 'trash-2' },
  'haccp': { el: 'HACCP', en: 'HACCP', icon: 'thermometer' },
  'costing': { el: 'Κοστολόγιο', en: 'Costing', icon: 'scale' },
  'analytics': { el: 'Analytics', en: 'Analytics', icon: 'bar-chart-2' },
  'custom': { el: 'Προσαρμοσμένη', en: 'Custom', icon: 'file-text' }
};

export const REPORT_FREQUENCY_TRANSLATIONS: Record<ReportFrequency, { el: string; en: string }> = {
  'daily': { el: 'Καθημερινά', en: 'Daily' },
  'weekly': { el: 'Εβδομαδιαία', en: 'Weekly' },
  'biweekly': { el: 'Κάθε 2 Εβδομάδες', en: 'Biweekly' },
  'monthly': { el: 'Μηνιαία', en: 'Monthly' },
  'manual': { el: 'Χειροκίνητα', en: 'Manual' }
};

export interface EmailReport {
  id: string;
  name: string; // Report name
  reportType: ReportType;
  frequency: ReportFrequency;
  format: ReportFormat;
  recipients: string[]; // Email addresses
  isActive: boolean;
  
  // Schedule
  scheduledTime?: string; // HH:MM format (e.g., "09:00")
  scheduledDay?: number; // For weekly/biweekly (0=Sunday, 6=Saturday)
  scheduledDate?: number; // For monthly (1-31)
  
  // Content filters
  dateRange?: {
    from?: string; // ISO date
    to?: string; // ISO date
  };
  includeCharts?: boolean;
  customNotes?: string;
  
  // Metadata
  lastSent?: string; // ISO timestamp
  nextScheduled?: string; // ISO timestamp
  createdAt: string;
  createdBy: string; // User ID
  teamId: string;
}

export interface ReportHistory {
  id: string;
  reportId: string; // Reference to EmailReport
  status: ReportStatus;
  sentAt: string;
  recipients: string[];
  format: ReportFormat;
  fileSize?: number; // In bytes
  errorMessage?: string; // If failed
  downloadUrl?: string; // For accessing generated file
  teamId: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  name_en: string;
  reportType: ReportType;
  description?: string;
  isDefault: boolean;
  
  // Template configuration
  sections: ReportSection[];
  headerLogo?: string; // Base64 or URL
  footerText?: string;
  
  teamId: string;
}

export interface ReportSection {
  id: string;
  title: string;
  title_en: string;
  type: 'table' | 'chart' | 'summary' | 'text';
  content: any; // Flexible content based on type
  order: number;
  isVisible: boolean;
}

// Team Collaboration - Tasks
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface TeamTask {
  id: string;
  teamId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: string[]; // User IDs
  createdBy: string; // User ID
  createdAt: string;
  dueDate?: string;
  completedAt?: string;
  completedBy?: string; // User ID
  tags?: string[];
  relatedRecipeId?: string; // Link to recipe if task is recipe-related
  relatedMenuId?: string; // Link to menu if task is menu-related
}

// Team Collaboration - Chat
export interface ChatMessage {
  id: string;
  teamId: string;
  channelId: string; // 'general' or custom channel
  senderId: string; // User ID
  content: string;
  mentions?: string[]; // User IDs mentioned with @
  replyToId?: string; // ID of message being replied to
  attachments?: ChatAttachment[];
  createdAt: string;
  editedAt?: string;
  isDeleted?: boolean;
  reactions?: ChatReaction[];
}

export interface ChatAttachment {
  id: string;
  name: string;
  type: 'image' | 'file' | 'recipe' | 'menu';
  url?: string; // For images/files
  recipeId?: string; // For recipe references
  menuId?: string; // For menu references
  size?: number; // File size in bytes
}

export interface ChatReaction {
  emoji: string;
  userIds: string[]; // Users who reacted
}

export interface ChatChannel {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  members: string[]; // User IDs
  createdBy: string;
  createdAt: string;
}
