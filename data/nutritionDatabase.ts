// Nutritional data per 100g for common ingredients
// Sources: USDA FoodData Central, Hellenic Health Foundation

export interface NutritionData {
  calories: number; // kcal per 100g
  protein: number; // grams per 100g
  carbs: number; // grams per 100g
  fat: number; // grams per 100g
  fiber?: number; // grams per 100g
  sugar?: number; // grams per 100g
  sodium?: number; // mg per 100g
}

export interface IngredientNutrition {
  name: string;
  aliases: string[]; // Alternative names for matching
  nutrition: NutritionData;
  density?: number; // g/ml for liquids (to convert ml to g)
}

export const NUTRITION_DATABASE: IngredientNutrition[] = [
  // Proteins
  {
    name: 'chicken breast',
    aliases: ['κοτόπουλο', 'στήθος κοτόπουλου', 'chicken', 'κοτοπουλο'],
    nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 }
  },
  {
    name: 'beef',
    aliases: ['μοσχάρι', 'βοδινό', 'βοδινο', 'μοσχαρι'],
    nutrition: { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0 }
  },
  {
    name: 'pork',
    aliases: ['χοιρινό', 'χοιρινο'],
    nutrition: { calories: 242, protein: 27, carbs: 0, fat: 14, fiber: 0 }
  },
  {
    name: 'fish',
    aliases: ['ψάρι', 'ψαρι'],
    nutrition: { calories: 206, protein: 22, carbs: 0, fat: 12, fiber: 0 }
  },
  {
    name: 'salmon',
    aliases: ['σολομός', 'σολομος'],
    nutrition: { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 }
  },
  {
    name: 'eggs',
    aliases: ['αυγά', 'αυγα', 'αβγό', 'αβγο'],
    nutrition: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 }
  },
  
  // Dairy
  {
    name: 'milk',
    aliases: ['γάλα', 'γαλα'],
    nutrition: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0 },
    density: 1.03
  },
  {
    name: 'yogurt',
    aliases: ['γιαούρτι', 'γιαουρτι'],
    nutrition: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0 }
  },
  {
    name: 'cheese',
    aliases: ['τυρί', 'τυρι'],
    nutrition: { calories: 402, protein: 25, carbs: 1.3, fat: 33, fiber: 0 }
  },
  {
    name: 'feta',
    aliases: ['φέτα'],
    nutrition: { calories: 264, protein: 14, carbs: 4.1, fat: 21, fiber: 0 }
  },
  
  // Grains & Pasta
  {
    name: 'rice',
    aliases: ['ρύζι', 'ρυζι'],
    nutrition: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 }
  },
  {
    name: 'pasta',
    aliases: ['μακαρόνια', 'ζυμαρικά', 'μακαρονια', 'ζυμαρικα'],
    nutrition: { calories: 371, protein: 13, carbs: 75, fat: 1.5, fiber: 3.2 }
  },
  {
    name: 'bread',
    aliases: ['ψωμί', 'ψωμι'],
    nutrition: { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7 }
  },
  {
    name: 'flour',
    aliases: ['αλεύρι', 'αλευρι'],
    nutrition: { calories: 364, protein: 10, carbs: 76, fat: 1, fiber: 2.7 }
  },
  
  // Vegetables
  {
    name: 'tomato',
    aliases: ['ντομάτα', 'ντοματα'],
    nutrition: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 }
  },
  {
    name: 'onion',
    aliases: ['κρεμμύδι', 'κρεμμυδι'],
    nutrition: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 }
  },
  {
    name: 'garlic',
    aliases: ['σκόρδο', 'σκορδο'],
    nutrition: { calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1 }
  },
  {
    name: 'potato',
    aliases: ['πατάτα', 'πατατα'],
    nutrition: { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.1 }
  },
  {
    name: 'carrot',
    aliases: ['καρότο', 'καροτο'],
    nutrition: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 }
  },
  {
    name: 'lettuce',
    aliases: ['μαρούλι', 'μαρουλι'],
    nutrition: { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3 }
  },
  {
    name: 'cucumber',
    aliases: ['αγγούρι', 'αγγουρι'],
    nutrition: { calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5 }
  },
  {
    name: 'pepper',
    aliases: ['πιπεριά', 'πιπερια'],
    nutrition: { calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1 }
  },
  
  // Fruits
  {
    name: 'lemon',
    aliases: ['λεμόνι', 'λεμονι'],
    nutrition: { calories: 29, protein: 1.1, carbs: 9.3, fat: 0.3, fiber: 2.8 }
  },
  {
    name: 'apple',
    aliases: ['μήλο', 'μηλο'],
    nutrition: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 }
  },
  
  // Oils & Fats
  {
    name: 'olive oil',
    aliases: ['ελαιόλαδο', 'λάδι', 'ελαιολαδο', 'λαδι'],
    nutrition: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
    density: 0.92
  },
  {
    name: 'butter',
    aliases: ['βούτυρο', 'βουτυρο'],
    nutrition: { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0 }
  },
  
  // Legumes
  {
    name: 'beans',
    aliases: ['φασόλια', 'φασολια'],
    nutrition: { calories: 127, protein: 8.7, carbs: 23, fat: 0.5, fiber: 6.4 }
  },
  {
    name: 'lentils',
    aliases: ['φακές', 'φακες'],
    nutrition: { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9 }
  },
  
  // Nuts & Seeds
  {
    name: 'almonds',
    aliases: ['αμύγδαλα', 'αμυγδαλα'],
    nutrition: { calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5 }
  },
  {
    name: 'walnuts',
    aliases: ['καρύδια', 'καρυδια'],
    nutrition: { calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7 }
  },
  
  // Sugar & Sweeteners
  {
    name: 'sugar',
    aliases: ['ζάχαρη', 'ζαχαρη'],
    nutrition: { calories: 387, protein: 0, carbs: 100, fat: 0, fiber: 0, sugar: 100 }
  },
  {
    name: 'honey',
    aliases: ['μέλι', 'μελι'],
    nutrition: { calories: 304, protein: 0.3, carbs: 82, fat: 0, fiber: 0.2, sugar: 82 },
    density: 1.42
  },
  
  // Common ingredients
  {
    name: 'salt',
    aliases: ['αλάτι', 'αλατι'],
    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 38758 }
  },
  {
    name: 'water',
    aliases: ['νερό', 'νερο'],
    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    density: 1.0
  }
];

