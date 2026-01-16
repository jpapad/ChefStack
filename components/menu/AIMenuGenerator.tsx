import React, { useState } from 'react';
import { Recipe, Allergen, ALLERGENS_LIST, RECIPE_CATEGORY_KEYS } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { callGemini } from '../../src/lib/ai/callGemini';

interface AIMenuGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    recipes: Omit<Recipe, 'id' | 'teamId'>[],
    menuDetails: { name: string; description: string; pax: number }
  ) => void;
}

// 👉 Βάλε εδώ το ID του μοντέλου από τη λίστα σου
const MODEL_ID = 'gemini-flash-latest';

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
      const fullPrompt = `
Είσαι Executive Chef. Θέλω να δημιουργήσεις ΕΝΑ μενού μπουφέ στα Ελληνικά με βάση την παρακάτω περιγραφή:
"${prompt}"

Το μενού είναι για περίπου ${pax} άτομα.

Θέλω:
- 1 ορεκτικό
- 2 σαλάτες
- 2 κυρίως πιάτα
- 1 επιδόρπιο

Για κάθε συνταγή ΔΩΣΕ:
- name: τίτλος στα Ελληνικά
- name_en: τίτλος στα Αγγλικά
- description: σύντομη περιγραφή στα Ελληνικά
- category: ένα από τα εξής: ${RECIPE_CATEGORY_KEYS.join(', ')}
- prepTime: χρόνος προετοιμασίας σε λεπτά (αριθμός)
- cookTime: χρόνος μαγειρέματος σε λεπτά (αριθμός)
- servings: πόσες μερίδες βγάζει η συνταγή
- ingredients: λίστα αντικειμένων { name, quantity, unit }
- steps: λίστα STRING με τα βήματα στα Ελληνικά
- allergens: λίστα από αλλεργιογόνα, επιλέγοντας μόνο από: ${ALLERGENS_LIST.join(', ')}

ΕΠΙΣΤΡΕΨΕ ΑΠΟΚΛΕΙΣΤΙΚΑ ΕΓΚΥΡΟ JSON (ΧΩΡΙΣ κείμενο απ' έξω, ΧΩΡΙΣ markdown), της μορφής:

{
  "menuName": "string",
  "menuDescription": "string",
  "recipes": [
    {
      "name": "string",
      "name_en": "string",
      "description": "string",
      "category": "string",
      "prepTime": number,
      "cookTime": number,
      "servings": number,
      "ingredients": [
        { "name": "string", "quantity": number, "unit": "string" }
      ],
      "steps": ["string", "string", ...],
      "allergens": ["string", ...]
    }
  ]
}
`;

      // Call via Supabase Edge Function proxy
      const response = await callGemini({
        feature: 'menu_generator',
        prompt: fullPrompt,
        model: 'gemini-2.0-flash', // Using consistent model (was gemini-flash-latest)
      });

      if (response.error) {
        throw new Error(response.error);
      }

      let text = response.text || '';

      // Αν τυχόν βάλει ```json ``` γύρω γύρω, τα αφαιρούμε
      text = text.replace(/```json|```/g, '').trim();

      const parsedData = JSON.parse(text);

      if (!parsedData.menuName || !parsedData.recipes || parsedData.recipes.length === 0) {
        throw new Error('The AI response was missing required menu data.');
      }

      const recipesToCreate: Omit<Recipe, 'id' | 'teamId'>[] = parsedData.recipes.map(
        (r: any, idx: number) => ({
          name: r.name || '',
          name_en: r.name_en || '',
          description: r.description || '',
          imageUrl: '',
          category: (RECIPE_CATEGORY_KEYS as string[]).includes(r.category)
            ? (r.category as Recipe['category'])
            : 'other',
          prepTime: Number(r.prepTime) || 0,
          cookTime: Number(r.cookTime) || 0,
          servings: Number(r.servings) || 10,
          ingredients: (r.ingredients || []).map((ing: any, i: number) => ({
            id: `ing${Date.now()}_${idx}_${i}`,
            name: ing.name || '',
            quantity: Number(ing.quantity) || 0,
            unit: ing.unit || 'g',
            isSubRecipe: false,
          })),
          steps: (r.steps || []).map((step: string, i: number) => ({
            id: `step${Date.now()}_${idx}_${i}`,
            type: 'step' as const,
            content: step,
          })),
          allergens: (r.allergens || []).filter((a: string) =>
            ALLERGENS_LIST.includes(a as Allergen)
          ) as Allergen[],
        })
      );

      const menuDetails = {
        name: parsedData.menuName as string,
        description: (parsedData.menuDescription as string) || '',
        pax,
      };

      onSave(recipesToCreate, menuDetails);
      onClose();
    } catch (e: any) {
      console.error('AI Menu Generation failed:', e);

      const rawMessage =
        e?.message ||
        (e?.toString ? e.toString() : '') ||
        'Άγνωστο σφάλμα από το Gemini API.';

      if (rawMessage.includes('Unexpected token') || rawMessage.includes('JSON')) {
        setError(
          'Το AI επέστρεψε μη έγκυρο JSON. Δοκίμασε ξανά με πιο συγκεκριμένη περιγραφή ή ξαναπροσπάθησε.'
        );
        return;
      }

      if (
        rawMessage.toLowerCase().includes('api key') ||
        rawMessage.toLowerCase().includes('permission') ||
        rawMessage.toLowerCase().includes('unauthorized') ||
        rawMessage.includes('401') ||
        rawMessage.includes('403')
      ) {
        setError(
          'Σφάλμα αυθεντικοποίησης στο Gemini API. Έλεγξε ότι το VITE_GEMINI_API_KEY είναι σωστό, έχει πρόσβαση στο Gemini και ότι έχεις ενεργοποιήσει billing/usage.'
        );
        return;
      }

      if (rawMessage.includes('429')) {
        setError('Το Gemini API έκανε rate limit (429). Δοκίμασε ξανά μετά από λίγο.');
        return;
      }

      setError(`Σφάλμα από Gemini: ${rawMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="sparkles" className="w-6 h-6 text-purple-500" />
            Δημιουργία Μενού με AI
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[250px]">
            <Icon name="loader-2" className="w-16 h-16 text-brand-yellow animate-spin" />
            <p className="mt-4 text-lg font-semibold text-muted-foreground">
              Η AI δημιουργεί το μενού σας...
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-y-auto max-h-[60vh] space-y-4 py-4">{error && (
                <p className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-sm p-3 rounded-lg">
                  {error}
                </p>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Περιγράψτε το θέμα ή το στυλ του μενού
                </label>
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
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
              >
                {t('cancel')}
              </Button>
              <Button
                type="button"
                onClick={handleGenerate}
                className="bg-brand-dark text-white hover:opacity-90 gap-2"
              >
                <Icon name="sparkles" className="w-5 h-5" />
                Δημιουργία
              </Button>
            </footer>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AIMenuGenerator;
