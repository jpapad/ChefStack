import React from 'react';
import { Recipe } from '../types';
import { Icon } from './common/Icon';

interface RecipeGridCardProps {
  recipe: Recipe;
  isSelected: boolean;
  onClick: () => void;
  isBookMode: boolean;
  isBookSelected: boolean;
  onBookSelect: (id: string) => void;
}

const RecipeGridCard: React.FC<RecipeGridCardProps> = ({ recipe, isSelected, onClick, isBookMode, isBookSelected, onBookSelect }) => {
  return (
    <div
      onClick={() => isBookMode ? onBookSelect(recipe.id) : onClick()}
      className={`relative rounded-xl cursor-pointer transition-all duration-200 group overflow-hidden border-2 ${
        isSelected && !isBookMode
          ? 'border-brand-yellow'
          : 'border-transparent hover:border-brand-yellow/50'
      } ${isBookSelected ? 'border-brand-yellow shadow-lg ring-2 ring-brand-yellow/50' : ''}`}
    >
       {isBookMode && (
             <div className="absolute top-2 right-2 z-10 bg-black/30 rounded-full">
                <Icon name={isBookSelected ? 'check-square' : 'square'} className={`w-6 h-6 ${isBookSelected ? 'text-brand-yellow' : 'text-white/80'}`} />
            </div>
        )}
      <img
        src={recipe.imageUrl}
        alt={recipe.name}
        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
        <h3 className="font-bold text-md leading-tight">{recipe.name}</h3>
        <div className="flex items-center text-xs opacity-80 mt-1 space-x-3">
            <div className="flex items-center">
                <Icon name="clock" className="w-3 h-3 mr-1"/> 
                <span>{recipe.prepTime + recipe.cookTime}'</span>
            </div>
            <div className="flex items-center">
                <Icon name="servings" className="w-3 h-3 mr-1"/> 
                <span>{recipe.servings}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeGridCard;