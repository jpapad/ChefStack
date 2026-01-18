import { Recipe, RecipeVersion } from '../types';

/**
 * Δημιουργεί αντίγραφο συνταγής με νέο ID και καθαρό state
 */
export const duplicateRecipe = (recipe: Recipe, userId: string): Omit<Recipe, 'id'> => {
  return {
    ...recipe,
    name: `${recipe.name} (Αντίγραφο)`,
    name_en: recipe.name_en ? `${recipe.name_en} (Copy)` : '',
    ratings: [],
    versions: [],
    currentVersion: 1,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: userId,
    // Νέα IDs για ingredients και steps
    ingredients: recipe.ingredients.map(ing => ({
      ...ing,
      id: `ing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    })),
    steps: recipe.steps.map(step => ({
      ...step,
      id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }))
  };
};

/**
 * Δημιουργεί νέα έκδοση συνταγής
 */
export const createRecipeVersion = (
  recipe: Recipe,
  changes: string[],
  userId: string,
  comment?: string
): RecipeVersion => {
  const versionRecord: RecipeVersion = {
    id: `ver_${Date.now()}`,
    recipeId: recipe.id,
    version: recipe.currentVersion || 1,
    changes, // Array of change descriptions
    changedBy: userId,
    changedAt: new Date().toISOString(),
    comment
  };

  return versionRecord;
};

/**
 * Έξυπνη στρογγυλοποίηση ποσοτήτων για καλύτερη usability
 */
export const smartRound = (value: number, unit: string): number => {
  // Για αυγά, τεμάχια κτλ - στρογγυλοποίηση σε ακέραιο
  if (unit === 'τεμ') {
    return Math.round(value);
  }
  
  // Για κουταλιές - στρογγυλοποίηση σε 0.5
  if (unit === 'κ.γ.' || unit === 'κ.σ.') {
    return Math.round(value * 2) / 2;
  }
  
  // Για γραμμάρια/ml
  if (unit === 'g' || unit === 'ml') {
    if (value < 10) return Math.round(value * 2) / 2; // 0.5 precision
    if (value < 100) return Math.round(value / 5) * 5; // 5g precision
    return Math.round(value / 10) * 10; // 10g precision
  }
  
  // Για κιλά/λίτρα
  if (unit === 'kg' || unit === 'L') {
    return Math.round(value * 100) / 100; // 2 decimal places
  }
  
  return Math.round(value * 10) / 10; // default 1 decimal
};

/**
 * Υπολογίζει difficulty βάσει χρόνου και πολυπλοκότητας
 */
export const calculateDifficulty = (recipe: Recipe): Recipe['difficulty'] => {
  const totalTime = recipe.prepTime + recipe.cookTime;
  const ingredientCount = recipe.ingredients.length;
  const stepCount = recipe.steps.filter(s => s.type === 'step').length;
  
  // Simple heuristic
  const complexityScore = (totalTime / 10) + (ingredientCount / 2) + (stepCount / 3);
  
  if (complexityScore < 10) return 'easy';
  if (complexityScore < 20) return 'medium';
  return 'hard';
};

/**
 * Προτεινόμενα tags βάσει συνταγής
 */
export const suggestTags = (recipe: Recipe): string[] => {
  const tags: string[] = [];
  
  const totalTime = recipe.prepTime + recipe.cookTime;
  if (totalTime <= 30) tags.push('γρήγορο', 'quick');
  if (totalTime >= 120) tags.push('αργό', 'slow-cooked');
  
  // Category-based tags
  if (recipe.category === 'dessert') tags.push('γλυκό', 'dessert');
  if (recipe.category === 'appetizer') tags.push('ορεκτικό', 'starter');
  
  // Allergen-based tags
  if (!recipe.allergens || recipe.allergens.length === 0) {
    tags.push('χωρίς-αλλεργιογόνα', 'allergen-free');
  }
  if (!recipe.allergens?.includes('Gluten')) {
    tags.push('χωρίς-γλουτένη', 'gluten-free');
  }
  if (!recipe.allergens?.includes('Milk') && !recipe.allergens?.includes('Eggs')) {
    tags.push('vegan-option');
  }
  
  // Price-based
  if (recipe.price && recipe.price < 5) tags.push('οικονομικό', 'budget-friendly');
  
  return tags;
};

/**
 * Εξαγωγή δημοφιλών tags από συλλογή συνταγών
 */
export const extractPopularTags = (recipes: Recipe[], limit: number = 20): { tag: string; count: number }[] => {
  const tagCounts = new Map<string, number>();
  
  recipes.forEach(recipe => {
    recipe.tags?.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });
  
  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};
