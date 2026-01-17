import React, { useState, useMemo } from 'react';
import {
  View,
  User,
  Team,
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
  LanguageMode,
  Notification,
  Message,
  RecipeCategoryKey,
  Role,
  Shift,
  ShiftSchedule,
  Channel,
  InventoryLocation,
  ExtractedInvoiceItem,
  MappedInvoiceItem,
  PurchaseUnit,
  InventoryTransaction,
  RolePermissions,
  ALL_PERMISSIONS,
  WasteLog
} from './types';

import Sidebar, { ALL_NAV_ITEMS } from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/dashboard/DashboardView';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import RecipeForm from './components/RecipeForm';
import WorkstationView from './components/workstations/WorkstationView';
import HaccpView from './components/haccp/HaccpView';
import CostingView from './components/costing/CostingView';
import InventoryView from './components/inventory/InventoryView';
import SupplierView from './components/suppliers/SupplierView';
import MenuView from './components/menu/MenuView';
import LabelView from './components/labels/LabelView';
import HaccpPrintView from './components/haccp/HaccpPrintView';
import SettingsView from './components/settings/SettingsView';
import ShoppingListView from './components/shoppinglist/ShoppingListView';
import StockTakeView from './components/stocktake/StockTakeView';
import NotificationView from './components/notifications/NotificationView';
import ShiftsView from './components/shifts/ShiftsView';
import WasteLogView from './components/waste/WasteLogView';
import PrintPreview from './components/common/PrintPreview';
import RecipeBookPrintView from './components/RecipeBookPrintView';
import ImportUrlModal from './components/common/ImportUrlModal';
import FloatingActionButton from './components/common/FloatingActionButton';
import QRScanner from './components/inventory/QRScanner';
import QuickActionModal from './components/inventory/QuickActionModal';
import InvoiceImportModal from './components/inventory/InvoiceImportModal';
import InvoiceConfirmationModal from './components/inventory/InvoiceConfirmationModal';
import InventoryHistoryView from './components/inventory/InventoryHistoryView';
import UserManualView from './components/manual/UserManualView';
import ApiKeyPromptModal from './components/common/ApiKeyPromptModal';
import QuickSearchModal from './components/common/QuickSearchModal';

import { useLocalStorage } from './hooks/useLocalStorage';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useResponsive } from './hooks/useResponsive';
import { useTranslation } from './i18n';
import { api } from './services/api';
import MobileNavBar from './components/common/MobileNavBar';

interface KitchenInterfaceProps {
  user: User;
  onLogout: () => void;
  allUsers: User[];
  setAllUsers: React.Dispatch<React.SetStateAction<User[]>>;
  allTeams: Team[];
  setAllTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  currentTeamId: string;
  onSetCurrentTeam: (teamId: string) => void;
  recipes: Recipe[];
  teamRecipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  ingredientCosts: IngredientCost[];
  setIngredientCosts: React.Dispatch<React.SetStateAction<IngredientCost[]>>;
  workstations: Workstation[];
  setWorkstations: React.Dispatch<React.SetStateAction<Workstation[]>>;
  tasks: PrepTask[];
  setTasks: React.Dispatch<React.SetStateAction<PrepTask[]>>;
  haccpLogs: HaccpLog[];
  setHaccpLogs: React.Dispatch<React.SetStateAction<HaccpLog[]>>;
  haccpItems: HaccpItem[];
  setHaccpItems: React.Dispatch<React.SetStateAction<HaccpItem[]>>;
  haccpReminders: HaccpReminder[];
  setHaccpReminders: React.Dispatch<React.SetStateAction<HaccpReminder[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  inventoryLocations: InventoryLocation[];
  setInventoryLocations: React.Dispatch<React.SetStateAction<InventoryLocation[]>>;
  inventoryTransactions: InventoryTransaction[];
  setInventoryTransactions: React.Dispatch<React.SetStateAction<InventoryTransaction[]>>;
  wasteLogs: WasteLog[];
  setWasteLogs: React.Dispatch<React.SetStateAction<WasteLog[]>>;
  menus: Menu[];
  teamMenus: Menu[];
  setMenus: React.Dispatch<React.SetStateAction<Menu[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
  shiftSchedules: ShiftSchedule[];
  setShiftSchedules: React.Dispatch<React.SetStateAction<ShiftSchedule[]>>;
  allChannels: Channel[];
  setAllChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
}

const KitchenInterface: React.FC<KitchenInterfaceProps> = (props) => {
  const {
    user,
    onLogout,
    currentTeamId,
    onSetCurrentTeam,
    allTeams,
    allUsers,
    setAllUsers,
    setAllTeams,
    recipes,
    teamRecipes,
    setRecipes,
    ingredientCosts,
    setIngredientCosts,
    workstations,
    setWorkstations,
    tasks,
    setTasks,
    haccpLogs,
    setHaccpLogs,
    haccpItems,
    setHaccpItems,
    haccpReminders,
    setHaccpReminders,
    suppliers,
    setSuppliers,
    inventory,
    setInventory,
    inventoryLocations,
    setInventoryLocations,
    inventoryTransactions,
    setInventoryTransactions,
    wasteLogs,
    setWasteLogs,
    menus,
    teamMenus,
    setMenus,
    notifications,
    setNotifications,
    messages,
    setMessages,
    shifts,
    setShifts,
    shiftSchedules,
    setShiftSchedules,
    allChannels,
    setAllChannels
  } = props;

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorage('sidebarCollapsed', false);
  const { isMobile, isTablet, isDesktop, deviceType } = useResponsive();

  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);
  const [isCreatingRecipe, setIsCreatingRecipe] = useState(false);
  const [recipeCategoryFilter, setRecipeCategoryFilter] =
    useState<RecipeCategoryKey | 'All'>('All');
  const [recipeSearchTerm, setRecipeSearchTerm] = useState('');
  const [recipeViewMode, setRecipeViewMode] =
    useLocalStorage<'list' | 'grid'>('recipeViewMode', 'list');

  const [selectedCostId, setSelectedCostId] = useState<string | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);

