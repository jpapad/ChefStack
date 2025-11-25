import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
// Fix: Corrected RecipeCategory and RECIPE_CATEGORIES imports to their Key-based counterparts.
import { Recipe, RecipeCategoryKey, RECIPE_CATEGORY_KEYS, Allergen, ALLERGENS_LIST, Unit } from '../../types';
import { Icon } from './Icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface ImportUrlModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRecipeParsed: (recipeData: Partial<Recipe>) => void;
}

const ImportUrlModal: React.FC<ImportUrlModalProps> = ({ isOpen, onClose, onRecipeParsed }) => {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImport = async () => {
        if (!url.trim()) {
            setError('Παρακαλώ εισάγετε ένα έγκυρο URL.');
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            if (!process.env.API_KEY) {
                throw new Error("API_KEY is not configured.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

            // Define the structure inside the prompt, since responseSchema is not allowed with googleSearch tool.
            const jsonStructure = `{
    "name": "string (The recipe's title in Greek)",
    "description": "string (A short, appealing description in Greek)",
    "category": "string (One of: ${RECIPE_CATEGORY_KEYS.join(', ')})",
    "prepTime": "integer (Preparation time in minutes)",
    "cookTime": "integer (Cooking time in minutes)",
    "servings": "integer (Number of servings)",
    "ingredients": [
        { "name": "string (Ingredient name in Greek)", "quantity": "number", "unit": "string (e.g., g, kg, ml, τεμ, κ.σ.)" }
    ],
    "steps": [
        "string (Cooking step in Greek)"
    ],
    "allergens": [
        "string (An allergen from the list: ${ALLERGENS_LIST.join(', ')})"
    ]
}`;

            const prompt = `From the webpage at this URL: ${url}\n\nAnalyze the recipe on the page and extract its details. Your response MUST be ONLY a single, valid JSON object. Do not include any text, markdown, or explanations before or after the JSON. The JSON object must follow this structure:\n${jsonStructure}\n\nAll text content (names, descriptions, ingredients, steps) MUST be in Greek.`;

            const genAIResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    tools: [{googleSearch: {}}],
                },
            });

            let resultJson = genAIResponse.text;

            // Clean up the response to get only the JSON part
            const jsonMatch = resultJson.match(/```(?:json)?([\s\S]*?)```/);
            if (jsonMatch && jsonMatch[1]) {
                resultJson = jsonMatch[1];
            } else {
                const startIndex = resultJson.indexOf('{');
                const endIndex = resultJson.lastIndexOf('}');
                if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
                    resultJson = resultJson.substring(startIndex, endIndex + 1);
                }
            }
            
            let parsedData;
            try {
                parsedData = JSON.parse(resultJson);
            } catch (e) {
                 console.error('Failed to parse JSON from AI response:', e, 'Raw response:', resultJson);
                 throw new Error('Η AI δεν επέστρεψε μια έγκυρη μορφή συνταγής. Η δομή του ιστότοπου μπορεί να είναι πολύ περίπλοκη.');
            }
            

            // Sanitize and format data for Recipe type
            const recipeData: Partial<Recipe> = {
                name: parsedData.name || '',
                description: parsedData.description || '',
                // Fix: Updated category validation to use RECIPE_CATEGORY_KEYS and the correct 'other' fallback key.
                category: RECIPE_CATEGORY_KEYS.includes(parsedData.category) ? parsedData.category : 'other',
                prepTime: parsedData.prepTime || 0,
                cookTime: parsedData.cookTime || 0,
                servings: parsedData.servings || 1,
                ingredients: (parsedData.ingredients || []).map((ing: any, i: number) => ({
                    id: `ing${Date.now()}${i}`,
                    name: ing.name || '',
                    quantity: ing.quantity || 0,
                    unit: ing.unit || 'g' as Unit,
                    isSubRecipe: false,
                })),
                steps: (parsedData.steps || []).map((step: string, i: number) => ({
                    id: `step${Date.now()}${i}`,
                    type: 'step',
                    content: step,
                })),
                allergens: (parsedData.allergens || []).filter((a: string) => ALLERGENS_LIST.includes(a as Allergen)),
            };

            onRecipeParsed(recipeData);

        } catch (err: any) {
            console.error('Import failed:', err);
            const errorMessage = err.message.includes("API_KEY")
                ? "Σφάλμα διαμόρφωσης: Το κλειδί API δεν έχει ρυθμιστεί."
                : err.message || 'Παρουσιάστηκε ένα απρόσμενο σφάλμα κατά την εισαγωγή. Ο ιστότοπος μπορεί να μην είναι προσβάσιμος ή η συνταγή να μην έχει αναγνωρίσιμη μορφή.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Icon name="link" className="w-5 h-5 text-brand-yellow" />
                        Εισαγωγή Συνταγής από URL
                    </DialogTitle>
                    <DialogDescription>
                        Αυτή η λειτουργία χρησιμοποιεί την αναζήτηση Google για να αναλύσει τη συνταγή
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
                            {error}
                        </div>
                    )}
                    
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center min-h-[150px]">
                            <Icon name="loader-2" className="w-12 h-12 text-brand-yellow animate-spin" />
                            <p className="mt-4 text-muted-foreground">Γίνεται ανάλυση της συνταγής...</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="recipe-url">Επικολλήστε το URL της συνταγής</Label>
                            <Input
                                id="recipe-url"
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://..."
                                required
                            />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Άκυρο
                    </Button>
                    <Button
                        type="button"
                        onClick={handleImport}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Icon name="loader-2" className="animate-spin w-4 h-4 mr-2" />
                        ) : (
                            <Icon name="link" className="w-4 h-4 mr-2" />
                        )}
                        Εισαγωγή
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      );
};

export default ImportUrlModal;
