import React, { useState, useEffect } from 'react';
import { PrepTask, PrepTaskStatus, Recipe } from '../../types';
import { Icon } from '../common/Icon';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface PrepTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<PrepTask, 'id' | 'teamId'> | PrepTask) => void;
  taskToEdit: PrepTask | null;
  recipes: Recipe[];
  workstationId: string;
}

const PrepTaskForm: React.FC<PrepTaskFormProps> = ({ isOpen, onClose, onSave, taskToEdit, recipes, workstationId }) => {
  const [description, setDescription] = useState('');
  const [recipeName, setRecipeName] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setDescription(taskToEdit.description);
      setRecipeName(taskToEdit.recipeName);
    } else {
      setDescription('');
      setRecipeName('');
    }
  }, [taskToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !recipeName) return;

    const taskData = {
      description,
      recipeName,
      workstationId,
      status: taskToEdit?.status || PrepTaskStatus.ToDo,
    };
    
    onSave(taskToEdit ? { ...taskToEdit, ...taskData } : taskData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {taskToEdit ? 'Επεξεργασία Εργασίας' : 'Νέα Εργασία Προετοιμασίας'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="task-desc" className="mb-2">Περιγραφή Εργασίας</Label>
              <Input
                id="task-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="task-recipe" className="mb-2">Για Συνταγή</Label>
              <Select value={recipeName} onValueChange={setRecipeName} required>
                <SelectTrigger id="task-recipe">
                  <SelectValue placeholder="Επιλέξτε συνταγή" />
                </SelectTrigger>
                <SelectContent>
                  {recipes.map(recipe => (
                    <SelectItem key={recipe.id} value={recipe.name}>{recipe.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

export default PrepTaskForm;
