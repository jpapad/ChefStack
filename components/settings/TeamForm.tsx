import React, { useState, useEffect } from 'react';
import { Team } from '../../types';
import { Icon } from '../common/Icon';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface TeamFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Team, 'id'> | Team) => void;
  teamToEdit: Team | null;
}

const TeamForm: React.FC<TeamFormProps> = ({ isOpen, onClose, onSave, teamToEdit }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    setName(teamToEdit?.name || '');
  }, [teamToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(teamToEdit ? { ...teamToEdit, name } : { name });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{teamToEdit ? 'Επεξεργασία Ομάδας' : 'Νέα Ομάδα'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="team-name" className="mb-2">Όνομα Ομάδας</Label>
            <Input id="team-name" type="text" value={name} onChange={e => setName(e.target.value)} required />
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

export default TeamForm;
