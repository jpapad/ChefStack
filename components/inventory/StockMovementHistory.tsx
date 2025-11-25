import React, { useMemo, useState } from 'react';
import { InventoryItem, InventoryTransaction, WasteLog } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

interface StockMovementHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem;
  transactions: InventoryTransaction[];
  wasteLogs: WasteLog[];
}

type MovementType = 'purchase' | 'usage' | 'waste' | 'transfer_in' | 'transfer_out' | 'adjustment';

interface TimelineEvent {
  id: string;
  date: string;
  type: MovementType;
  quantity: number;
  unit: string;
  balanceAfter: number;
  description: string;
  reference?: string;
}

const StockMovementHistory: React.FC<StockMovementHistoryProps> = ({
  isOpen,
  onClose,
  item,
  transactions,
  wasteLogs
}) => {
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState<MovementType | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const timeline = useMemo(() => {
    const events: TimelineEvent[] = [];
    
    // Add inventory transactions
    transactions
      .filter(tx => tx.itemId === item.id)
      .forEach(tx => {
        events.push({
          id: tx.id,
          date: tx.createdAt,
          type: tx.type as MovementType,
          quantity: tx.quantity,
          unit: item.unit,
          balanceAfter: tx.balanceAfter || 0,
          description: tx.notes || getTypeLabel(tx.type as MovementType),
          reference: tx.invoiceNumber
        });
      });

    // Add waste logs
    wasteLogs
      .filter(log => log.itemName.toLowerCase() === item.name.toLowerCase())
      .forEach(log => {
        events.push({
          id: log.id,
          date: log.date,
          type: 'waste',
          quantity: -log.quantity,
          unit: item.unit,
          balanceAfter: 0, // We don't track balance in waste logs
          description: `Απώλεια: ${log.reason}`,
          reference: undefined
        });
      });

    // Sort by date
    events.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    // Filter by type
    if (filterType !== 'all') {
      return events.filter(e => e.type === filterType);
    }

    return events;
  }, [item, transactions, wasteLogs, filterType, sortOrder]);

  const stats = useMemo(() => {
    const totalPurchases = timeline
      .filter(e => e.type === 'purchase')
      .reduce((sum, e) => sum + e.quantity, 0);
    
    const totalUsage = timeline
      .filter(e => e.type === 'usage')
      .reduce((sum, e) => sum + Math.abs(e.quantity), 0);
    
    const totalWaste = timeline
      .filter(e => e.type === 'waste')
      .reduce((sum, e) => sum + Math.abs(e.quantity), 0);
    
    const totalAdjustments = timeline
      .filter(e => e.type === 'adjustment')
      .reduce((sum, e) => sum + e.quantity, 0);

    return {
      totalPurchases,
      totalUsage,
      totalWaste,
      totalAdjustments,
      movementCount: timeline.length
    };
  }, [timeline]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-bg rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="history" className="w-8 h-8" />
                <h2 className="text-2xl font-heading font-bold">Ιστορικό Κινήσεων</h2>
              </div>
              <p className="text-white/90 text-lg font-medium">{item.name}</p>
              <p className="text-white/80 text-sm">
                Τρέχον απόθεμα: {item.totalQuantity.toFixed(2)} {item.unit}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Icon name="x" className="w-6 h-6" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="text-white/80 text-xs mb-1">Αγορές</div>
              <div className="text-xl font-bold text-green-300">
                +{stats.totalPurchases.toFixed(1)} {item.unit}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="text-white/80 text-xs mb-1">Χρήση</div>
              <div className="text-xl font-bold text-blue-300">
                -{stats.totalUsage.toFixed(1)} {item.unit}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="text-white/80 text-xs mb-1">Απώλεια</div>
              <div className="text-xl font-bold text-red-300">
                -{stats.totalWaste.toFixed(1)} {item.unit}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="text-white/80 text-xs mb-1">Κινήσεις</div>
              <div className="text-xl font-bold">{stats.movementCount}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-light-border dark:border-dark-border bg-light-bg/50 dark:bg-dark-bg/50">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border'
                }`}
              >
                Όλες
              </button>
              <button
                onClick={() => setFilterType('purchase')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filterType === 'purchase'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border'
                }`}
              >
                Αγορές
              </button>
              <button
                onClick={() => setFilterType('usage')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filterType === 'usage'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border'
                }`}
              >
                Χρήση
              </button>
              <button
                onClick={() => setFilterType('waste')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filterType === 'waste'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border'
                }`}
              >
                Απώλεια
              </button>
              <button
                onClick={() => setFilterType('adjustment')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filterType === 'adjustment'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border'
                }`}
              >
                Προσαρμογές
              </button>
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border hover:border-blue-400 transition-colors flex items-center gap-2"
            >
              <Icon name={sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'} className="w-4 h-4" />
              {sortOrder === 'desc' ? 'Νεότερα πρώτα' : 'Παλαιότερα πρώτα'}
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-auto p-6">
          {timeline.length === 0 ? (
            <div className="text-center py-12 text-light-text-secondary dark:text-dark-text-secondary">
              <Icon name="inbox" className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Δεν υπάρχουν καταχωρημένες κινήσεις</p>
            </div>
          ) : (
            <div className="space-y-3">
              {timeline.map((event, idx) => (
                <div
                  key={event.id}
                  className="flex gap-4 relative group"
                >
                  {/* Timeline line */}
                  {idx !== timeline.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-light-border dark:border-dark-border" />
                  )}

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColors(event.type).bg} ${getTypeColors(event.type).text} shadow-lg z-10`}>
                    <Icon name={getTypeIcon(event.type)} className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColors(event.type).badge}`}>
                            {getTypeLabel(event.type)}
                          </span>
                          {event.reference && (
                            <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                              #{event.reference}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          {event.description}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <div className={`text-lg font-bold ${
                          event.quantity > 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {event.quantity > 0 ? '+' : ''}{event.quantity.toFixed(2)} {event.unit}
                        </div>
                        <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                          {new Date(event.date).toLocaleDateString('el-GR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>

                    {event.balanceAfter > 0 && (
                      <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary border-t border-light-border dark:border-dark-border pt-2 mt-2">
                        Υπόλοιπο μετά: <span className="font-semibold">{event.balanceAfter.toFixed(2)} {event.unit}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-light-border dark:border-dark-border bg-light-bg/50 dark:bg-dark-bg/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Κλείσιμο
          </button>
        </div>
      </div>
    </div>
  );
};

function getTypeIcon(type: MovementType): string {
  switch (type) {
    case 'purchase': return 'shopping-cart';
    case 'usage': return 'arrow-down';
    case 'waste': return 'trash-2';
    case 'transfer_in': return 'arrow-right';
    case 'transfer_out': return 'arrow-left';
    case 'adjustment': return 'edit';
    default: return 'circle';
  }
}

function getTypeLabel(type: MovementType): string {
  switch (type) {
    case 'purchase': return 'Αγορά';
    case 'usage': return 'Χρήση';
    case 'waste': return 'Απώλεια';
    case 'transfer_in': return 'Μεταφορά Εισόδου';
    case 'transfer_out': return 'Μεταφορά Εξόδου';
    case 'adjustment': return 'Προσαρμογή';
    default: return 'Κίνηση';
  }
}

function getTypeColors(type: MovementType): { bg: string; text: string; badge: string } {
  switch (type) {
    case 'purchase':
      return {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-600 dark:text-green-400',
        badge: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
      };
    case 'usage':
      return {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-600 dark:text-blue-400',
        badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
      };
    case 'waste':
      return {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-600 dark:text-red-400',
        badge: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
      };
    case 'transfer_in':
      return {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-600 dark:text-purple-400',
        badge: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
      };
    case 'transfer_out':
      return {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-600 dark:text-orange-400',
        badge: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'
      };
    case 'adjustment':
      return {
        bg: 'bg-gray-100 dark:bg-gray-900/30',
        text: 'text-gray-600 dark:text-gray-400',
        badge: 'bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300'
      };
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-900/30',
        text: 'text-gray-600 dark:text-gray-400',
        badge: 'bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300'
      };
  }
}

export default StockMovementHistory;
