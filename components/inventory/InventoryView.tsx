import React, { useState, useMemo } from 'react';
import {
  InventoryItem,
  Supplier,
  IngredientCost,
  Role,
  InventoryLocation,
  RolePermissions
} from '../../types';
import { Icon } from '../common/Icon';
import ConfirmationModal from '../common/ConfirmationModal';
import InventoryForm from './InventoryForm';
import InventoryList from './InventoryList';
import PrintPreview from '../common/PrintPreview';
import QRCodePrint from './QRCodePrint';
import TransferStockModal from './TransferStockModal';
import { api } from '../../services/api';

interface InventoryViewProps {
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
  currentTeamId
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [isQrPrintOpen, setIsQrPrintOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // 🧠 Κατάσταση για το AI panel
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const canManage = currentUserRole
    ? rolePermissions[currentUserRole]?.includes('manage_inventory')
    : false;

  const inventoryWithDetails = useMemo(() => {
    return inventory
      .map(item => {
        const totalQuantity = item.locations.reduce(
          (sum, loc) => sum + loc.quantity,
          0
        );
        return {
          ...item,
          totalQuantity,
          supplierName:
            suppliers.find(s => s.id === item.supplierId)?.name || 'N/A'
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [inventory, suppliers]);

  const selectedItem = useMemo(
    () => inventoryWithDetails.find(i => i.id === selectedItemId),
    [inventoryWithDetails, selectedItemId]
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
      const savedItem = await api.saveInventoryItem(data as any, currentTeamId);

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

  // ✅ Πραγματικό Gemini για προτάσεις αποθέματος
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
            throw new Error('Λείπει το VITE_GEMINI_API_KEY από το .env.local.');
          }

          const total: number =
            (selectedItem as any).totalQuantity ??
            selectedItem.locations.reduce((sum, l) => sum + l.quantity, 0);

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

          const prompt = `
Είσαι βοηθός food cost & stock control σε επαγγελματική κουζίνα.

Δεδομένα είδους αποθήκης:
- Όνομα: ${selectedItem.name}
- Μονάδα: ${selectedItem.unit}
- Προμηθευτής: ${supplierName}
- Συνολική ποσότητα: ${total.toFixed(2)} ${selectedItem.unit}
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

Να είσαι σύντομος, πρακτικός και συγκεκριμένος. Χρησιμοποίησε bullets (•) και όχι πολύ θεωρία.
          `.trim();

          const response = await fetch(
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' +
    encodeURIComponent(apiKey),
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    })
  }
);


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
            e?.message || 'Σφάλμα κατά την ανάλυση των δεδομένων αποθέματος.'
          );
        } finally {
          setIsAiLoading(false);
        }
      })();
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div
          className={`h-full ${
            selectedItemId ? 'hidden lg:block' : 'lg:col-span-1'
          }`}
        >
          <InventoryList
            inventory={inventoryWithDetails}
            selectedItemId={selectedItemId}
            onSelectItem={onSelectItem}
            onAdd={() => handleOpenForm(null)}
            onEdit={handleOpenForm}
            onDelete={handleRequestDelete}
            canManage={canManage}
            onImportInvoice={onImportInvoice}
            withApiKeyCheck={withApiKeyCheck}
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
                      className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
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
                <div className="bg-black/5 dark:bg:white/5 p-4 rounded-lg lg:col-span-2">
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

                {/* Συνολική Ποσότητα */}
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
                </div>
              </div>

              {/* 🧠 AI Panel */}
              <div className="mt-6 bg-purple-50/70 dark:bg-purple-900/40 border border-purple-200/80 dark:border-purple-700/70 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon
                    name="sparkles"
                    className="w-5 h-5 text-purple-500 dark:text-purple-300"
                  />
                  <h4 className="text-md font-semibold font-heading text-purple-800 dark:text-purple-100">
                    AI Προτάσεις για το απόθεμα
                  </h4>
                </div>

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
                    φθοράς.
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
        item={selectedItem}
        inventoryLocations={inventoryLocations}
      />
    </>
  );
};

export default InventoryView;
