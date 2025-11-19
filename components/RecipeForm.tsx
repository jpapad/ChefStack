import React, { useState, useRef } from 'react';
import {
  Recipe,
  Ingredient,
  Allergen,
  ALLERGENS_LIST,
  RecipeCategoryKey,
  RECIPE_CATEGORY_KEYS,
  Unit,
  RecipeStep,
} from '../types';
import { Icon } from './common/Icon';
import AIImageModal from './common/AIImageModal';

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
    { id: `ing${Date.now()}`, name: '', quantity: 0, unit: 'g', isSubRecipe: false },
  ],
  steps: [{ id: `step${Date.now()}`, type: 'step', content: '' }],
  allergens: [],
  teamId: '',
  yield: { quantity: 1, unit: 'kg' },
};

const RecipeForm: React.FC<RecipeFormProps> = ({
  onSave,
  onCancel,
  recipeToEdit,
  allRecipes,
  withApiKeyCheck,
}) => {
  // αρχικο state μόνο στο mount
  const [recipe, setRecipe] = useState<Omit<Recipe, 'id'> | Recipe>(() => {
    if (recipeToEdit) {
      return {
        ...initialRecipeState,
        ...recipeToEdit,
        name_en: recipeToEdit.name_en || '',
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
          [field]: field === 'quantity' ? parseFloat(value) || 0 : value,
        },
      }));
    } else {
      setRecipe((prev) => ({
        ...prev,
        [name]: numericFields.includes(name) ? parseFloat(value) || 0 : value,
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
      alert('Το αρχείο είναι πολύ μεγάλο. Παρακαλώ επιλέξτε μια εικόνα κάτω από 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setRecipe((prev) => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.onerror = () => {
      console.error('Πρόβλημα κατά την ανάγνωση του αρχείου.');
      alert('Δεν ήταν δυνατή η ανάγνωση του αρχείου εικόνας.');
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
        recipeId: selectedRecipe.id,
      };
      setRecipe((prev) => ({ ...prev, ingredients: newIngredients }));
    }
  };

  const addIngredient = () => {
    setRecipe((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { id: `ing${Date.now()}`, name: '', quantity: 0, unit: 'g', isSubRecipe: false },
      ],
    }));
  };

  const removeIngredient = (index: number) => {
    if (recipe.ingredients.length > 1) {
      setRecipe((prev) => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index),
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
        steps: prev.steps.filter((_, i) => i !== index),
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
    if (!recipe.name || recipe.ingredients.some((i) => !i.name) || recipe.steps.some((s) => !s.content)) {
      alert('Please fill in all required fields (Recipe Name, Ingredient Names, and Steps).');
      return;
    }
    onSave(recipe);
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto bg-light-card dark:bg-dark-card">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
            <h2 className="text-3xl font-extrabold">
              {recipeToEdit ? 'Επεξεργασία Συνταγής' : 'Δημιουργία Νέας Συνταγής'}
            </h2>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold"
              >
                Άκυρο
              </button>
              <button
                type="submit"
                className="py-2 px-6 rounded-lg bg-brand-primary text-white hover:bg-brand-secondary font-semibold"
              >
                Αποθήκευση
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="p-6 bg-light-bg/50 dark:bg-dark-bg/30 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Βασικές Πληροφορίες</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Όνομα Συνταγής (Ελληνικά) */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  Όνομα Συνταγής (Ελληνικά)
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
                <label
                  htmlFor="name_en"
                  className="block text-sm font-medium mb-1"
                >
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
                <label
                  htmlFor="category"
                  className="block text-sm font-medium mb-1"
                >
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
                <div className="mt-1 flex justify-center items-center w-full h-48 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-2 relative text-center">
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
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                        <button
                          type="button"
                          onClick={openAiImageModal}
                          title="Edit with AI"
                          className="text-white p-2 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors"
                        >
                          <Icon name="sparkles" className="w-6 h-6" />
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          title="Remove image"
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
                        <Icon name="sparkles" className="w-4 h-4" /> Δημιουργία
                        με AI
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Περιγραφή */}
              <div className="col-span-1 md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-1"
                >
                  Περιγραφή
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={recipe.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                ></textarea>
              </div>

              {/* Χρόνοι */}
              <div>
                <label
                  htmlFor="prepTime"
                  className="block text-sm font-medium mb-1"
                >
                  Χρόνος Προετοιμασίας (λεπτά)
                </label>
                <input
                  type="number"
                  id="prepTime"
                  name="prepTime"
                  value={recipe.prepTime}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="cookTime"
                  className="block text-sm font-medium mb-1"
                >
                  Χρόνος Μαγειρέματος (λεπτά)
                </label>
                <input
                  type="number"
                  id="cookTime"
                  name="cookTime"
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
                      value={recipe.yield?.quantity || 1}
                      onChange={handleChange}
                      className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                    />
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
                    <label
                      htmlFor="servings"
                      className="block text-sm font-medium mb-1"
                    >
                      Μερίδες
                    </label>
                    <input
                      type="number"
                      id="servings"
                      name="servings"
                      value={recipe.servings}
                      onChange={handleChange}
                      className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 focus:ring-brand-primary focus:border-brand-primary"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium mb-1"
                    >
                      Τιμή Πώλησης (€)
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      step="0.01"
                      value={recipe.price || ''}
                      onChange={handleChange}
                      className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 focus:ring-brand-primary focus:border-brand-primary"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Ingredients */}
          <div className="p-6 bg-light-bg/50 dark:bg-dark-bg/30 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Συστατικά</h3>
            <div className="space-y-3">
              {recipe.ingredients.map((ing, index) => (
                <div key={ing.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6">
                    {ing.isSubRecipe ? (
                      <select
                        value={ing.recipeId || ''}
                        onChange={(e) =>
                          handleSubRecipeSelect(index, e.target.value)
                        }
                        className="p-2 w-full rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
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
                        placeholder="Όνομα"
                        value={ing.name}
                        onChange={(e) =>
                          handleIngredientChange(index, 'name', e.target.value)
                        }
                        className="p-2 w-full rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                        required
                      />
                    )}
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Ποσότητα"
                      value={ing.quantity}
                      onChange={(e) =>
                        handleIngredientChange(index, 'quantity', e.target.value)
                      }
                      className="p-2 w-full rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      value={ing.unit}
                      onChange={(e) =>
                        handleIngredientChange(index, 'unit', e.target.value)
                      }
                      className="p-2 w-full rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
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
                  <div className="col-span-1 flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={ing.isSubRecipe}
                      onChange={(e) =>
                        handleIngredientChange(
                          index,
                          'isSubRecipe',
                          e.target.checked
                        )
                      }
                      className="h-5 w-5 rounded border-gray-300 text-brand-secondary focus:ring-brand-primary"
                      title="Είναι Υποπαρασκευή;"
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50"
                      disabled={recipe.ingredients.length <= 1}
                    >
                      <Icon name="trash-2" className="w-5 h-5" />
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

          {/* Steps */}
          <div className="p-6 bg-light-bg/50 dark:bg-dark-bg/30 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Εκτέλεση</h3>
            <div className="space-y-4">
              {recipe.steps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-2">
                  {step.type === 'step' && (
                    <span className="font-bold text-lg text-gray-400 pt-2">
                      {index + 1}.
                    </span>
                  )}
                  {step.type === 'heading' ? (
                    <input
                      type="text"
                      value={step.content}
                      onChange={(e) =>
                        handleStepChange(index, e.target.value)
                      }
                      placeholder="Όνομα Ενότητας (π.χ. Κιμάς)"
                      className="flex-1 p-2 rounded bg-light-bg dark:bg-dark-bg border-0 border-b-2 border-gray-300 dark:border-gray-600 font-bold text-lg focus:ring-0 focus:border-brand-primary"
                      required
                    />
                  ) : (
                    <textarea
                      value={step.content}
                      onChange={(e) =>
                        handleStepChange(index, e.target.value)
                      }
                      rows={2}
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
              ))}
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

          {/* Allergens */}
          <div className="p-6 bg-light-bg/50 dark:bg-dark-bg/30 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Αλλεργιογόνα</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ALLERGENS_LIST.map((allergen) => (
                <label
                  key={allergen}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={recipe.allergens.includes(allergen)}
                    onChange={() => handleAllergenChange(allergen)}
                    className="h-5 w-5 rounded border-gray-300 text-brand-secondary focus:ring-brand-primary"
                  />
                  <span>{allergen}</span>
                </label>
              ))}
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
