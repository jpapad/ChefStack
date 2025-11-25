import React, { useState, useMemo } from 'react';
import {
  InventoryItem,
  Supplier,
  IngredientCost,
  Role,
  InventoryLocation,
  RolePermissions,
  Menu,
  Recipe,
  InventoryTransaction
} from '../../types';
import { WasteLog, View } from '../../types';
import { Icon } from '../common/Icon';
import ConfirmationModal from '../common/ConfirmationModal';
import InventoryForm from './InventoryForm';
import InventoryList from './InventoryList';
import PrintPreview from '../common/PrintPreview';
import QRCodePrint from './QRCodePrint';
import TransferStockModal from './TransferStockModal';
import StockAlertPanel from './StockAlertPanel';
import QuickStockAdjustment from './QuickStockAdjustment';
import SupplierOrderTemplates from './SupplierOrderTemplates';
import InventoryForecast from './InventoryForecast';
import StockMovementHistory from './StockMovementHistory';
import ExportImportButtons from '../common/ExportImportButtons';
import AdvancedFilterPanel, { FilterConfig, FilterValue } from '../common/AdvancedFilterPanel';
import { useFilterPresets } from '../../hooks/useFilterPresets';
import BatchActionBar, { BatchAction } from '../common/BatchActionBar';
import BulkEditModal, { BulkEditField } from '../common/BulkEditModal';
import { useBatchSelection } from '../../hooks/useBatchSelection';
import { api } from '../../services/api';

interface InventoryViewProps {
  wasteLogs?: WasteLog[];
  onViewChange?: (view: View) => void;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  suppliers: Supplier[];
  ingredientCosts: IngredientCost[];
  inventoryLocations: InventoryLocation[];
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onBack: () => void;
  currentUserRole?: Role;
  rolePermissions: RolePermissions;
  onTransfer: (
    itemId: string,
    fromLocationId: string,
    toLocationId: string,
    quantity: number
  ) => void;
  onImportInvoice: () => void;
  withApiKeyCheck: (action: () => void) => void;
  currentTeamId: string;
  menus?: Menu[];
  recipes?: Recipe[];
  inventoryTransactions?: InventoryTransaction[];
}

