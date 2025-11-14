import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Recipe, Allergen, ALLERGENS_LIST, RECIPE_CATEGORY_KEYS } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

interface AIMenuGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipes: Omit<Recipe, 'id' | 'teamId'>[], menuDetails: { name: string, description: string, pax: number }) => void;
}

const AIMenuGenerator: React.FC<AIMenuGeneratorProps> = ({ isOpen, onClose, onSave }) => {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState('');
  const [pax, setPax] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please describe the menu you want to create.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY is not configured.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      
      const fullPrompt = `Create a complete, themed buffet menu in Greek based on the following description: "${prompt}".
The menu is for ${pax} people.
Generate 1 appetizer, 2 salads, 2 main courses, and 1 dessert.
For each recipe, provide a full professional recipe including name, description, category, prep time, cook time, servings (scaled appropriately for a buffet, so maybe for 10-20 people per batch), a complete list of ingredients with quantities and units, a full list of steps, and a list of any allergens.`;
      
      const response = await ai.models.generateContent({
          model: "gemini-2.5-pro",
          contents: fullPrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    menuName: { type: Type.STRING, description: "A creative name for the menu in Greek" },
                    menuDescription: { type: Type.STRING, description: "A short, appealing description for the menu in Greek" },
                    recipes: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "Recipe title in Greek" },
                                name_en: { type: Type.STRING, description: "Recipe title in English" },
                                description: { type: Type.STRING, description: "Short description in Greek" },
                                category: { type: Type.STRING, description: `One of: ${RECIPE_CATEGORY_KEYS.join(', ')}` },
                                prepTime: { type: Type.INTEGER, description: "Preparation time in minutes" },
                                cookTime: { type: Type.INTEGER, description: "Cooking time in minutes" },
                                servings: { type: Type.INTEGER, description: "Number of servings this batch produces" },
                                ingredients: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            name: { type: Type.STRING, description: "Ingredient name in Greek" },
                                            quantity: { type: Type.NUMBER },
                                            unit: { type: Type.STRING, description: "e.g., g, kg, ml, L, τεμ, κ.σ." },
                                        },
                                        required: ['name', 'quantity', 'unit']
                                    }
                                },
                                steps: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING, description: "A single cooking step in Greek" }
                                },
                                allergens: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING, description: `An allergen from the list: ${ALLERGENS_LIST.join(', ')}` }
                                }
                            },
                            required: ['name', 'name_en', 'description', 'category', 'prepTime', 'cookTime', 'servings', 'ingredients', 'steps', 'allergens']
                        }
                    }
                },
                required: ['menuName', 'menuDescription', 'recipes']
            }
          }
      });
      
      const resultJson = response.text;
      const parsedData = JSON.parse(resultJson);
      
      if (!parsedData.menuName || !parsedData.recipes || parsedData.recipes.length === 0) {
        throw new Error("The AI response was missing required menu data.");
      }
      
      // Convert to the required type
      const recipesToCreate: Omit<Recipe, 'id' | 'teamId'>[] = parsedData.recipes.map((r: any) => ({
          name: r.name || '',
          name_en: r.name_en || '',
          description: r.description || '',
          imageUrl: '', // Will be generated later
          category: RECIPE_CATEGORY_KEYS.includes(r.category) ? r.category : 'other',
          prepTime: r.prepTime || 0,
          cookTime: r.cookTime || 0,
          servings: r.servings || 10,
          ingredients: (r.ingredients || []).map((ing: any, i: number) => ({
              id: `ing${Date.now()}${i}`,
              name: ing.name || '',
              quantity: ing.quantity || 0,
              unit: ing.unit || 'g',
              isSubRecipe: false,
          })),
          steps: (r.steps || []).map((step: string, i: number) => ({
              id: `step${Date.now()}${i}`,
              type: 'step',
              content: step
          })),
          allergens: (r.allergens || []).filter((a: string) => ALLERGENS_LIST.includes(a as Allergen)),
      }));
      
      const menuDetails = {
          name: parsedData.menuName,
          description: parsedData.menuDescription || '',
          pax: pax,
      };

      onSave(recipesToCreate, menuDetails);

    } catch (e: any) {
      console.error("AI Menu Generation failed:", e);
      const errorMessage = e.message.includes("API_KEY")
          ? "Σφάλμα διαμόρφωσης: Το κλειδί API δεν έχει ρυθμιστεί."
          : "Failed to generate menu. The AI may have returned an invalid format or an error occurred. Please try again with a clearer prompt.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200/80 dark:border-gray-700/80">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Icon name="sparkles" className="w-6 h-6 text-purple-500"/>
            Δημιουργία Μενού με AI
          </h3>
          <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
            <Icon name="x" className="w-6 h-6" />
          </button>
        </header>
        {isLoading ? (
             <div className="p-10 flex flex-col items-center justify-center min-h-[250px]">
                <Icon name="loader-2" className="w-16 h-16 text-brand-yellow animate-spin"/>
                <p className="mt-4 text-lg font-semibold text-light-text-secondary dark:text-dark-text-secondary">Η AI δημιουργεί το μενού σας...</p>
            </div>
        ) : (
          <>
            <div className="p-6 space-y-4">
              {error && <p className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-sm p-3 rounded-lg">{error}</p>}
              <div>
                <label className="block text-sm font-medium mb-1">Περιγράψτε το θέμα ή το στυλ του μενού</label>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  rows={4}
                  className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                  placeholder="π.χ. 'Κλασικό ελληνικό κυριακάτικο γεύμα', 'Modern Mediterranean brunch', 'Χριστουγεννιάτικος μπουφές με διεθνείς γεύσεις'"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Αριθμός Ατόμων (PAX)</label>
                <input
                  type="number"
                  value={pax}
                  onChange={e => setPax(parseInt(e.target.value, 10) || 1)}
                  className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>
            <footer className="p-4 flex justify-end gap-4 bg-black/5 dark:bg-white/5 rounded-b-2xl">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 font-semibold">{t('cancel')}</button>
              <button type="button" onClick={handleGenerate} className="px-4 py-2 rounded-lg bg-brand-dark text-white hover:opacity-90 font-semibold flex items-center gap-2">
                <Icon name="sparkles" className="w-5 h-5"/>
                Δημιουργία
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};

export default AIMenuGenerator;
