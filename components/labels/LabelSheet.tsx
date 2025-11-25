import React from 'react';
import { Recipe, LogoPosition, LanguageMode, AllergenIconVariant } from '../../types';
import LabelCard from './LabelCard';
import AllergenLegend from './AllergenLegend';

interface LabelSheetProps {
    recipes: Recipe[];
    showAllergens: boolean;
    logoUrl: string | null;
    logoPosition: LogoPosition;
    labelWidth: number;
    labelHeight: number;
    languageMode: LanguageMode;
    columnsPerPage: number;
    printLegend: boolean;
    allergenVariant?: AllergenIconVariant;
}

const LabelSheet: React.FC<LabelSheetProps> = ({ 
    recipes, 
    showAllergens, 
    logoUrl, 
    logoPosition, 
    labelWidth, 
    labelHeight,
    languageMode,
    columnsPerPage,
    printLegend,
    allergenVariant = 'colored'
}) => {
    
    const gridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: `repeat(${columnsPerPage}, 1fr)`,
        gap: '2mm',
    };
    
    return (
        <>
            <div id="label-sheet" style={gridStyle}>
                {recipes.map(recipe => (
                    <LabelCard 
                        key={recipe.id} 
                        recipe={recipe} 
                        showAllergens={showAllergens}
                        logoUrl={logoUrl}
                        logoPosition={logoPosition}
                        width={labelWidth}
                        height={labelHeight}
                        languageMode={languageMode}
                        allergenVariant={allergenVariant}
                    />
                ))}
            </div>
            {printLegend && <AllergenLegend />}
        </>
    );
};

export default LabelSheet;
