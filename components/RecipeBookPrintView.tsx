import React from 'react';
import { Recipe } from '../types';
import { Icon } from './common/Icon';
import { AllergenIcon } from './common/AllergenIcon';

interface RecipeBookPrintViewProps {
  recipes: Recipe[];
}

const RecipeBookPrintView: React.FC<RecipeBookPrintViewProps> = ({ recipes }) => {
  return (
    <div className="font-sans text-black bg-white p-4">
      {/* Title Page */}
      <div className="h-[270mm] flex flex-col items-center justify-center text-center border-b-2 border-black break-after-page">
        <Icon name="book-open" className="w-24 h-24 text-gray-800 mb-8" />
        <h1 className="text-5xl font-extrabold font-heading">Συνταγολόγιο</h1>
        <p className="text-xl mt-4 text-gray-600">
          {new Date().toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {recipes.map((recipe, index) => (
        <div key={recipe.id} className={`p-4 ${index < recipes.length - 1 ? 'break-after-page' : ''}`}>
          <div className="grid grid-cols-3 gap-8 break-inside-avoid">
            {/* Left Column for Image and Info */}
            <div className="col-span-1 space-y-4">
              <h2 className="text-3xl font-extrabold font-heading mb-2">{recipe.name}</h2>
              {recipe.imageUrl && (
                <img src={recipe.imageUrl} alt={recipe.name} className="w-full object-cover rounded-lg shadow-md" />
              )}
              <div className="p-3 bg-gray-100 rounded-lg space-y-3 text-sm">
                <div className="flex justify-between"><span>Προετοιμασία:</span> <span className="font-bold">{recipe.prepTime}'</span></div>
                <div className="flex justify-between"><span>Μαγείρεμα:</span> <span className="font-bold">{recipe.cookTime}'</span></div>
                <div className="flex justify-between"><span>Σύνολο:</span> <span className="font-bold">{recipe.prepTime + recipe.cookTime}'</span></div>
                <div className="flex justify-between"><span>Μερίδες:</span> <span className="font-bold">{recipe.servings}</span></div>
              </div>
              {recipe.allergens.length > 0 && (
                <div>
                  <h4 className="font-bold mb-2">Αλλεργιογόνα:</h4>
                  <div className="flex flex-wrap gap-2">
                    {recipe.allergens.map(allergen => (
                      <div key={allergen} title={allergen} className="p-2 bg-gray-200 rounded-full">
                        <AllergenIcon allergen={allergen} className="w-5 h-5" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column for Ingredients and Steps */}
            <div className="col-span-2">
              <div>
                <h3 className="text-xl font-bold border-b-2 border-black pb-1 mb-3">Συστατικά</h3>
                <ul className="list-disc list-inside space-y-1 text-base">
                  {recipe.ingredients.map(ing => (
                    <li key={ing.id}>
                      <span className="font-semibold">{ing.name}:</span> {ing.quantity}{ing.unit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-bold border-b-2 border-black pb-1 mb-3">Εκτέλεση</h3>
                <div className="space-y-3 text-base leading-relaxed">
                  {recipe.steps.map((step, stepIndex) => (
                    step.type === 'heading' ? (
                       <h4 key={step.id} className="text-lg font-bold uppercase tracking-wider mt-4">{step.content}</h4>
                    ) : (
                       <p key={step.id}><strong className="mr-2">{stepIndex + 1}.</strong>{step.content}</p>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecipeBookPrintView;
