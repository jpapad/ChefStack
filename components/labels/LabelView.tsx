import React, { useState, useMemo } from 'react';
import { Recipe, Menu, LogoPosition, LanguageMode, AllergenIconVariant } from '../../types';
import { Icon } from '../common/Icon';
import LabelCard from './LabelCard';
import LabelSheet from './LabelSheet';
import PrintPreview from '../common/PrintPreview';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

interface LabelViewProps {
  recipes: Recipe[];
  menus: Menu[];
}

const LabelView: React.FC<LabelViewProps> = ({ recipes, menus }) => {
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string>('none');
  
  // Customization State
  const [showAllergens, setShowAllergens] = useState(true);
  const [allergenVariant, setAllergenVariant] = useState<AllergenIconVariant>('colored');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPosition, setLogoPosition] = useState<LogoPosition>('top');
  const [labelWidth, setLabelWidth] = useState(70);
  const [labelHeight, setLabelHeight] = useState(50);
  const [columnsPerPage, setColumnsPerPage] = useState(3);
  const [languageMode, setLanguageMode] = useState<LanguageMode>('el');
  const [printLegend, setPrintLegend] = useState(false);

  // Preset templates
  const presets = [
    { name: 'Μικρό (50×35mm)', width: 50, height: 35, columns: 4 },
    { name: 'Μεσαίο (70×50mm)', width: 70, height: 50, columns: 3 },
    { name: 'Μεγάλο (100×70mm)', width: 100, height: 70, columns: 2 },
    { name: 'A4 Full (210×297mm)', width: 210, height: 297, columns: 1 },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setLabelWidth(preset.width);
    setLabelHeight(preset.height);
    setColumnsPerPage(preset.columns);
  };

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
      if (!menuId || menuId === 'none') {
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
        allergenVariant={allergenVariant}
      />
    );
  };

  const sortedRecipes = [...recipes].sort((a,b) => a.name.localeCompare(b.name));

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
        {/* Settings Panel */}
        <div className="xl:col-span-3">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="settings" className="w-5 h-5" />
                Ρυθμίσεις Ετικετών
              </CardTitle>
              <CardDescription>
                Προσαρμόστε την εμφάνιση των ετικετών σας
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-6">
              {/* Quick Presets */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Γρήγορα Πρότυπα</Label>
                <div className="grid grid-cols-2 gap-2">
                  {presets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset(preset)}
                      className="h-auto py-2 text-xs"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Label Size */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Μέγεθος Ετικέτας (mm)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="width" className="text-xs text-muted-foreground">Πλάτος</Label>
                    <Input
                      id="width"
                      type="number"
                      value={labelWidth}
                      onChange={(e) => setLabelWidth(parseInt(e.target.value) || 0)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="height" className="text-xs text-muted-foreground">Ύψος</Label>
                    <Input
                      id="height"
                      type="number"
                      value={labelHeight}
                      onChange={(e) => setLabelHeight(parseInt(e.target.value) || 0)}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>

              {/* Columns Per Page */}
              <div className="space-y-2">
                <Label htmlFor="columns" className="text-sm font-semibold">Στήλες ανά Σελίδα</Label>
                <Input
                  id="columns"
                  type="number"
                  value={columnsPerPage}
                  onChange={(e) => setColumnsPerPage(parseInt(e.target.value) || 1)}
                  min={1}
                  max={6}
                  className="h-9"
                />
              </div>

              {/* Content Options */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Περιεχόμενο</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allergens"
                      checked={showAllergens}
                      onCheckedChange={(checked) => setShowAllergens(checked as boolean)}
                    />
                    <Label htmlFor="allergens" className="text-sm cursor-pointer">
                      Εμφάνιση Αλλεργιογόνων
                    </Label>
                  </div>
                  
                  {showAllergens && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="allergen-variant" className="text-xs text-muted-foreground">
                        Στυλ Αλλεργιογόνων
                      </Label>
                      <Select value={allergenVariant} onValueChange={(value) => setAllergenVariant(value as AllergenIconVariant)}>
                        <SelectTrigger id="allergen-variant" className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="colored">Χρωματιστά (Προτείνεται)</SelectItem>
                          <SelectItem value="monochrome">Μονόχρωμα</SelectItem>
                          <SelectItem value="outline">Περίγραμμα</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="legend"
                      checked={printLegend}
                      onCheckedChange={(checked) => setPrintLegend(checked as boolean)}
                    />
                    <Label htmlFor="legend" className="text-sm cursor-pointer">
                      Εκτύπωση Οδηγού Αλλεργιογόνων
                    </Label>
                  </div>
                </div>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm font-semibold">Γλώσσα</Label>
                <Select value={languageMode} onValueChange={(value) => setLanguageMode(value as LanguageMode)}>
                  <SelectTrigger id="language" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="el">Ελληνικά</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="both">Ελληνικά & English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Logo Options */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Λογότυπο</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="h-9 cursor-pointer"
                />
                {logoUrl && (
                  <div className="space-y-2 mt-2 p-3 bg-muted rounded-lg">
                    <img src={logoUrl} alt="Logo preview" className="h-12 object-contain mx-auto" />
                    <Select value={logoPosition} onValueChange={(value) => setLogoPosition(value as LogoPosition)}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Θέση λογότυπου" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Πάνω</SelectItem>
                        <SelectItem value="bottom">Κάτω</SelectItem>
                        <SelectItem value="left">Αριστερά</SelectItem>
                        <SelectItem value="right">Δεξιά</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>

            {/* Print Button */}
            <div className="p-6 pt-0">
              <Button
                onClick={handlePrint}
                disabled={recipesToPrint.length === 0}
                className="w-full h-12 gap-2"
                size="lg"
              >
                <Icon name="printer" className="w-5 h-5" />
                <span className="font-semibold">
                  Προεπισκόπηση & Εκτύπωση
                  {recipesToPrint.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {recipesToPrint.length}
                    </Badge>
                  )}
                </span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Recipe Selection & Preview */}
        <div className="xl:col-span-9 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recipe Selection */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="list" className="w-5 h-5" />
                Επιλογή Συνταγών
                {selectedRecipeIds.length > 0 && (
                  <Badge variant="default" className="ml-auto">
                    {selectedRecipeIds.length} επιλεγμένες
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Επιλέξτε τις συνταγές για τις οποίες θέλετε ετικέτες
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4">
              {/* Quick Menu Select */}
              <div className="space-y-2">
                <Label htmlFor="menu-select" className="text-sm font-semibold">
                  Γρήγορη επιλογή από μενού
                </Label>
                <Select value={selectedMenuId} onValueChange={handleMenuSelect}>
                  <SelectTrigger id="menu-select">
                    <SelectValue placeholder="-- Επιλογή Μενού --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Καμία (Χειροκίνητη επιλογή)</SelectItem>
                    {menus.map((menu) => (
                      <SelectItem key={menu.id} value={menu.id}>
                        {menu.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Recipe Grid */}
              <div className="flex-1 overflow-y-auto border-t pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sortedRecipes.map((recipe) => {
                    const isSelected = selectedRecipeIds.includes(recipe.id);
                    return (
                      <div
                        key={recipe.id}
                        onClick={() => handleRecipeSelect(recipe.id)}
                        className={`
                          group relative p-4 rounded-lg border-2 cursor-pointer transition-all
                          ${isSelected
                            ? 'border-brand-yellow bg-brand-yellow/10 shadow-md'
                            : 'border-border hover:border-brand-yellow/50 hover:bg-accent'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <div className="pt-0.5">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleRecipeSelect(recipe.id)}
                              className="pointer-events-none"
                            />
                          </div>
                          
                          {/* Recipe Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm leading-tight truncate">
                              {recipe.name}
                            </h4>
                            {recipe.name_en && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {recipe.name_en}
                              </p>
                            )}
                            {recipe.allergens.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {recipe.allergens.slice(0, 4).map((allergen) => (
                                  <div key={allergen} className="w-4 h-4">
                                    <Icon name="alert-circle" className="w-4 h-4 text-orange-500" />
                                  </div>
                                ))}
                                {recipe.allergens.length > 4 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{recipe.allergens.length - 4}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="eye" className="w-5 h-5" />
                Προεπισκόπηση
              </CardTitle>
              <CardDescription>
                Δείτε πώς θα φαίνονται οι ετικέτες σας
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {recipesToPrint.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                  <Icon name="package" className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-sm">Επιλέξτε συνταγές για να δείτε την προεπισκόπηση</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-xs text-muted-foreground text-center pb-2 border-b">
                    Προεπισκόπηση πρώτων {Math.min(3, recipesToPrint.length)} ετικετών
                  </div>
                  <div className="space-y-3">
                    {recipesToPrint.slice(0, 3).map((recipe) => (
                      <div key={recipe.id} className="flex justify-center">
                        <LabelCard
                          recipe={recipe}
                          showAllergens={showAllergens}
                          logoUrl={logoUrl}
                          logoPosition={logoPosition}
                          width={labelWidth}
                          height={labelHeight}
                          languageMode={languageMode}
                          allergenVariant={allergenVariant}
                        />
                      </div>
                    ))}
                  </div>
                  {recipesToPrint.length > 3 && (
                    <p className="text-xs text-center text-muted-foreground pt-2 border-t">
                      ...και {recipesToPrint.length - 3} ακόμα
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
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
