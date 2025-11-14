import React, { useState, useMemo } from 'react';
import { Recipe, Menu, LogoPosition, LanguageMode } from '../../types';
import { Icon } from '../common/Icon';
import LabelSheet from './LabelSheet';
import PrintPreview from '../common/PrintPreview';

interface LabelViewProps {
  recipes: Recipe[];
  menus: Menu[];
}

const LabelView: React.FC<LabelViewProps> = ({ recipes, menus }) => {
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');
  
  // Customization State
  const [showAllergens, setShowAllergens] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPosition, setLogoPosition] = useState<LogoPosition>('top');
  const [labelWidth, setLabelWidth] = useState(70);
  const [labelHeight, setLabelHeight] = useState(50);
  const [columnsPerPage, setColumnsPerPage] = useState(3);
  const [languageMode, setLanguageMode] = useState<LanguageMode>('el');
  const [printLegend, setPrintLegend] = useState(false);

  const [printPreviewContent, setPrintPreviewContent] = useState<React.ReactNode | null>(null);

  const recipesToPrint = useMemo(() => {
    return recipes.filter(r => selectedRecipeIds.includes(r.id))
                  .sort((a,b) => a.name.localeCompare(b.name));
  }, [recipes, selectedRecipeIds]);

  const handleRecipeSelect = (recipeId: string) => {
    setSelectedRecipeIds(prev =>
      prev.includes(recipeId) ? prev.filter(id => id !== recipeId) : [...prev, recipeId]
    );
  };
  
  const handleMenuSelect = (menuId: string) => {
      setSelectedMenuId(menuId);
      if (!menuId) {
          setSelectedRecipeIds([]);
          return;
      }
      const menu = menus.find(m => m.id === menuId);
      if (menu) {
          if (menu.type === 'a_la_carte') {
              setSelectedRecipeIds(menu.recipeIds);
          } else {
              const recipeIds = new Set<string>();
              menu.dailyPlans.forEach(plan => {
                  plan.mealPeriods.forEach(period => {
                      period.categories.forEach(cat => {
                          cat.recipes.forEach(r => recipeIds.add(r.recipeId));
                      });
                  });
              });
              setSelectedRecipeIds(Array.from(recipeIds));
          }
      }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    setPrintPreviewContent(
      <LabelSheet
        recipes={recipesToPrint}
        showAllergens={showAllergens}
        logoUrl={logoUrl}
        logoPosition={logoPosition}
        labelWidth={labelWidth}
        labelHeight={labelHeight}
        languageMode={languageMode}
        columnsPerPage={columnsPerPage}
        printLegend={printLegend}
      />
    );
  };

  const sortedRecipes = [...recipes].sort((a,b) => a.name.localeCompare(b.name));

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Customization Panel */}
        <div className="lg:col-span-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl h-full flex flex-col">
           <h2 className="text-2xl font-bold font-heading mb-4">Ρυθμίσεις Ετικετών</h2>
           <div className="space-y-4 overflow-y-auto pr-2 -mr-2 flex-grow">
               {/* Label Size */}
                <div>
                    <h3 className="font-semibold mb-2">Μέγεθος Ετικέτας (mm)</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <input type="number" value={labelWidth} onChange={e => setLabelWidth(parseInt(e.target.value) || 0)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg" placeholder="Πλάτος"/>
                        <input type="number" value={labelHeight} onChange={e => setLabelHeight(parseInt(e.target.value) || 0)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg" placeholder="Ύψος"/>
                    </div>
                </div>
                 <div>
                    <label className="font-semibold mb-2 block">Στήλες ανά Σελίδα</label>
                    <input type="number" value={columnsPerPage} onChange={e => setColumnsPerPage(parseInt(e.target.value) || 1)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg"/>
                </div>
               {/* Content Options */}
               <div>
                  <h3 className="font-semibold mb-2">Περιεχόμενο</h3>
                   <div className="space-y-2">
                     <label className="flex items-center gap-2"><input type="checkbox" checked={showAllergens} onChange={e => setShowAllergens(e.target.checked)} /> Εμφάνιση Αλλεργιογόνων</label>
                     <label className="flex items-center gap-2"><input type="checkbox" checked={printLegend} onChange={e => setPrintLegend(e.target.checked)} /> Εκτύπωση Οδηγού Αλλεργιογόνων</label>
                   </div>
                   <div className="mt-2">
                     <label className="font-semibold mb-1 block">Γλώσσα</label>
                     <select value={languageMode} onChange={e => setLanguageMode(e.target.value as LanguageMode)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg">
                        <option value="el">Ελληνικά</option>
                        <option value="en">English</option>
                        <option value="both">Ελληνικά & English</option>
                     </select>
                   </div>
               </div>

               {/* Logo Options */}
               <div>
                    <h3 className="font-semibold mb-2">Λογότυπο</h3>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-yellow/20 file:text-brand-yellow hover:file:bg-brand-yellow/30"/>
                    {logoUrl && (
                        <div className="mt-2">
                             <label className="font-semibold mb-1 block">Θέση Λογότυπου</label>
                             <select value={logoPosition} onChange={e => setLogoPosition(e.target.value as LogoPosition)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg">
                                <option value="top">Πάνω</option><option value="bottom">Κάτω</option><option value="left">Αριστερά</option><option value="right">Δεξιά</option>
                             </select>
                        </div>
                    )}
               </div>
           </div>
            <button onClick={handlePrint} disabled={recipesToPrint.length === 0} className="w-full mt-6 flex items-center justify-center gap-2 bg-brand-dark text-white px-4 py-3 rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                <Icon name="printer" className="w-5 h-5"/>
                <span className="font-semibold">Προεπισκόπηση & Εκτύπωση ({recipesToPrint.length})</span>
            </button>
        </div>

        {/* Recipe Selection */}
        <div className="lg:col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl h-full flex flex-col">
            <h2 className="text-2xl font-bold font-heading mb-4">Επιλογή Συνταγών</h2>
             <div className="mb-4">
                <label className="font-semibold mb-1 block">Γρήγορη επιλογή από μενού:</label>
                 <select value={selectedMenuId} onChange={e => handleMenuSelect(e.target.value)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg">
                     <option value="">-- Επιλογή Μενού --</option>
                     {menus.map(menu => <option key={menu.id} value={menu.id}>{menu.name}</option>)}
                 </select>
            </div>
            <div className="flex-grow overflow-y-auto border-t border-gray-200/80 dark:border-gray-700/80 pt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sortedRecipes.map(recipe => (
                        <label key={recipe.id} className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedRecipeIds.includes(recipe.id) ? 'bg-brand-yellow text-brand-dark' : 'bg-black/5 dark:bg-white/10'}`}>
                            <input type="checkbox" checked={selectedRecipeIds.includes(recipe.id)} onChange={() => handleRecipeSelect(recipe.id)} className="hidden"/>
                            <span className="font-semibold">{recipe.name}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
      </div>
       {printPreviewContent && (
        <PrintPreview onClose={() => setPrintPreviewContent(null)}>
          {printPreviewContent}
        </PrintPreview>
      )}
    </>
  );
};

export default LabelView;