  // Recipe Book
  const [isBookMode, setIsBookMode] = useState(false);
  const [bookSelectedIds, setBookSelectedIds] = useState<string[]>([]);
  const [printPreviewContent, setPrintPreviewContent] =
    useState<React.ReactNode | null>(null);

  // URL Import
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // QR Scanner
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedItemId, setScannedItemId] = useState<string | null>(null);

  // Invoice Import
  const [isInvoiceImportOpen, setIsInvoiceImportOpen] = useState(false);
  const [extractedInvoiceItems, setExtractedInvoiceItems] =
    useState<ExtractedInvoiceItem[] | null>(null);

  // Permissions
  const [rolePermissions, setRolePermissions] = useLocalStorage<RolePermissions>(
    'rolePermissions',
    {
      Admin: [...ALL_PERMISSIONS],
      'Sous Chef': ['manage_recipes', 'manage_inventory', 'manage_shifts', 'manage_waste'],
      Cook: []
    }
  );

  // API Key Prompt
  const [isApiKeyPromptOpen, setIsApiKeyPromptOpen] = useState(false);
  const [actionToResume, setActionToResume] =
    useState<(() => Promise<void> | void) | null>(null);
  
  // Quick Search Modal
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);

  const withApiKeyCheck = (action: () => void) => {
    // No longer checks for VITE_GEMINI_API_KEY - API key is now on backend
    // All AI features now route through Supabase Edge Functions
    action();
  };

  const handleApiKeyConfirm = async () => {
    try {
      await (window as any).aistudio.openSelectKey();
      if (actionToResume) {
        await actionToResume();
      }
    } catch (e) {
      console.error('Failed to open API key selection:', e);
      alert('Could not open the API key selection dialog.');
    } finally {
      setIsApiKeyPromptOpen(false);
      setActionToResume(null);
    }
  };

  const { t, language, setLanguage } = useTranslation();

  const currentTeam = useMemo(
    () => allTeams.find((t) => t.id === currentTeamId),
    [allTeams, currentTeamId]
  );

  const currentUserRole = useMemo(
    () => user.memberships.find((m) => m.teamId === currentTeamId)?.role,
    [user, currentTeamId]
  );
  
  // Keyboard Shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrlKey: true,
      description: 'Open quick search',
      callback: () => setIsQuickSearchOpen(true)
    },
    {
      key: 'n',
      ctrlKey: true,
      description: 'New recipe',
      callback: () => {
        if (currentView === 'recipes') {
          setIsCreatingRecipe(true);
          setRecipeToEdit(null);
          setSelectedRecipeId(null);
        } else {
          setCurrentView('recipes');
          setTimeout(() => {
            setIsCreatingRecipe(true);
            setRecipeToEdit(null);
            setSelectedRecipeId(null);
          }, 100);
        }
      }
    },
    {
      key: 'Escape',
      description: 'Close modals',
      callback: () => {
        if (isQuickSearchOpen) {
          setIsQuickSearchOpen(false);
        } else if (isCreatingRecipe || recipeToEdit) {
          setIsCreatingRecipe(false);
          setRecipeToEdit(null);
        } else if (isScannerOpen) {
          setIsScannerOpen(false);
        } else if (isImportModalOpen) {
          setIsImportModalOpen(false);
        }
      },
      preventDefault: false
    }
  ], true);

  const handleSaveRecipe = async (recipeData: Omit<Recipe, 'id'> | Recipe) => {
    try {
      const recipeToSave = { ...recipeData, teamId: currentTeamId };
      const savedRecipe = await api.saveRecipe(recipeToSave);

      setRecipes((prev) => {
        const exists = prev.some((r) => r.id === savedRecipe.id);
        return exists
          ? prev.map((r) => (r.id === savedRecipe.id ? savedRecipe : r))
          : [...prev, savedRecipe];
      });

      if (!('id' in recipeData)) {
        setSelectedRecipeId(savedRecipe.id);
      }
      setIsCreatingRecipe(false);
      setRecipeToEdit(null);
    } catch (err: any) {
      console.error('Failed to save recipe', err);
      alert(
        `Αποτυχία αποθήκευσης συνταγής: ${
          err?.message || 'Άγνωστο σφάλμα από Supabase.'
        }`
      );
    }
  };

  const handleDeleteRecipe = async (recipeToDelete: Recipe) => {
    await api.deleteRecipe(recipeToDelete.id);
    setRecipes((prev) => prev.filter((r) => r.id !== recipeToDelete.id));
    setSelectedRecipeId(null);
  };

  const handleStartImportedRecipe = (importedData: Partial<Recipe>) => {
    const recipeForForm = {
      ...importedData,
      imageUrl: '',
      teamId: currentTeamId
    };
    setRecipeToEdit(recipeForForm as Recipe);
    setIsCreatingRecipe(false);
    setIsImportModalOpen(false);
  };

  // --- Recipe Book Handlers ---
  const toggleBookMode = () => {
    setIsBookMode((prev) => {
      if (prev) {
        setBookSelectedIds([]);
      }
      return !prev;
    });
  };

  const handleBookSelect = (id: string) => {
    setBookSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((recipeId) => recipeId !== id)
        : [...prev, id]
    );
  };

  const handleBookCategorySelect = (
    category: RecipeCategoryKey | 'All',
    isSelected: boolean
  ) => {
    const teamRecipesForTeam = recipes.filter((r) => r.teamId === currentTeamId);
    const categoryRecipeIds = teamRecipesForTeam
      .filter((r) => category === 'All' || r.category === category)
      .map((r) => r.id);

    setBookSelectedIds((prev) => {
      const otherIds = prev.filter((id) => !categoryRecipeIds.includes(id));
      return isSelected ? [...otherIds, ...categoryRecipeIds] : otherIds;
    });
  };

  const handleGenerateBook = () => {
    const selectedRecipes = recipes.filter((r) =>
      bookSelectedIds.includes(r.id)
    );
    setPrintPreviewContent(<RecipeBookPrintView recipes={selectedRecipes} />);
    toggleBookMode();
  };

  // --- Inventory Action Handlers ---
  const handleInventoryTransfer = (
    itemId: string,
    fromLocationId: string,
    toLocationId: string,
    quantity: number
  ) => {
    const success = inventory.some((item) => {
      if (item.id === itemId) {
        const fromLocation = item.locations.find(
          (l) => l.locationId === fromLocationId
        );
        if (!fromLocation || fromLocation.quantity < quantity) {
          alert('Δεν υπάρχει αρκετό απόθεμα στην τοποθεσία προέλευσης.');
          return false;
        }
      }
      return true;
    });

    if (!success) return;

    const transferOutId = `trx_${Date.now()}_out`;
    const transferInId = `trx_${Date.now()}_in`;

    const newTransactions: InventoryTransaction[] = [
      {
        id: transferOutId,
        itemId,
        timestamp: new Date(),
        type: 'transfer_out',
        quantityChange: -quantity,
        locationId: fromLocationId,
        relatedTransactionId: transferInId,
        userId: user.id,
        teamId: currentTeamId
      },
      {
        id: transferInId,
        itemId,
        timestamp: new Date(),
        type: 'transfer_in',
        quantityChange: quantity,
        locationId: toLocationId,
        relatedTransactionId: transferOutId,
        userId: user.id,
        teamId: currentTeamId
      }
    ];

    setInventoryTransactions((prev) => [...prev, ...newTransactions]);

    setInventory((prevInventory) =>
      prevInventory.map((item) => {
        if (item.id === itemId) {
          const newLocations = [...item.locations];
          const fromIndex = newLocations.findIndex(
            (loc) => loc.locationId === fromLocationId
          );
          const toIndex = newLocations.findIndex(
            (loc) => loc.locationId === toLocationId
          );

          newLocations[fromIndex] = {
            ...newLocations[fromIndex],
            quantity: newLocations[fromIndex].quantity - quantity
          };

          if (toIndex > -1) {
            newLocations[toIndex] = {
              ...newLocations[toIndex],
              quantity: newLocations[toIndex].quantity + quantity
            };
          } else {
            newLocations.push({ locationId: toLocationId, quantity });
          }

          return { ...item, locations: newLocations };
        }
        return item;
      })
    );
  };

  const scannedItem = useMemo(
    () => inventory.find((item) => item.id === scannedItemId),
    [inventory, scannedItemId]
  );

  const handleScanSuccess = (qrData: string) => {
    try {
      const data = JSON.parse(qrData);
      if (data.type === 'inventory_item' && data.id) {
        setScannedItemId(data.id);
        setIsScannerOpen(false);
      } else {
        alert(t('qr_scan_invalid'));
      }
    } catch (e) {
      console.error('Invalid QR code scanned', e);
      alert(t('qr_scan_invalid'));
    }
  };

  const handleQuickActionConfirm = (
    itemToUpdate: InventoryItem,
    quantity: number,
    action: 'add' | 'subtract' | 'transfer',
    fromLocationId?: string,
    toLocationId?: string
  ) => {
    if (action === 'transfer') {
      if (fromLocationId && toLocationId) {
        handleInventoryTransfer(
          itemToUpdate.id,
          fromLocationId,
          toLocationId,
          quantity
        );
      }
    } else {
      if (!itemToUpdate.locations || itemToUpdate.locations.length === 0) return;
      const primaryLocationId = itemToUpdate.locations[0].locationId;

      const newTransaction: InventoryTransaction = {
        id: `trx_${Date.now()}`,
        itemId: itemToUpdate.id,
        timestamp: new Date(),
        type: action === 'add' ? 'manual_add' : 'manual_subtract',
        quantityChange: action === 'add' ? quantity : -quantity,
        locationId: primaryLocationId,
        userId: user.id,
        teamId: currentTeamId
      };

      setInventoryTransactions((prev) => [...prev, newTransaction]);

      setInventory((prevInventory) =>
        prevInventory.map((item) => {
          if (item.id === itemToUpdate.id) {
            const newLocations = [...item.locations];
            const currentQuantity = newLocations[0].quantity;
            const newQuantity =
              action === 'add'
                ? currentQuantity + quantity
                : currentQuantity - quantity;

            newLocations[0] = {
              ...newLocations[0],
              quantity: Math.max(0, newQuantity)
            };
            return { ...item, locations: newLocations };
          }
          return item;
        })
      );
    }
    setScannedItemId(null);
  };

  const handleStockTakeSave = (stockLevels: Record<string, number>) => {
    const newTransactions: InventoryTransaction[] = [];

    const updatedInventory = inventory.map((item) => {
      const newQuantity = stockLevels[item.id];
      if (newQuantity !== undefined && item.locations.length > 0) {
        const primaryLocationId = item.locations[0].locationId;
        const oldQuantity = item.locations[0].quantity;
        const diff = newQuantity - oldQuantity;

        if (diff !== 0) {
          newTransactions.push({
            id: `trx_${Date.now()}_${item.id}`,
            itemId: item.id,
            timestamp: new Date(),
            type: 'stock_take_adjustment',
            quantityChange: diff,
            locationId: primaryLocationId,
            notes: `Old: ${oldQuantity}, New: ${newQuantity}`,
            userId: user.id,
            teamId: currentTeamId
          });
        }

        const newLocations = [...item.locations];
        newLocations[0] = { ...newLocations[0], quantity: newQuantity };
        return { ...item, locations: newLocations };
      }
      return item;
    });

    setInventory(updatedInventory);
    setInventoryTransactions((prev) => [...prev, ...newTransactions]);
  };

  // --- Invoice Import Handlers ---
  const handleInvoiceParsed = (items: ExtractedInvoiceItem[]) => {
    setExtractedInvoiceItems(items);
    setIsInvoiceImportOpen(false);
  };

  const handleConfirmInvoiceImport = (
    mappedItems: MappedInvoiceItem[],
    targetLocationId: string
  ) => {
    const newInventoryItems: InventoryItem[] = [];
    const newCostItems: IngredientCost[] = [];
    const newTransactions: InventoryTransaction[] = [];

    setInventory((prevInventory) => {
      const updatedInventory = [...prevInventory];

      mappedItems.forEach((mappedItem) => {
        const transactionBase = {
          id: `trx_${Date.now()}_${mappedItem.itemName}`,
          timestamp: new Date(),
          type: 'invoice_import' as const,
          quantityChange: mappedItem.quantity,
          locationId: targetLocationId,
          userId: user.id,
          teamId: currentTeamId
        };

        if (!mappedItem.isNew) {
          const itemIndex = updatedInventory.findIndex(
            (inv) => inv.id === mappedItem.inventoryId
          );
          if (itemIndex > -1) {
            newTransactions.push({
              ...transactionBase,
              itemId: updatedInventory[itemIndex].id
            });

            const newLocations = [...updatedInventory[itemIndex].locations];
            const locIndex = newLocations.findIndex(
              (loc) => loc.locationId === targetLocationId
            );

            if (locIndex > -1) {
              newLocations[locIndex].quantity += mappedItem.quantity;
            } else {
              newLocations.push({
                locationId: targetLocationId,
                quantity: mappedItem.quantity
              });
            }

            updatedInventory[itemIndex] = {
              ...updatedInventory[itemIndex],
              locations: newLocations
            };
          }
        } else {
          const newInvId = `inv${Date.now()}${Math.random()}`;
          const newCostId = `ic${Date.now()}${Math.random()}`;

          newInventoryItems.push({
            id: newInvId,
            name: mappedItem.itemName,
            locations: [
              { locationId: targetLocationId, quantity: mappedItem.quantity }
            ],
            unit: mappedItem.unit as PurchaseUnit,
            reorderPoint: 0,
            teamId: currentTeamId,
            ingredientCostId: newCostId
          });

          newCostItems.push({
            id: newCostId,
            name: mappedItem.itemName,
            cost: mappedItem.unitPrice,
            purchaseUnit: mappedItem.unit as PurchaseUnit,
            teamId: currentTeamId
          });

          newTransactions.push({ ...transactionBase, itemId: newInvId });
        }
      });

      return [...updatedInventory, ...newInventoryItems];
    });

    setInventoryTransactions((prev) => [...prev, ...newTransactions]);

    setIngredientCosts((prevCosts) => {
      let updatedCosts = [...prevCosts];

      mappedItems.forEach((mappedItem) => {
        if (!mappedItem.isNew) {
          const invItem = inventory.find(
            (i) => i.id === mappedItem.inventoryId
          );
          const costIndex = invItem
            ? updatedCosts.findIndex((c) => c.id === invItem.ingredientCostId)
            : -1;
          if (costIndex > -1) {
            updatedCosts[costIndex] = {
              ...updatedCosts[costIndex],
              cost: mappedItem.unitPrice,
              purchaseUnit: mappedItem.unit as PurchaseUnit
            };
          }
        }
      });

      return [...updatedCosts, ...newCostItems];
    });

    setExtractedInvoiceItems(null);
  };

  const handleSaveWasteLog = (
    logData: Omit<WasteLog, 'id' | 'teamId' | 'userId'>
  ) => {
    const newLog: WasteLog = {
      ...logData,
      id: `waste${Date.now()}`,
      teamId: currentTeamId,
      userId: user.id
    };

    setWasteLogs((prev) => [...prev, newLog]);

    const inventoryItem = inventory.find(
      (i) => i.id === newLog.inventoryItemId
    );
    if (inventoryItem && inventoryItem.locations.length > 0) {
      const primaryLocationId = inventoryItem.locations[0].locationId;

      const newTransaction: InventoryTransaction = {
        id: `trx_${Date.now()}`,
        itemId: newLog.inventoryItemId,
        timestamp: newLog.timestamp,
        type: 'waste',
        quantityChange: -newLog.quantity,
        locationId: primaryLocationId,
        notes: `Reason: ${logData.reason}. ${logData.notes || ''}`,
        userId: user.id,
        teamId: currentTeamId
      };

      setInventoryTransactions((prev) => [...prev, newTransaction]);

      setInventory((prevInventory) =>
        prevInventory.map((item) => {
          if (item.id === newLog.inventoryItemId) {
            const newLocations = [...item.locations];
            const locIndex = newLocations.findIndex(
              (l) => l.locationId === primaryLocationId
            );
            if (locIndex > -1) {
              newLocations[locIndex].quantity = Math.max(
                0,
                newLocations[locIndex].quantity - newLog.quantity
              );
            }
            return { ...item, locations: newLocations };
          }
          return item;
        })
      );
    }
  };

  const handleViewChange = (view: View) => {
    setSelectedRecipeId(null);
    setSelectedCostId(null);
    setSelectedSupplierId(null);
    setSelectedInventoryId(null);
    setIsCreatingRecipe(false);
    setRecipeToEdit(null);
    setCurrentView(view);
  };

  const renderContent = () => {
    const teamRecipesForTeam = recipes.filter(
      (r) => r.teamId === currentTeamId
    );
    const teamIngredientCosts = ingredientCosts.filter(
      (ic) => ic.teamId === currentTeamId
    );
    const teamWorkstations = workstations.filter(
      (w) => w.teamId === currentTeamId
    );
    const teamTasks = tasks.filter((t) => t.teamId === currentTeamId);
    const teamHaccpLogs = haccpLogs.filter((l) => l.teamId === currentTeamId);
    const teamHaccpItems = haccpItems.filter(
      (i) => i.teamId === currentTeamId
    );
    const teamHaccpReminders = haccpReminders.filter(
      (r) => r.teamId === currentTeamId
    );
    const teamSuppliers = suppliers.filter(
      (s) => s.teamId === currentTeamId
    );
    const teamInventory = inventory.filter(
      (i) => i.teamId === currentTeamId
    );
    const teamInventoryLocations = inventoryLocations.filter(
      (i) => i.teamId === currentTeamId
    );
    const teamInventoryTransactions = inventoryTransactions.filter(
      (t) => t.teamId === currentTeamId
    );
    const teamWasteLogs = wasteLogs.filter(
      (w) => w.teamId === currentTeamId
    );
    const teamMenusForTeam = menus.filter(
      (m) => m.teamId === currentTeamId
    );
    const teamMessages = messages.filter(
      (m) => m.teamId === currentTeamId
    );
    const teamShifts = shifts.filter((s) => s.teamId === currentTeamId);
    const teamShiftSchedules = shiftSchedules.filter(
      (s) => s.teamId === currentTeamId
    );
    const teamChannels = allChannels.filter(
      (c) => c.teamId === currentTeamId
    );

    if (currentView === 'recipes') {
      const recipesForCategoryFilter = teamRecipesForTeam.filter((recipe) => {
        return (
          recipeCategoryFilter === 'All' ||
          recipe.category === recipeCategoryFilter
        );
      });

      const filteredRecipes = recipesForCategoryFilter.filter((recipe) => {
        return (
          recipe.name.toLowerCase().includes(recipeSearchTerm.toLowerCase()) ||
          (recipe.name_en &&
            recipe.name_en
              .toLowerCase()
              .includes(recipeSearchTerm.toLowerCase()))
        );
      });

      if (isCreatingRecipe || recipeToEdit) {
        return (
          <RecipeForm
            key={recipeToEdit?.id ?? 'new_recipe'}
            recipeToEdit={recipeToEdit}
            allRecipes={recipes}
            onSave={handleSaveRecipe}
            onCancel={() => {
              setIsCreatingRecipe(false);
              setRecipeToEdit(null);
            }}
            withApiKeyCheck={withApiKeyCheck}
          />
        );
      }

      return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
          <div
            className={`h-full ${
              selectedRecipeId && !isBookMode ? 'hidden' : 'col-span-1 lg:col-span-5'
            }`}
          >
            <RecipeList
              recipes={filteredRecipes}
              allRecipesForCategory={recipesForCategoryFilter}
              selectedRecipeId={selectedRecipeId}
              onSelectRecipe={setSelectedRecipeId}
              onStartCreateRecipe={() => {
                setIsCreatingRecipe(true);
                setRecipeToEdit(null);
                setSelectedRecipeId(null);
              }}
              onStartImport={() => setIsImportModalOpen(true)}
              activeCategory={recipeCategoryFilter}
              onCategoryFilterChange={setRecipeCategoryFilter}
              searchTerm={recipeSearchTerm}
              onSearchChange={setRecipeSearchTerm}
              currentUserRole={currentUserRole}
              recipeViewMode={recipeViewMode}
              onRecipeViewModeChange={setRecipeViewMode}
              isBookMode={isBookMode}
              toggleBookMode={toggleBookMode}
              bookSelectedIds={bookSelectedIds}
              onBookSelect={handleBookSelect}
              onBookCategorySelect={handleBookCategorySelect}
              onGenerateBook={handleGenerateBook}
              rolePermissions={rolePermissions}
              withApiKeyCheck={withApiKeyCheck}
              onUpdateRecipes={setRecipes}
            />
          </div>
          <div
            className={`h-full w-full ${
              !selectedRecipeId ? 'hidden' : 'col-span-1 lg:col-span-5 flex'
            }`}
          >
            {teamRecipesForTeam.find((r) => r.id === selectedRecipeId) ? (
              <RecipeDetail
                recipe={
                  teamRecipesForTeam.find(
                    (r) => r.id === selectedRecipeId
                  )!
                }
                allRecipes={recipes}
                ingredientCosts={teamIngredientCosts}
                onBack={() => setSelectedRecipeId(null)}
                onEdit={(recipe) => {
                  setRecipeToEdit(recipe);
                  setIsCreatingRecipe(false);
                }}
                onSaveRecipe={handleSaveRecipe}
                onDelete={handleDeleteRecipe}
                onSelectRecipe={setSelectedRecipeId}
                currentUserRole={currentUserRole}
                language={language}
                rolePermissions={rolePermissions}
                withApiKeyCheck={withApiKeyCheck}
              />
            ) : (
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl flex items-center justify-center h-full text-light-text-secondary dark:text-dark-text-secondary p-6">
                <p>Επιλέξτε μια συνταγή για να δείτε τις λεπτομέρειες.</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            recipes={teamRecipesForTeam}
            tasks={teamTasks}
            haccpLogs={teamHaccpLogs}
            haccpItems={teamHaccpItems}
            haccpReminders={teamHaccpReminders}
            inventory={teamInventory}
            wasteLogs={teamWasteLogs}
            messages={teamMessages}
            channels={teamChannels}
            onViewChange={handleViewChange}
            withApiKeyCheck={withApiKeyCheck}
          />
        );
      case 'workstations':
        return (
          <WorkstationView
            recipes={teamRecipesForTeam}
            workstations={teamWorkstations}
            setWorkstations={setWorkstations}
            tasks={teamTasks}
            setTasks={setTasks}
            menus={teamMenusForTeam}
            currentUserRole={currentUserRole}
            rolePermissions={rolePermissions}
          />
        );
      case 'shifts':
        return (
          <ShiftsView
            shifts={teamShifts}
            setShifts={setShifts}
            shiftSchedules={teamShiftSchedules}
            setShiftSchedules={setShiftSchedules}
            allUsers={allUsers}
            currentTeamId={currentTeamId}
            currentUserRole={currentUserRole}
            rolePermissions={rolePermissions}
          />
        );
      case 'haccp':
        return (
          <HaccpView
            logs={teamHaccpLogs}
            setLogs={setHaccpLogs}
            haccpItems={teamHaccpItems}
            haccpReminders={teamHaccpReminders}
            onNavigateToPrint={() => handleViewChange('haccp_print')}
            currentUserRole={currentUserRole}
            rolePermissions={rolePermissions}
            withApiKeyCheck={withApiKeyCheck}
          />
        );
      case 'haccp_print':
        return <HaccpPrintView onBack={() => handleViewChange('haccp')} />;
      case 'costing':
        return (
          <CostingView
            ingredientCosts={teamIngredientCosts}
            setIngredientCosts={setIngredientCosts}
            selectedCostId={selectedCostId}
            onSelectCost={setSelectedCostId}
            onBack={() => setSelectedCostId(null)}
            currentUserRole={currentUserRole}
            rolePermissions={rolePermissions}
          />
        );
      case 'inventory':
        return (
          <InventoryView
            inventory={teamInventory}
            setInventory={setInventory}
            suppliers={teamSuppliers}
            ingredientCosts={teamIngredientCosts}
            inventoryLocations={teamInventoryLocations}
            selectedItemId={selectedInventoryId}
            onSelectItem={setSelectedInventoryId}
            onBack={() => setSelectedInventoryId(null)}
            currentUserRole={currentUserRole}
            onTransfer={handleInventoryTransfer}
            onImportInvoice={() => setIsInvoiceImportOpen(true)}
            rolePermissions={rolePermissions}
            withApiKeyCheck={withApiKeyCheck}
            currentTeamId={currentTeamId}
            wasteLogs={teamWasteLogs}
            onViewChange={handleViewChange}
            menus={teamMenusForTeam}
            recipes={teamRecipesForTeam}
            inventoryTransactions={teamInventoryTransactions}
          />
        );
      case 'inventory_history':
        return (
          <InventoryHistoryView
            inventory={teamInventory}
            inventoryLocations={teamInventoryLocations}
            inventoryTransactions={teamInventoryTransactions}
          />
        );
      case 'waste_log':
        return (
          <WasteLogView
            wasteLogs={teamWasteLogs}
            setWasteLogs={setWasteLogs}
            inventory={teamInventory}
            users={allUsers}
            onSave={handleSaveWasteLog}
            currentUserRole={currentUserRole}
            rolePermissions={rolePermissions}
            ingredientCosts={teamIngredientCosts}
          />
        );
      case 'suppliers':
        return (
          <SupplierView
            suppliers={teamSuppliers}
            setSuppliers={setSuppliers}
            selectedSupplierId={selectedSupplierId}
            onSelectSupplier={setSelectedSupplierId}
            onBack={() => setSelectedSupplierId(null)}
            currentUserRole={currentUserRole}
            rolePermissions={rolePermissions}
          />
        );
      case 'menus':
        return (
          <MenuView
            menus={teamMenusForTeam}
            setMenus={setMenus}
            allRecipes={teamRecipesForTeam}
            setAllRecipes={setRecipes}
            tasks={teamTasks}
            workstations={teamWorkstations}
            currentUserRole={currentUserRole}
            allTeams={allTeams}
            currentTeamId={currentTeamId}
            rolePermissions={rolePermissions}
            withApiKeyCheck={withApiKeyCheck}
            inventory={teamInventory}
            wasteLogs={teamWasteLogs}
            ingredientCosts={teamIngredientCosts}
          />
        );
      case 'labels':
        return <LabelView recipes={recipes} menus={menus} />;
      case 'settings':
        return (
          <SettingsView
            users={allUsers}
            setUsers={setAllUsers}
            teams={allTeams}
            setTeams={setAllTeams}
            currentUser={user}
            rolePermissions={rolePermissions}
            setRolePermissions={setRolePermissions}
            currentTeamId={currentTeamId}
            inventoryLocations={teamInventoryLocations}
            setInventoryLocations={setInventoryLocations}
            haccpItems={teamHaccpItems}
            setHaccpItems={setHaccpItems}
          />
        );
      case 'shopping_list':
        return (
          <ShoppingListView
            menus={teamMenusForTeam}
            recipes={recipes}
            inventory={inventory}
            suppliers={suppliers}
          />
        );
      case 'stock_take':
        return (
          <StockTakeView
            inventory={teamInventory}
            onSaveChanges={handleStockTakeSave}
          />
        );
      case 'notifications':
        return (
          <NotificationView
            currentUser={user}
            currentTeamId={currentTeamId}
            allUsers={allUsers}
            messages={teamMessages}
            setMessages={setMessages}
            allChannels={teamChannels}
            setAllChannels={setAllChannels}
          />
        );
      case 'user_manual':
        return <UserManualView withApiKeyCheck={withApiKeyCheck} />;
      default:
        return <div>View not implemented</div>;
    }
  };

  const currentViewTitleKey =
    ALL_NAV_ITEMS.find((item) => item.view === currentView)?.labelKey ||
    'nav_dashboard';

  const teamNotifications = notifications.filter(
    (n) => n.userId === user.id && n.teamId === currentTeamId
  );

  return (
    <div className="flex h-screen bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary">
      {/* Desktop & Tablet Sidebar - hidden on mobile */}
      {!isMobile && (
        <Sidebar
          currentView={currentView}
          onViewChange={handleViewChange}
          user={user}
          onLogout={onLogout}
          currentTeam={currentTeam}
          currentUserRole={currentUserRole}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          currentViewTitleKey={currentViewTitleKey}
          user={user}
          allTeams={allTeams}
          currentTeamId={currentTeamId}
          onSetCurrentTeam={onSetCurrentTeam}
          notifications={teamNotifications}
          onViewChange={handleViewChange}
        />
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto ${isMobile ? 'pb-20' : ''}`}>
          {renderContent()}
        </main>
      </div>

      <FloatingActionButton onClick={() => setIsScannerOpen(true)} />

      {isScannerOpen && (
        <QRScanner
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={handleScanSuccess}
        />
      )}

      <QuickActionModal
        item={scannedItem}
        inventoryLocations={inventoryLocations.filter(
          (l) => l.teamId === currentTeamId
        )}
        onClose={() => setScannedItemId(null)}
        onConfirm={handleQuickActionConfirm}
      />

      <InvoiceImportModal
        isOpen={isInvoiceImportOpen}
        onClose={() => setIsInvoiceImportOpen(false)}
        onSuccess={handleInvoiceParsed}
      />

      {extractedInvoiceItems && (
        <InvoiceConfirmationModal
          isOpen={!!extractedInvoiceItems}
          onClose={() => setExtractedInvoiceItems(null)}
          onConfirm={handleConfirmInvoiceImport}
          extractedItems={extractedInvoiceItems}
          inventory={inventory.filter((i) => i.teamId === currentTeamId)}
          inventoryLocations={inventoryLocations.filter(
            (l) => l.teamId === currentTeamId
          )}
        />
      )}

      {printPreviewContent && (
        <PrintPreview onClose={() => setPrintPreviewContent(null)}>
          {printPreviewContent}
        </PrintPreview>
      )}

      {isImportModalOpen && (
        <ImportUrlModal
          onClose={() => setIsImportModalOpen(false)}
          onRecipeParsed={handleStartImportedRecipe}
        />
      )}

      <ApiKeyPromptModal
        isOpen={isApiKeyPromptOpen}
        onClose={() => {
          setIsApiKeyPromptOpen(false);
          setActionToResume(null);
        }}
        onConfirm={handleApiKeyConfirm}
      />
      
      <QuickSearchModal
        isOpen={isQuickSearchOpen}
        onClose={() => setIsQuickSearchOpen(false)}
        onSearch={(query) => {
          setRecipeSearchTerm(query);
          setCurrentView('recipes');
        }}
      />

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileNavBar
          currentView={currentView}
          onViewChange={handleViewChange}
          currentUserRole={currentUserRole}
        />
      )}
    </div>
  );
};

export default KitchenInterface;
