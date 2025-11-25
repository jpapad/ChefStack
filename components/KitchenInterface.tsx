import React, { useEffect, useState, useMemo } from 'react';
import type {
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
  Notification as AppNotification,
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
  WasteLog,
  KitchenOrder,
  RecipeVariation,
  EmailReport,
  ReportHistory
} from '../types';
import { ALL_PERMISSIONS } from '../types';

import Sidebar, { ALL_NAV_ITEMS } from './Sidebar';
import Header from './Header';
import DashboardView from './dashboard/DashboardView';
import RecipeList from './RecipeList';
import RecipeDetail from './RecipeDetail';
import RecipeForm from './RecipeForm';
import WorkstationView from './workstations/WorkstationView';
import HaccpView from './haccp/HaccpView';
import CostingView from './costing/CostingView';
import InventoryView from './inventory/InventoryView';
import SupplierView from './suppliers/SupplierView';
import MenuView from './menu/MenuView';
import LabelView from './labels/LabelView';
import HaccpPrintView from './haccp/HaccpPrintView';
import SettingsView from './settings/SettingsView';
import ShoppingListView from './shoppinglist/ShoppingListView';
import StockTakeView from './stocktake/StockTakeView';
import NotificationView from './notifications/NotificationView';
import ShiftsView from './shifts/ShiftsView';
import WasteLogView from './waste/WasteLogView';
import PrintPreview from './common/PrintPreview';
import RecipeBookPrintView from './RecipeBookPrintView';
import ImportUrlModal from './common/ImportUrlModal';
import FloatingActionButton from './common/FloatingActionButton';
import QRScanner from './inventory/QRScanner';
import QuickActionModal from './inventory/QuickActionModal';
import InvoiceImportModal from './inventory/InvoiceImportModal';
import InvoiceConfirmationModal from './inventory/InvoiceConfirmationModal';
import InventoryHistoryView from './inventory/InventoryHistoryView';
import UserManualView from './manual/UserManualView';
import AnalyticsDashboard from './analytics/AnalyticsDashboard';
import CollaborationView from './collaboration/CollaborationView';
import type { HandoverNote } from './collaboration/ShiftHandoverNotes';
import type { Notification as CollabNotification } from './collaboration/NotificationCenter';
import ChefCopilot from './ai/ChefCopilot';
import ApiKeyPromptModal from './common/ApiKeyPromptModal';

// 🆕 Kitchen–Service view
import KitchenServiceView from './kitchen/KitchenServiceView';

// 🆕 Kitchen Display System (KDS)
import KitchenDisplayView from './kds/KitchenDisplayView';

