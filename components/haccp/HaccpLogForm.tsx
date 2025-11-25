import React, { useState, useEffect } from 'react';
import { HaccpLog, HaccpLogType, HaccpItem } from '../../types';
import { Icon } from '../common/Icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface HaccpLogFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<HaccpLog, 'id'> | HaccpLog) => void;
  haccpItems: HaccpItem[];
  logToEdit?: HaccpLog | null;
}

const HaccpLogForm: React.FC<HaccpLogFormProps> = ({ isOpen, onClose, onSave, haccpItems, logToEdit }) => {
  const [type, setType] = useState<HaccpLogType>(HaccpLogType.Temperature);
  const [haccpItemId, setHaccpItemId] = useState<string>(haccpItems[0]?.id || '');
  const [value, setValue] = useState('');
  const [user, setUser] = useState('');
  const [notes, setNotes] = useState('');

  // Reset form when logToEdit changes
  useEffect(() => {
    if (logToEdit) {
      setType(logToEdit.type);
      setHaccpItemId(logToEdit.haccpItemId);
      setValue(logToEdit.value || '');
      setUser(logToEdit.user);
      setNotes(logToEdit.notes || '');
    } else {
      setType(HaccpLogType.Temperature);
      setHaccpItemId(haccpItems[0]?.id || '');
      setValue('');
      setUser('');
      setNotes('');
    }
  }, [logToEdit, haccpItems, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!haccpItemId || !user.trim()) return;
    
    if (logToEdit) {
      // Update existing log
      onSave({
        ...logToEdit,
        type,
        haccpItemId,
        value: type === HaccpLogType.Temperature ? value : undefined,
        user,
        notes,
      });
    } else {
      // Create new log
      onSave({
        timestamp: new Date(),
        type,
        haccpItemId,
        value: type === HaccpLogType.Temperature ? value : undefined,
        user,
        notes,
        teamId: '', // Will be set by parent
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="shield-check" className="w-5 h-5 text-brand-yellow" />
            {logToEdit ? 'Επεξεργασία Καταγραφής HACCP' : 'Νέα Καταγραφή HACCP'}
          </DialogTitle>
          <DialogDescription>
            Συμπλήρωσε τα στοιχεία της καταγραφής HACCP
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="haccp-item">Σημείο Ελέγχου</Label>
              <Select value={haccpItemId} onValueChange={setHaccpItemId} required>
                <SelectTrigger id="haccp-item">
                  <SelectValue placeholder="Επιλέξτε σημείο..." />
                </SelectTrigger>
                <SelectContent>
                  {haccpItems.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="log-type">Τύπος Καταγραφής</Label>
                <Select value={type} onValueChange={(value) => setType(value as HaccpLogType)}>
                  <SelectTrigger id="log-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(HaccpLogType).map(t => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {type === HaccpLogType.Temperature && (
                <div className="space-y-2">
                  <Label htmlFor="temperature-value">Τιμή (π.χ. 3°C)</Label>
                  <Input
                    id="temperature-value"
                    type="text"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder="3°C"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-name">Όνομα Χρήστη</Label>
              <Input
                id="user-name"
                type="text"
                value={user}
                onChange={e => setUser(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Σχόλια (προαιρετικά)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="Πρόσθετες παρατηρήσεις..."
              />
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

export default HaccpLogForm;