// Helper function to find nutrition data for an ingredient
export const findNutritionData = (ingredientName: string): IngredientNutrition | null => {
  const searchTerm = ingredientName.toLowerCase().trim();
  
  return NUTRITION_DATABASE.find(item => 
    item.name.toLowerCase() === searchTerm ||
    item.aliases.some(alias => alias.toLowerCase().includes(searchTerm) || searchTerm.includes(alias.toLowerCase()))
  ) || null;
};

// Convert quantity to grams (handles unit conversions)
export const convertToGrams = (quantity: number | null, unit: string | null, density?: number): number => {
  if (!quantity) return 0;
  if (!unit) return quantity; // Assume grams if no unit
  
  const unitLower = unit.toLowerCase();
  
  // Weight units
  if (unitLower === 'g' || unitLower === 'gr') return quantity;
  if (unitLower === 'kg') return quantity * 1000;
  if (unitLower === 'mg') return quantity / 1000;
  
  // Volume units (need density to convert to grams)
  if (unitLower === 'ml') return density ? quantity * density : quantity;
  if (unitLower === 'l') return density ? quantity * 1000 * density : quantity * 1000;
  if (unitLower === 'κ.σ.' || unitLower === 'tbsp') return density ? 15 * density : 15;
  if (unitLower === 'κ.γ.' || unitLower === 'tsp') return density ? 5 * density : 5;
  if (unitLower === 'cup' || unitLower === 'κούπα') return density ? 240 * density : 240;
  
  // Items (rough estimates)
  if (unitLower === 'τεμ' || unitLower === 'pc' || unitLower === 'piece') return quantity * 100; // Assume 100g per piece
  
  return quantity; // Default: assume grams
};
