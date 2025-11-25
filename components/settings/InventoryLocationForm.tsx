import React, { useState, useEffect } from 'react';
import { InventoryLocation } from '../../types';
import { useTranslation } from '../../i18n';
import { Icon } from '../common/Icon';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface InventoryLocationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<InventoryLocation, 'id' | 'teamId'> | InventoryLocation) => void;
  locationToEdit: InventoryLocation | null;
}

const InventoryLocationForm: React.FC<InventoryLocationFormProps> = ({ isOpen, onClose, onSave, locationToEdit }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');

  useEffect(() => {
    if (locationToEdit) {
      setName(locationToEdit.name);
    } else {
      setName('');
    }
  }, [locationToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(locationToEdit ? { ...locationToEdit, name } : { name });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{locationToEdit ? t('workspace_edit_location') : t('workspace_new_location')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="location-name" className="mb-2">Όνομα Τοποθεσίας</Label>
            <Input
              id="location-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>{t('cancel')}</Button>
            <Button type="submit">{t('save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryLocationForm;
