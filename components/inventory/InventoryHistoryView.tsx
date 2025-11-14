import React, { useState, useMemo } from 'react';
import { InventoryItem, InventoryLocation, InventoryTransaction } from '../../types';
import { useTranslation } from '../../i18n';
import { Icon } from '../common/Icon';

interface InventoryHistoryViewProps {
  inventory: InventoryItem[];
  inventoryLocations: InventoryLocation[];
  inventoryTransactions: InventoryTransaction[];
}

interface SummaryRow {
    itemId: string;
    itemName: string;
    unit: string;
    startStock: number;
    totalIn: number;
    totalOut: number;
    endStock: number;
}

const InventoryHistoryView: React.FC<InventoryHistoryViewProps> = ({ inventory, inventoryLocations, inventoryTransactions }) => {
    const { t } = useTranslation();
    
    // Default to the last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const toInputFormat = (date: Date) => date.toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(toInputFormat(thirtyDaysAgo));
    const [endDate, setEndDate] = useState(toInputFormat(today));
    const [selectedItemId, setSelectedItemId] = useState('all');
    const [selectedLocationId, setSelectedLocationId] = useState('all');
    const [detailedItemId, setDetailedItemId] = useState<string | null>(null);

    const summaryData = useMemo((): SummaryRow[] => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the whole end day

        const relevantItems = selectedItemId === 'all'
            ? inventory
            : inventory.filter(i => i.id === selectedItemId);

        return relevantItems.map(item => {
            let startStock = 0;
            let totalIn = 0;
            let totalOut = 0;

            inventoryTransactions
                .filter(t => t.itemId === item.id && (selectedLocationId === 'all' || t.locationId === selectedLocationId))
                .forEach(t => {
                    const txDate = new Date(t.timestamp);
                    if (txDate < start) {
                        startStock += t.quantityChange;
                    } else if (txDate >= start && txDate <= end) {
                        if (t.quantityChange > 0) {
                            totalIn += t.quantityChange;
                        } else {
                            totalOut += Math.abs(t.quantityChange);
                        }
                    }
                });
            
            const endStock = startStock + totalIn - totalOut;

            return {
                itemId: item.id,
                itemName: item.name,
                unit: item.unit,
                startStock,
                totalIn,
                totalOut,
                endStock
            };
        }).filter(row => row.startStock !== 0 || row.totalIn !== 0 || row.totalOut !== 0 || row.endStock !== 0);

    }, [startDate, endDate, selectedItemId, selectedLocationId, inventory, inventoryTransactions]);
    
    const detailedTransactions = useMemo(() => {
        if (!detailedItemId) return [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return inventoryTransactions
            .filter(t => t.itemId === detailedItemId 
                && (selectedLocationId === 'all' || t.locationId === selectedLocationId)
                && new Date(t.timestamp) >= start
                && new Date(t.timestamp) <= end
            )
            .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    }, [detailedItemId, startDate, endDate, selectedLocationId, inventoryTransactions]);


    return (
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl h-full flex flex-col">
            <h2 className="text-3xl font-extrabold font-heading mb-6 pb-4 border-b border-gray-200/80 dark:border-gray-700/80">{t('history_title')}</h2>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-black/5 dark:bg-white/5 rounded-lg">
                <div>
                    <label className="text-sm font-semibold">{t('start_date')}</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 rounded bg-light-card dark:bg-dark-card mt-1"/>
                </div>
                 <div>
                    <label className="text-sm font-semibold">{t('end_date')}</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 rounded bg-light-card dark:bg-dark-card mt-1"/>
                </div>
                 <div>
                    <label className="text-sm font-semibold">{t('filter_by_item')}</label>
                    <select value={selectedItemId} onChange={e => setSelectedItemId(e.target.value)} className="w-full p-2 rounded bg-light-card dark:bg-dark-card mt-1">
                        <option value="all">{t('all_items')}</option>
                        {inventory.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="text-sm font-semibold">{t('filter_by_location')}</label>
                    <select value={selectedLocationId} onChange={e => setSelectedLocationId(e.target.value)} className="w-full p-2 rounded bg-light-card dark:bg-dark-card mt-1">
                        <option value="all">{t('all_locations')}</option>
                        {inventoryLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">{t('summary_report')}</h3>
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md">
                        <tr className="border-b-2 border-black/10 dark:border-white/10">
                            <th className="p-2">{t('item_name')}</th>
                            <th className="p-2 text-right">{t('start_stock')}</th>
                            <th className="p-2 text-right text-green-600 dark:text-green-400">{t('total_in')}</th>
                            <th className="p-2 text-right text-red-600 dark:text-red-400">{t('total_out')}</th>
                            <th className="p-2 text-right font-bold">{t('end_stock')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {summaryData.map(row => (
                            <React.Fragment key={row.itemId}>
                                <tr onClick={() => setDetailedItemId(prev => prev === row.itemId ? null : row.itemId)} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
                                    <td className="p-2 font-semibold">{row.itemName}</td>
                                    <td className="p-2 text-right font-mono">{row.startStock.toFixed(2)} {row.unit}</td>
                                    <td className="p-2 text-right font-mono text-green-600 dark:text-green-400">+{row.totalIn.toFixed(2)}</td>
                                    <td className="p-2 text-right font-mono text-red-600 dark:text-red-400">-{row.totalOut.toFixed(2)}</td>
                                    <td className="p-2 text-right font-mono font-bold">{row.endStock.toFixed(2)} {row.unit}</td>
                                </tr>
                                {detailedItemId === row.itemId && (
                                    <tr>
                                        <td colSpan={5} className="p-4 bg-black/5 dark:bg-white/5">
                                            <h4 className="font-bold mb-2">{t('detailed_history_for')} {row.itemName}</h4>
                                            <div className="max-h-60 overflow-y-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b border-black/10 dark:border-white/10">
                                                            <th className="p-1">{t('transaction_date')}</th>
                                                            <th className="p-1">{t('transaction_type')}</th>
                                                            <th className="p-1 text-right">{t('transaction_quantity')}</th>
                                                            <th className="p-1">{t('transaction_location')}</th>
                                                            <th className="p-1">{t('transaction_notes')}</th>
                                                        </tr>
                                                    </thead>
                                                     <tbody>
                                                        {detailedTransactions.map(tx => (
                                                            <tr key={tx.id} className="border-b border-black/5 dark:border-white/5">
                                                                <td className="p-1">{new Date(tx.timestamp).toLocaleString('el-GR')}</td>
                                                                <td className="p-1">{t(`transaction_type_${tx.type}`)}</td>
                                                                <td className={`p-1 text-right font-mono ${tx.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>{tx.quantityChange.toFixed(2)}</td>
                                                                <td className="p-1">{inventoryLocations.find(l=>l.id === tx.locationId)?.name}</td>
                                                                <td className="p-1 text-xs italic">{tx.notes || ''}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
                 {summaryData.length === 0 && <p className="text-center py-8 text-gray-500">Δεν βρέθηκαν κινήσεις για τα επιλεγμένα φίλτρα.</p>}
            </div>
        </div>
    );
};

export default InventoryHistoryView;
