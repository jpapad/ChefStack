

import React, { useState, useMemo } from 'react';
import {
  View, User, Team, Recipe, IngredientCost, Workstation, PrepTask, HaccpLog, HaccpItem, Supplier, InventoryItem, Menu, LanguageMode, Notification, Message, RecipeCategoryKey, Role, Shift, ShiftSchedule, Channel, InventoryLocation, ExtractedInvoiceItem, MappedInvoiceItem, PurchaseUnit, InventoryTransaction, RolePermissions, ALL_PERMISSIONS, WasteLog
} from './types';

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
// Fix: Added import for MenuView which was missing and causing module resolution errors.
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
        user, onLogout, currentTeamId, onSetCurrentTeam, allTeams, allUsers, setAllUsers, setAllTeams,
        recipes, setRecipes, ingredientCosts, setIngredientCosts, workstations, setWorkstations,
        tasks, setTasks, haccpLogs, setHaccpLogs, haccpItems, setHaccpItems, suppliers, setSuppliers, inventory, setInventory,
        inventoryLocations, setInventoryLocations, inventoryTransactions, setInventoryTransactions, wasteLogs, setWasteLogs, menus, setMenus, notifications, setNotifications, 
        messages, setMessages, shifts, setShifts, shiftSchedules, setShiftSchedules, allChannels, setAllChannels
    } = props;
    
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorage('sidebarCollapsed', false);
    
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
    const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);
    const [isCreatingRecipe, setIsCreatingRecipe] = useState(false);
    const [recipeCategoryFilter, setRecipeCategoryFilter] = useState<RecipeCategoryKey | 'All'>('All');
    const [recipeSearchTerm, setRecipeSearchTerm] = useState('');
    const [recipeViewMode, setRecipeViewMode] = useLocalStorage<'list' | 'grid'>('recipeViewMode', 'list');

    const [selectedCostId, setSelectedCostId] = useState<string | null>(null);
    const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
    const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);

    // State for Recipe Book feature
    const [isBookMode, setIsBookMode] = useState(false);
    const [bookSelectedIds, setBookSelectedIds] = useState<string[]>([]);
    const [printPreviewContent, setPrintPreviewContent] = useState<React.ReactNode | null>(null);
    
    // State for URL Import feature
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    
    // State for QR Scanner
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scannedItemId, setScannedItemId] = useState<string | null>(null);

    // State for Invoice Import
    const [isInvoiceImportOpen, setIsInvoiceImportOpen] = useState(false);
    const [extractedInvoiceItems, setExtractedInvoiceItems] = useState<ExtractedInvoiceItem[] | null>(null);

    // State for Permissions
    const [rolePermissions, setRolePermissions] = useLocalStorage<RolePermissions>('rolePermissions', {
      'Admin': [...ALL_PERMISSIONS],
      'Sous Chef': ['manage_recipes', 'manage_inventory', 'manage_shifts', 'manage_waste'],
      'Cook': [],
    });


    const { t, language, setLanguage } = useTranslation();

    const currentTeam = useMemo(() => allTeams.find(t => t.id === currentTeamId), [allTeams, currentTeamId]);

    const currentUserRole = useMemo(() => 
        user.memberships.find(m => m.teamId === currentTeamId)?.role,
        [user, currentTeamId]
    );

    const handleSaveRecipe = async (recipeData: Omit<Recipe, 'id'> | Recipe) => {
        const recipeToSave = { ...recipeData, teamId: currentTeamId };
        const savedRecipe = await api.saveRecipe(recipeToSave);
        setRecipes(prev => {
            const exists = prev.some(r => r.id === savedRecipe.id);
            return exists ? prev.map(r => r.id === savedRecipe.id ? savedRecipe : r) : [...prev, savedRecipe];
        });

        if (!('id' in recipeData)) {
            setSelectedRecipeId(savedRecipe.id);
        }
        setIsCreatingRecipe(false);
        setRecipeToEdit(null);
    };

    const handleDeleteRecipe = async (recipeToDelete: Recipe) => {
        await api.deleteRecipe(recipeToDelete.id);
        setRecipes(prev => prev.filter(r => r.id !== recipeToDelete.id));
        setSelectedRecipeId(null);
    };
    
    const handleStartImportedRecipe = (importedData: Partial<Recipe>) => {
        const recipeForForm = {
            ...importedData,
            imageUrl: '',
            teamId: currentTeamId,
        };
        setRecipeToEdit(recipeForForm as Recipe);
        setIsCreatingRecipe(false);
        setIsImportModalOpen(false);
    };

    // --- Recipe Book Handlers ---
    const toggleBookMode = () => {
        setIsBookMode(prev => {
            if (prev) { // Exiting book mode
                setBookSelectedIds([]);
            }
            return !prev;
        });
    };

    const handleBookSelect = (id: string) => {
        setBookSelectedIds(prev =>
            prev.includes(id) ? prev.filter(recipeId => recipeId !== id) : [...prev, id]
        );
    };
    
    const handleBookCategorySelect = (category: RecipeCategoryKey | 'All', isSelected: boolean) => {
        const teamRecipes = recipes.filter(r => r.teamId === currentTeamId);
        const categoryRecipeIds = teamRecipes
            .filter(r => category === 'All' || r.category === category)
            .map(r => r.id);
        
        setBookSelectedIds(prev => {
            const otherIds = prev.filter(id => !categoryRecipeIds.includes(id));
            return isSelected ? [...otherIds, ...categoryRecipeIds] : otherIds;
        });
    };

    const handleGenerateBook = () => {
        const selectedRecipes = recipes.filter(r => bookSelectedIds.includes(r.id));
        setPrintPreviewContent(<RecipeBookPrintView recipes={selectedRecipes} />);
        toggleBookMode(); // Exit book mode after generating
    };

    // --- Inventory Action Handlers ---
    const handleInventoryTransfer = (itemId: string, fromLocationId: string, toLocationId: string, quantity: number) => {
        const success = inventory.some(item => {
            if (item.id === itemId) {
                const fromLocation = item.locations.find(l => l.locationId === fromLocationId);
                if (!fromLocation || fromLocation.quantity < quantity) {
                    alert("Δεν υπάρχει αρκετό απόθεμα στην τοποθεσία προέλευσης.");
                    return false;
                }
            }
            return true;
        });

        if (!success) return;

        const transferOutId = `trx_${Date.now()}_out`;
        const transferInId = `trx_${Date.now()}_in`;

        const newTransactions: InventoryTransaction[] = [
            { id: transferOutId, itemId, timestamp: new Date(), type: 'transfer_out', quantityChange: -quantity, locationId: fromLocationId, relatedTransactionId: transferInId, userId: user.id, teamId: currentTeamId },
            { id: transferInId, itemId, timestamp: new Date(), type: 'transfer_in', quantityChange: quantity, locationId: toLocationId, relatedTransactionId: transferOutId, userId: user.id, teamId: currentTeamId },
        ];
        setInventoryTransactions(prev => [...prev, ...newTransactions]);

        setInventory(prevInventory => 
            prevInventory.map(item => {
                if (item.id === itemId) {
                    const newLocations = [...item.locations];
                    const fromIndex = newLocations.findIndex(loc => loc.locationId === fromLocationId);
                    const toIndex = newLocations.findIndex(loc => loc.locationId === toLocationId);

                    newLocations[fromIndex] = { ...newLocations[fromIndex], quantity: newLocations[fromIndex].quantity - quantity };

                    if (toIndex > -1) {
                        newLocations[toIndex] = { ...newLocations[toIndex], quantity: newLocations[toIndex].quantity + quantity };
                    } else {
                        newLocations.push({ locationId: toLocationId, quantity: quantity });
                    }

                    return { ...item, locations: newLocations };
                }
                return item;
            })
        );
    };


    const scannedItem = useMemo(() => 
        inventory.find(item => item.id === scannedItemId), 
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

    const handleQuickActionConfirm = (itemToUpdate: InventoryItem, quantity: number, action: 'add' | 'subtract' | 'transfer', fromLocationId?: string, toLocationId?: string) => {
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
            setInventoryTransactions(prev => [...prev, newTransaction]);

            setInventory(prevInventory => 
                prevInventory.map(item => {
                    if (item.id === itemToUpdate.id) {
                        const newLocations = [...item.locations];
                        const currentQuantity = newLocations[0].quantity;
                        const newQuantity = action === 'add' 
                            ? currentQuantity + quantity 
                            : currentQuantity - quantity;
                        
                        newLocations[0] = { ...newLocations[0], quantity: Math.max(0, newQuantity) };
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
        
        const updatedInventory = inventory.map(item => {
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
                        teamId: currentTeamId,
                    });
                }
                
                const newLocations = [...item.locations];
                newLocations[0] = { ...newLocations[0], quantity: newQuantity };
                return { ...item, locations: newLocations };
            }
            return item;
        });

        setInventory(updatedInventory);
        setInventoryTransactions(prev => [...prev, ...newTransactions]);
    };
    
    // --- Invoice Import Handlers ---
    const handleInvoiceParsed = (items: ExtractedInvoiceItem[]) => {
        setExtractedInvoiceItems(items);
        setIsInvoiceImportOpen(false);
    };

    const handleConfirmInvoiceImport = (mappedItems: MappedInvoiceItem[], targetLocationId: string) => {
        const newInventoryItems: InventoryItem[] = [];
        const newCostItems: IngredientCost[] = [];
        const newTransactions: InventoryTransaction[] = [];

        // Update existing items
        setInventory(prevInventory => {
            const updatedInventory = [...prevInventory];
            
            mappedItems.forEach(mappedItem => {
                const transactionBase = {
                    id: `trx_${Date.now()}_${mappedItem.itemName}`,
                    timestamp: new Date(),
                    type: 'invoice_import' as 'invoice_import',
                    quantityChange: mappedItem.quantity,
                    locationId: targetLocationId,
                    userId: user.id,
                    teamId: currentTeamId,
                };

                if (!mappedItem.isNew) {
                    const itemIndex = updatedInventory.findIndex(inv => inv.id === mappedItem.inventoryId);
                    if (itemIndex > -1) {
                        newTransactions.push({ ...transactionBase, itemId: updatedInventory[itemIndex].id });
                        const newLocations = [...updatedInventory[itemIndex].locations];
                        const locIndex = newLocations.findIndex(loc => loc.locationId === targetLocationId);
                        if (locIndex > -1) {
                            newLocations[locIndex].quantity += mappedItem.quantity;
                        } else {
                            newLocations.push({ locationId: targetLocationId, quantity: mappedItem.quantity });
                        }
                        updatedInventory[itemIndex] = { ...updatedInventory[itemIndex], locations: newLocations };
                    }
                } else { // Create new inventory item
                    const newInvId = `inv${Date.now()}${Math.random()}`;
                    const newCostId = `ic${Date.now()}${Math.random()}`;
                    newInventoryItems.push({
                        id: newInvId,
                        name: mappedItem.itemName,
                        locations: [{ locationId: targetLocationId, quantity: mappedItem.quantity }],
                        unit: mappedItem.unit as PurchaseUnit, // Simple cast for now
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
        
        setInventoryTransactions(prev => [...prev, ...newTransactions]);
        
        setIngredientCosts(prevCosts => {
            let updatedCosts = [...prevCosts];
            mappedItems.forEach(mappedItem => {
                if (!mappedItem.isNew) {
                    const invItem = inventory.find(i => i.id === mappedItem.inventoryId);
                    const costIndex = invItem ? updatedCosts.findIndex(c => c.id === invItem.ingredientCostId) : -1;
                    if (costIndex > -1) {
                        updatedCosts[costIndex] = {
                            ...updatedCosts[costIndex],
                            cost: mappedItem.unitPrice,
                            purchaseUnit: mappedItem.unit as PurchaseUnit,
                        }
                    }
                }
            });
            return [...updatedCosts, ...newCostItems];
        });

        setExtractedInvoiceItems(null);
    };
    
    const handleSaveWasteLog = (logData: Omit<WasteLog, 'id' | 'teamId' | 'userId'>) => {
        const newLog: WasteLog = {
            ...logData,
            id: `waste${Date.now()}`,
            teamId: currentTeamId,
            userId: user.id,
        };
        setWasteLogs(prev => [...prev, newLog]);

        const inventoryItem = inventory.find(i => i.id === newLog.inventoryItemId);
        if (inventoryItem && inventoryItem.locations.length > 0) {
            // For simplicity, remove from the first location. A real app might need to ask.
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
            setInventoryTransactions(prev => [...prev, newTransaction]);
            
            setInventory(prevInventory => 
                prevInventory.map(item => {
                    if (item.id === newLog.inventoryItemId) {
                        const newLocations = [...item.locations];
                        const locIndex = newLocations.findIndex(l => l.locationId === primaryLocationId);
                        if (locIndex > -1) {
                           newLocations[locIndex].quantity = Math.max(0, newLocations[locIndex].quantity - newLog.quantity);
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
        const teamRecipes = recipes.filter(r => r.teamId === currentTeamId);
        const teamIngredientCosts = ingredientCosts.filter(ic => ic.teamId === currentTeamId);
        const teamWorkstations = workstations.filter(w => w.teamId === currentTeamId);
        const teamTasks = tasks.filter(t => t.teamId === currentTeamId);
        const teamHaccpLogs = haccpLogs.filter(l => l.teamId === currentTeamId);
        const teamHaccpItems = haccpItems.filter(i => i.teamId === currentTeamId);
        const teamSuppliers = suppliers.filter(s => s.teamId === currentTeamId);
        const teamInventory = inventory.filter(i => i.teamId === currentTeamId);
        const teamInventoryLocations = inventoryLocations.filter(i => i.teamId === currentTeamId);
        const teamInventoryTransactions = inventoryTransactions.filter(t => t.teamId === currentTeamId);
        const teamWasteLogs = wasteLogs.filter(w => w.teamId === currentTeamId);
        const teamMenus = menus.filter(m => m.teamId === currentTeamId);
        const teamMessages = messages.filter(m => m.teamId === currentTeamId);
        const teamShifts = shifts.filter(s => s.teamId === currentTeamId);
        const teamShiftSchedules = shiftSchedules.filter(s => s.teamId === currentTeamId);
        const teamChannels = allChannels.filter(c => c.teamId === currentTeamId);

        if (currentView === 'recipes') {
            const recipesForCategoryFilter = teamRecipes.filter(recipe => {
                return recipeCategoryFilter === 'All' || recipe.category === recipeCategoryFilter;
            });

            const filteredRecipes = recipesForCategoryFilter.filter(recipe => {
                return recipe.name.toLowerCase().includes(recipeSearchTerm.toLowerCase()) || (recipe.name_en && recipe.name_en.toLowerCase().includes(recipeSearchTerm.toLowerCase()));
            });

            if (isCreatingRecipe || recipeToEdit) {
                return <RecipeForm 
                    recipeToEdit={recipeToEdit}
                    allRecipes={recipes}
                    onSave={handleSaveRecipe}
                    onCancel={() => { setIsCreatingRecipe(false); setRecipeToEdit(null); }}
                />;
            }

            return (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
                    <div className={`h-full lg:col-span-2 ${selectedRecipeId && !isBookMode ? 'hidden lg:block' : ''}`}>
                        <RecipeList
                            recipes={filteredRecipes}
                            allRecipesForCategory={recipesForCategoryFilter}
                            selectedRecipeId={selectedRecipeId}
                            onSelectRecipe={setSelectedRecipeId}
                            onStartCreateRecipe={() => { setIsCreatingRecipe(true); setRecipeToEdit(null); setSelectedRecipeId(null); }}
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
                        />
                    </div>
                    <div className={`h-full lg:col-span-3 ${!selectedRecipeId ? 'hidden lg:flex' : 'flex'}`}>
                        {teamRecipes.find(r => r.id === selectedRecipeId) ? (
                            <RecipeDetail
                                recipe={teamRecipes.find(r => r.id === selectedRecipeId)!}
                                allRecipes={recipes}
                                ingredientCosts={teamIngredientCosts}
                                onBack={() => setSelectedRecipeId(null)}
                                onEdit={(recipe) => { setRecipeToEdit(recipe); setIsCreatingRecipe(false); }}
                                onSaveRecipe={handleSaveRecipe}
                                onDelete={handleDeleteRecipe}
                                onSelectRecipe={setSelectedRecipeId}
                                currentUserRole={currentUserRole}
                                language={language}
                                rolePermissions={rolePermissions}
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
                return <DashboardView recipes={teamRecipes} tasks={teamTasks} haccpLogs={teamHaccpLogs} inventory={teamInventory} onViewChange={handleViewChange} />;
            case 'workstations':
                return <WorkstationView 
                    recipes={teamRecipes}
                    workstations={teamWorkstations}
                    setWorkstations={setWorkstations}
                    tasks={teamTasks}
                    setTasks={setTasks}
                    menus={teamMenus}
                    currentUserRole={currentUserRole}
                    rolePermissions={rolePermissions}
                />;
            case 'shifts':
                return <ShiftsView
                    shifts={teamShifts}
                    setShifts={setShifts}
                    shiftSchedules={teamShiftSchedules}
                    setShiftSchedules={setShiftSchedules}
                    allUsers={allUsers}
                    currentTeamId={currentTeamId}
                    currentUserRole={currentUserRole}
                    rolePermissions={rolePermissions}
                />;
            case 'haccp':
                return <HaccpView logs={teamHaccpLogs} setLogs={setHaccpLogs} haccpItems={teamHaccpItems} onNavigateToPrint={() => handleViewChange('haccp_print')} currentUserRole={currentUserRole} rolePermissions={rolePermissions}/>;
            case 'haccp_print':
                 return <HaccpPrintView onBack={() => handleViewChange('haccp')} />;
            case 'costing':
                 return <CostingView 
                    ingredientCosts={teamIngredientCosts} 
                    setIngredientCosts={setIngredientCosts}
                    selectedCostId={selectedCostId}
                    onSelectCost={setSelectedCostId}
                    onBack={() => setSelectedCostId(null)}
                    currentUserRole={currentUserRole}
                    rolePermissions={rolePermissions}
                 />;
            case 'inventory':
                 return <InventoryView
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
                 />;
            case 'inventory_history':
                return <InventoryHistoryView
                    inventory={teamInventory}
                    inventoryLocations={teamInventoryLocations}
                    inventoryTransactions={teamInventoryTransactions}
                />;
            case 'waste_log':
                return <WasteLogView
                    wasteLogs={teamWasteLogs}
                    setWasteLogs={setWasteLogs}
                    inventory={teamInventory}
                    users={allUsers}
                    onSave={handleSaveWasteLog}
                    currentUserRole={currentUserRole}
                    rolePermissions={rolePermissions}
                />;
            case 'suppliers':
                return <SupplierView 
                    suppliers={teamSuppliers}
                    setSuppliers={setSuppliers}
                    selectedSupplierId={selectedSupplierId}
                    onSelectSupplier={setSelectedSupplierId}
                    onBack={() => setSelectedSupplierId(null)}
                    currentUserRole={currentUserRole}
                    rolePermissions={rolePermissions}
                />;
             case 'menus':
                return <MenuView
                    menus={teamMenus}
                    setMenus={setMenus}
                    allRecipes={recipes}
                    setAllRecipes={setRecipes}
                    tasks={teamTasks}
                    workstations={teamWorkstations}
                    currentUserRole={currentUserRole}
                    allTeams={allTeams}
                    currentTeamId={currentTeamId}
                    rolePermissions={rolePermissions}
                />;
            case 'labels':
                return <LabelView recipes={recipes} menus={menus} />;
            case 'settings':
                return <SettingsView 
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
                />;
            case 'shopping_list':
                return <ShoppingListView menus={teamMenus} recipes={recipes} inventory={inventory} suppliers={suppliers} />;
            case 'stock_take':
                return <StockTakeView inventory={teamInventory} onSaveChanges={handleStockTakeSave} />;
            case 'notifications':
                return <NotificationView 
                    currentUser={user} 
                    currentTeamId={currentTeamId} 
                    allUsers={allUsers} 
                    messages={teamMessages} 
                    setMessages={setMessages} 
                    allChannels={teamChannels}
                    setAllChannels={setAllChannels}
                />;
            default:
                return <div>View not implemented</div>;
        }
    };

    const currentViewTitleKey = ALL_NAV_ITEMS.find(item => item.view === currentView)?.labelKey || 'nav_dashboard';
    const teamNotifications = notifications.filter(n => n.userId === user.id && n.teamId === currentTeamId);
    
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
                onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
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
                inventoryLocations={inventoryLocations.filter(l => l.teamId === currentTeamId)}
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
                    inventory={inventory.filter(i => i.teamId === currentTeamId)}
                    inventoryLocations={inventoryLocations.filter(l => l.teamId === currentTeamId)}
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
        </div>
    );
};

export default KitchenInterface;
