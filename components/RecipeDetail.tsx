import React, { useState, useMemo } from 'react';
import {
  Recipe,
  IngredientCost,
  Ingredient,
  Unit,
  Role,
  LanguageMode,
  ALLERGEN_TRANSLATIONS,
  RecipeStep,
  RolePermissions,
  User,
  NutritionInfo
} from '../types';
import { Icon } from './common/Icon';
import PrintLabel from './common/PrintLabel';
import PrintPreview from './common/PrintPreview';
import ConfirmationModal from './common/ConfirmationModal';
import { AllergenIcon } from './common/AllergenIcon';
import StarRating from './common/StarRating';
import { useTranslation } from '../i18n';
import AIResponseModal from './common/AIResponseModal';
import { GoogleGenAI } from '@google/genai';
import { NutritionLabel } from './common/NutritionLabel';
import {
  calculateRecipeNutrition,
  getNutritionCoverage,
  getMissingNutritionIngredients
} from '../utils/nutritionCalculator';

interface RecipeDetailProps {
  recipe: Recipe;
  allRecipes: Recipe[]; // Pass all recipes for costing sub-recipes
  ingredientCosts: IngredientCost[];
  onBack: () => void;
  onEdit: (recipe: Recipe) => void;
  onSaveRecipe: (recipe: Recipe) => void; // For AI updates
  onDelete: (recipe: Recipe) => void;
  onSelectRecipe: (id: string) => void; // For navigating to sub-recipes
  currentUser: User;
  currentUserRole?: Role;
  rolePermissions: RolePermissions;
  language: Exclude<LanguageMode, 'both'>;
  withApiKeyCheck: (action: () => void) => void;
}

type Tab = 'ingredients' | 'steps' | 'allergens' | 'costing' | 'nutrition';

