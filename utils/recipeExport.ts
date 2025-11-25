import { Recipe } from '../types';

export const exportRecipesToJSON = (recipes: Recipe[], filename: string = 'recipes.json'): void => {
  const dataStr = JSON.stringify(recipes, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportRecipesToCSV = (recipes: Recipe[], filename: string = 'recipes.csv'): void => {
  // CSV Headers
  const headers = [
    'ID', 'Name (Greek)', 'Name (English)', 'Category', 'Prep Time', 'Cook Time',
    'Servings', 'Allergens', 'Ingredients', 'Steps', 'Average Rating', 'Total Ratings'
  ];
  
  // Convert recipes to CSV rows
  const rows = recipes.map(recipe => {
    const avgRating = recipe.ratings?.length
      ? (recipe.ratings.reduce((sum, r) => sum + r.rating, 0) / recipe.ratings.length).toFixed(2)
      : '0';
    
    const allergens = (recipe.allergens || []).join('; ');
    const ingredients = (recipe.ingredients || [])
      .map(i => `${i.quantity || ''} ${i.unit || ''} ${i.name}`.trim())
      .join('; ');
    const steps = (recipe.steps || [])
      .filter(s => s.type === 'step')
      .map(s => s.content)
      .join(' | ');
    
    return [
      recipe.id,
      recipe.name,
      recipe.name_en,
      recipe.category,
      recipe.prepTime || '',
      recipe.cookTime || '',
      recipe.servings || '',
      allergens,
      ingredients,
      steps,
      avgRating,
      recipe.ratings?.length || 0
    ];
  });
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Escape commas and quotes in CSV
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(','))
  ].join('\n');
  
  const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const importRecipesFromJSON = (file: File): Promise<Recipe[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const recipes = JSON.parse(content) as Recipe[];
        
        // Basic validation
        if (!Array.isArray(recipes)) {
          throw new Error('Invalid format: expected array of recipes');
        }
        
        // Validate each recipe has required fields
        recipes.forEach((recipe, idx) => {
          if (!recipe.id || !recipe.name || !recipe.category) {
            throw new Error(`Recipe at index ${idx} is missing required fields`);
          }
        });
        
        resolve(recipes);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const importRecipesFromCSV = (file: File): Promise<Partial<Recipe>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error('CSV file is empty or invalid');
        }
        
        // Parse header
        const headers = lines[0].split(',').map(h => h.trim());
        
        // Parse rows
        const recipes: Partial<Recipe>[] = lines.slice(1).map((line, idx) => {
          const values = line.split(',').map(v => v.trim().replace(/^"(.*)"$/, '$1').replace(/""/g, '"'));
          
          const recipe: Partial<Recipe> = {
            id: `imported_${Date.now()}_${idx}`,
            name: values[1] || `Imported Recipe ${idx + 1}`,
            name_en: values[2] || values[1] || `Imported Recipe ${idx + 1}`,
            category: (values[3] || 'other') as any,
            prepTime: parseInt(values[4]) || 0,
            cookTime: parseInt(values[5]) || 0,
            servings: parseInt(values[6]) || 4,
            allergens: values[7] ? values[7].split('; ').filter(Boolean) as any : [],
            ingredients: values[8] ? values[8].split('; ').map((ing, i) => ({
              id: `${i}`,
              name: ing.trim(),
              quantity: null,
              unit: null,
              isSubRecipe: false
            })) : [],
            steps: values[9] ? values[9].split(' | ').map((step, i) => ({
              id: `step_${i}`,
              type: 'step' as const,
              content: step.trim()
            })) : [],
            ratings: []
          };
          
          return recipe;
        });
        
        resolve(recipes);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
