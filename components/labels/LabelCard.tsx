import React from 'react';
import { Recipe, LogoPosition, LanguageMode, AllergenIconVariant } from '../../types';
import { AllergenIcon } from '../common/AllergenIcon';

interface LabelCardProps {
    recipe: Recipe;
    showAllergens: boolean;
    logoUrl: string | null;
    logoPosition: LogoPosition;
    width: number;
    height: number;
    languageMode: LanguageMode;
    allergenVariant?: AllergenIconVariant;
}

const LabelCard: React.FC<LabelCardProps> = ({ 
    recipe, 
    showAllergens, 
    logoUrl, 
    logoPosition, 
    width, 
    height, 
    languageMode,
    allergenVariant = 'colored'
}) => {
    
    const containerStyle: React.CSSProperties = {
        width: `${width}mm`,
        height: `${height}mm`,
    };

    const getFlexDirection = (): React.CSSProperties['flexDirection'] => {
        switch (logoPosition) {
            case 'top': return 'column';
            case 'bottom': return 'column-reverse';
            case 'left': return 'row';
            case 'right': return 'row-reverse';
            default: return 'column';
        }
    };

    const renderRecipeName = () => {
        const hasEnglishName = recipe.name_en && recipe.name_en.trim() !== '';
        switch(languageMode) {
            case 'el':
                return <h3 className="text-lg font-bold text-center text-light-text-primary dark:text-dark-text-primary leading-tight">{recipe.name}</h3>;
            case 'en':
                return <h3 className="text-lg font-bold text-center text-light-text-primary dark:text-dark-text-primary leading-tight">{hasEnglishName ? recipe.name_en : recipe.name}</h3>;
            case 'both':
                return (
                    <div>
                        <h3 className="text-lg font-bold text-center text-light-text-primary dark:text-dark-text-primary leading-tight">{recipe.name}</h3>
                        {hasEnglishName && <h4 className="text-md font-semibold italic text-center text-light-text-secondary dark:text-dark-text-secondary leading-tight">{recipe.name_en}</h4>}
                    </div>
                );
            default:
                 return <h3 className="text-lg font-bold text-center text-light-text-primary dark:text-dark-text-primary leading-tight">{recipe.name}</h3>;
        }
    }

    return (
        <div
            className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm flex overflow-hidden break-inside-avoid"
            style={{ ...containerStyle, flexDirection: getFlexDirection() }}
        >
            {logoUrl && (
                <div className={`flex-shrink-0 ${logoPosition === 'left' || logoPosition === 'right' ? 'w-1/4 h-full' : 'h-1/4 w-full'} flex items-center justify-center`}>
                    <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
            )}
            
            <div className="flex-grow flex flex-col justify-between p-1 overflow-hidden">
                 <div className="flex-grow flex items-center justify-center">
                    {renderRecipeName()}
                 </div>
                
                {showAllergens && recipe.allergens.length > 0 && (
                    <div className="mt-1 pt-1 border-t border-dashed border-gray-300 dark:border-gray-600 flex flex-wrap justify-center gap-2">
                        {recipe.allergens.map(allergen => (
                            <div key={allergen} title={allergen}>
                                <AllergenIcon allergen={allergen} variant={allergenVariant} className="w-6 h-6" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LabelCard;
