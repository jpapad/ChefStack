import React, { useState, useEffect } from 'react';
import { IngredientCost, PurchaseUnit } from '../../types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface IngredientCostFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<IngredientCost, 'id' | 'teamId'> | IngredientCost) => void;
  costToEdit: IngredientCost | null;
}

const IngredientCostForm: React.FC<IngredientCostFormProps> = ({ isOpen, onClose, onSave, costToEdit }) => {
  const [name, setName] = useState('');
  const [cost, setCost] = useState<number>(0);
  const [purchaseUnit, setPurchaseUnit] = useState<PurchaseUnit>('kg');

  useEffect(() => {
    if (costToEdit) {
      setName(costToEdit.name);
      setCost(costToEdit.cost);
      setPurchaseUnit(costToEdit.purchaseUnit);
    } else {
      setName('');
      setCost(0);
      setPurchaseUnit('kg');
    }
  }, [costToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || cost <= 0) return;
    
    const data = { name, cost, purchaseUnit };
    onSave(costToEdit ? { ...costToEdit, ...data } : data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{costToEdit ? 'Επεξεργασία Κόστους' : 'Νέο Κόστος Συστατικού'}</DialogTitle>
          <DialogDescription>
            Ορίστε το κόστος αγοράς για το συστατικό
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Όνομα Συστατικού *</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="π.χ. Τομάτα"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                <Label htmlFor="cost">Κόστος Αγοράς (€) *</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={cost}
                  onChange={e => setCost(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Ανά Μονάδα *</Label>
                <Select value={purchaseUnit} onValueChange={(val) => setPurchaseUnit(val as PurchaseUnit)} required>
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

export default IngredientCostForm;
