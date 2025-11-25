import React, { useState, useEffect } from 'react';
import { InventoryItem, Supplier, IngredientCost, PurchaseUnit, InventoryLocation, InventoryItemLocation } from '../../types';
import { Icon } from '../common/Icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface InventoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<InventoryItem, 'id' | 'teamId'> | InventoryItem) => void;
  itemToEdit: InventoryItem | null;
  suppliers: Supplier[];
  ingredientCosts: IngredientCost[];
  inventoryLocations: InventoryLocation[];
}

const InventoryForm: React.FC<InventoryFormProps> = ({ isOpen, onClose, onSave, itemToEdit, suppliers, ingredientCosts, inventoryLocations }) => {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<PurchaseUnit>('kg');
  const [reorderPoint, setReorderPoint] = useState(0);
  const [supplierId, setSupplierId] = useState<string | undefined>(undefined);
  const [ingredientCostId, setIngredientCostId] = useState<string | undefined>(undefined);
  const [locations, setLocations] = useState<InventoryItemLocation[]>([]);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setUnit(itemToEdit.unit);
      setReorderPoint(itemToEdit.reorderPoint);
      setSupplierId(itemToEdit.supplierId);
      setIngredientCostId(itemToEdit.ingredientCostId);
      setLocations(itemToEdit.locations);
    } else {
      setName('');
      setUnit('kg');
      setReorderPoint(0);
      setSupplierId(undefined);
      setIngredientCostId(undefined);
      setLocations(inventoryLocations.length > 0 ? inventoryLocations.map(loc => ({ locationId: loc.id, quantity: 0 })) : []);
    }
  }, [itemToEdit, isOpen, inventoryLocations]);
  
  const handleLocationQuantityChange = (locationId: string, quantity: number) => {
      setLocations(prev => {
          const existing = prev.find(l => l.locationId === locationId);
          if (existing) {
              return prev.map(l => l.locationId === locationId ? { ...l, quantity } : l);
          }
          return [...prev, { locationId, quantity }];
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = { name, unit, reorderPoint, supplierId, ingredientCostId, locations };
    onSave(itemToEdit ? { ...itemToEdit, ...data } : data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="package" className="w-5 h-5 text-brand-yellow" />
            {itemToEdit ? 'Επεξεργασία Είδους' : 'Νέο Είδος Αποθήκης'}
          </DialogTitle>
          <DialogDescription>
            Συμπλήρωσε τα στοιχεία του είδους αποθήκης
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Όνομα Είδους</Label>
              <Input
                id="item-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="π.χ. Ντομάτα"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Ποσότητες ανά Τοποθεσία</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto p-3 bg-accent/50 rounded-lg border">
                {inventoryLocations.map(loc => {
                  const itemLocation = locations.find(l => l.locationId === loc.id);
                  return (
                    <div key={loc.id} className="grid grid-cols-3 gap-2 items-center">
                      <Label className="col-span-1 text-sm">{loc.name}</Label>
                      <Input
                        type="number"
                        step="any"
                        value={itemLocation?.quantity ?? 0}
                        onChange={e => handleLocationQuantityChange(loc.id, parseFloat(e.target.value) || 0)}
                        className="col-span-2"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Μονάδα</Label>
                <Select value={unit} onValueChange={(value) => setUnit(value as PurchaseUnit)}>
                  <SelectTrigger id="unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="τεμ">τεμ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reorder-point">Σημείο Αναπαραγγελίας</Label>
                <Input
                  id="reorder-point"
                  type="number"
                  step="any"
                  value={reorderPoint}
                  onChange={e => setReorderPoint(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Προμηθευτής (Προαιρετικά)</Label>
              <Select value={supplierId || 'none'} onValueChange={(value) => setSupplierId(value === 'none' ? undefined : value)}>
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="-- Κανένας --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Κανένας --</SelectItem>
                  {suppliers.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Άκυρο
            </Button>
            <Button type="submit">
              Αποθήκευση
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryForm;
