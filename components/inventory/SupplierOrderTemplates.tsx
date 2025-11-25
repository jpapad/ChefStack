import React, { useMemo, useState } from 'react';
import { InventoryItem, Supplier } from '../../types';
import { Icon } from '../common/Icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';

interface SupplierOrderTemplatesProps {
  inventory: InventoryItem[];
  suppliers: Supplier[];
  isOpen: boolean;
  onClose: () => void;
}

interface OrderItem {
  item: InventoryItem & { totalQuantity: number };
  suggestedQuantity: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
}

interface SupplierOrder {
  supplier: Supplier;
  items: OrderItem[];
  totalEstimatedCost: number;
}

const SupplierOrderTemplates: React.FC<SupplierOrderTemplatesProps> = ({
  inventory,
  suppliers,
  isOpen,
  onClose
}) => {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

  // Calculate supplier orders
  const supplierOrders = useMemo(() => {
    const orders: SupplierOrder[] = [];

    suppliers.forEach(supplier => {
      const supplierItems = inventory.filter(item => item.supplierId === supplier.id);
      const orderItems: OrderItem[] = [];

      supplierItems.forEach(item => {
        const totalQuantity = item.locations.reduce((sum, loc) => sum + loc.quantity, 0);
        const reorderPoint = item.reorderPoint || 0;

        // Only include if stock is low
        if (reorderPoint > 0 && totalQuantity <= reorderPoint) {
          // Calculate suggested quantity (2x reorder point - current stock)
          const suggestedQuantity = Math.max(0, reorderPoint * 2 - totalQuantity);
          
          // Determine urgency
          let urgency: 'critical' | 'high' | 'medium' | 'low' = 'low';
          const stockRatio = totalQuantity / reorderPoint;
          
          if (totalQuantity <= 0.01) {
            urgency = 'critical';
          } else if (stockRatio < 0.3) {
            urgency = 'high';
          } else if (stockRatio < 0.6) {
            urgency = 'medium';
          }

          orderItems.push({
            item: { ...item, totalQuantity },
            suggestedQuantity,
            urgency
          });
        }
      });

      if (orderItems.length > 0) {
        // Sort by urgency
        orderItems.sort((a, b) => {
          const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        });

        orders.push({
          supplier,
          items: orderItems,
          totalEstimatedCost: 0 // Would need cost data
        });
      }
    });

    return orders;
  }, [inventory, suppliers]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
      case 'medium': return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30';
      default: return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'ΚΡΙΣΙΜΟ';
      case 'high': return 'ΥΨΗΛΗ';
      case 'medium': return 'ΜΕΤΡΙΑ';
      default: return 'ΧΑΜΗΛΗ';
    }
  };

  const selectedOrder = selectedSupplierId
    ? supplierOrders.find(o => o.supplier.id === selectedSupplierId)
    : null;

  const handleExportOrder = (order: SupplierOrder) => {
    // Create text format for copying/emailing
    let text = `ΠΑΡΑΓΓΕΛΙΑ ΠΡΟΣ: ${order.supplier.name}\n`;
    text += `ΗΜΕΡΟΜΗΝΙΑ: ${new Date().toLocaleDateString('el-GR')}\n`;
    text += `─`.repeat(60) + '\n\n';
    
    order.items.forEach((orderItem, idx) => {
      text += `${idx + 1}. ${orderItem.item.name}\n`;
      text += `   Διαθέσιμο: ${orderItem.item.totalQuantity.toFixed(2)} ${orderItem.item.unit}\n`;
      text += `   Προτεινόμενη Ποσότητα: ${orderItem.suggestedQuantity.toFixed(2)} ${orderItem.item.unit}\n`;
      text += `   Προτεραιότητα: ${getUrgencyLabel(orderItem.urgency)}\n\n`;
    });

    // Copy to clipboard
    navigator.clipboard.writeText(text).then(() => {
      alert('Η παραγγελία αντιγράφηκε στο clipboard!');
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Προτεινόμενες Παραγγελίες</DialogTitle>
          <DialogDescription>
            Βασισμένες σε χαμηλό απόθεμα ανά προμηθευτή
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-auto max-h-[70vh]">
          {supplierOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Icon name="check-circle" className="w-16 h-16 text-emerald-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Όλα Εντάξει!</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Δεν υπάρχουν είδη που χρειάζονται άμεση παραγγελία
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
              {/* Supplier List */}
              <div className="border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900/50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-sm uppercase text-gray-600 dark:text-gray-400">
                    Προμηθευτές ({supplierOrders.length})
                  </h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {supplierOrders.map(order => (
                    <button
                      key={order.supplier.id}
                      onClick={() => setSelectedSupplierId(order.supplier.id)}
                      className={`w-full p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                        selectedSupplierId === order.supplier.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{order.supplier.name}</h4>
                          {order.supplier.phone && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              <Icon name="phone" className="w-3 h-3 inline mr-1" />
                              {order.supplier.phone}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700">
                              {order.items.length} {order.items.length === 1 ? 'είδος' : 'είδη'}
                            </span>
                            {order.items.some(i => i.urgency === 'critical') && (
                              <span className="text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-semibold">
                                ΕΠΕΙΓΟΝ
                              </span>
                            )}
                          </div>
                        </div>
                        <Icon name="chevron-right" className="w-5 h-5 flex-shrink-0 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Details */}
              <div className="lg:col-span-2">
                {selectedOrder ? (
                  <div className="h-full flex flex-col">
                    {/* Order Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{selectedOrder.supplier.name}</h3>
                          {selectedOrder.supplier.email && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <Icon name="mail" className="w-4 h-4 inline mr-1" />
                              {selectedOrder.supplier.email}
                            </p>
                          )}
                        </div>
                        <Button
                          onClick={() => handleExportOrder(selectedOrder)}
                          className="gap-2"
                        >
                          <Icon name="copy" className="w-4 h-4" />
                          <span>Αντιγραφή</span>
                        </Button>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-semibold">{selectedOrder.items.length} προϊόντα</span>
                        <span>•</span>
                        <span>{new Date().toLocaleDateString('el-GR')}</span>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="flex-1 overflow-auto p-6">
                      <div className="space-y-3">
                        {selectedOrder.items.map((orderItem, idx) => (
                          <div
                            key={orderItem.item.id}
                            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-lg font-semibold">{idx + 1}. {orderItem.item.name}</span>
                                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getUrgencyColor(orderItem.urgency)}`}>
                                    {getUrgencyLabel(orderItem.urgency)}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400 block text-xs">Τρέχον Απόθεμα</span>
                                    <span className="font-mono font-semibold">
                                      {orderItem.item.totalQuantity.toFixed(2)} {orderItem.item.unit}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400 block text-xs">Όριο</span>
                                    <span className="font-mono font-semibold">
                                      {orderItem.item.reorderPoint} {orderItem.item.unit}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-blue-600 dark:text-blue-400 block text-xs font-semibold">Προτεινόμενη Παραγγελία</span>
                                    <span className="font-mono font-bold text-lg">
                                      {orderItem.suggestedQuantity.toFixed(2)} {orderItem.item.unit}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <Icon name="arrow-left" className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Επιλέξτε έναν προμηθευτή για να δείτε τη λίστα παραγγελίας</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupplierOrderTemplates;