const RecipeDetail: React.FC<RecipeDetailProps> = ({
  recipe,
  allRecipes,
  ingredientCosts,
  onBack,
  onEdit,
  onSaveRecipe,
  onDelete,
  onSelectRecipe,
  currentUser,
  currentUserRole,
  rolePermissions,
  language,
  withApiKeyCheck
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('ingredients');
  const [servings, setServings] = useState(recipe.servings);
  const [isLabelPreviewOpen, setIsLabelPreviewOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiContent, setAiContent] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAction, setAiAction] = useState<'improve' | 'translate' | null>(null);

  // Nutrition calculation
  const calculatedNutrition = useMemo(() => calculateRecipeNutrition(recipe), [recipe]);
  const nutritionCoverage = useMemo(() => getNutritionCoverage(recipe), [recipe]);
  const missingIngredients = useMemo(() => getMissingNutritionIngredients(recipe), [recipe]);
  const [customNutrition, setCustomNutrition] = useState<NutritionInfo | null>(null);
  const [isEditingNutrition, setIsEditingNutrition] = useState(false);

  // Use custom nutrition if set, otherwise use calculated or recipe's stored nutrition
  const displayNutrition = customNutrition || recipe.nutrition || calculatedNutrition;

  const canManage = currentUserRole
    ? rolePermissions[currentUserRole]?.includes('manage_recipes')
    : false;

  const scalingFactor = useMemo(
    () => servings / recipe.servings,
    [servings, recipe.servings]
  );

  const scaledIngredients = useMemo(
    () =>
      recipe.ingredients.map((ing) => ({
        ...ing,
        quantity: ing.quantity * scalingFactor
      })),
    [recipe.ingredients, scalingFactor]
  );

  const calculateRecipeCost = useMemo(() => {
    const memo: Record<string, number> = {};

    const calculate = (recipeToCost: Recipe): number => {
      if (memo[recipeToCost.id]) {
        return memo[recipeToCost.id];
      }

      const cost = recipeToCost.ingredients.reduce((total, ing) => {
        if (ing.isSubRecipe && ing.recipeId) {
          const subRecipe = allRecipes.find((r) => r.id === ing.recipeId);
          if (!subRecipe) return total;

          const subRecipeCost = calculate(subRecipe);
          const subRecipeYield = subRecipe.yield?.quantity || 1;
          // Basic unit conversion assumption
          const quantityNeeded =
            ing.unit === 'g' && subRecipe.yield?.unit === 'kg'
              ? ing.quantity / 1000
              : ing.quantity;

          return total + (subRecipeCost / subRecipeYield) * quantityNeeded;
        } else {
          const costData = ingredientCosts.find(
            (c) => c.name.toLowerCase() === ing.name.toLowerCase()
          );
          if (!costData) return total;

          let quantityInPurchaseUnit = ing.quantity;
          if (ing.unit === 'g' && costData.purchaseUnit === 'kg')
            quantityInPurchaseUnit /= 1000;
          else if (ing.unit === 'ml' && costData.purchaseUnit === 'L')
            quantityInPurchaseUnit /= 1000;

          return total + quantityInPurchaseUnit * costData.cost;
        }
      }, 0);

      memo[recipeToCost.id] = cost;
      return cost;
    };
    return calculate;
  }, [allRecipes, ingredientCosts]);

  const totalCost = useMemo(() => {
    return calculateRecipeCost(recipe);
  }, [recipe, calculateRecipeCost]);

  const costPerServing = totalCost / recipe.servings;

  const displayName = language === 'en' && recipe.name_en ? recipe.name_en : recipe.name;
  const displayDescription = recipe.description;

  // Calculate average rating
  const averageRating = useMemo(() => {
    if (!recipe.ratings || recipe.ratings.length === 0) return 0;
    const sum = recipe.ratings.reduce((acc, r) => acc + r.rating, 0);
    return sum / recipe.ratings.length;
  }, [recipe.ratings]);

  // Get current user's rating
  const userRating = useMemo(() => {
    if (!recipe.ratings) return 0;
    const found = recipe.ratings.find(r => r.userId === currentUser.id);
    return found ? found.rating : 0;
  }, [recipe.ratings, currentUser.id]);

  // Handle rating
  const handleRate = (rating: number) => {
    const updatedRatings = recipe.ratings ? [...recipe.ratings] : [];
    const existingIndex = updatedRatings.findIndex(r => r.userId === currentUser.id);
    
    if (existingIndex >= 0) {
      updatedRatings[existingIndex] = {
        userId: currentUser.id,
        rating,
        timestamp: new Date().toISOString()
      };
    } else {
      updatedRatings.push({
        userId: currentUser.id,
        rating,
        timestamp: new Date().toISOString()
      });
    }

    const updatedRecipe = {
      ...recipe,
      ratings: updatedRatings
    };

    onSaveRecipe(updatedRecipe);
  };

  const handleAiAction = async (action: 'improve' | 'translate') => {
    setAiAction(action);
    setIsAiModalOpen(true);
    setIsAiLoading(true);
    setAiContent('');

    try {
      if (!process.env.API_KEY) {
        throw new Error('API_KEY is not configured.');
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

      const stepsString = recipe.steps
        .map((s) =>
          s.type === 'heading' ? `\n## ${s.content}\n` : s.content
        )
        .join('\n');
      const recipeString = `Title: ${recipe.name}\nDescription: ${recipe.description}\nSteps:\n${stepsString}`;

      const prompt =
        action === 'improve'
          ? `You are a professional chef. Review the following recipe and provide an improved version. Rewrite the description to be more appealing and refine the steps for clarity and professional technique. Output only the improved description and steps in JSON format like this: {"description": "...", "steps": ["...", "..."]}. The recipe is:\n\n${recipeString}`
          : `You are a professional translator. Translate the following recipe's title, description and steps to English. Output only the translation in JSON format like this: {"name_en": "...", "description": "...", "steps": ["...", "..."]}. The recipe is:\n\n${recipeString}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text;
      setAiContent(text);
    } catch (error: any) {
      console.error('AI action failed:', error);
      const errorMessage = error.message.includes('API_KEY')
        ? 'Σφάλμα διαμόρφωσης: Το κλειδί API δεν έχει ρυθμιστεί.'
        : t('error_generic');
      setAiContent(errorMessage);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleConfirmAiChanges = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      let updatedRecipe = { ...recipe };

      if (aiAction === 'improve' && parsed.description && parsed.steps) {
        updatedRecipe = {
          ...updatedRecipe,
          description: parsed.description,
          steps: parsed.steps.map((s: string, i: number) => ({
            id: `s${i}`,
            type: 'step',
            content: s
          }))
        };
      } else if (
        aiAction === 'translate' &&
        parsed.name_en &&
        parsed.description &&
        parsed.steps
      ) {
        // Simple conversion for now, doesn't handle headings
        updatedRecipe = {
          ...updatedRecipe,
          name_en: parsed.name_en,
          description: parsed.description,
          steps: parsed.steps.map((s: string, i: number) => ({
            id: `s${i}`,
            type: 'step',
            content: s
          }))
        };
      } else {
        throw new Error('Invalid JSON structure from AI.');
      }

      onSaveRecipe(updatedRecipe);
      setIsAiModalOpen(false);
    } catch (e) {
      console.error('Failed to parse or apply AI changes', e);
      alert(
        'Could not apply changes from AI. The format might be incorrect.'
      );
    }
  };

  const TabButton: React.FC<{ tab: Tab; label: string }> = ({ tab, label }) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 font-semibold text-sm rounded-full ${
        activeTab === tab
          ? 'bg-brand-dark text-white'
          : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20'
      }`}
    >
      {label}
    </button>
  );

  const renderSteps = () => {
    let stepCounter = 0;
    return (
      <div className="space-y-4">
        {recipe.steps.map((step) => {
          if (step.type === 'heading') {
            stepCounter = 0; // Reset counter for new section
            return (
              <h3
                key={step.id}
                className="text-xl font-bold mt-6 mb-3 uppercase tracking-wider border-b-2 border-brand-yellow pb-1"
              >
                {step.content}
              </h3>
            );
          }
          stepCounter++;
          return (
            <div key={step.id} className="flex items-start">
              <span className="flex items-center justify-center w-6 h-6 mr-4 font-bold text-sm bg-brand-yellow text-brand-dark rounded-full flex-shrink-0 mt-1">
                {stepCounter}
              </span>
              <p className="text-light-text-primary dark:text-dark-text-primary leading-relaxed">
                {step.content}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  const hasImage = !!recipe.imageUrl;

  return (
    <>
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <button
            type="button"
            onClick={onBack}
            className="lg:hidden flex items-center mb-4 text-brand-yellow hover:underline"
          >
            <Icon name="arrow-left" className="w-5 h-5 mr-2" />
            {t('recipe_detail_back')}
          </button>

          {/* Header */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {hasImage ? (
              <img
                src={recipe.imageUrl}
                alt={displayName}
                className="w-full md:w-1/3 h-48 object-cover rounded-xl shadow-lg"
              />
            ) : (
              <div className="w-full md:w-1/3 h-48 rounded-xl shadow-lg bg-black/5 dark:bg-white/5 flex flex-col items-center justify-center text-center px-4">
                <Icon
                  name="image"
                  className="w-8 h-8 mb-2 text-slate-400 dark:text-slate-500"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('recipe_detail_no_image') || 'Χωρίς εικόνα συνταγής'}
                </p>
              </div>
            )}

            <div className="flex-1">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-sm font-semibold bg-brand-yellow/20 text-brand-yellow px-3 py-1 rounded-full">
                    {t(`recipe_category_${recipe.category}`)}
                  </span>
                  <h2 className="text-3xl lg:text-4xl font-extrabold font-heading mt-2 mb-2">
                    {displayName}
                  </h2>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                  <button
                    type="button"
                    onClick={() => setIsLabelPreviewOpen(true)}
                    title={t('recipe_detail_print_label')}
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg:white/10 transition-colors"
                  >
                    <Icon
                      name="printer"
                      className="w-5 h-5 text-brand-yellow"
                    />
                  </button>
                  {canManage && (
                    <>
                      <button
                        type="button"
                        onClick={() => onEdit(recipe)}
                        title={t('edit')}
                        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg:white/10 transition-colors"
                      >
                        <Icon name="edit" className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDeleteModalOpen(true)}
                        title={t('delete')}
                        className="p-2 rounded-full text-light-text-secondary hover:text-red-600 dark:text-dark-text-secondary dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Icon name="trash-2" className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                {displayDescription}
              </p>

              {/* Rating Section */}
              <div className="mb-4 p-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-yellow-400 dark:border-yellow-500 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {t('recipe_rating_your_rating') || 'Your Rating:'}
                    </span>
                    <StarRating
                      rating={userRating}
                      onRate={handleRate}
                      size="md"
                    />
                  </div>
                  {averageRating > 0 && (
                    <div className="flex items-center gap-3 sm:ml-auto pl-4 sm:pl-0 border-l-2 sm:border-l-0 sm:border-l-2 border-yellow-400 dark:border-yellow-500">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {t('recipe_rating_average') || 'Team Average:'}
                      </span>
                      <StarRating
                        rating={averageRating}
                        size="sm"
                        readonly
                        showCount
                        count={recipe.ratings?.length}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-center">
                <div>
                  <p className="font-bold text-xl">{recipe.prepTime}'</p>
                  <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">
                    {t('recipe_detail_prep_time').toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-xl">{recipe.cookTime}'</p>
                  <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">
                    {t('recipe_detail_cook_time').toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-xl">
                    {recipe.prepTime + recipe.cookTime}'
                  </p>
                  <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">
                    {t('recipe_detail_total_time').toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-xl">
                    {recipe.yield
                      ? `${recipe.yield.quantity}${recipe.yield.unit}`
                      : recipe.servings}
                  </p>
                  <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">
                    {recipe.yield
                      ? t('recipe_detail_yield').toUpperCase()
                      : t('recipe_detail_servings').toUpperCase()}
                  </p>
                </div>
              </div>

              {canManage && (
                <div className="mt-4 pt-4 border-t border-gray-200/80 dark:border-gray-700/80 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      withApiKeyCheck(() => handleAiAction('improve'))
                    }
                    className="flex items-center gap-2 text-sm font-semibold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900 lift-on-hover"
                  >
                    <Icon name="sparkles" className="w-4 h-4" />{' '}
                    {t('ai_improve')}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      withApiKeyCheck(() => handleAiAction('translate'))
                    }
                    className="flex items-center gap-2 text-sm font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900 lift-on-hover"
                  >
                    <Icon name="globe" className="w-4 h-4" />{' '}
                    {t('ai_translate')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="my-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200/80 dark:border-gray-700/80 pb-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <TabButton
                tab="ingredients"
                label={t('recipe_detail_tab_ingredients')}
              />
              <TabButton
                tab="steps"
                label={t('recipe_detail_tab_steps')}
              />
              <TabButton
                tab="allergens"
                label={t('recipe_detail_tab_allergens')}
              />
              <TabButton
                tab="costing"
                label={t('recipe_detail_tab_costing')}
              />
              <TabButton
                tab="nutrition"
                label={t('recipe_detail_tab_nutrition')}
              />
            </div>
            {activeTab === 'ingredients' && (
              <div className="flex items-center gap-2">
                <label
                  htmlFor="servings-input"
                  className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary whitespace-nowrap"
                >
                  {t('recipe_detail_adjust_servings')}:
                </label>
                <input
                  id="servings-input"
                  type="number"
                  value={servings}
                  onChange={(e) =>
                    setServings(
                      Math.max(1, parseInt(e.target.value, 10) || 1)
                    )
                  }
                  className="w-20 p-1.5 rounded-md bg-black/5 dark:bg-white/10 border-transparent text-center font-bold focus:border-brand-yellow focus:shadow-aura-yellow"
                />
              </div>
            )}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'ingredients' && (
              <ul className="space-y-2">
                {scaledIngredients.map((ing) => (
                  <li
                    key={ing.id}
                    className={`flex items-center p-2 rounded-md ${
                      ing.isSubRecipe
                        ? 'cursor-pointer hover:bg-brand-yellow/10'
                        : ''
                    } bg-black/5 dark:bg-white/5`}
                    onClick={
                      ing.isSubRecipe && ing.recipeId
                        ? () => onSelectRecipe(ing.recipeId!)
                        : undefined
                    }
                  >
                    {ing.isSubRecipe && (
                      <Icon
                        name="book-open"
                        className="w-5 h-5 mr-3 text-brand-yellow"
                      />
                    )}
                    <span className="font-bold text-light-text-primary dark:text-dark-text-primary flex-1">
                      {ing.name}
                    </span>
                    <span className="font-mono">
                      {ing.quantity.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2
                      })}{' '}
                      {ing.unit}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'steps' && renderSteps()}

            {activeTab === 'allergens' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {recipe.allergens.length > 0 ? (
                  recipe.allergens.map((allergen) => (
                    <div
                      key={allergen}
                      className="flex items-center gap-3 p-3 bg-black/5 dark:bg-white/10 rounded-lg"
                    >
                      <AllergenIcon
                        allergen={allergen}
                        className="w-8 h-8 text-brand-yellow flex-shrink-0"
                      />
                      <div>
                        <p className="font-semibold">
                          {ALLERGEN_TRANSLATIONS[allergen][language]}
                        </p>
                        <p className="text-sm italic text-light-text-secondary dark:text-dark-text-secondary">
                          {
                            ALLERGEN_TRANSLATIONS[allergen][
                              language === 'el' ? 'en' : 'el'
                            ]
                          }
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>{t('allergens_none')}</p>
                )}
              </div>
            )}

            {activeTab === 'costing' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-lg">
                  <p className="text-xs font-bold uppercase text-light-text-secondary dark:text-dark-text-secondary">
                    {t('costing_total')}
                  </p>
                  <p className="text-2xl font-bold font-mono text-brand-yellow">
                    {totalCost.toFixed(2)}€
                  </p>
                </div>
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-lg">
                  <p className="text-xs font-bold uppercase text-light-text-secondary dark:text-dark-text-secondary">
                    {t('costing_per_serving')}
                  </p>
                  <p className="text-2xl font-bold font-mono text-brand-yellow">
                    {costPerServing.toFixed(2)}€
                  </p>
                </div>
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-lg">
                  <p className="text-xs font-bold uppercase text-light-text-secondary dark:text-dark-text-secondary">
                    {t('costing_selling_price')}
                  </p>
                  <p className="text-2xl font-bold font-mono text-brand-yellow">
                    {recipe.price?.toFixed(2) || '-'}€
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'nutrition' && (
              <div className="space-y-6">
                {displayNutrition ? (
                  <>
                    <div className="flex justify-center">
                      <NutritionLabel nutrition={displayNutrition} servings={recipe.servings} />
                    </div>

                    {/* Coverage info */}
                    {nutritionCoverage < 100 && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Icon name="info" className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                              {t('nutrition_coverage')}: {nutritionCoverage.toFixed(0)}%
                            </p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-2">
                              {t('nutrition_missing_data')}
                            </p>
                            {missingIngredients.length > 0 && (
                              <div className="text-sm text-yellow-700 dark:text-yellow-400">
                                <span className="font-semibold">{t('missing_ingredients')}:</span>{' '}
                                {missingIngredients.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Manual override option */}
                    {canManage && !isEditingNutrition && (
                      <div className="flex justify-center">
                        <button
                          onClick={() => setIsEditingNutrition(true)}
                          className="px-4 py-2 bg-brand-yellow text-slate-900 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
                        >
                          {t('edit_nutrition_manually')}
                        </button>
                      </div>
                    )}

                    {/* Manual edit form */}
                    {isEditingNutrition && (
                      <div className="bg-white dark:bg-dark-card p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold mb-4">{t('manual_nutrition_entry')}</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-semibold mb-1">{t('calories')}</label>
                            <input
                              type="number"
                              value={customNutrition?.calories ?? displayNutrition.calories}
                              onChange={(e) => setCustomNutrition({
                                ...(customNutrition || displayNutrition),
                                calories: parseFloat(e.target.value) || 0,
                                isCalculated: false
                              })}
                              className="w-full p-2 rounded-md bg-black/5 dark:bg-white/10 border border-slate-300 dark:border-slate-600"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-1">{t('protein')} (g)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={customNutrition?.protein ?? displayNutrition.protein}
                              onChange={(e) => setCustomNutrition({
                                ...(customNutrition || displayNutrition),
                                protein: parseFloat(e.target.value) || 0,
                                isCalculated: false
                              })}
                              className="w-full p-2 rounded-md bg-black/5 dark:bg-white/10 border border-slate-300 dark:border-slate-600"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-1">{t('total_carbs')} (g)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={customNutrition?.carbs ?? displayNutrition.carbs}
                              onChange={(e) => setCustomNutrition({
                                ...(customNutrition || displayNutrition),
                                carbs: parseFloat(e.target.value) || 0,
                                isCalculated: false
                              })}
                              className="w-full p-2 rounded-md bg-black/5 dark:bg-white/10 border border-slate-300 dark:border-slate-600"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-1">{t('total_fat')} (g)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={customNutrition?.fat ?? displayNutrition.fat}
                              onChange={(e) => setCustomNutrition({
                                ...(customNutrition || displayNutrition),
                                fat: parseFloat(e.target.value) || 0,
                                isCalculated: false
                              })}
                              className="w-full p-2 rounded-md bg-black/5 dark:bg-white/10 border border-slate-300 dark:border-slate-600"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              if (customNutrition) {
                                onSaveRecipe({ ...recipe, nutrition: customNutrition });
                              }
                              setIsEditingNutrition(false);
                            }}
                            className="px-4 py-2 bg-brand-yellow text-slate-900 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
                          >
                            {t('save')}
                          </button>
                          <button
                            onClick={() => {
                              setCustomNutrition(null);
                              setIsEditingNutrition(false);
                            }}
                            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-semibold"
                          >
                            {t('cancel')}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <Icon name="info" className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      {t('no_nutrition_data')}
                    </p>
                    {canManage && (
                      <button
                        onClick={() => setIsEditingNutrition(true)}
                        className="px-4 py-2 bg-brand-yellow text-slate-900 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
                      >
                        {t('add_nutrition_manually')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isLabelPreviewOpen && (
        <PrintPreview onClose={() => setIsLabelPreviewOpen(false)}>
          <PrintLabel recipe={recipe} />
        </PrintPreview>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          onDelete(recipe);
          setIsDeleteModalOpen(false);
        }}
        title={t('confirm_delete_title')}
        body={t('confirm_delete_body')}
      />

      <AIResponseModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        isLoading={isAiLoading}
        content={aiContent}
        title={
          aiAction === 'improve'
            ? t('ai_improver_title')
            : t('ai_translator_title')
        }
        showConfirmButton={!isAiLoading && !!aiContent}
        onConfirm={handleConfirmAiChanges}
      />
    </>
  );
};

export default RecipeDetail;
