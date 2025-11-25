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
              <button
                type="button"
                onClick={onCancel}
                className="py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold text-sm"
              >
                Άκυρο
              </button>
              <button
                type="submit"
                className="py-2 px-6 rounded-lg bg-brand-yellow text-brand-dark hover:brightness-105 font-semibold text-sm shadow-md"
              >
                Αποθήκευση
              </button>
            </div>
          </div>

          {/* Βασικές Πληροφορίες */}
          <div className="p-6 bg-light-bg/50 dark:bg-dark-bg/30 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Icon name="info" className="w-5 h-5 text-brand-yellow" />
                Βασικές Πληροφορίες
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Τα πεδία με * είναι υποχρεωτικά
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Όνομα Συνταγής (Ελληνικά) */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Όνομα Συνταγής (Ελληνικά) *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={recipe.name}
                  onChange={handleChange}
                  placeholder="π.χ. Μοσχαράκι Κοκκινιστό"
                  required
                  className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>

              {/* Όνομα Συνταγής (Αγγλικά) */}
              <div>
                <label htmlFor="name_en" className="block text-sm font-medium mb-1">
                  Όνομα Συνταγής (Αγγλικά)
                </label>
                <input
                  type="text"
                  id="name_en"
                  name="name_en"
                  value={recipe.name_en}
                  onChange={handleChange}
                  placeholder="e.g. Beef Kokkinisto"
                  className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>

              {/* Κατηγορία */}
              <div className="col-span-1 md:col-span-2">
                <label htmlFor="category" className="block text-sm font-medium mb-1">
                  Κατηγορία
                </label>
                <select
                  id="category"
                  name="category"
                  value={recipe.category}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 focus:ring-brand-primary focus:border-brand-primary"
                >
                  {RECIPE_CATEGORY_KEYS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Εικόνα Συνταγής */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium mb-1">Εικόνα Συνταγής</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  PNG / JPG / GIF έως 10MB ή δημιουργία με AI.
                </p>
                <div className="mt-1 flex justify-center items-center w-full h-48 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-2 relative text-center bg-black/5 dark:bg-white/5">
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
                        <button
                          type="button"
                          onClick={openAiImageModal}
                          title="Επεξεργασία με AI"
                          className="text-white p-2 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors"
                        >
                          <Icon name="sparkles" className="w-6 h-6" />
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          title="Αφαίρεση εικόνας"
                          className="text-white p-2 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
                        >
                          <Icon name="trash-2" className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Icon
                        name="upload-cloud"
                        className="mx-auto h-10 w-10 text-gray-400"
                      />
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <button
                          type="button"
                          onClick={handleImageUploadClick}
                          className="font-semibold text-brand-secondary hover:underline focus:outline-none"
                        >
                          Ανεβάστε ένα αρχείο
                        </button>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        ή
                      </p>
                      <button
                        type="button"
                        onClick={openAiImageModal}
                        className="mt-2 flex items-center gap-2 text-sm font-semibold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900 lift-on-hover"
                      >
                        <Icon name="sparkles" className="w-4 h-4" /> Δημιουργία με AI
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Περιγραφή */}
              <div className="col-span-1 md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Περιγραφή
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={recipe.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Λίγα λόγια για το πιάτο, τεχνικές, tips σερβιρίσματος..."
                  className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                ></textarea>
              </div>

              {/* Χρόνοι */}
              <div>
                <label htmlFor="prepTime" className="block text-sm font-medium mb-1">
                  Χρόνος Προετοιμασίας (λεπτά)
                </label>
                <input
                  type="number"
                  id="prepTime"
                  name="prepTime"
                  min={0}
                  value={recipe.prepTime}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>

              <div>
                <label htmlFor="cookTime" className="block text-sm font-medium mb-1">
                  Χρόνος Μαγειρέματος (λεπτά)
                </label>
                <input
                  type="number"
                  id="cookTime"
                  name="cookTime"
                  min={0}
                  value={recipe.cookTime}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>

              {/* Yield ή Μερίδες / Τιμή */}
              {recipe.category === 'sub_recipe' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Παραγωγή (Yield)
                    </label>
                    <input
                      type="number"
                      name="yield_quantity"
                      min={0}
                      value={recipe.yield?.quantity || 1}
                      onChange={handleChange}
                      className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Συνολική ποσότητα που παράγει η υποπαρασκευή.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Μονάδα Παραγωγής
                    </label>
                    <select
                      name="yield_unit"
                      value={recipe.yield?.unit || 'kg'}
                      onChange={handleChange}
                      className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                    >
                      <option value="kg">kg</option>
                      <option value="L">L</option>
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="τεμ">τεμ</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="servings" className="block text-sm font-medium mb-1">
                      Μερίδες
                    </label>
                    <input
                      type="number"
                      id="servings"
                      name="servings"
                      min={1}
                      value={recipe.servings}
                      onChange={handleChange}
                      className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 focus:ring-brand-primary focus:border-brand-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium mb-1">
                      Τιμή Πώλησης (€)
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      step="0.01"
                      min={0}
                      value={recipe.price || ''}
                      onChange={handleChange}
                      className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 focus:ring-brand-primary focus:border-brand-primary"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Συστατικά */}
          <div className="p-6 bg-light-bg/50 dark:bg-dark-bg/30 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Icon name="list" className="w-5 h-5 text-brand-yellow" />
                Συστατικά
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Μπορείς να δηλώσεις και υποπαρασκευές (βάσεις, σάλτσες κ.λπ.)
              </span>
            </div>

            {/* Header row για desktop */}
            <div className="hidden md:grid grid-cols-12 gap-2 text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
              <div className="col-span-6">Όνομα / Υποπαρασκευή</div>
              <div className="col-span-2 text-right">Ποσότητα</div>
              <div className="col-span-2">Μονάδα</div>
              <div className="col-span-1 text-center">Υποπαρ.</div>
              <div className="col-span-1 text-center">Διαγραφή</div>
            </div>

            <div className="space-y-3">
              {recipe.ingredients.map((ing, index) => (
                <div
                  key={ing.id}
                  className="grid grid-cols-12 gap-2 items-center bg-black/5 dark:bg:white/5 rounded-md px-2 py-1.5"
                >
                  <div className="col-span-12 md:col-span-6">
                    {ing.isSubRecipe ? (
                      <select
                        value={ing.recipeId || ''}
                        onChange={(e) => handleSubRecipeSelect(index, e.target.value)}
                        className="p-2 w-full rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 text-sm"
                        required
                      >
                        <option value="" disabled>
                          Επιλέξτε Υποπαρασκευή
                        </option>
                        {allRecipes.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Όνομα υλικού"
                        value={ing.name}
                        onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                        className="p-2 w-full rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 text-sm"
                        required
                      />
                    )}
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <input
                      type="number"
                      placeholder="Ποσότητα"
                      value={ing.quantity}
                      min={0}
                      onChange={(e) =>
                        handleIngredientChange(index, 'quantity', e.target.value)
                      }
                      className="p-2 w-full rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 text-sm text-right"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <select
                      value={ing.unit}
                      onChange={(e) =>
                        handleIngredientChange(index, 'unit', e.target.value)
                      }
                      className="p-2 w-full rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 text-sm"
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="L">L</option>
                      <option value="τεμ">τεμ</option>
                      <option value="κ.γ.">κ.γ.</option>
                      <option value="κ.σ.">κ.σ.</option>
                    </select>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-center justify-center">
                    <label className="inline-flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-400">
                      <input
                        type="checkbox"
                        checked={ing.isSubRecipe}
                        onChange={(e) =>
                          handleIngredientChange(index, 'isSubRecipe', e.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300 text-brand-secondary focus:ring-brand-primary"
                        title="Είναι Υποπαρασκευή;"
                      />
                      <span className="hidden lg:inline">Υποπαρ.</span>
                    </label>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-50"
                      disabled={recipe.ingredients.length <= 1}
                    >
                      <Icon name="trash-2" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addIngredient}
              className="mt-4 flex items-center gap-2 text-sm font-semibold text-brand-secondary hover:underline"
            >
              <Icon name="plus" className="w-4 h-4" /> Προσθήκη Συστατικού
            </button>
          </div>

          {/* Εκτέλεση */}
          <div className="p-6 bg-light-bg/50 dark:bg-dark-bg/30 rounded-lg	border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Icon name="list-ordered" className="w-5 h-5 text-brand-yellow" />
                Εκτέλεση
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Χρησιμοποίησε ενότητες για μεγάλα παρασκευάσματα (π.χ. &quot;Κιμάς&quot;,
                &quot;Σάλτσα&quot;).
              </span>
            </div>

            <div className="space-y-4">
              {recipe.steps.map((step, index) => {
                let displayNumber: number | null = null;
                if (step.type === 'step') {
                  visibleStepCounter += 1;
                  displayNumber = visibleStepCounter;
                }

                return (
                  <div key={step.id} className="flex items-start gap-2">
                    {step.type === 'step' && (
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-yellow text-brand-dark font-bold text-xs mt-1 flex-shrink-0">
                        {displayNumber}.
                      </span>
                    )}
                    {step.type === 'heading' ? (
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          <Icon name="bookmark" className="w-3 h-3" />
                          Ενότητα συνταγής
                        </div>
                        <input
                          type="text"
                          value={step.content}
                          onChange={(e) => handleStepChange(index, e.target.value)}
                          placeholder="Όνομα Ενότητας (π.χ. Κιμάς, Σάλτσα, Γαρνιτούρα)"
                          className="flex-1 p-2 rounded bg-light-bg dark:bg-dark-bg border-0 border-b-2 border-gray-300 dark:border-gray-600 font-bold text-lg focus:ring-0 focus:border-brand-primary"
                          required
                        />
                      </div>
                    ) : (
                      <textarea
                        value={step.content}
                        onChange={(e) => handleStepChange(index, e.target.value)}
                        rows={2}
                        placeholder="Περιέγραψε αναλυτικά το βήμα εκτέλεσης..."
                        className="flex-1 p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                        required
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50"
                      disabled={recipe.steps.length <= 1}
                    >
                      <Icon name="trash-2" className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-4">
              <button
                type="button"
                onClick={() => addStep('step')}
                className="flex items-center gap-2 text-sm font-semibold text-brand-secondary hover:underline"
              >
                <Icon name="plus" className="w-4 h-4" /> Προσθήκη Βήματος
              </button>
              <button
                type="button"
                onClick={() => addStep('heading')}
                className="flex items-center gap-2 text-sm font-semibold text-brand-secondary hover:underline"
              >
                <Icon name="plus" className="w-4 h-4" /> Προσθήκη Ενότητας
              </button>
            </div>
          </div>

          {/* Αλλεργιογόνα */}
          <div className="p-6 bg-light-bg/50 dark:bg-dark-bg/30 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Icon name="alert-circle" className="w-5 h-5 text-brand-yellow" />
                Αλλεργιογόνα
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Εμφανίζονται στις ετικέτες και στην πληροφόρηση πελατών.
              </span>
            </div>
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
              })}
            </div>
          </div>
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
