import React, { useState, useEffect } from 'react';
import { Workstation } from '../../types';
import { Icon } from '../common/Icon';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface WorkstationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Workstation, 'id' | 'teamId'> | Workstation) => void;
  workstationToEdit: Workstation | null;
}

const WorkstationForm: React.FC<WorkstationFormProps> = ({ isOpen, onClose, onSave, workstationToEdit }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (workstationToEdit) {
      setName(workstationToEdit.name);
    } else {
      setName('');
    }
  }, [workstationToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(workstationToEdit ? { ...workstationToEdit, name } : { name });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {workstationToEdit ? 'Επεξεργασία Σταθμού' : 'Νέος Σταθμός Εργασίας'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="ws-name" className="mb-2">Όνομα Σταθμού</Label>
            <Input
              id="ws-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Άκυρο</Button>
            <Button type="submit">Αποθήκευση</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WorkstationForm;
