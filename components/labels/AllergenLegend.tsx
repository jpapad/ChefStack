import React from 'react';
import { ALLERGENS_LIST, ALLERGEN_TRANSLATIONS } from '../../types';
import { AllergenIcon } from '../common/AllergenIcon';

const AllergenLegend: React.FC = () => {
    return (
        <div className="allergen-legend bg-white p-4 font-sans text-black">
            <div className="text-center border-b-2 border-black pb-2 mb-4">
                <h2 className="text-2xl font-bold">Οδηγός Αλλεργιογόνων / Allergen Guide</h2>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {ALLERGENS_LIST.map(allergen => {
                    const translation = ALLERGEN_TRANSLATIONS[allergen];
                    return (
                        <div key={allergen} className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                                <AllergenIcon allergen={allergen} className="w-10 h-10" />
                            </div>
                            <div>
                                <p className="font-semibold text-lg">{translation.el}</p>
                                <p className="text-md italic text-gray-700">{translation.en}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AllergenLegend;
