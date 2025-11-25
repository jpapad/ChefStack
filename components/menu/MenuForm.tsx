import React, { useState, useEffect } from 'react';
import { Menu, MenuType } from '../../types';
import { Icon } from '../common/Icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface MenuFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data:
    | Partial<Omit<Extract<Menu, { type: 'a_la_carte' }>, 'id'>>
    | Partial<Omit<Extract<Menu, { type: 'buffet' }>, 'id'>>
  ) => void;
  menuToEdit: Menu | null;
}

const MenuForm: React.FC<MenuFormProps> = ({ isOpen, onClose, onSave, menuToEdit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MenuType>('a_la_carte');
  const [pax, setPax] = useState(50);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (menuToEdit) {
      setName(menuToEdit.name);
      setDescription(menuToEdit.description);
      setType(menuToEdit.type);
      if (menuToEdit.type === 'buffet') {
        setPax(menuToEdit.pax);
        setStartDate(menuToEdit.startDate || '');
        setEndDate(menuToEdit.endDate || '');
      }
    } else {
      setName('');
      setDescription('');
      setType('a_la_carte');
      setPax(50);
      setStartDate('');
      setEndDate('');
    }
  }, [menuToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const baseData = { name, description };
    let data;
    if (type === 'buffet') {
        data = { ...baseData, type, pax, startDate, endDate };
    } else {
        data = { ...baseData, type };
    }
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="utensils" className="w-5 h-5 text-brand-yellow" />
            {menuToEdit ? 'Επεξεργασία Μενού' : 'Νέο Μενού'}
          </DialogTitle>
          <DialogDescription>
            Δημιούργησε ή επεξεργάσου ένα μενού (à la carte ή buffet)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Menu Type Toggle */}
            <div className="space-y-2">
              <Label>Τύπος Μενού</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={type === 'a_la_carte' ? 'default' : 'outline'}
                  onClick={() => setType('a_la_carte')}
                  className="flex-1"
                >
                  À la carte
                </Button>
                <Button
                  type="button"
                  variant={type === 'buffet' ? 'default' : 'outline'}
                  onClick={() => setType('buffet')}
                  className="flex-1"
                >
                  Μπουφέ
                </Button>
              </div>
            </div>

            {/* Menu Name */}
            <div className="space-y-2">
              <Label htmlFor="menu-name">Όνομα Μενού</Label>
              <Input
                id="menu-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="π.χ. Καλοκαιρινό Μενού 2025"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="menu-description">Περιγραφή</Label>
              <Textarea
                id="menu-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="Σύντομη περιγραφή του μενού..."
              />
            </div>

            {/* Buffet-specific fields */}
            {type === 'buffet' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="pax">Αριθμός Ατόμων (PAX)</Label>
                  <Input
                    id="pax"
                    type="number"
                    value={pax}
                    onChange={e => setPax(parseInt(e.target.value) || 0)}
                    min={1}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Ημερομηνία Έναρξης</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">Ημερομηνία Λήξης</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
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

export default MenuForm;