import React, { useState, useMemo } from 'react';
import { Recipe, RecipeVariation, VariationType, VARIATION_TYPE_TRANSLATIONS, Allergen } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';
import VariationCard from './VariationCard.tsx';
import CreateVariationModal from './CreateVariationModal.tsx';

interface RecipeVariationsViewProps {
  recipe: Recipe;
  variations: RecipeVariation[];
  setVariations: React.Dispatch<React.SetStateAction<RecipeVariation[]>>;
  onBack: () => void;
  currentTeamId: string;
}

const RecipeVariationsView: React.FC<RecipeVariationsViewProps> = ({
  recipe,
  variations,
  setVariations,
  onBack,
  currentTeamId
}) => {
  const { language, t } = useTranslation();
  const [isCreating, setIsCreating] = useState(false);
  const [editingVariation, setEditingVariation] = useState<RecipeVariation | null>(null);
  const [filterType, setFilterType] = useState<VariationType | 'all'>('all');
  const [showInactiveVariations, setShowInactiveVariations] = useState(false);

  const recipeVariations = useMemo(() => {
    return variations
      .filter(v => v.parentRecipeId === recipe.id)
      .filter(v => filterType === 'all' || v.variationType === filterType)
      .filter(v => showInactiveVariations || v.isActive);
  }, [variations, recipe.id, filterType, showInactiveVariations]);

  const handleCreateVariation = (variation: Omit<RecipeVariation, 'id' | 'createdAt'>) => {
    const newVariation: RecipeVariation = {
      ...variation,
      id: `var_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setVariations(prev => [...prev, newVariation]);
    setIsCreating(false);
  };

  const handleUpdateVariation = (variation: RecipeVariation) => {
    setVariations(prev => prev.map(v => v.id === variation.id ? variation : v));
    setEditingVariation(null);
  };

  const handleDeleteVariation = (variationId: string) => {
    if (confirm(language === 'el' ? 'Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την παραλλαγή;' : 'Are you sure you want to delete this variation?')) {
      setVariations(prev => prev.filter(v => v.id !== variationId));
    }
  };

  const handleToggleActive = (variationId: string) => {
    setVariations(prev => prev.map(v => 
      v.id === variationId ? { ...v, isActive: !v.isActive } : v
    ));
  };

  const variationTypeOptions: { value: VariationType | 'all'; label: string }[] = [
    { value: 'all', label: language === 'el' ? 'Όλες οι Παραλλαγές' : 'All Variations' },
    ...Object.entries(VARIATION_TYPE_TRANSLATIONS).map(([key, trans]) => ({
      value: key as VariationType,
      label: trans[language]
    }))
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <Icon name="arrow-left" className="w-5 h-5" />
          {language === 'el' ? 'Πίσω στη Συνταγή' : 'Back to Recipe'}
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {language === 'el' ? 'Παραλλαγές Συνταγής' : 'Recipe Variations'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
              {language === 'el' ? recipe.name : recipe.name_en}
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-6 py-3 bg-brand-yellow hover:bg-yellow-500 text-gray-900 rounded-lg font-medium transition-colors"
          >
            <Icon name="plus" className="w-5 h-5" />
            {language === 'el' ? 'Νέα Παραλλαγή' : 'New Variation'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {language === 'el' ? 'Τύπος:' : 'Type:'}
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as VariationType | 'all')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          >
            {variationTypeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showInactiveVariations}
            onChange={(e) => setShowInactiveVariations(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {language === 'el' ? 'Εμφάνιση Ανενεργών' : 'Show Inactive'}
          </span>
        </label>

        <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
          {recipeVariations.length} {language === 'el' ? 'παραλλαγές' : 'variations'}
        </div>
      </div>

      {/* Variations Grid */}
      {recipeVariations.length === 0 ? (
        <div className="text-center py-16">
          <Icon name="git-branch" className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
            {language === 'el' ? 'Δεν υπάρχουν παραλλαγές' : 'No variations yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mb-6">
            {language === 'el' 
              ? 'Δημιουργήστε παραλλαγές για vegan, χωρίς γλουτένη ή διαφορετικές μερίδες' 
              : 'Create variations for vegan, gluten-free, or different portion sizes'}
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-6 py-3 bg-brand-yellow hover:bg-yellow-500 text-gray-900 rounded-lg font-medium transition-colors"
          >
            {language === 'el' ? 'Δημιουργία Πρώτης Παραλλαγής' : 'Create First Variation'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipeVariations.map(variation => (
            <VariationCard
              key={variation.id}
              variation={variation}
              parentRecipe={recipe}
              onEdit={() => setEditingVariation(variation)}
              onDelete={() => handleDeleteVariation(variation.id)}
              onToggleActive={() => handleToggleActive(variation.id)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(isCreating || editingVariation) && (
        <CreateVariationModal
          isOpen={true}
          parentRecipe={recipe}
          variationToEdit={editingVariation}
          onSave={editingVariation ? handleUpdateVariation : handleCreateVariation}
          onCancel={() => {
            setIsCreating(false);
            setEditingVariation(null);
          }}
          currentTeamId={currentTeamId}
        />
      )}
    </div>
  );
};

export default RecipeVariationsView;
