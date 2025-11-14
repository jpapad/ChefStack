import React, { useState, useMemo } from 'react';
import { Recipe, IngredientCost, Ingredient, Unit, Role, LanguageMode, ALLERGEN_TRANSLATIONS, RecipeStep, RolePermissions } from '../types';
import { Icon } from './common/Icon';
import PrintLabel from './common/PrintLabel';
import PrintPreview from './common/PrintPreview';
import ConfirmationModal from './common/ConfirmationModal';
import { AllergenIcon } from './common/AllergenIcon';
import { useTranslation } from '../i18n';
import AIResponseModal from './common/AIResponseModal';
import { GoogleGenAI } from '@google/genai';

interface RecipeDetailProps {
  recipe: Recipe;
  allRecipes: Recipe[]; // Pass all recipes for costing sub-recipes
  ingredientCosts: IngredientCost[];
  onBack: () => void;
  onEdit: (recipe: Recipe) => void;
  onSaveRecipe: (recipe: Recipe) => void; // For AI updates
  onDelete: (recipe: Recipe) => void;
  onSelectRecipe: (id: string) => void; // For navigating to sub-recipes
  currentUserRole?: Role;
  rolePermissions: RolePermissions;
  language: Exclude<LanguageMode, 'both'>;
  withApiKeyCheck: (action: () => void) => void;
}

