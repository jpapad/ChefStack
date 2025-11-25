import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useToast } from '../../hooks/use-toast';
import { Toaster } from '../ui/toaster';
import { ModernRecipeCard } from './ModernRecipeCard';
import type { Recipe } from '../../types';

export const ShadcnDemo: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [viewMode, setViewMode] = useState<'thumbnail' | 'full'>('thumbnail');
  const { toast } = useToast();

  // Sample recipes for demo
  const sampleRecipes: Recipe[] = [
    {
      id: '1',
      name: 'Μουσακάς',
      name_en: 'Moussaka',
      category: 'main_course',
      description: 'Παραδοσιακό ελληνικό πιάτο με μελιτζάνες, κιμά και μπεσαμέλ',
      imageUrl: '',
      servings: 6,
      ingredients: [
        { id: '1', name: 'Μελιτζάνες', quantity: 1000, unit: 'g' as const, isSubRecipe: false },
        { id: '2', name: 'Κιμάς μοσχαρίσιος', quantity: 500, unit: 'g' as const, isSubRecipe: false },
        { id: '3', name: 'Γάλα', quantity: 500, unit: 'ml' as const, isSubRecipe: false },
      ],
      steps: [
        { id: '1', type: 'step' as const, content: 'Κόβουμε τις μελιτζάνες σε ροδέλες' },
        { id: '2', type: 'step' as const, content: 'Τηγανίζουμε τις μελιτζάνες' },
        { id: '3', type: 'step' as const, content: 'Φτιάχνουμε μπεσαμέλ' },
      ],
      prepTime: 30,
      cookTime: 60,
      yield: { quantity: 6, unit: 'τεμ' as const },
      allergens: ['Milk', 'Gluten'],
      teamId: 'team1'
    },
    {
      id: '2',
      name: 'Χωριάτικη Σαλάτα',
      name_en: 'Greek Salad',
      category: 'salad',
      description: 'Φρέσκια σαλάτα με ντομάτα, αγγούρι, φέτα και ελιές',
      imageUrl: '',
      servings: 4,
      ingredients: [
        { id: '1', name: 'Ντομάτες', quantity: 400, unit: 'g' as const, isSubRecipe: false },
        { id: '2', name: 'Αγγούρι', quantity: 200, unit: 'g' as const, isSubRecipe: false },
        { id: '3', name: 'Φέτα', quantity: 150, unit: 'g' as const, isSubRecipe: false },
      ],
      steps: [
        { id: '1', type: 'step' as const, content: 'Κόβουμε τα λαχανικά' },
        { id: '2', type: 'step' as const, content: 'Προσθέτουμε φέτα και ελιές' },
      ],
      prepTime: 15,
      cookTime: 0,
      yield: { quantity: 4, unit: 'τεμ' as const },
      allergens: ['Milk'],
      teamId: 'team1'
    },
    {
      id: '3',
      name: 'Γαλακτομπούρεκο',
      name_en: 'Galaktoboureko',
      category: 'dessert',
      description: 'Παραδοσιακό γλυκό με κρέμα γάλακτος και φύλλο',
      imageUrl: '',
      servings: 8,
      ingredients: [
        { id: '1', name: 'Γάλα', quantity: 1000, unit: 'ml' as const, isSubRecipe: false },
        { id: '2', name: 'Σιμιγδάλι', quantity: 150, unit: 'g' as const, isSubRecipe: false },
        { id: '3', name: 'Ζάχαρη', quantity: 200, unit: 'g' as const, isSubRecipe: false },
      ],
      steps: [
        { id: '1', type: 'step' as const, content: 'Φτιάχνουμε κρέμα' },
        { id: '2', type: 'step' as const, content: 'Στρώνουμε φύλλα' },
        { id: '3', type: 'step' as const, content: 'Ψήνουμε' },
      ],
      prepTime: 25,
      cookTime: 45,
      yield: { quantity: 8, unit: 'τεμ' as const },
      allergens: ['Milk', 'Eggs', 'Gluten'],
      teamId: 'team1'
    }
  ];

  const showToast = () => {
    toast({
      title: "Επιτυχία!",
      description: "Αυτό είναι ένα toast notification με shadcn/ui",
    });
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">shadcn/ui Demo</h1>
        <p className="text-muted-foreground">Modern, accessible components για το ChefStack</p>
      </div>

      {/* Buttons Section */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Different button variants and sizes</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </CardContent>
      </Card>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Συνταγή: Μουσακάς</CardTitle>
            <CardDescription>Παραδοσιακό ελληνικό πιάτο</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Ένα κλασικό πιάτο με μελιτζάνες, κιμά και μπεσαμέλ
            </p>
            <div className="flex gap-2">
              <span className="inline-flex items-center rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">Κυρίως</span>
              <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">45 λεπτά</span>
              <span className="inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium">4 μερίδες</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm">Επεξεργασία</Button>
            <Button size="sm">Προβολή</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recipe: Greek Salad</CardTitle>
            <CardDescription>Fresh Mediterranean salad</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              A classic combination of tomatoes, cucumber, feta, and olives
            </p>
            <div className="flex gap-2">
              <span className="inline-flex items-center rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">Appetizer</span>
              <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">10 min</span>
              <span className="inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium">2 servings</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm">Edit</Button>
            <Button size="sm">View</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Input & Toast Section */}
      <Card>
        <CardHeader>
          <CardTitle>Input & Notifications</CardTitle>
          <CardDescription>Interactive form elements with toast notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Όνομα Συνταγής</label>
            <Input 
              placeholder="Γράψε το όνομα της συνταγής..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
          <Button onClick={showToast}>Show Toast Notification</Button>
        </CardContent>
      </Card>

      {/* Dialog Section */}
      <Card>
        <CardHeader>
          <CardTitle>Dialog (Modal)</CardTitle>
          <CardDescription>Accessible modal dialogs</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Άνοιγμα Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Διαγραφή Συνταγής</DialogTitle>
                <DialogDescription>
                  Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή τη συνταγή; 
                  Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Ακύρωση</Button>
                <Button variant="destructive">Διαγραφή</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle>Styled Badges</CardTitle>
          <CardDescription>Status indicators and labels</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-md bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">Default</span>
          <span className="inline-flex items-center rounded-md bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">Secondary</span>
          <span className="inline-flex items-center rounded-md bg-destructive px-2.5 py-0.5 text-xs font-semibold text-destructive-foreground">Destructive</span>
          <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold">Outline</span>
          <span className="inline-flex items-center rounded-md bg-green-600 px-2.5 py-0.5 text-xs font-semibold text-white">Success</span>
          <span className="inline-flex items-center rounded-md bg-yellow-600 px-2.5 py-0.5 text-xs font-semibold text-white">Warning</span>
          <span className="inline-flex items-center rounded-md bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white">Info</span>
        </CardContent>
      </Card>

      {/* Recipe Cards Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recipe Cards (Modern Design)</CardTitle>
              <CardDescription>shadcn/ui powered recipe cards με glassmorphism</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={viewMode === 'thumbnail' ? 'default' : 'outline'}
                onClick={() => setViewMode('thumbnail')}
              >
                Grid View
              </Button>
              <Button 
                size="sm" 
                variant={viewMode === 'full' ? 'default' : 'outline'}
                onClick={() => setViewMode('full')}
              >
                Full View
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {viewMode === 'thumbnail' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleRecipes.map(recipe => (
                <ModernRecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  mode="thumbnail"
                  onView={() => showToast()}
                  onEdit={() => showToast()}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {sampleRecipes.map(recipe => (
                <ModernRecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  mode="full"
                  onView={() => showToast()}
                  onEdit={() => showToast()}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Toaster />
    </div>
  );
};
