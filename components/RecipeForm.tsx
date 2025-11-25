import React, { useState, useRef } from 'react';
import {
  Recipe,
  Ingredient,
  Allergen,
  ALLERGENS_LIST,
  RECIPE_CATEGORY_KEYS,
  Unit,
  RecipeStep
} from '../types';
import { Icon } from './common/Icon';
import AIImageModal from './common/AIImageModal';
import { useToast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface RecipeFormProps {
  recipeToEdit?: Recipe | null;
  allRecipes: Recipe[];
  onSave: (recipe: Omit<Recipe, 'id'> | Recipe) => void;
  onCancel: () => void;
  withApiKeyCheck: (action: () => void) => void;
}

const initialRecipeState: Omit<Recipe, 'id'> = {
  name: '',
  name_en: '',
  description: '',
  imageUrl: '',
  category: 'main_course',
  prepTime: 0,
  cookTime: 0,
  servings: 1,
  price: 0,
  ingredients: [
    { id: `ing${Date.now()}`, name: '', quantity: 0, unit: 'g', isSubRecipe: false }
  ],
  steps: [{ id: `step${Date.now()}`, type: 'step', content: '' }],
  allergens: [],
  teamId: '',
  yield: { quantity: 1, unit: 'kg' }
};

const RecipeForm: React.FC<RecipeFormProps> = ({
  onSave,
  onCancel,
  recipeToEdit,
  allRecipes,
  withApiKeyCheck
}) => {
  const { toast } = useToast();
  
  // αρχικό state μόνο στο mount
  const [recipe, setRecipe] = useState<Omit<Recipe, 'id'> | Recipe>(() => {
    if (recipeToEdit) {
      return {
        ...initialRecipeState,
        ...recipeToEdit,
        name_en: recipeToEdit.name_en || ''
      };
    }
    return initialRecipeState;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAiImageModalOpen, setIsAiImageModalOpen] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const numericFields = ['prepTime', 'cookTime', 'servings', 'price'];

    if (name === 'yield_quantity' || name === 'yield_unit') {
      const field = name.split('_')[1] as 'quantity' | 'unit';
      setRecipe((prev) => ({
        ...prev,
        yield: {
          ...prev.yield!,
          [field]: field === 'quantity' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      setRecipe((prev) => ({
        ...prev,
        [name]: numericFields.includes(name) ? parseFloat(value) || 0 : value
      }));
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Σφάλμα",
        description: "Το αρχείο είναι πολύ μεγάλο. Παρακαλώ επιλέξτε μια εικόνα κάτω από 10MB.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setRecipe((prev) => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.onerror = () => {
      console.error('Πρόβλημα κατά την ανάγνωση του αρχείου.');
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η ανάγνωση του αρχείου εικόνας.",
        variant: "destructive"
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setRecipe((prev) => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAiImageConfirm = (base64Image: string) => {
    const newImageUrl = `data:image/png;base64,${base64Image}`;
    setRecipe((prev) => ({ ...prev, imageUrl: newImageUrl }));
    setIsAiImageModalOpen(false);
  };

  const getBaseImageForEditing = () => {
    if (!recipe.imageUrl || !recipe.imageUrl.startsWith('data:')) {
      return null;
    }
    try {
      const [header, data] = recipe.imageUrl.split(',');
      const mimeTypeMatch = header.match(/:(.*?);/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';
      if (data && mimeType) {
        return { data, mimeType };
      }
    } catch (e) {
      console.error('Could not parse image data URL for editing', e);
    }
    return null;
  };

  const openAiImageModal = () => {
    withApiKeyCheck(() => setIsAiImageModalOpen(true));
  };

  // --- Ingredient Handlers ---
  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string | number | boolean
  ) => {
    const newIngredients = [...recipe.ingredients];
    const ingredient = { ...newIngredients[index] };

    if (field === 'quantity') {
      ingredient[field] = parseFloat(value as string) || 0;
    } else if (field === 'isSubRecipe') {
      ingredient[field] = value as boolean;
      ingredient.name = '';
      ingredient.recipeId = undefined;
    } else {
      (ingredient[field] as any) = value;
    }

    newIngredients[index] = ingredient;
    setRecipe((prev) => ({ ...prev, ingredients: newIngredients }));
  };

  const handleSubRecipeSelect = (index: number, selectedRecipeId: string) => {
    const selectedRecipe = allRecipes.find((r) => r.id === selectedRecipeId);
    if (selectedRecipe) {
      const newIngredients = [...recipe.ingredients];
      newIngredients[index] = {
        ...newIngredients[index],
        name: selectedRecipe.name,
        recipeId: selectedRecipe.id
      };
      setRecipe((prev) => ({ ...prev, ingredients: newIngredients }));
    }
  };

  const addIngredient = () => {
    setRecipe((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          id: `ing${Date.now()}`,
          name: '',
          quantity: 0,
          unit: 'g',
          isSubRecipe: false
        }
      ]
    }));
  };

  const removeIngredient = (index: number) => {
    if (recipe.ingredients.length > 1) {
      setRecipe((prev) => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }));
    }
  };

  // --- Step Handlers ---
  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...recipe.steps];
    newSteps[index] = { ...newSteps[index], content: value };
    setRecipe((prev) => ({ ...prev, steps: newSteps }));
  };

  const addStep = (type: 'step' | 'heading') => {
    const newStep: RecipeStep = { id: `step${Date.now()}`, type, content: '' };
    setRecipe((prev) => ({ ...prev, steps: [...prev.steps, newStep] }));
  };

  const removeStep = (index: number) => {
    if (recipe.steps.length > 1) {
      setRecipe((prev) => ({
        ...prev,
        steps: prev.steps.filter((_, i) => i !== index)
      }));
    }
  };

  // --- Allergen Handler ---
  const handleAllergenChange = (allergen: Allergen) => {
    setRecipe((prev) => {
      const newAllergens = prev.allergens.includes(allergen)
        ? prev.allergens.filter((a) => a !== allergen)
        : [...prev.allergens, allergen];
      return { ...prev, allergens: newAllergens };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !recipe.name ||
      recipe.ingredients.some((i) => !i.name) ||
      recipe.steps.some((s) => !s.content)
    ) {
      toast({
        title: "Ελλιπή στοιχεία",
        description: "Συμπλήρωσε όλα τα απαραίτητα πεδία: Όνομα συνταγής, ονόματα υλικών και βήματα εκτέλεσης.",
        variant: "destructive"
      });
      return;
    }
    onSave(recipe);
    toast({
      title: "Επιτυχία!",
      description: recipeToEdit ? "Η συνταγή ενημερώθηκε επιτυχώς." : "Η συνταγή δημιουργήθηκε επιτυχώς.",
    });
  };

  // Για σωστή αρίθμηση βημάτων (αγνοεί τις ενότητες)
  let visibleStepCounter = 0;

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2">
                <Icon name="book-open" className="w-6 h-6 text-brand-yellow" />
                {recipeToEdit ? 'Επεξεργασία Συνταγής' : 'Δημιουργία Νέας Συνταγής'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Συμπλήρωσε τα στοιχεία της συνταγής, τα υλικά και τα βήματα εκτέλεσης.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Άκυρο
              </Button>
              <Button
                type="submit"
              >
                <Icon name="save" className="w-4 h-4 mr-2" />
                Αποθήκευση
              </Button>
            </div>
          </div>

          {/* Βασικές Πληροφορίες */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="info" className="w-5 h-5 text-brand-yellow" />
                Βασικές Πληροφορίες
              </CardTitle>
              <CardDescription>
                Τα πεδία με * είναι υποχρεωτικά
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Όνομα Συνταγής (Ελληνικά) */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Όνομα Συνταγής (Ελληνικά) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={recipe.name}
                    onChange={handleChange}
                    placeholder="π.χ. Μοσχαράκι Κοκκινιστό"
                    required
                  />
                </div>

                {/* Όνομα Συνταγής (Αγγλικά) */}
                <div className="space-y-2">
                  <Label htmlFor="name_en">
                    Όνομα Συνταγής (Αγγλικά)
                  </Label>
                  <Input
                    id="name_en"
                    name="name_en"
                    value={recipe.name_en}
                    onChange={handleChange}
                    placeholder="e.g. Beef Kokkinisto"
                  />
                </div>

                {/* Κατηγορία */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="category">
                    Κατηγορία
                  </Label>
                  <Select
                    value={recipe.category}
                    onValueChange={(value) => setRecipe(prev => ({ ...prev, category: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Επιλέξτε κατηγορία" />
                    </SelectTrigger>
                    <SelectContent>
                      {RECIPE_CATEGORY_KEYS.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              {/* Εικόνα Συνταγής */}
              <div className="md:col-span-2">
                <Label>Εικόνα Συνταγής</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  PNG / JPG / GIF έως 10MB ή δημιουργία με AI
                </p>
                <div className="flex justify-center items-center w-full h-48 rounded-lg border-2 border-dashed border-input p-2 relative text-center bg-accent/50">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    accept="image/png, image/jpeg, image/gif"
                    className="hidden"
                  />
                  {recipe.imageUrl ? (
                    <div className="relative group w-full h-full">
                      <img
                        src={recipe.imageUrl}
                        alt="Προεπισκόπηση"
                        className="w-full h-full object-contain rounded-md"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                        <Button
                          type="button"
                          size="icon"
                          onClick={openAiImageModal}
                          title="Επεξεργασία με AI"
                          className="rounded-full bg-purple-600 hover:bg-purple-700"
                        >
                          <Icon name="sparkles" className="w-6 h-6" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          onClick={handleRemoveImage}
                          title="Αφαίρεση εικόνας"
                          className="rounded-full"
                        >
                          <Icon name="trash-2" className="w-6 h-6" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Icon
                        name="upload-cloud"
                        className="mx-auto h-10 w-10 text-gray-400"
                      />
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <Button
                          type="button"
                          variant="link"
                          onClick={handleImageUploadClick}
                          className="p-0 h-auto font-semibold"
                        >
                          Ανεβάστε ένα αρχείο
                        </Button>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        ή
                      </p>
                      <Button
                        type="button"
                        onClick={openAiImageModal}
                        className="mt-2 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900"
                      >
                        <Icon name="sparkles" className="w-4 h-4 mr-2" />
                        Δημιουργία με AI
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Περιγραφή */}
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">
                  Περιγραφή
                </Label>
                <Textarea
                  name="description"
                  id="description"
                  value={recipe.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Λίγα λόγια για το πιάτο, τεχνικές, tips σερβιρίσματος..."
                />
              </div>
              </div>

              {/* Χρόνοι & Μερίδες/Τιμή */}
              <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prepTime">
                  Χρόνος Προετοιμασίας (λεπτά)
                </Label>
                <Input
                  type="number"
                  id="prepTime"
                  name="prepTime"
                  min={0}
                  value={recipe.prepTime}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cookTime">
                  Χρόνος Μαγειρέματος (λεπτά)
                </Label>
                <Input
                  type="number"
                  id="cookTime"
                  name="cookTime"
                  min={0}
                  value={recipe.cookTime}
                  onChange={handleChange}
                />
              </div>

              {/* Yield ή Μερίδες / Τιμή */}
              {recipe.category === 'sub_recipe' ? (
                <>
                  <div className="space-y-2">
                    <Label>
                      Παραγωγή (Yield)
                    </Label>
                    <Input
                      type="number"
                      name="yield_quantity"
                      min={0}
                      value={recipe.yield?.quantity || 1}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Συνολική ποσότητα που παράγει η υποπαρασκευή.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Μονάδα Παραγωγής
                    </Label>
                    <Select
                      value={recipe.yield?.unit || 'kg'}
                      onValueChange={(value) => {
                        setRecipe(prev => ({
                          ...prev,
                          yield: { ...prev.yield!, unit: value as any }
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="τεμ">τεμ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="servings">
                      Μερίδες
                    </Label>
                    <Input
                      type="number"
                      id="servings"
                      name="servings"
                      min={1}
                      value={recipe.servings}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      Τιμή Πώλησης (€)
                    </Label>
                    <Input
                      type="number"
                      id="price"
                      name="price"
                      step="0.01"
                      min={0}
                      value={recipe.price || ''}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}
              </div>
            </CardContent>
          </Card>

          {/* Συστατικά */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="list" className="w-5 h-5 text-brand-yellow" />
                Συστατικά
              </CardTitle>
              <CardDescription>
                Μπορείς να δηλώσεις και υποπαρασκευές (βάσεις, σάλτσες κ.λπ.)
              </CardDescription>
            </CardHeader>
            <CardContent>

            {/* Header row για desktop */}
            <div className="hidden md:grid grid-cols-12 gap-2 text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
              <div className="col-span-6">Όνομα / Υποπαρασκευή</div>
              <div className="col-span-2 text-right">Ποσότητα</div>
              <div className="col-span-2">Μονάδα</div>
              <div className="col-span-1 text-center">Υποπαρ.</div>
              <div className="col-span-1 text-center">Διαγραφή</div>
            </div>

            <div className="space-y-2">
              {recipe.ingredients.map((ing, index) => (
                <div
                  key={ing.id}
                  className="grid grid-cols-12 gap-2 items-center p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="col-span-12 md:col-span-6">
                    {ing.isSubRecipe ? (
                      <Select
                        value={ing.recipeId || ''}
                        onValueChange={(value) => handleSubRecipeSelect(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Επιλέξτε Υποπαρασκευή" />
                        </SelectTrigger>
                        <SelectContent>
                          {allRecipes.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type="text"
                        placeholder="Όνομα υλικού"
                        value={ing.name}
                        onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                        required
                      />
                    )}
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <Input
                      type="number"
                      placeholder="Ποσ."
                      value={ing.quantity}
                      min={0}
                      onChange={(e) =>
                        handleIngredientChange(index, 'quantity', e.target.value)
                      }
                      className="text-right"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <Select
                      value={ing.unit}
                      onValueChange={(value) =>
                        handleIngredientChange(index, 'unit', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="τεμ">τεμ</SelectItem>
                        <SelectItem value="κ.γ.">κ.γ.</SelectItem>
                        <SelectItem value="κ.σ.">κ.σ.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-center justify-center">
                    <label className="inline-flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ing.isSubRecipe}
                        onChange={(e) =>
                          handleIngredientChange(index, 'isSubRecipe', e.target.checked)
                        }
                        className="h-4 w-4 rounded border-input"
                        title="Είναι Υποπαρασκευή;"
                      />
                      <span className="hidden lg:inline">Υποπαρ.</span>
                    </label>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-center justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                      disabled={recipe.ingredients.length <= 1}
                      className="h-8 w-8 text-gray-400 hover:text-destructive"
                    >
                      <Icon name="trash-2" className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="link"
              onClick={addIngredient}
              className="mt-4 p-0 h-auto"
            >
              <Icon name="plus" className="w-4 h-4 mr-2" />
              Προσθήκη Συστατικού
            </Button>
            </CardContent>
          </Card>

          {/* Εκτέλεση */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="list-ordered" className="w-5 h-5 text-brand-yellow" />
                Εκτέλεση
              </CardTitle>
              <CardDescription>
                Χρησιμοποίησε ενότητες για μεγάλα παρασκευάσματα (π.χ. &quot;Κιμάς&quot;, &quot;Σάλτσα&quot;)
              </CardDescription>
            </CardHeader>
            <CardContent>

            <div className="space-y-4">
              {recipe.steps.map((step, index) => {
                let displayNumber: number | null = null;
                if (step.type === 'step') {
                  visibleStepCounter += 1;
                  displayNumber = visibleStepCounter;
                }

                return (
                  <div key={step.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                    {step.type === 'step' && (
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-yellow text-brand-dark font-bold text-sm flex-shrink-0">
                        {displayNumber}
                      </span>
                    )}
                    {step.type === 'heading' ? (
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          <Icon name="bookmark" className="w-4 h-4" />
                          Ενότητα συνταγής
                        </div>
                        <Input
                          type="text"
                          value={step.content}
                          onChange={(e) => handleStepChange(index, e.target.value)}
                          placeholder="Όνομα Ενότητας (π.χ. Κιμάς, Σάλτσα, Γαρνιτούρα)"
                          className="font-bold text-lg border-0 border-b-2 rounded-none px-0 focus-visible:ring-0 focus-visible:border-brand-yellow"
                          required
                        />
                      </div>
                    ) : (
                      <Textarea
                        value={step.content}
                        onChange={(e) => handleStepChange(index, e.target.value)}
                        rows={2}
                        placeholder="Περιέγραψε αναλυτικά το βήμα εκτέλεσης..."
                        className="flex-1"
                        required
                      />
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStep(index)}
                      disabled={recipe.steps.length <= 1}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Icon name="trash-2" className="w-5 h-5" />
                    </Button>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-4">
              <Button
                type="button"
                variant="link"
                onClick={() => addStep('step')}
                className="p-0 h-auto"
              >
                <Icon name="plus" className="w-4 h-4 mr-2" />
                Προσθήκη Βήματος
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={() => addStep('heading')}
                className="p-0 h-auto"
              >
                <Icon name="plus" className="w-4 h-4 mr-2" />
                Προσθήκη Ενότητας
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Αλλεργιογόνα */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="alert-circle" className="w-5 h-5 text-brand-yellow" />
                Αλλεργιογόνα
              </CardTitle>
              <CardDescription>
                Εμφανίζονται στις ετικέτες και στην πληροφόρηση πελατών
              </CardDescription>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {ALLERGENS_LIST.map((allergen) => {
                const selected = recipe.allergens.includes(allergen);
                return (
                  <label
                    key={allergen}
                    className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border text-sm ${
                      selected
                        ? 'border-brand-yellow bg-brand-yellow/10 text-brand-dark'
                        : 'border-gray-300 dark:border-gray-600 bg-black/5 dark:bg-white/5 text-gray-800 dark:text-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => handleAllergenChange(allergen)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-secondary focus:ring-brand-primary"
                    />
                    <span className="truncate">{allergen}</span>
                  </label>
                );
              ))}
            </div>
            </CardContent>
          </Card>
        </form>
      </div>

      <AIImageModal
        isOpen={isAiImageModalOpen}
        onClose={() => setIsAiImageModalOpen(false)}
        onConfirm={handleAiImageConfirm}
        initialPrompt={recipe.name}
        baseImage={getBaseImageForEditing()}
      />
    </>
  );
};

export default RecipeForm;
