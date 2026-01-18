import React, { useState, useMemo } from 'react';
import { Recipe, Ingredient } from '../../types';
import { Icon } from './Icon';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { smartRound } from '../../utils/recipeHelpers';
import { useTranslation } from '../../i18n';

interface SmartScalingProps {
  recipe: Recipe;
  currentServings: number;
  onServingsChange: (servings: number) => void;
  onApplySmartRound?: () => void;
}

export const SmartScaling: React.FC<SmartScalingProps> = ({
  recipe,
  currentServings,
  onServingsChange,
  onApplySmartRound
}) => {
  const { t } = useTranslation();
  const [scaleBy, setScaleBy] = useState<'servings' | 'ingredient'>('servings');
  const [selectedIngredient, setSelectedIngredient] = useState<string>('');
  const [targetQuantity, setTargetQuantity] = useState<number>(0);

  const scalingFactor = currentServings / recipe.servings;

  // Calculate smart rounded ingredients
  const smartScaledIngredients = useMemo(() => {
    return recipe.ingredients.map(ing => ({
      ...ing,
      originalQuantity: ing.quantity,
      scaledQuantity: ing.quantity * scalingFactor,
      smartRoundedQuantity: smartRound(ing.quantity * scalingFactor, ing.unit)
    }));
  }, [recipe.ingredients, scalingFactor]);

  // Calculate scaling factor if scaling by ingredient
  const ingredientBasedFactor = useMemo(() => {
    if (!selectedIngredient || !targetQuantity) return 1;
    
    const ingredient = recipe.ingredients.find(ing => ing.id === selectedIngredient);
    if (!ingredient || ingredient.quantity === 0) return 1;
    
    return targetQuantity / ingredient.quantity;
  }, [selectedIngredient, targetQuantity, recipe.ingredients]);

  const ingredientBasedServings = Math.round(recipe.servings * ingredientBasedFactor);

  const handleQuickScale = (multiplier: number) => {
    onServingsChange(Math.round(recipe.servings * multiplier));
  };

  const handleIngredientScale = () => {
    if (ingredientBasedFactor !== 1) {
      onServingsChange(ingredientBasedServings);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="scale" className="w-5 h-5 text-primary" />
          Έξυπνη Κλιμάκωση
        </CardTitle>
        <CardDescription>
          Προσάρμοσε τις ποσότητες με αυτόματη στρογγυλοποίηση
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scaling method tabs */}
        <div className="flex gap-2 p-1 bg-accent rounded-lg">
          <button
            onClick={() => setScaleBy('servings')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              scaleBy === 'servings'
                ? 'bg-white dark:bg-slate-800 shadow-sm'
                : 'hover:bg-accent/80'
            }`}
          >
            <Icon name="users" className="w-4 h-4 inline mr-1" />
            Ανά Μερίδες
          </button>
          <button
            onClick={() => setScaleBy('ingredient')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              scaleBy === 'ingredient'
                ? 'bg-white dark:bg-slate-800 shadow-sm'
                : 'hover:bg-accent/80'
            }`}
          >
            <Icon name="package" className="w-4 h-4 inline mr-1" />
            Ανά Υλικό
          </button>
        </div>

        {scaleBy === 'servings' ? (
          /* Scale by servings */
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="servings">
                Μερίδες (Αρχικά: {recipe.servings})
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="servings"
                  type="number"
                  min="1"
                  step="1"
                  value={currentServings}
                  onChange={(e) => onServingsChange(parseInt(e.target.value) || 1)}
                  className="flex-1"
                />
                {currentServings !== recipe.servings && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onServingsChange(recipe.servings)}
                  >
                    Reset
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Παράγοντας κλιμάκωσης: ×{scalingFactor.toFixed(2)}
              </p>
            </div>

            {/* Quick scale buttons */}
            <div className="space-y-2">
              <Label className="text-sm">Γρήγορη κλιμάκωση:</Label>
              <div className="flex flex-wrap gap-2">
                {[0.5, 2, 3, 4, 5, 10].map(multiplier => (
                  <Button
                    key={multiplier}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickScale(multiplier)}
                    disabled={currentServings === Math.round(recipe.servings * multiplier)}
                  >
                    ×{multiplier}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Scale by ingredient */
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ingredient-select">
                Διάλεξε υλικό:
              </Label>
              <select
                id="ingredient-select"
                value={selectedIngredient}
                onChange={(e) => setSelectedIngredient(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">-- Επιλέξτε υλικό --</option>
                {recipe.ingredients.map(ing => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name} ({ing.quantity} {ing.unit})
                  </option>
                ))}
              </select>
            </div>

            {selectedIngredient && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="target-quantity">
                    Πόσο έχεις διαθέσιμο;
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="target-quantity"
                      type="number"
                      min="0"
                      step="0.01"
                      value={targetQuantity || ''}
                      onChange={(e) => setTargetQuantity(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">
                      {recipe.ingredients.find(ing => ing.id === selectedIngredient)?.unit}
                    </span>
                  </div>
                </div>

                {targetQuantity > 0 && (
                  <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                    <p className="text-sm font-medium mb-2">Αποτέλεσμα:</p>
                    <p className="text-2xl font-bold">
                      {ingredientBasedServings} μερίδες
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Παράγοντας: ×{ingredientBasedFactor.toFixed(2)}
                    </p>
                    <Button
                      onClick={handleIngredientScale}
                      className="mt-3 w-full"
                      size="sm"
                    >
                      Εφαρμογή
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Smart rounding preview */}
        {currentServings !== recipe.servings && (
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                <Icon name="sparkles" className="w-4 h-4 inline mr-1 text-primary" />
                Έξυπνη Στρογγυλοποίηση
              </Label>
              {onApplySmartRound && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onApplySmartRound}
                >
                  Εφαρμογή
                </Button>
              )}
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2 text-sm">
              {smartScaledIngredients.slice(0, 5).map(ing => (
                <div
                  key={ing.id}
                  className="flex items-center justify-between gap-2 p-2 bg-accent/30 rounded"
                >
                  <span className="truncate flex-1">{ing.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-muted-foreground line-through">
                      {ing.scaledQuantity.toFixed(2)}
                    </span>
                    <span className="font-medium text-primary">
                      {ing.smartRoundedQuantity} {ing.unit}
                    </span>
                  </div>
                </div>
              ))}
              {smartScaledIngredients.length > 5 && (
                <p className="text-xs text-center text-muted-foreground">
                  ...και {smartScaledIngredients.length - 5} ακόμα
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartScaling;
