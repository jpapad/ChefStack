import React, { useState, useEffect } from 'react';
import { Supplier } from '../../types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';

interface SupplierFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Supplier, 'id' | 'teamId'> | Supplier) => void;
  supplierToEdit: Supplier | null;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ isOpen, onClose, onSave, supplierToEdit }) => {
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (supplierToEdit) {
      setName(supplierToEdit.name);
      setContactPerson(supplierToEdit.contactPerson || '');
      setPhone(supplierToEdit.phone || '');
      setEmail(supplierToEdit.email || '');
    } else {
      setName('');
      setContactPerson('');
      setPhone('');
      setEmail('');
    }
  }, [supplierToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = { name, contactPerson, phone, email };
    onSave(supplierToEdit ? { ...supplierToEdit, ...data } : data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{supplierToEdit ? 'Επεξεργασία Προμηθευτή' : 'Νέος Προμηθευτής'}</DialogTitle>
          <DialogDescription>
            Συμπληρώστε τα στοιχεία του προμηθευτή
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Όνομα Εταιρείας *</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="π.χ. ΜΕΤΡΟ Α.Ε."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contactPerson">Υπεύθυνος Επικοινωνίας</Label>
                <Input
                  id="contactPerson"
                  type="text"
                  value={contactPerson}
                  onChange={e => setContactPerson(e.target.value)}
                  placeholder="π.χ. Γιάννης Παπαδόπουλος"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Τηλέφωνο</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="π.χ. 210 1234567"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="π.χ. orders@metro.gr"
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

export default SupplierForm;
