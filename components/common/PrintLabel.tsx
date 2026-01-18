import React from 'react';
import { Recipe } from '../../types';

interface PrintLabelProps {
  recipe: Recipe | null;
}

const PrintLabel: React.FC<PrintLabelProps> = ({ recipe }) => {
  if (!recipe) return null;

  const productionDate = new Date();
  const expirationDate = new Date();
  expirationDate.setDate(productionDate.getDate() + 3); // Example: expires in 3 days

  const formatDate = (date: Date) => new Intl.DateTimeFormat('el-GR', { dateStyle: 'short' }).format(date);

  // A simple way to check if an ingredient might be an allergen.
  // In a real app, this would be more robust, linking ingredients to an allergen database.
  const isAllergen = (ingredientName: string) => {
    return (recipe.allergens || []).some(allergen => 
      ingredientName.toLowerCase().includes(allergen.toLowerCase().substring(0, 4))
    );
  };

  return (
    <div className="font-sans text-black p-2 w-[72mm] leading-tight bg-white">
      <h1 className="text-lg font-bold text-center border-b-2 border-black pb-1 mb-1">{recipe.name}</h1>
      <div className="flex justify-between text-xs font-semibold mb-2">
        <span>Ημ/νία Παραγ.: {formatDate(productionDate)}</span>
        <span>Ανάλωση έως: {formatDate(expirationDate)}</span>
      </div>
      <div className="text-xs">
        <span className="font-bold">Συστατικά: </span>
        {recipe.ingredients.map((ing, index) => (
          <span key={index}>
            {isAllergen(ing.name)
              ? <strong className="font-extrabold uppercase">{ing.name}</strong>
              : ing.name}
            {index < recipe.ingredients.length - 1 ? ', ' : '.'}
          </span>
        ))}
      </div>
      {recipe.allergens.length > 0 && (
         <div className="text-xs mt-1">
            <span className="font-bold">Αλλεργιογόνα: </span>
            {recipe.allergens.join(', ')}.
        </div>
      )}
    </div>
  );
};

export default PrintLabel;