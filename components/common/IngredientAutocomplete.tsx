import React, { useState, useEffect, useRef } from 'react';
import { Ingredient, Unit, IngredientLibrary, ALLERGENS_LIST } from '../../types';
import { Icon } from './Icon';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from './Badge';

interface IngredientAutocompleteProps {
  ingredient: Ingredient;
  index: number;
  ingredientLibrary: IngredientLibrary[];
  allRecipes: { id: string; name: string; name_en: string }[];
  onChange: (index: number, field: keyof Ingredient, value: any) => void;
  onRemove: (index: number) => void;
  canMove: { up: boolean; down: boolean };
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const COMMON_UNITS: Unit[] = ['g', 'kg', 'ml', 'L', 'τεμ', 'κ.γ.', 'κ.σ.'];

export const IngredientAutocomplete: React.FC<IngredientAutocompleteProps> = ({
  ingredient,
  index,
  ingredientLibrary,
  allRecipes,
  onChange,
  onRemove,
  canMove,
  onMoveUp,
  onMoveDown
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<(IngredientLibrary | { id: string; name: string; type: 'recipe' })[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ingredient.name || ingredient.name.length < 2) {
      setFilteredSuggestions([]);
      return;
    }

    const query = ingredient.name.toLowerCase();
    
    // Filter ingredient library
    const matchingIngredients = ingredientLibrary.filter(
      lib => lib.name.toLowerCase().includes(query) || lib.name_en.toLowerCase().includes(query)
    );
    
    // Filter recipes for sub-recipes
    const matchingRecipes = allRecipes
      .filter(r => r.name.toLowerCase().includes(query) || r.name_en?.toLowerCase().includes(query))
      .map(r => ({ id: r.id, name: r.name, type: 'recipe' as const }));
    
    setFilteredSuggestions([...matchingIngredients, ...matchingRecipes]);
  }, [ingredient.name, ingredientLibrary, allRecipes]);

  const handleSuggestionClick = (suggestion: IngredientLibrary | { id: string; name: string; type: 'recipe' }) => {
    if ('type' in suggestion && suggestion.type === 'recipe') {
      // Sub-recipe
      onChange(index, 'name', suggestion.name);
      onChange(index, 'isSubRecipe', true);
      onChange(index, 'recipeId', suggestion.id);
      onChange(index, 'unit', 'g');
    } else {
      // Regular ingredient
      const lib = suggestion as IngredientLibrary;
      onChange(index, 'name', lib.name);
      onChange(index, 'unit', lib.defaultUnit);
      onChange(index, 'isSubRecipe', false);
      onChange(index, 'recipeId', undefined);
    }
    setShowSuggestions(false);
    setFilteredSuggestions([]);
  };

  return (
    <div className="relative p-4 bg-accent/30 rounded-lg border border-input space-y-3">
      {/* Move buttons */}
      <div className="absolute top-2 right-2 flex gap-1">
        {canMove.up && onMoveUp && (
          <button
            type="button"
            onClick={onMoveUp}
            className="p-1 hover:bg-accent rounded"
            title="Μετακίνηση πάνω"
          >
            <Icon name="arrow-up" className="w-4 h-4" />
          </button>
        )}
        {canMove.down && onMoveDown && (
          <button
            type="button"
            onClick={onMoveDown}
            className="p-1 hover:bg-accent rounded"
            title="Μετακίνηση κάτω"
          >
            <Icon name="arrow-down" className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1 hover:bg-destructive/10 text-destructive rounded"
          title="Διαγραφή"
        >
          <Icon name="trash-2" className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pr-20">
        {/* Ingredient Name with Autocomplete */}
        <div className="md:col-span-6 relative">
          <Label htmlFor={`ingredient-name-${index}`}>
            Υλικό {ingredient.isSubRecipe && <Badge variant="info" size="sm" className="ml-2">Υπο-συνταγή</Badge>}
          </Label>
          <Input
            ref={inputRef}
            id={`ingredient-name-${index}`}
            value={ingredient.name}
            onChange={(e) => {
              onChange(index, 'name', e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="π.χ. Αλάτι, Ντομάτα..."
            className="pr-8"
          />
          {ingredient.name && (
            <button
              type="button"
              onClick={() => {
                onChange(index, 'name', '');
                onChange(index, 'isSubRecipe', false);
                onChange(index, 'recipeId', undefined);
              }}
              className="absolute right-2 top-9 text-muted-foreground hover:text-foreground"
            >
              <Icon name="x" className="w-4 h-4" />
            </button>
          )}
          
          {/* Autocomplete suggestions */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-popover border border-border rounded-md shadow-lg">
              {filteredSuggestions.map((suggestion, idx) => {
                const isRecipe = 'type' in suggestion && suggestion.type === 'recipe';
                const lib = isRecipe ? null : (suggestion as IngredientLibrary);
                
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-3 py-2 text-left hover:bg-accent flex items-center justify-between gap-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Icon 
                        name={isRecipe ? 'book-open' : 'package'} 
                        className="w-4 h-4 flex-shrink-0 text-muted-foreground" 
                      />
                      <span className="truncate">{suggestion.name}</span>
                    </div>
                    {lib && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Badge variant="info" size="sm">{lib.category}</Badge>
                        <span className="text-xs text-muted-foreground">{lib.defaultUnit}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Quantity */}
        <div className="md:col-span-3">
          <Label htmlFor={`ingredient-qty-${index}`}>Ποσότητα</Label>
          <Input
            id={`ingredient-qty-${index}`}
            type="number"
            step="0.01"
            min="0"
            value={ingredient.quantity || ''}
            onChange={(e) => onChange(index, 'quantity', parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
        </div>

        {/* Unit */}
        <div className="md:col-span-3">
          <Label htmlFor={`ingredient-unit-${index}`}>Μονάδα</Label>
          <Select
            value={ingredient.unit}
            onValueChange={(value) => onChange(index, 'unit', value as Unit)}
          >
            <SelectTrigger id={`ingredient-unit-${index}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMMON_UNITS.map(unit => (
                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default IngredientAutocomplete;
