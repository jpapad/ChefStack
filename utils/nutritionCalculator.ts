import { Recipe, NutritionInfo, Ingredient } from '../types';
import { findNutritionData, convertToGrams } from '../data/nutritionDatabase';

/**
 * Calculate nutritional information for a recipe based on its ingredients
 * Returns null if no ingredients have matching nutrition data
 */
export const calculateRecipeNutrition = (recipe: Recipe): NutritionInfo | null => {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalSugar = 0;
  let totalSodium = 0;
  let foundAnyData = false;

  for (const ingredient of recipe.ingredients) {
    // Skip sub-recipes for now (could be enhanced to recursively calculate)
    if (ingredient.isSubRecipe) continue;

    const nutritionData = findNutritionData(ingredient.name);
    if (!nutritionData) continue;

    foundAnyData = true;

    // Convert ingredient quantity to grams
    const grams = convertToGrams(
      ingredient.quantity,
      ingredient.unit,
      nutritionData.density
    );

    // Calculate nutrition for this ingredient (data is per 100g)
    const factor = grams / 100;
    totalCalories += nutritionData.nutrition.calories * factor;
    totalProtein += nutritionData.nutrition.protein * factor;
    totalCarbs += nutritionData.nutrition.carbs * factor;
    totalFat += nutritionData.nutrition.fat * factor;
    if (nutritionData.nutrition.fiber) totalFiber += nutritionData.nutrition.fiber * factor;
    if (nutritionData.nutrition.sugar) totalSugar += nutritionData.nutrition.sugar * factor;
    if (nutritionData.nutrition.sodium) totalSodium += nutritionData.nutrition.sodium * factor;
  }

  if (!foundAnyData) return null;

  // Divide by servings to get per-serving values
  const servings = recipe.servings || 1;

  return {
    calories: totalCalories / servings,
    protein: totalProtein / servings,
    carbs: totalCarbs / servings,
    fat: totalFat / servings,
    fiber: totalFiber > 0 ? totalFiber / servings : undefined,
    sugar: totalSugar > 0 ? totalSugar / servings : undefined,
    sodium: totalSodium > 0 ? totalSodium / servings : undefined,
    isCalculated: true
  };
};

/**
 * Calculate total nutrition for entire recipe (all servings combined)
 */
export const calculateTotalRecipeNutrition = (recipe: Recipe): NutritionInfo | null => {
  const perServing = calculateRecipeNutrition(recipe);
  if (!perServing) return null;

  const servings = recipe.servings || 1;

  return {
    calories: perServing.calories * servings,
    protein: perServing.protein * servings,
    carbs: perServing.carbs * servings,
    fat: perServing.fat * servings,
    fiber: perServing.fiber ? perServing.fiber * servings : undefined,
    sugar: perServing.sugar ? perServing.sugar * servings : undefined,
    sodium: perServing.sodium ? perServing.sodium * servings : undefined,
    isCalculated: true
  };
};

/**
 * Get ingredient coverage percentage (how many ingredients have nutrition data)
 */
export const getNutritionCoverage = (recipe: Recipe): number => {
  if (recipe.ingredients.length === 0) return 0;

  const ingredientsWithData = recipe.ingredients.filter(ingredient => {
    if (ingredient.isSubRecipe) return false;
    return findNutritionData(ingredient.name) !== null;
  }).length;

  const totalIngredients = recipe.ingredients.filter(i => !i.isSubRecipe).length;
  if (totalIngredients === 0) return 0;

  return (ingredientsWithData / totalIngredients) * 100;
};

/**
 * Get list of ingredients without nutrition data (for user feedback)
 */
export const getMissingNutritionIngredients = (recipe: Recipe): string[] => {
  return recipe.ingredients
    .filter(ingredient => !ingredient.isSubRecipe && !findNutritionData(ingredient.name))
    .map(ingredient => ingredient.name);
};
