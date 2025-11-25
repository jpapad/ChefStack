import React, { useState } from 'react';
import { Icon } from './Icon';
import { useTranslation } from '../../i18n';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export interface BulkEditField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'date' | 'boolean';
  options?: { value: string; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

interface BulkEditModalProps {
  isOpen: boolean;
  title: string;
  selectedCount: number;
  fields: BulkEditField[];
  onSave: (changes: Record<string, any>) => void;
  onCancel: () => void;
}

const BulkEditModal: React.FC<BulkEditModalProps> = ({
  isOpen,
  title,
  selectedCount,
  fields,
  onSave,
  onCancel,
}) => {
  const { language } = useTranslation();
  const [changes, setChanges] = useState<Record<string, any>>({});
  const [enabledFields, setEnabledFields] = useState<Set<string>>(new Set());

  const handleToggleField = (fieldId: string) => {
    const newEnabled = new Set(enabledFields);
    if (newEnabled.has(fieldId)) {
      newEnabled.delete(fieldId);
      const newChanges = { ...changes };
      delete newChanges[fieldId];
      setChanges(newChanges);
    } else {
      newEnabled.add(fieldId);
    }
    setEnabledFields(newEnabled);
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setChanges({ ...changes, [fieldId]: value });
  };

  const handleSave = () => {
    const filteredChanges: Record<string, any> = {};
    enabledFields.forEach((fieldId) => {
      if (changes[fieldId] !== undefined) {
        filteredChanges[fieldId] = changes[fieldId];
      }
    });
    onSave(filteredChanges);
    setChanges({});
    setEnabledFields(new Set());
  };

  const handleCancel = () => {
    setChanges({});
    setEnabledFields(new Set());
    onCancel();
  };

  const renderField = (field: BulkEditField) => {
    const value = changes[field.id];

    switch (field.type) {
      case 'text':
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            disabled={!enabledFields.has(field.id)}
            className="flex-1"
          />
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={(val) => handleFieldChange(field.id, val)}
            disabled={!enabledFields.has(field.id)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={language === 'el' ? 'Επιλέξτε...' : 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value))}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            disabled={!enabledFields.has(field.id)}
            className="flex-1"
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            disabled={!enabledFields.has(field.id)}
            className="flex-1"
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={value || false}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
              disabled={!enabledFields.has(field.id)}
              id={`${field.id}-boolean`}
            />
            <Label htmlFor={`${field.id}-boolean`} className="cursor-pointer">
              {language === 'el' ? 'Ενεργό' : 'Enabled'}
            </Label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {language === 'el' ? 'Μαζική επεξεργασία' : 'Bulk edit'} {selectedCount}{' '}
            {language === 'el' ? 'επιλεγμένων εγγραφών' : 'selected items'}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] py-4">
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
              <Icon name="info" className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {language === 'el'
                  ? 'Επιλέξτε τα πεδία που θέλετε να ενημερώσετε. Μόνο τα ενεργά πεδία θα αλλάξουν.'
                  : 'Select the fields you want to update. Only enabled fields will be changed.'}
              </p>
            </div>

            {fields.map((field) => (
              <div
                key={field.id}
                className={`border rounded-lg p-4 transition-all ${
                  enabledFields.has(field.id)
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                    : 'border-gray-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Checkbox
                    checked={enabledFields.has(field.id)}
                    onCheckedChange={() => handleToggleField(field.id)}
                    id={`field-${field.id}`}
                  />
                  <Label htmlFor={`field-${field.id}`} className="font-medium cursor-pointer flex-1">
                    {field.label}
                  </Label>
                </div>
                <div className="ml-7">{renderField(field)}</div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            {language === 'el' ? 'Ακύρωση' : 'Cancel'}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={enabledFields.size === 0}
            className="gap-2"
          >
            <Icon name="check" className="w-4 h-4" />
            {language === 'el' ? 'Εφαρμογή Αλλαγών' : 'Apply Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkEditModal;