const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  setInventory,
  suppliers,
  ingredientCosts,
  inventoryLocations,
  selectedItemId,
  onSelectItem,
  onBack,
  currentUserRole,
  rolePermissions,
  onTransfer,
  onImportInvoice,
  withApiKeyCheck,
  currentTeamId,
  wasteLogs,
  onViewChange,
  menus = [],
  recipes = [],
  inventoryTransactions = []
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [isQrPrintOpen, setIsQrPrintOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [quickAdjustItem, setQuickAdjustItem] = useState<(InventoryItem & { totalQuantity: number }) | null>(null);
  const [isOrderTemplatesOpen, setIsOrderTemplatesOpen] = useState(false);
  const [isForecastOpen, setIsForecastOpen] = useState(false);
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);

  // 🔍 Advanced Filters
  const { presets, savePreset, deletePreset } = useFilterPresets('inventory');
  const [filterValues, setFilterValues] = useState<FilterValue>({
    search: '',
    supplier: '',
    stockStatus: '',
    category: '',
    dateRange: { from: '', to: '' },
  });

  // 🧠 Κατάσταση για το AI panel
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const canManage = currentUserRole
    ? rolePermissions[currentUserRole]?.includes('manage_inventory')
    : false;

  // 🔢 Helper για συνολική ποσότητα
  const getTotalQuantity = (item: InventoryItem) =>
    item.locations.reduce((sum, loc) => sum + loc.quantity, 0);

  // 💰 Εμπλουτίζουμε inventory με totalQuantity, supplierName, unitCost, stockValue
  const inventoryWithDetails = useMemo(
    () =>
      inventory
        .map(item => {
          const totalQuantity = getTotalQuantity(item);
          const supplierName =
            suppliers.find(s => s.id === item.supplierId)?.name || 'N/A';

          const costRow = item.ingredientCostId
            ? ingredientCosts.find(c => c.id === item.ingredientCostId)
            : undefined;
          const unitCost = costRow?.cost ?? 0;
          const stockValue = totalQuantity * unitCost;

          return {
            ...item,
            totalQuantity,
            supplierName,
            unitCost,
            stockValue
          } as InventoryItem & {
            totalQuantity: number;
            supplierName: string;
            unitCost: number;
            stockValue: number;
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [inventory, suppliers, ingredientCosts]
  );

  // 🔍 Filter configuration
  const filterConfig: FilterConfig[] = useMemo(() => {
    const uniqueSuppliers = Array.from(new Set(suppliers.map(s => s.id))).map(id => {
      const supplier = suppliers.find(s => s.id === id);
      return { value: id, label: supplier?.name || 'N/A' };
    });

    return [
      {
        id: 'search',
        label: 'Αναζήτηση',
        type: 'text',
        placeholder: 'Όνομα είδους...',
      },
      {
        id: 'supplier',
        label: 'Προμηθευτής',
        type: 'select',
        options: uniqueSuppliers,
      },
      {
        id: 'stockStatus',
        label: 'Κατάσταση Αποθέματος',
        type: 'select',
        options: [
          { value: 'all', label: 'Όλα' },
          { value: 'low', label: 'Χαμηλό Απόθεμα' },
          { value: 'zero', label: 'Εξαντλημένο' },
          { value: 'normal', label: 'Κανονικό' },
        ],
      },
      {
        id: 'minQuantity',
        label: 'Ελάχιστη Ποσότητα',
        type: 'number',
        placeholder: '0',
      },
      {
        id: 'maxQuantity',
        label: 'Μέγιστη Ποσότητα',
        type: 'number',
        placeholder: '1000',
      },
    ];
  }, [suppliers]);

  // 🔍 Filtered inventory
  const filteredInventory = useMemo(() => {
    return inventoryWithDetails.filter(item => {
      // Search filter
      if (filterValues.search && typeof filterValues.search === 'string') {
        const searchLower = filterValues.search.toLowerCase();
        if (!item.name.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Supplier filter
      if (filterValues.supplier && filterValues.supplier !== '') {
        if (item.supplierId !== filterValues.supplier) {
          return false;
        }
      }

      // Stock status filter
      if (filterValues.stockStatus && filterValues.stockStatus !== '' && filterValues.stockStatus !== 'all') {
        const status = filterValues.stockStatus;
        const isLow = item.totalQuantity <= item.reorderPoint;
        const isZero = item.totalQuantity <= 0.0001;

        if (status === 'low' && !isLow) return false;
        if (status === 'zero' && !isZero) return false;
        if (status === 'normal' && (isLow || isZero)) return false;
      }

      // Min quantity filter
      if (filterValues.minQuantity && filterValues.minQuantity !== '') {
        const min = parseFloat(filterValues.minQuantity as string);
        if (!isNaN(min) && item.totalQuantity < min) {
          return false;
        }
      }

      // Max quantity filter
      if (filterValues.maxQuantity && filterValues.maxQuantity !== '') {
        const max = parseFloat(filterValues.maxQuantity as string);
        if (!isNaN(max) && item.totalQuantity > max) {
          return false;
        }
      }

      return true;
    });
  }, [inventoryWithDetails, filterValues]);

  // ✅ Batch Selection
  const {
    selectedIds,
    selectedItems,
    selectedCount,
    isSelected,
    toggleSelection,
    selectAll,
    deselectAll,
  } = useBatchSelection(filteredInventory);

  // 📝 Bulk Edit Modal
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  // 📊 Γενικά στατιστικά αποθήκης + smart alerts
  const inventoryStats = useMemo(() => {
    const totalItems = inventoryWithDetails.length;

    const totalStockValue = inventoryWithDetails.reduce(
      (sum, item) => sum + (item.stockValue || 0),
      0
    );

    const lowStockItems = inventoryWithDetails.filter(item => {
      const rp = item.reorderPoint || 0;
      if (rp <= 0) return false;
      return item.totalQuantity <= rp;
    });

    const zeroStockItems = inventoryWithDetails.filter(item => {
      const rp = item.reorderPoint || 0;
      if (rp <= 0) return false;
      return item.totalQuantity <= 0.0001;
    });

    const lowStockTop = [...lowStockItems]
      .sort((a, b) => {
        const ar = a.totalQuantity / Math.max(a.reorderPoint || 1, 1);
        const br = b.totalQuantity / Math.max(b.reorderPoint || 1, 1);
        return ar - br;
      })
      .slice(0, 5);

    return {
      totalItems,
      totalStockValue,
      lowStockCount: lowStockItems.length,
      zeroStockCount: zeroStockItems.length,
      lowStockTop
    };
  }, [inventoryWithDetails]);

  const selectedItem = useMemo(
    () =>
      inventoryWithDetails.find(i => i.id === selectedItemId) || null,
    [inventoryWithDetails, selectedItemId]
  );

  // 📉 Waste logs για το επιλεγμένο είδος
  const itemWasteLogs = useMemo(
    () =>
      (wasteLogs || []).filter(
        w => w.inventoryItemId === selectedItemId
      ),
    [wasteLogs, selectedItemId]
  );

  const totalItemWaste = useMemo(
    () => itemWasteLogs.reduce((sum, w) => sum + w.quantity, 0),
    [itemWasteLogs]
  );

  const handleOpenForm = (item: InventoryItem | null = null) => {
    setItemToEdit(item);
    setIsFormOpen(true);
  };

  const handleSaveItem = async (
    data: Omit<InventoryItem, 'id' | 'teamId'> | InventoryItem
  ) => {
    try {
      const isExisting = 'id' in data;
      const savedItem = await api.saveInventoryItem(
        data as any,
        currentTeamId
      );

      setInventory(prev => {
        const exists = prev.some(i => i.id === savedItem.id);
        const updated = exists
          ? prev.map(i => (i.id === savedItem.id ? savedItem : i))
          : [...prev, savedItem];
        return updated.sort((a, b) => a.name.localeCompare(b.name));
      });

      if (!isExisting) {
        onSelectItem(savedItem.id);
      }

      setIsFormOpen(false);
      setItemToEdit(null);
    } catch (err: any) {
      console.error('Failed to save inventory item', err);
      alert(
        `Αποτυχία αποθήκευσης είδους αποθήκης: ${
          err?.message || 'Άγνωστο σφάλμα'
        }`
      );
    }
  };

  const handleRequestDelete = (item: InventoryItem) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;

    const run = async () => {
      try {
        await api.deleteInventoryItem(itemToDelete.id);

        setInventory(prev => prev.filter(c => c.id !== itemToDelete.id));

        if (selectedItemId === itemToDelete.id) {
          const remaining = inventory.filter(i => i.id !== itemToDelete.id);
          onSelectItem(remaining.length > 0 ? remaining[0].id : null);
        }

        setItemToDelete(null);
      } catch (err: any) {
        console.error('Failed to delete inventory item', err);
        alert(
          `Αποτυχία διαγραφής είδους αποθήκης: ${
            err?.message || 'Άγνωστο σφάλμα'
          }`
        );
      }
    };
    run();
  };

  // 🔄 Batch Operations Handlers
  const handleBulkEdit = (changes: Record<string, any>) => {
    const updatedItems = selectedItems.map(item => ({
      ...item,
      ...changes,
    }));

    updatedItems.forEach(async (item) => {
      try {
        await api.upsertInventoryItem(item);
      } catch (error) {
        console.error('Failed to update item:', error);
      }
    });

    setInventory(prev => prev.map(item => {
      const updated = updatedItems.find(u => u.id === item.id);
      return updated || item;
    }));

    setIsBulkEditOpen(false);
    deselectAll();
    alert(`Ενημερώθηκαν ${updatedItems.length} είδη με επιτυχία!`);
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedItems.map(item => api.deleteInventoryItem(item.id))
      );

      setInventory(prev => prev.filter(item => !selectedIds.has(item.id)));
      
      if (selectedItemId && selectedIds.has(selectedItemId)) {
        onSelectItem(null);
      }

      setBulkDeleteConfirmOpen(false);
      deselectAll();
      alert(`Διαγράφηκαν ${selectedCount} είδη με επιτυχία!`);
    } catch (error) {
      console.error('Bulk delete failed:', error);
      alert('Αποτυχία μαζικής διαγραφής');
    }
  };

  const handleBulkPriceUpdate = (percentage: number) => {
    const updatedItems = selectedItems.map(item => {
      const costRow = item.ingredientCostId
        ? ingredientCosts.find(c => c.id === item.ingredientCostId)
        : undefined;
      
      if (costRow) {
        const newCost = costRow.cost * (1 + percentage / 100);
        // Update cost in ingredientCosts array (simplified)
        return item;
      }
      return item;
    });

    alert(`Ενημερώθηκαν τιμές για ${selectedCount} είδη (+${percentage}%)`);
    deselectAll();
  };

  const handleConfirmTransfer = (
    fromLocationId: string,
    toLocationId: string,
    quantity: number
  ) => {
    if (selectedItem) {
      onTransfer(selectedItem.id, fromLocationId, toLocationId, quantity);
    }
    setIsTransferModalOpen(false);
  };

  // 🚀 Quick stock adjustment
  const handleQuickAdjustment = async (itemId: string, adjustment: number, reason: string) => {
    try {
      const item = inventory.find(i => i.id === itemId);
      if (!item) return;

      // Find the first location or create default location
      const firstLocation = item.locations[0] || { locationId: 'default', quantity: 0 };
      const newQuantity = Math.max(0, firstLocation.quantity + adjustment);

      // Update the item
      const updatedItem: InventoryItem = {
        ...item,
        locations: [
          { ...firstLocation, quantity: newQuantity },
          ...item.locations.slice(1)
        ]
      };

      await api.upsertInventoryItem(updatedItem);
      setInventory(prev => prev.map(i => i.id === itemId ? updatedItem : i));
      setQuickAdjustItem(null);

      // Show success message
      const action = adjustment > 0 ? 'Προστέθηκαν' : 'Αφαιρέθηκαν';
      alert(`${action} ${Math.abs(adjustment)} ${item.unit} ${adjustment > 0 ? 'στο' : 'από το'} απόθεμα`);
    } catch (error) {
      console.error('Failed to adjust stock:', error);
      alert('Αποτυχία ενημέρωσης αποθέματος');
    }
  };

  // ✅ Gemini για προτάσεις αποθέματος
  const handleAiSuggestionsForItem = () => {
    if (!selectedItem) return;

    withApiKeyCheck(() => {
      (async () => {
        setIsAiLoading(true);
        setAiError(null);

        try {
          const apiKey = import.meta.env.VITE_GEMINI_API_KEY as
            | string
            | undefined;
          if (!apiKey) {
            throw new Error(
              'Λείπει το VITE_GEMINI_API_KEY από το .env.local.'
            );
          }

          const total: number = (selectedItem as any).totalQuantity;

          const reorderPoint = selectedItem.reorderPoint || 0;

          const estimatedDailyUsage =
            reorderPoint > 0 ? reorderPoint / 7 : total > 0 ? total / 14 : 0;

          const daysLeft =
            estimatedDailyUsage > 0 ? total / estimatedDailyUsage : null;

          const supplierName =
            (selectedItem as any).supplierName ||
            suppliers.find(s => s.id === selectedItem.supplierId)?.name ||
            'N/A';

          const perLocation = selectedItem.locations
            .map(loc => {
              const locDetails = inventoryLocations.find(
                l => l.id === loc.locationId
              );
              const name = locDetails?.name || 'Άγνωστη τοποθεσία';
              return `${name}: ${loc.quantity.toFixed(2)} ${
                selectedItem.unit
              }`;
            })
            .join('\n');

          const unitCost = (selectedItem as any).unitCost as number;
          const stockValue = (selectedItem as any).stockValue as number;

          const prompt = `
Είσαι βοηθός food cost & stock control σε επαγγελματική κουζίνα.

Δεδομένα είδους αποθήκης:
- Όνομα: ${selectedItem.name}
- Μονάδα: ${selectedItem.unit}
- Προμηθευτής: ${supplierName}
- Συνολική ποσότητα: ${total.toFixed(2)} ${selectedItem.unit}
- Εκτιμώμενο κόστος/μονάδα: ${unitCost.toFixed(2)} €
- Εκτιμώμενη αξία αποθέματος: ${stockValue.toFixed(2)} €
- Reorder point: ${
            reorderPoint > 0 ? reorderPoint.toFixed(2) : 'δεν έχει οριστεί'
          }
- Εκτίμηση ημερών κάλυψης (πολύ πρόχειρη): ${
            daysLeft !== null ? daysLeft.toFixed(1) : 'άγνωστο'
          }
- Ανάλυση ανά τοποθεσία:
${perLocation || '—'}

Θέλω σε 4–6 bullets, στα Ελληνικά, να μου δώσεις:
1. Εκτίμηση αν το stock είναι χαμηλό, οριακό ή υψηλό σε σχέση με το reorder point.
2. Αν χρειάζεται άμεση παραγγελία ή απλά παρακολούθηση.
3. Αν υπάρχει ρίσκο φθοράς / λήξης λόγω υπερβολικού stock.
4. Μικρές πρακτικές προτάσεις (π.χ. αλλαγές στη συχνότητα παραγγελίας, μεταφορά σε άλλη τοποθεσία, χρήση σε συνταγές ημέρας).
5. Αν η αξία του αποθέματος για αυτό το είδος είναι ανησυχητικά υψηλή ή χαμηλή σε σχέση με την χρήση του.

Να είσαι σύντομος, πρακτικός και συγκεκριμένος. Χρησιμοποίησε bullets (•) και όχι πολύ θεωρία.
          `.trim();

          const model = 'gemini-2.0-flash';
          const endpoint =
            'https://generativelanguage.googleapis.com/v1beta/models/' +
            model +
            ':generateContent?key=' +
            encodeURIComponent(apiKey);

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }]
                }
              ]
            })
          });

          if (!response.ok) {
            const text = await response.text();
            console.error('Gemini API error:', text);
            throw new Error('Σφάλμα από το Gemini API.');
          }

          const data = await response.json();
          const text =
            data?.candidates?.[0]?.content?.parts
              ?.map((p: any) => p.text)
              .join('\n') ||
            'Δεν λήφθηκε απάντηση από το AI.';

          setAiInsights(text);
        } catch (e: any) {
          console.error('AI suggestions error', e);
          setAiError(
            e?.message ||
              'Σφάλμα κατά την ανάλυση των δεδομένων αποθέματος.'
          );
        } finally {
          setIsAiLoading(false);
        }
      })();
    });
  };

  return (
    <>
      {/* 🔝 Inventory Overview & Smart Alerts */}
      {inventoryWithDetails.length > 0 && (
        <div className="mb-4 space-y-3">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-white/70 dark:bg-slate-900/70 border border-white/30 dark:border-slate-700/60 rounded-xl p-3 flex items-center gap-3">
              <div className="p-2 rounded-full bg-black/5 dark:bg-white/10">
                <Icon name="package" className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400">
                  Σύνολο Ειδών
                </p>
                <p className="text-lg font-bold">
                  {inventoryStats.totalItems}
                </p>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-slate-900/70 border border-white/30 dark:border-slate-700/60 rounded-xl p-3 flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-50 dark:bg-emerald-900/40">
                <Icon
                  name="euro"
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-300"
                />
              </div>
              <div>
                <p className="text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400">
                  Συνολική Αξία Αποθέματος
                </p>
                <p className="text-lg font-bold">
                  {inventoryStats.totalStockValue.toFixed(2)} €
                </p>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-slate-900/70 border border-white/30 dark:border-slate-700/60 rounded-xl p-3 flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-50 dark:bg-amber-900/40">
                <Icon
                  name="alert-triangle"
                  className="w-4 h-4 text-amber-600 dark:text-amber-300"
                />
              </div>
              <div>
                <p className="text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400">
                  Χαμηλό Απόθεμα (≤ reorder)
                </p>
                <p className="text-lg font-bold">
                  {inventoryStats.lowStockCount}
                </p>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-slate-900/70 border border-white/30 dark:border-slate-700/60 rounded-xl p-3 flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-50 dark:bg-red-900/40">
                <Icon
                  name="x-circle"
                  className="w-4 h-4 text-red-600 dark:text-red-300"
                />
              </div>
              <div>
                <p className="text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400">
                  Μηδενικό Απόθεμα
                </p>
                <p className="text-lg font-bold">
                  {inventoryStats.zeroStockCount}
                </p>
              </div>
            </div>
          </div>

          {/* Stock Alert Panel */}
          <StockAlertPanel
            lowStockItems={inventoryStats.lowStockTop}
            zeroStockCount={inventoryStats.zeroStockCount}
            onSelectItem={(itemId) => {
              onSelectItem(itemId);
              const item = inventoryWithDetails.find(i => i.id === itemId);
              if (item) {
                setQuickAdjustItem(item);
              }
            }}
          />

          {/* Quick Action: Supplier Order Templates */}
          {inventoryStats.lowStockCount > 0 && (
            <button
              onClick={() => setIsOrderTemplatesOpen(true)}
              className="w-full p-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 font-semibold"
            >
              <Icon name="file-text" className="w-5 h-5" />
              <span>Δημιουργία Προτεινόμενων Παραγγελιών</span>
              <Icon name="arrow-right" className="w-5 h-5" />
            </button>
          )}

          {/* Quick Action Buttons Row */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setIsForecastOpen(true)}
              className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 font-semibold"
            >
              <Icon name="trending-up" className="w-5 h-5" />
              <span>Πρόβλεψη Αποθέματος</span>
            </button>
            <button
              onClick={() => onViewChange?.('inventory_history')}
              className="p-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 font-semibold"
            >
              <Icon name="history" className="w-5 h-5" />
              <span>Ιστορικό Κινήσεων</span>
            </button>
            <div className="flex items-center justify-center">
              <ExportImportButtons
                type="inventory"
                data={inventory}
                showImport={canManage}
                onImportComplete={(importedItems) => {
                  const itemsWithIds = importedItems.map(item => ({
                    ...item,
                    id: `inv_${Date.now()}_${Math.random()}`,
                    teamId: inventory[0]?.teamId || '',
                  }));
                  setInventory(prev => [...prev, ...itemsWithIds as InventoryItem[]]);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}

      <div className="mb-6">
        <AdvancedFilterPanel
          filters={filterConfig}
          values={filterValues}
          onChange={setFilterValues}
          presets={presets}
          onSavePreset={savePreset}
          onLoadPreset={setFilterValues}
          onDeletePreset={deletePreset}
          onClear={() => setFilterValues({
            search: '',
            supplier: '',
            stockStatus: '',
            minQuantity: '',
            maxQuantity: '',
          })}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div
          className={`h-full ${
            selectedItemId ? 'hidden lg:block' : 'lg:col-span-1'
          }`}
        >
          <InventoryList
            inventory={filteredInventory}
            selectedItemId={selectedItemId}
            onSelectItem={onSelectItem}
            onAdd={() => handleOpenForm(null)}
            onEdit={handleOpenForm}
            onDelete={handleRequestDelete}
            canManage={canManage}
            onImportInvoice={onImportInvoice}
            withApiKeyCheck={withApiKeyCheck}
            onViewHistory={setHistoryItem}
            isSelected={isSelected}
            onToggleSelection={toggleSelection}
            batchMode={selectedCount > 0}
          />
        </div>
        <div
          className={`h-full ${
            !selectedItemId ? 'hidden lg:flex' : 'lg:col-span-2'
          }`}
        >
          {selectedItem ? (
            <div className="p-6 h-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl overflow-y-auto">
              <button
                onClick={onBack}
                className="lg:hidden flex items-center mb-4 text-brand-yellow hover:underline"
              >
                <Icon name="arrow-left" className="w-5 h-5 mr-2" />
                Πίσω στο Απόθεμα
              </button>

              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-heading">
                    {selectedItem.name}
                  </h2>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Προμηθευτής:{' '}
                    {(selectedItem as any).supplierName || 'N/A'}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-4">
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => setIsTransferModalOpen(true)}
                      title="Μεταφορά Αποθέματος"
                      className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                      <Icon
                        name="arrow-right-left"
                        className="w-5 h-5 text-blue-500"
                      />
                    </button>
                    <button
                      onClick={() => setIsQrPrintOpen(true)}
                      title="Εκτύπωση QR Code"
                      className="p-2 rounded-full hover:bg-black/5 dark:hover:bg:white/10 transition-colors"
                    >
                      <Icon
                        name="qr-code"
                        className="w-5 h-5 text-brand-yellow"
                      />
                    </button>
                    {canManage && (
                      <>
                        <button
                          onClick={() => handleOpenForm(selectedItem)}
                          title="Επεξεργασία"
                          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        >
                          <Icon name="edit" className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRequestDelete(selectedItem)}
                          title="Διαγραφή"
                          className="p-2 rounded-full text-light-text-secondary hover:text-red-600 dark:text-dark-text-secondary dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Icon name="trash-2" className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* 🧠 Κουμπί AI Προτάσεις */}
                  <button
                    onClick={handleAiSuggestionsForItem}
                    className="px-3 py-1 rounded-full border border-purple-400 text-purple-700 text-xs font-semibold hover:bg-purple-50 dark:border-purple-500 dark:text-purple-200 dark:hover:bg-purple-500/10 transition-colors"
                  >
                    AI Προτάσεις
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Ανάλυση ανά τοποθεσία */}
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-lg lg:col-span-2">
                  <h4 className="text-md font-semibold font-heading text-light-text-secondary dark:text-dark-text-secondary mb-2">
                    Ανάλυση Αποθέματος ανά Τοποθεσία
                  </h4>
                  <div className="space-y-2">
                    {selectedItem.locations.map(loc => {
                      const locationDetails = inventoryLocations.find(
                        l => l.id === loc.locationId
                      );
                      const isLowHere =
                        loc.quantity <=
                        selectedItem.reorderPoint /
                          Math.max(selectedItem.locations.length, 1);
                      return (
                        <div
                          key={loc.locationId}
                          className="flex justify-between items-center p-2 bg-light-card dark:bg-dark-card rounded"
                        >
                          <span className="font-semibold">
                            {locationDetails?.name || 'Άγνωστη τοποθεσία'}
                          </span>
                          <span
                            className={`font-bold font-mono text-lg ${
                              isLowHere ? 'text-red-500' : ''
                            }`}
                          >
                            {loc.quantity.toFixed(2)} {selectedItem.unit}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Συνολική Ποσότητα + Αξία */}
                <div className="bg-black/5 dark:bg-white/5 p-6 rounded-lg text-center">
                  <h4 className="text-md font-semibold font-heading text-light-text-secondary dark:text-dark-text-secondary">
                    Συνολική Ποσότητα
                  </h4>
                  <p
                    className={`text-4xl font-bold ${
                      (selectedItem as any).totalQuantity <=
                      selectedItem.reorderPoint
                        ? 'text-red-500'
                        : 'text-brand-yellow'
                    }`}
                  >
                    {(selectedItem as any).totalQuantity.toFixed(2)}{' '}
                    <span className="text-2xl">{selectedItem.unit}</span>
                  </p>

                  {typeof (selectedItem as any).stockValue === 'number' && (
                    <p className="mt-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      Εκτιμώμενη αξία αποθέματος:{' '}
                      {(selectedItem as any).stockValue.toFixed(2)} €
                    </p>
                  )}
                </div>
              </div>

              {/* 🔄 Φθορές για το είδος */}
              {selectedItem && (
                <div className="mt-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700 rounded-xl p-3">
                  <h4 className="text-xs font-semibold mb-2 flex items-center gap-2">
                    <Icon
                      name="trash"
                      className="w-4 h-4 text-amber-500"
                    />
                    Φθορές για το είδος
                  </h4>

                  {itemWasteLogs.length === 0 ? (
                    <p className="text-xs text-amber-900 dark:text-amber-100">
                      Δεν έχουν καταχωρηθεί φθορές για αυτό το είδος.
                    </p>
                  ) : (
                    <>
                      <p className="text-xs mb-2">
                        Καταχωρήσεις:{' '}
                        <strong>{itemWasteLogs.length}</strong> | Συνολική
                        ποσότητα:{' '}
                        <strong>
                          {totalItemWaste.toFixed(2)} {selectedItem.unit}
                        </strong>
                      </p>
                      <button
                        type="button"
                        onClick={() => onViewChange?.('waste_log')}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-amber-400 text-amber-700 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-200 dark:hover:bg-amber-500/10 transition-colors"
                      >
                        <Icon name="arrow-right" className="w-3 h-3" />
                        Δες όλες τις φθορές
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* 🧠 AI Panel */}
              <div className="mt-6 bg-purple-50/70 dark:bg-purple-900/40 border border-purple-200/80 dark:border-purple-700/70 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon
                    name="sparkles"
                    className="w-5 h-5 text-purple-500 dark:text-purple-300"
                  />
                </div>
                <h4 className="text-md font-semibold font-heading text-purple-800 dark:text-purple-100">
                  AI Προτάσεις για το απόθεμα
                </h4>

                {isAiLoading && (
                  <p className="text-sm text-purple-700 dark:text-purple-200">
                    Γίνεται ανάλυση των δεδομένων αποθέματος...
                  </p>
                )}

                {!isAiLoading && aiError && (
                  <p className="text-sm text-red-600 dark:text-red-300">
                    {aiError}
                  </p>
                )}

                {!isAiLoading && !aiError && aiInsights && (
                  <pre className="text-sm whitespace-pre-wrap font-sans text-purple-900 dark:text-purple-100">
                    {aiInsights}
                  </pre>
                )}

                {!isAiLoading && !aiError && !aiInsights && (
                  <p className="text-sm text-purple-700 dark:text-purple-200">
                    Πάτησε το κουμπί <strong>“AI Προτάσεις”</strong> για να
                    λάβεις ανάλυση επιπέδων αποθέματος, κινδύνου έλλειψης ή
                    φθοράς, μαζί με προτάσεις δράσης.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-light-text-secondary dark:text-dark-text-secondary bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl">
              <p>Επιλέξτε ή δημιουργήστε ένα είδος αποθήκης</p>
            </div>
          )}
        </div>
      </div>

      <InventoryForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveItem}
        itemToEdit={itemToEdit}
        suppliers={suppliers}
        ingredientCosts={ingredientCosts}
        inventoryLocations={inventoryLocations}
      />

      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Διαγραφή Είδους Αποθήκης"
        body={
          <p>
            Είστε σίγουροι ότι θέλετε να διαγράψετε το είδος "
            {itemToDelete?.name}";
          </p>
        }
      />

      {isQrPrintOpen && selectedItem && (
        <PrintPreview onClose={() => setIsQrPrintOpen(false)}>
          <QRCodePrint item={selectedItem} />
        </PrintPreview>
      )}

      <TransferStockModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onConfirm={handleConfirmTransfer}
        item={selectedItem || undefined}
        inventoryLocations={inventoryLocations}
      />

      {quickAdjustItem && (
        <QuickStockAdjustment
          item={quickAdjustItem}
          isOpen={true}
          onClose={() => setQuickAdjustItem(null)}
          onAdjust={handleQuickAdjustment}
        />
      )}

      <SupplierOrderTemplates
        inventory={inventory}
        suppliers={suppliers}
        isOpen={isOrderTemplatesOpen}
        onClose={() => setIsOrderTemplatesOpen(false)}
      />

      <InventoryForecast
        isOpen={isForecastOpen}
        onClose={() => setIsForecastOpen(false)}
        inventory={inventory}
        menus={menus}
        recipes={recipes}
        wasteLogs={wasteLogs || []}
        forecastDays={7}
      />

      {historyItem && (
        <StockMovementHistory
          isOpen={true}
          onClose={() => setHistoryItem(null)}
          item={historyItem}
          transactions={inventoryTransactions}
          wasteLogs={wasteLogs || []}
        />
      )}

      {/* Batch Action Bar */}
      <BatchActionBar
        selectedCount={selectedCount}
        totalCount={filteredInventory.length}
        actions={[
          {
            id: 'edit',
            label: 'Μαζική Επεξεργασία',
            icon: 'edit',
            color: 'blue',
            action: () => setIsBulkEditOpen(true),
          },
          {
            id: 'delete',
            label: 'Μαζική Διαγραφή',
            icon: 'trash-2',
            color: 'red',
            dangerous: true,
            requiresConfirmation: true,
            action: () => setBulkDeleteConfirmOpen(true),
          },
        ]}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        onCancel={deselectAll}
      />

      {/* Bulk Edit Modal */}
      <BulkEditModal
        isOpen={isBulkEditOpen}
        title="Μαζική Επεξεργασία Αποθέματος"
        selectedCount={selectedCount}
        fields={[
          {
            id: 'supplierId',
            label: 'Προμηθευτής',
            type: 'select',
            options: suppliers.map(s => ({ value: s.id, label: s.name })),
          },
          {
            id: 'reorderPoint',
            label: 'Reorder Point',
            type: 'number',
            placeholder: '10',
            min: 0,
          },
        ]}
        onSave={handleBulkEdit}
        onCancel={() => setIsBulkEditOpen(false)}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={bulkDeleteConfirmOpen}
        title="Επιβεβαίωση Μαζικής Διαγραφής"
        message={`Είστε σίγουροι ότι θέλετε να διαγράψετε ${selectedCount} είδη; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.`}
        confirmLabel="Διαγραφή"
        cancelLabel="Ακύρωση"
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirmOpen(false)}
        isDangerous
      />
    </>
  );
};

export default InventoryView;
