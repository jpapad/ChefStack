import React, { useState } from 'react';
import { Recipe, Menu, LogoPosition, LanguageMode, AllergenIconVariant } from '../../types';
import { Icon } from '../common/Icon';
import PrintPreview from '../common/PrintPreview';
import LabelSheet from './LabelSheet';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

interface LabelPrintViewProps {
  recipes: Recipe[];
  menus: Menu[];
  onBack: () => void;
}

const LabelPrintView: React.FC<LabelPrintViewProps> = ({ recipes, menus, onBack }) => {
  const [printPreviewContent, setPrintPreviewContent] = useState<React.ReactNode | null>(null);
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

  const toggleRecipe = (recipeId: string) => {
    setSelectedRecipeIds((prev) =>
      prev.includes(recipeId)
        ? prev.filter((id) => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const sortedRecipes = [...recipes].sort((a, b) => a.name.localeCompare(b.name));
  const recipesToPrint = sortedRecipes.filter((r) => selectedRecipeIds.includes(r.id));

  return (
    <>
      <div className="max-w-7xl mx-auto p-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 gap-2"
        >
          <Icon name="arrow-left" className="w-4 h-4" />
          Πίσω στις Ετικέτες
        </Button>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Settings Panel */}
          <div className="xl:col-span-4">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="settings" className="w-5 h-5" />
                  Ρυθμίσεις Εκτύπωσης
                </CardTitle>
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
                    Εκτύπωση Ετικετών ({recipesToPrint.length})
                  </span>
                </Button>
              </div>
            </Card>
          </div>

          {/* Recipe Selection */}
          <div className="xl:col-span-8">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="list" className="w-5 h-5" />
                  Επιλογή Συνταγών
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-4">
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

                {/* Recipe Checkboxes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Συνταγές ({selectedRecipeIds.length} επιλεγμένες)</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRecipeIds(sortedRecipes.map(r => r.id))}
                      >
                        Επιλογή Όλων
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRecipeIds([])}
                      >
                        Καθαρισμός
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[600px] overflow-y-auto p-2 border rounded-lg">
                    {sortedRecipes.map((recipe) => (
                      <div
                        key={recipe.id}
                        className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleRecipe(recipe.id)}
                      >
                        <Checkbox
                          id={`recipe-${recipe.id}`}
                          checked={selectedRecipeIds.includes(recipe.id)}
                          onCheckedChange={() => toggleRecipe(recipe.id)}
                        />
                        <Label
                          htmlFor={`recipe-${recipe.id}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {recipe.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
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

export default LabelPrintView;