// 🆕 Email Reports & Scheduling
import EmailReportsView from './reports/EmailReportsView';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTranslation } from '../i18n';
import { api } from '../services/api';

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
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
  shiftSchedules: ShiftSchedule[];
  setShiftSchedules: React.Dispatch<React.SetStateAction<ShiftSchedule[]>>;
  allChannels: Channel[];
  setAllChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
  orders: KitchenOrder[];
  setOrders: React.Dispatch<React.SetStateAction<KitchenOrder[]>>;
  variations: RecipeVariation[];
  setVariations: React.Dispatch<React.SetStateAction<RecipeVariation[]>>;
  reports: EmailReport[];
  setReports: React.Dispatch<React.SetStateAction<EmailReport[]>>;
  reportHistory: ReportHistory[];
  setReportHistory: React.Dispatch<React.SetStateAction<ReportHistory[]>>;
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
    setAllChannels,
    orders,
    setOrders,
    variations,
    setVariations,
    reports,
    setReports,
    reportHistory,
    setReportHistory
  } = props;

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useLocalStorage('sidebarCollapsed', false);

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

  const [isBookMode, setIsBookMode] = useState(false);
  const [bookSelectedIds, setBookSelectedIds] = useState<string[]>([]);
  const [printPreviewContent, setPrintPreviewContent] =
    useState<React.ReactNode | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedItemId, setScannedItemId] = useState<string | null>(null);

  const [isInvoiceImportOpen, setIsInvoiceImportOpen] = useState(false);
  const [extractedInvoiceItems, setExtractedInvoiceItems] =
    useState<ExtractedInvoiceItem[] | null>(null);

  // Collaboration state
  const [handoverNotes, setHandoverNotes] = useState<HandoverNote[]>([]);
  const [collabNotifications, setCollabNotifications] = useState<CollabNotification[]>([]);

  const [rolePermissions, setRolePermissions] =
    useLocalStorage<RolePermissions>('rolePermissions', {
      Admin: [...ALL_PERMISSIONS],
      // 🆕 Sous Chef έχει και manage_kitchen_service by default
      'Sous Chef': [
        'manage_recipes',
        'manage_inventory',
        'manage_shifts',
        'manage_waste',
        'manage_kitchen_service'
      ],
      Cook: []
    });

  const [isApiKeyPromptOpen, setIsApiKeyPromptOpen] = useState(false);
  const [actionToResume, setActionToResume] =
    useState<(() => Promise<void> | void) | null>(null);
  const [kitchenServiceOpenCount, setKitchenServiceOpenCount] = useState(0);

  // 🔊 Walkie settings για Notifications
  const [walkieSettings, setWalkieSettings] = useLocalStorage<{
    soundEnabled: boolean;
    desktopEnabled: boolean;
  }>('walkieSettings', {
    soundEnabled: true,
    desktopEnabled: true
  });

  // ✅ withApiKeyCheck που συνεργάζεται με ApiKeyPromptModal & aistudio helper
  const withApiKeyCheck = (action: () => void | Promise<void>) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

    if (apiKey && apiKey.trim() !== '') {
      action();
      return;
    }

    if ((window as any).aistudio && typeof (window as any).aistudio.openSelectKey === 'function') {
      setActionToResume(() => action);
      setIsApiKeyPromptOpen(true);
      return;
    }

    alert(
      'Πρέπει να ορίσετε το VITE_GEMINI_API_KEY στο αρχείο .env.local και να επανεκκινήσετε τον dev server.'
    );
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

  const { t, language } = useTranslation();

  // 🔔 Realtime Walkie-Talkie (MONO subscribe – ΔΕΝ σβήνουμε τα υπάρχοντα μηνύματα/κανάλια)
  useEffect(() => {
    if (!currentTeamId) return;

    let unsubscribeMessages: (() => void) | null = null;
    let unsubscribeChannels: (() => void) | null = null;

    try {
      // ✅ Realtime messages
      unsubscribeMessages = api.subscribeToMessages(currentTeamId, (newMessage) => {
        console.log('[realtime] NEW MESSAGE', { teamId: currentTeamId, newMessage });

        // 1) Βάζουμε το μήνυμα στο global state (χωρίς να σβήσουμε τίποτα)
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });

        // 2) In-app notification + beep μόνο αν δεν είναι δικό μας μήνυμα
        if ((newMessage as any).userId !== user.id) {
          // In-app ειδοποίηση
          setNotifications((prev) => {
            const notifId = `msg_notif_${(newMessage as any).id}`;
            if (prev.some((n) => (n as any).id === notifId)) return prev;

            const preview =
              ((newMessage as any).content || (newMessage as any).text || '')
                .toString()
                .slice(0, 80);

            const notif: AppNotification = {
              id: notifId,
              userId: user.id,
              teamId: currentTeamId,
              message: preview
                ? `Νέο μήνυμα: ${preview}`
                : 'Νέο μήνυμα στο walkie-talkie',
              type: 'message',
              read: false,
              timestamp: new Date()
            } as any;

            return [...prev, notif];
          });

          // 🔊 Μικρό “μπιπ” – το on/off ρυθμίζεται στο NotificationView
          try {
            const AudioCtx =
              (window as any).AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
              const ctx = new AudioCtx();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'square';
              osc.frequency.value = 1000;
              gain.gain.value = 0.08;
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              setTimeout(() => {
                osc.stop();
                ctx.close();
              }, 120);
            }
          } catch (e) {
            console.warn('[realtime] beep failed', e);
          }
        }
      });

      // ✅ Realtime channels
      unsubscribeChannels = api.subscribeToChannels(currentTeamId, (newChannel) => {
        console.log('[realtime] NEW CHANNEL', newChannel);
        setAllChannels((prev) => {
          if (prev.some((c) => c.id === newChannel.id)) return prev;
          return [...prev, newChannel];
        });
      });
    } catch (err) {
      console.error('Failed to init realtime chat', err);
    }

    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeChannels) unsubscribeChannels();
    };
  }, [currentTeamId, setMessages, setAllChannels, setNotifications, user.id]);

  const currentTeam = useMemo(
    () => allTeams.find((t) => t.id === currentTeamId),
    [allTeams, currentTeamId]
  );

  const currentUserRole = useMemo(
    () => user.memberships.find((m) => m.teamId === currentTeamId)?.role,
    [user, currentTeamId]
  );

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
      prev.includes(id) ? prev.filter((recipeId) => recipeId !== id) : [...prev, id]
    );
  };

  const handleBookCategorySelect = (
    category: RecipeCategoryKey | 'All',
    isSelected: boolean
  ) => {
    const teamRecipesForFilter = recipes.filter((r) => r.teamId === currentTeamId);
    const categoryRecipeIds = teamRecipesForFilter
      .filter((r) => category === 'All' || r.category === category)
      .map((r) => r.id);

    setBookSelectedIds((prev) => {
      const otherIds = prev.filter((id) => !categoryRecipeIds.includes(id));
      return isSelected ? [...otherIds, ...categoryRecipeIds] : otherIds;
    });
  };

  const handleGenerateBook = () => {
    const selectedRecipes = recipes.filter((r) => bookSelectedIds.includes(r.id));
    setPrintPreviewContent(<RecipeBookPrintView recipes={selectedRecipes} />);
    toggleBookMode();
  };

  const handleInventoryTransfer = (
    itemId: string,
    fromLocationId: string,
    toLocationId: string,
    quantity: number
  ) => {
    const success = inventory.some((item) => {
      if (item.id === itemId) {
        const fromLocation = item.locations.find((l) => l.locationId === fromLocationId);
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
        handleInventoryTransfer(itemToUpdate.id, fromLocationId, toLocationId, quantity);
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
          const invItem = inventory.find((i) => i.id === mappedItem.inventoryId);
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

  // ✅ handleSaveWasteLog με normalization timestamp
  const handleSaveWasteLog = (
    logData: Omit<WasteLog, 'id' | 'teamId' | 'userId'>
  ) => {
    const run = async () => {
      try {
        const normalizedTimestamp =
          logData.timestamp instanceof Date
            ? logData.timestamp
            : new Date(logData.timestamp as any);

        const toSave: Omit<WasteLog, 'id'> = {
          ...logData,
          timestamp: normalizedTimestamp,
          teamId: currentTeamId,
          userId: user.id
        };

        const savedLog = await api.saveWasteLog(toSave);

        setWasteLogs((prev) => [...prev, savedLog]);

        const inventoryItem = inventory.find(
          (i) => i.id === savedLog.inventoryItemId
        );
        if (inventoryItem && inventoryItem.locations.length > 0) {
          const primaryLocationId = inventoryItem.locations[0].locationId;

          const newTransaction: InventoryTransaction = {
            id: `trx_${Date.now()}`,
            itemId: savedLog.inventoryItemId,
            timestamp: savedLog.timestamp,
            type: 'waste',
            quantityChange: -savedLog.quantity,
            locationId: primaryLocationId,
            notes: `Reason: ${savedLog.reason}. ${savedLog.notes || ''}`,
            userId: user.id,
            teamId: currentTeamId
          };

          setInventoryTransactions((prev) => [...prev, newTransaction]);

          setInventory((prevInventory) =>
            prevInventory.map((item) => {
              if (item.id === savedLog.inventoryItemId) {
                const newLocations = [...item.locations];
                const locIndex = newLocations.findIndex(
                  (l) => l.locationId === primaryLocationId
                );
                if (locIndex > -1) {
                  newLocations[locIndex].quantity = Math.max(
                    0,
                    newLocations[locIndex].quantity - savedLog.quantity
                  );
                }
                return { ...item, locations: newLocations };
              }
              return item;
            })
          );
        }
      } catch (err: any) {
        console.error('Failed to save waste log', err);
        alert(
          `Αποτυχία αποθήκευσης φθοράς: ${
            err?.message || JSON.stringify(err) || 'Άγνωστο σφάλμα από Supabase.'
          }`
        );
      }
    };

    run();
  };

  const handleDeleteWasteLog = (log: WasteLog) => {
    const run = async () => {
      try {
        await api.deleteWasteLog(log.id);

        setWasteLogs((prev) => prev.filter((w) => w.id !== log.id));

        const inventoryItem = inventory.find(
          (i) => i.id === log.inventoryItemId
        );
        if (inventoryItem && inventoryItem.locations.length > 0) {
          const primaryLocationId = inventoryItem.locations[0].locationId;

          const newTransaction: InventoryTransaction = {
            id: `trx_${Date.now()}`,
            itemId: log.inventoryItemId,
            timestamp: new Date(),
            type: 'manual_add',
            quantityChange: log.quantity,
            locationId: primaryLocationId,
            notes: `Undo waste log ${log.id}. ${log.notes || ''}`,
            userId: user.id,
            teamId: currentTeamId
          };

          setInventoryTransactions((prev) => [...prev, newTransaction]);

          setInventory((prevInventory) =>
            prevInventory.map((item) => {
              if (item.id === log.inventoryItemId) {
                const newLocations = [...item.locations];
                const locIndex = newLocations.findIndex(
                  (l) => l.locationId === primaryLocationId
                );
                if (locIndex > -1) {
                  newLocations[locIndex].quantity =
                    newLocations[locIndex].quantity + log.quantity;
                }
                return { ...item, locations: newLocations };
              }
              return item;
            })
          );
        }
      } catch (err: any) {
        console.error('Failed to delete waste log', err);
        alert(
          `Αποτυχία διαγραφής φθοράς: ${
            err?.message || 'Άγνωστο σφάλμα από Supabase.'
          }`
        );
      }
    };

    run();
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
    const teamRecipesFiltered = recipes.filter((r) => r.teamId === currentTeamId);
    const teamIngredientCosts = ingredientCosts.filter(
      (ic) => ic.teamId === currentTeamId
    );
    const teamWorkstations = workstations.filter(
      (w) => w.teamId === currentTeamId
    );
    const teamTasks = tasks.filter((t) => t.teamId === currentTeamId);
    const teamHaccpLogs = haccpLogs.filter((l) => l.teamId === currentTeamId);
    const teamHaccpItems = haccpItems.filter((i) => i.teamId === currentTeamId);
    const teamHaccpReminders = haccpReminders.filter((r) => r.teamId === currentTeamId);
    const teamSuppliers = suppliers.filter((s) => s.teamId === currentTeamId);
    const teamInventory = inventory.filter((i) => i.teamId === currentTeamId);
    const teamInventoryLocations = inventoryLocations.filter(
      (i) => i.teamId === currentTeamId
    );
    const teamInventoryTransactions = inventoryTransactions.filter(
      (t) => t.teamId === currentTeamId
    );
    const teamWasteLogs = wasteLogs.filter((w) => w.teamId === currentTeamId);
    const teamMenusFiltered = menus.filter((m) => m.teamId === currentTeamId);
    const teamMessages = messages.filter((m) => (m as any).teamId === currentTeamId);
    const teamShifts = shifts.filter((s) => s.teamId === currentTeamId);
    const teamUsers = allUsers.filter((u) => u.teamId === currentTeamId);
    const teamShiftSchedules = shiftSchedules.filter(
      (s) => s.teamId === currentTeamId
    );
    const teamChannels = allChannels.filter((c) => c.teamId === currentTeamId);

    if (currentView === 'recipes') {
      const recipesForCategoryFilter = teamRecipesFiltered.filter((recipe) => {
        return (
          recipeCategoryFilter === 'All' ||
          recipe.category === recipeCategoryFilter
        );
      });

      // 🔎 Βελτιωμένη αναζήτηση: name, name_en, description, ingredients[].name
      const filteredRecipes = recipesForCategoryFilter.filter((recipe) => {
        const term = recipeSearchTerm.trim().toLowerCase();
        if (!term) return true;

        const name = recipe.name?.toLowerCase() || '';
        const nameEn = recipe.name_en?.toLowerCase() || '';
        const desc = recipe.description?.toLowerCase() || '';

        const ingredientsText = (recipe.ingredients || [])
          .map((ing: any) => (ing?.name || '').toString().toLowerCase())
          .join(' ');

        return (
          name.includes(term) ||
          nameEn.includes(term) ||
          desc.includes(term) ||
          ingredientsText.includes(term)
        );
      });

      const hasActiveFilters =
        recipeCategoryFilter !== 'All' || recipeSearchTerm.trim() !== '';

      const resultsCount = filteredRecipes.length;
      const totalInCategory = recipesForCategoryFilter.length;

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
            className={`h-full lg:col-span-2 ${
              selectedRecipeId && !isBookMode ? 'hidden lg:block' : ''
            }`}
          >
            {/* 🔹 Header φίλτρων / αποτελεσμάτων πάνω από τη λίστα */}
            <div className="flex items-center justify-between mb-2 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <span className="font-semibold">
                  Αποτελέσματα: {resultsCount}
                </span>
                <span className="ml-1 opacity-80">
                  (σε {totalInCategory} συνταγές κατηγορίας)
                </span>
                {recipeCategoryFilter !== 'All' && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[10px]">
                    Κατηγορία: {recipeCategoryFilter}
                  </span>
                )}
                {recipeSearchTerm.trim() !== '' && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-black/5 dark:bg:white/10 text-[10px]">
                    Αναζήτηση: “{recipeSearchTerm}”
                  </span>
                )}
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setRecipeCategoryFilter('All');
                    setRecipeSearchTerm('');
                  }}
                  className="text-[11px] px-2 py-1 rounded-full border border-slate-300 dark:border-slate-600 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Καθαρισμός φίλτρων
                </button>
              )}
            </div>

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
            />
          </div>
          <div
            className={`h-full lg:col-span-3 ${
              !selectedRecipeId ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {teamRecipesFiltered.find((r) => r.id === selectedRecipeId) ? (
              <RecipeDetail
                recipe={
                  teamRecipesFiltered.find((r) => r.id === selectedRecipeId)!
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
                currentUser={user}
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
            recipes={teamRecipesFiltered}
            tasks={teamTasks}
            haccpLogs={teamHaccpLogs}
            inventory={teamInventory}
            wasteLogs={teamWasteLogs}
            onViewChange={handleViewChange}
            withApiKeyCheck={withApiKeyCheck}
          />
        );

      case 'copilot':
        return (
          <ChefCopilot
            recipes={teamRecipesFiltered}
            menus={teamMenusFiltered}
            inventory={teamInventory}
            wasteLogs={teamWasteLogs}
            haccpLogs={teamHaccpLogs}
            tasks={teamTasks}
            workstations={teamWorkstations}
            withApiKeyCheck={withApiKeyCheck}
          />
        );

      // 🆕 Kitchen–Service view
      case 'kitchen_service':
        return (
          <KitchenServiceView
            teamId={currentTeamId}
            currentUser={user}
            workstations={teamWorkstations}
            currentUserRole={currentUserRole}
            rolePermissions={rolePermissions}
            onOpenOrdersCountChange={setKitchenServiceOpenCount}
          />
        );

      // 🆕 Kitchen Display System (KDS)
      case 'kds':
        return (
          <KitchenDisplayView
            orders={orders.filter(o => o.teamId === currentTeamId)}
            setOrders={setOrders}
            recipes={teamRecipesFiltered}
            users={allUsers}
            currentUserId={user.id}
            currentTeamId={currentTeamId}
            canManage={currentUserRole === 'owner' || currentUserRole === 'admin'}
          />
        );

      case 'reports':
        return (
          <EmailReportsView
            reports={reports.filter(r => r.teamId === currentTeamId)}
            setReports={setReports}
            reportHistory={reportHistory}
            setReportHistory={setReportHistory}
            currentTeamId={currentTeamId}
            currentUserId={user.id}
          />
        );

      case 'workstations':
        return (
          <WorkstationView
            recipes={teamRecipesFiltered}
            workstations={teamWorkstations}
            setWorkstations={setWorkstations}
            tasks={teamTasks}
            setTasks={setTasks}
            menus={teamMenusFiltered}
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
            currentTeamId={currentTeamId}
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
            currentTeamId={currentTeamId}
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
            rolePermissions={rolePermissions}
            onTransfer={handleInventoryTransfer}
            onImportInvoice={() => setIsInvoiceImportOpen(true)}
            withApiKeyCheck={withApiKeyCheck}
            currentTeamId={currentTeamId}
            wasteLogs={teamWasteLogs}
            onViewChange={handleViewChange}
            menus={teamMenusFiltered}
            recipes={teamRecipesFiltered}
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
            ingredientCosts={teamIngredientCosts}
            onSave={handleSaveWasteLog}
            onDelete={handleDeleteWasteLog}
            currentUserRole={currentUserRole}
            rolePermissions={rolePermissions}
            withApiKeyCheck={withApiKeyCheck}
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
            currentTeamId={currentTeamId}
          />
        );
      case 'menus':
        return (
          <MenuView
            menus={teamMenusFiltered}
            setMenus={setMenus}
            allRecipes={teamRecipesFiltered}
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
            menus={teamMenusFiltered}
            recipes={teamRecipesFiltered}
            inventory={teamInventory}
            suppliers={teamSuppliers}
            withApiKeyCheck={withApiKeyCheck}
            wasteLogs={teamWasteLogs}
            onOpenInventoryItem={(itemId) => {
              setSelectedInventoryId(itemId);
              setCurrentView('inventory');
            }}
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
            walkieSettings={walkieSettings}
            setWalkieSettings={setWalkieSettings}
          />
        );
      case 'analytics':
        return (
          <AnalyticsDashboard
            recipes={teamRecipesFiltered}
            wasteLogs={teamWasteLogs}
            inventory={teamInventory}
            ingredientCosts={teamIngredientCosts}
            menus={teamMenusFiltered}
          />
        );
      case 'collaboration':
        return (
          <CollaborationView
            shifts={teamShifts}
            users={teamUsers}
            teams={allTeams}
            currentUserId={user.id}
            currentTeamId={user.teamId}
            handoverNotes={handoverNotes.filter(n => n.teamId === user.teamId)}
            notifications={collabNotifications}
            onAddHandoverNote={(note) => {
              const newNote: HandoverNote = {
                ...note,
                id: `handover_${Date.now()}`,
                createdAt: new Date().toISOString(),
                acknowledged: false,
              };
              setHandoverNotes(prev => [...prev, newNote]);
              // Create notification for recipient
              const recipientNotification: CollabNotification = {
                id: `notif_${Date.now()}`,
                teamId: note.teamId,
                userId: note.toUserId,
                type: 'shift',
                title: t('new_handover_note'),
                message: `Νέα σημείωση από ${teamUsers.find(u => u.id === note.fromUserId)?.name || 'Unknown'}`,
                createdAt: new Date().toISOString(),
                read: false,
                priority: note.priority,
              };
              setCollabNotifications(prev => [...prev, recipientNotification]);
            }}
            onAcknowledgeNote={(noteId) => {
              setHandoverNotes(prev =>
                prev.map(n =>
                  n.id === noteId
                    ? { ...n, acknowledged: true, acknowledgedAt: new Date().toISOString() }
                    : n
                )
              );
            }}
            onMarkNotificationAsRead={(notificationId) => {
              setCollabNotifications(prev =>
                prev.map(n =>
                  n.id === notificationId
                    ? { ...n, read: true, readAt: new Date().toISOString() }
                    : n
                )
              );
            }}
            onMarkAllNotificationsAsRead={() => {
              setCollabNotifications(prev =>
                prev.map(n =>
                  n.userId === user.id && !n.read
                    ? { ...n, read: true, readAt: new Date().toISOString() }
                    : n
                )
              );
            }}
            onDeleteNotification={(notificationId) => {
              setCollabNotifications(prev => prev.filter(n => n.id !== notificationId));
            }}
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
      <Sidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        user={user}
        onLogout={onLogout}
        currentTeam={currentTeam}
        currentUserRole={currentUserRole}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        walkieUnreadCount={kitchenServiceOpenCount}
      />
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
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
    </div>
  );
};

export default KitchenInterface;