type Tab = 'ingredients' | 'steps' | 'allergens' | 'costing';

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, allRecipes, ingredientCosts, onBack, onEdit, onSaveRecipe, onDelete, onSelectRecipe, currentUserRole, rolePermissions, language, withApiKeyCheck }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('ingredients');
  const [servings, setServings] = useState(recipe.servings);
  const [isLabelPreviewOpen, setIsLabelPreviewOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiContent, setAiContent] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAction, setAiAction] = useState<'improve' | 'translate' | null>(null);

  const canManage = currentUserRole ? rolePermissions[currentUserRole]?.includes('manage_recipes') : false;

  const scalingFactor = useMemo(() => servings / recipe.servings, [servings, recipe.servings]);

  const scaledIngredients = useMemo(() =>
    recipe.ingredients.map(ing => ({
      ...ing,
      quantity: ing.quantity * scalingFactor
    })), [recipe.ingredients, scalingFactor]
  );
  
  const calculateRecipeCost = useMemo(() => {
    const memo: Record<string, number> = {};

    const calculate = (recipeToCost: Recipe): number => {
      if (memo[recipeToCost.id]) {
        return memo[recipeToCost.id];
      }

      const cost = recipeToCost.ingredients.reduce((total, ing) => {
        if (ing.isSubRecipe && ing.recipeId) {
          const subRecipe = allRecipes.find(r => r.id === ing.recipeId);
          if (!subRecipe) return total;
          
          const subRecipeCost = calculate(subRecipe);
          const subRecipeYield = subRecipe.yield?.quantity || 1;
          // Basic unit conversion assumption
          const quantityNeeded = (ing.unit === 'g' && subRecipe.yield?.unit === 'kg') ? ing.quantity / 1000 : ing.quantity;
          
          return total + (subRecipeCost / subRecipeYield) * quantityNeeded;
        } else {
          const costData = ingredientCosts.find(c => c.name.toLowerCase() === ing.name.toLowerCase());
          if (!costData) return total;

          let quantityInPurchaseUnit = ing.quantity;
          if (ing.unit === 'g' && costData.purchaseUnit === 'kg') quantityInPurchaseUnit /= 1000;
          else if (ing.unit === 'ml' && costData.purchaseUnit === 'L') quantityInPurchaseUnit /= 1000;
          
          return total + (quantityInPurchaseUnit * costData.cost);
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

  const handleAiAction = async (action: 'improve' | 'translate') => {
      setAiAction(action);
      setIsAiModalOpen(true);
      setIsAiLoading(true);
      setAiContent('');

      try {
        if (!process.env.API_KEY) {
          throw new Error("API_KEY is not configured.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        const stepsString = recipe.steps.map(s => s.type === 'heading' ? `\n## ${s.content}\n` : s.content).join('\n');
        const recipeString = `Title: ${recipe.name}\nDescription: ${recipe.description}\nSteps:\n${stepsString}`;
        
        const prompt = action === 'improve'
          ? `You are a professional chef. Review the following recipe and provide an improved version. Rewrite the description to be more appealing and refine the steps for clarity and professional technique. Output only the improved description and steps in JSON format like this: {"description": "...", "steps": ["...", "..."]}. The recipe is:\n\n${recipeString}`
          : `You are a professional translator. Translate the following recipe's title, description and steps to English. Output only the translation in JSON format like this: {"name_en": "...", "description": "...", "steps": ["...", "..."]}. The recipe is:\n\n${recipeString}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        
        const text = response.text;
        setAiContent(text);

      } catch (error: any) {
        console.error("AI action failed:", error);
        const errorMessage = error.message.includes("API_KEY")
            ? "Σφάλμα διαμόρφωσης: Το κλειδί API δεν έχει ρυθμιστεί."
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
              updatedRecipe = { ...updatedRecipe, description: parsed.description, steps: parsed.steps.map((s: string, i: number) => ({ id: `s${i}`, type: 'step', content: s})) };
          } else if (aiAction === 'translate' && parsed.name_en && parsed.description && parsed.steps) {
              // Simple conversion for now, doesn't handle headings
              updatedRecipe = { ...updatedRecipe, name_en: parsed.name_en, description: parsed.description, steps: parsed.steps.map((s: string, i: number) => ({ id: `s${i}`, type: 'step', content: s})) };
          } else {
             throw new Error("Invalid JSON structure from AI.");
          }
          
          onSaveRecipe(updatedRecipe);
          setIsAiModalOpen(false);
      } catch (e) {
          console.error("Failed to parse or apply AI changes", e);
          alert("Could not apply changes from AI. The format might be incorrect.");
      }
  };


  const TabButton: React.FC<{ tab: Tab, label: string }> = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 font-semibold text-sm rounded-full ${
        activeTab === tab ? 'bg-brand-dark text-white' : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20'
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
                if(step.type === 'heading') {
                    stepCounter = 0; // Reset counter for new section
                    return (
                        <h3 key={step.id} className="text-xl font-bold mt-6 mb-3 uppercase tracking-wider border-b-2 border-brand-yellow pb-1">
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
                        <p className="text-light-text-primary dark:text-dark-text-primary leading-relaxed">{step.content}</p>
                    </div>
                );
             })}
         </div>
      );
  }


  return (
    <>
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <button onClick={onBack} className="lg:hidden flex items-center mb-4 text-brand-yellow hover:underline">
            <Icon name="arrow-left" className="w-5 h-5 mr-2" />
            {t('recipe_detail_back')}
          </button>
          
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <img src={recipe.imageUrl} alt={displayName} className="w-full md:w-1/3 h-48 object-cover rounded-xl shadow-lg" />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                    <span className="text-sm font-semibold bg-brand-yellow/20 text-brand-yellow px-3 py-1 rounded-full">{t(`recipe_category_${recipe.category}`)}</span>
                    <h2 className="text-3xl lg:text-4xl font-extrabold font-heading mt-2 mb-2">{displayName}</h2>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                  <button onClick={() => setIsLabelPreviewOpen(true)} title={t('recipe_detail_print_label')} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                     <Icon name="printer" className="w-5 h-5 text-brand-yellow"/>
                  </button>
                  {canManage && (
                    <>
                      <button onClick={() => onEdit(recipe)} title={t('edit')} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                          <Icon name="edit" className="w-5 h-5" />
                      </button>
                       <button onClick={() => setIsDeleteModalOpen(true)} title={t('delete')} className="p-2 rounded-full text-light-text-secondary hover:text-red-600 dark:text-dark-text-secondary dark:hover:text-red-400 hover:bg-red-500/10 transition-colors">
                          <Icon name="trash-2" className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">{displayDescription}</p>
              <div className="flex items-center gap-6 text-center">
                  <div>
                      <p className="font-bold text-xl">{recipe.prepTime}'</p>
                      <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">{t('recipe_detail_prep_time').toUpperCase()}</p>
                  </div>
                   <div>
                      <p className="font-bold text-xl">{recipe.cookTime}'</p>
                      <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">{t('recipe_detail_cook_time').toUpperCase()}</p>
                  </div>
                  <div>
                      <p className="font-bold text-xl">{recipe.prepTime + recipe.cookTime}'</p>
                      <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">{t('recipe_detail_total_time').toUpperCase()}</p>
                  </div>
                  <div>
                      <p className="font-bold text-xl">{recipe.yield ? `${recipe.yield.quantity}${recipe.yield.unit}` : recipe.servings}</p>
                      <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">{recipe.yield ? t('recipe_detail_yield').toUpperCase() : t('recipe_detail_servings').toUpperCase()}</p>
                  </div>
              </div>
               {canManage && (
                <div className="mt-4 pt-4 border-t border-gray-200/80 dark:border-gray-700/80 flex items-center gap-2">
                    <button onClick={() => withApiKeyCheck(() => handleAiAction('improve'))} className="flex items-center gap-2 text-sm font-semibold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900 lift-on-hover">
                        <Icon name="sparkles" className="w-4 h-4"/> {t('ai_improve')}
                    </button>
                    <button onClick={() => withApiKeyCheck(() => handleAiAction('translate'))} className="flex items-center gap-2 text-sm font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900 lift-on-hover">
                        <Icon name="globe" className="w-4 h-4"/> {t('ai_translate')}
                    </button>
                </div>
               )}
            </div>
          </div>
          
          {/* Tabs */}
          <div className="my-6 flex items-center justify-between border-b border-gray-200/80 dark:border-gray-700/80 pb-2">
            <div className="flex items-center gap-2">
              <TabButton tab="ingredients" label={t('recipe_detail_tab_ingredients')} />
              <TabButton tab="steps" label={t('recipe_detail_tab_steps')} />
              <TabButton tab="allergens" label={t('recipe_detail_tab_allergens')} />
              <TabButton tab="costing" label={t('recipe_detail_tab_costing')} />
            </div>
            {activeTab === 'ingredients' && (
              <div className="flex items-center gap-2">
                <label htmlFor="servings-input" className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">{t('recipe_detail_adjust_servings')}:</label>
                <input
                  id="servings-input"
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(Math.max(1, parseInt(e.target.value, 10) || 1))}
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
                  <li key={ing.id} 
                      className={`flex items-center p-2 rounded-md ${ing.isSubRecipe ? 'cursor-pointer hover:bg-brand-yellow/10' : ''} bg-black/5 dark:bg-white/5`}
                      onClick={ing.isSubRecipe && ing.recipeId ? () => onSelectRecipe(ing.recipeId!) : undefined}
                  >
                    {ing.isSubRecipe && <Icon name="book-open" className="w-5 h-5 mr-3 text-brand-yellow" />}
                    <span className="font-bold text-light-text-primary dark:text-dark-text-primary flex-1">{ing.name}</span>
                    <span className="font-mono">{ing.quantity.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})} {ing.unit}</span>
                  </li>
                ))}
              </ul>
            )}
            {activeTab === 'steps' && renderSteps()}
            {activeTab === 'allergens' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {recipe.allergens.length > 0 ? recipe.allergens.map(allergen => (
                         <div key={allergen} className="flex items-center gap-3 p-3 bg-black/5 dark:bg-white/10 rounded-lg">
                            <AllergenIcon allergen={allergen} className="w-8 h-8 text-brand-yellow flex-shrink-0" />
                            <div>
                                <p className="font-semibold">{ALLERGEN_TRANSLATIONS[allergen][language]}</p>
                                <p className="text-sm italic text-light-text-secondary dark:text-dark-text-secondary">{ALLERGEN_TRANSLATIONS[allergen][language === 'el' ? 'en' : 'el']}</p>
                            </div>
                        </div>
                    )) : <p>{t('allergens_none')}</p>}
                </div>
            )}
            {activeTab === 'costing' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-black/5 dark:bg-white/5 p-4 rounded-lg">
                      <p className="text-xs font-bold uppercase text-light-text-secondary dark:text-dark-text-secondary">{t('costing_total')}</p>
                      <p className="text-2xl font-bold font-mono text-brand-yellow">{totalCost.toFixed(2)}€</p>
                  </div>
                  <div className="bg-black/5 dark:bg-white/5 p-4 rounded-lg">
                      <p className="text-xs font-bold uppercase text-light-text-secondary dark:text-dark-text-secondary">{t('costing_per_serving')}</p>
                      <p className="text-2xl font-bold font-mono text-brand-yellow">{costPerServing.toFixed(2)}€</p>
                  </div>
                   <div className="bg-black/5 dark:bg-white/5 p-4 rounded-lg">
                      <p className="text-xs font-bold uppercase text-light-text-secondary dark:text-dark-text-secondary">{t('costing_selling_price')}</p>
                      <p className="text-2xl font-bold font-mono text-brand-yellow">{recipe.price?.toFixed(2) || '-'}€</p>
                  </div>
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
        title={aiAction === 'improve' ? t('ai_improver_title') : t('ai_translator_title')}
        showConfirmButton={!isAiLoading && !!aiContent}
        onConfirm={handleConfirmAiChanges}
      />
    </>
  );
};

export default RecipeDetail;