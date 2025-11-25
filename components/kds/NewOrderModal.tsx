import React, { useState } from 'react';
import { KitchenOrder, Recipe, OrderItem, OrderPriority } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Omit<KitchenOrder, 'id' | 'teamId' | 'createdAt' | 'status'>) => void;
  recipes: Recipe[];
}

const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  recipes,
}) => {
  const { language } = useTranslation();
  const [orderNumber, setOrderNumber] = useState(() => `ORD-${Date.now().toString().slice(-6)}`);
  const [tableNumber, setTableNumber] = useState('');
  const [station, setStation] = useState('hot');
  const [priority, setPriority] = useState<OrderPriority>('normal');
  const [estimatedTime, setEstimatedTime] = useState(20);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleAddItem = () => {
    if (!selectedRecipeId) return;

    const recipe = recipes.find(r => r.id === selectedRecipeId);
    if (!recipe) return;

    const newItem: OrderItem = {
      id: `item_${Date.now()}_${Math.random()}`,
      recipeId: recipe.id,
      recipeName: recipe.name,
      quantity,
      notes: '',
    };

    setItems([...items, newItem]);
    setSelectedRecipeId('');
    setQuantity(1);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId));
  };

  const handleSave = () => {
    if (items.length === 0) {
      alert(language === 'el' ? 'Προσθέστε τουλάχιστον ένα προϊόν' : 'Add at least one item');
      return;
    }

    onSave({
      orderNumber,
      tableNumber: tableNumber || undefined,
      station,
      items,
      priority,
      estimatedTime,
      notes: notes || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Icon name="plus-circle" className="w-6 h-6 text-blue-600" />
              {language === 'el' ? 'Νέα Παραγγελία' : 'New Order'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Icon name="x" className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {language === 'el' ? 'Αριθμός Παραγγελίας' : 'Order Number'}
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {language === 'el' ? 'Τραπέζι' : 'Table'} ({language === 'el' ? 'προαιρετικό' : 'optional'})
              </label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="12"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {language === 'el' ? 'Σταθμός' : 'Station'}
              </label>
              <select
                value={station}
                onChange={(e) => setStation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              >
                <option value="hot">{language === 'el' ? 'Ζεστό' : 'Hot'}</option>
                <option value="cold">{language === 'el' ? 'Κρύο' : 'Cold'}</option>
                <option value="grill">{language === 'el' ? 'Γκριλ' : 'Grill'}</option>
                <option value="pastry">{language === 'el' ? 'Ζαχαροπλαστική' : 'Pastry'}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {language === 'el' ? 'Προτεραιότητα' : 'Priority'}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as OrderPriority)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              >
                <option value="low">{language === 'el' ? 'Χαμηλή' : 'Low'}</option>
                <option value="normal">{language === 'el' ? 'Κανονική' : 'Normal'}</option>
                <option value="high">{language === 'el' ? 'Υψηλή' : 'High'}</option>
                <option value="urgent">{language === 'el' ? 'Επείγουσα' : 'Urgent'}</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {language === 'el' ? 'Εκτιμώμενος Χρόνος (λεπτά)' : 'Estimated Time (minutes)'}
              </label>
              <input
                type="number"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(parseInt(e.target.value) || 0)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Add Items */}
          <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
              {language === 'el' ? 'Προϊόντα' : 'Items'}
            </h3>

            <div className="flex gap-2 mb-4">
              <select
                value={selectedRecipeId}
                onChange={(e) => setSelectedRecipeId(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              >
                <option value="">{language === 'el' ? 'Επιλέξτε προϊόν...' : 'Select item...'}</option>
                {recipes.map(recipe => (
                  <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
                ))}
              </select>

              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                min="1"
                className="w-20 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />

              <button
                onClick={handleAddItem}
                disabled={!selectedRecipeId}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Icon name="plus" className="w-5 h-5" />
              </button>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <span className="text-gray-900 dark:text-white">
                    {item.quantity}x {item.recipeName}
                  </span>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600"
                  >
                    <Icon name="trash-2" className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {items.length === 0 && (
                <p className="text-center py-8 text-gray-400">
                  {language === 'el' ? 'Δεν έχουν προστεθεί προϊόντα' : 'No items added yet'}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {language === 'el' ? 'Σημειώσεις' : 'Notes'}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder={language === 'el' ? 'Προσθέστε σημειώσεις...' : 'Add notes...'}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            {language === 'el' ? 'Ακύρωση' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            disabled={items.length === 0}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Icon name="check" className="w-5 h-5" />
            {language === 'el' ? 'Δημιουργία Παραγγελίας' : 'Create Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewOrderModal;
