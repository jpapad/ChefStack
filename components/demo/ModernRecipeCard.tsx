import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { AllergenIcon } from '../common/AllergenIcon';
import { Icon } from '../common/Icon';
import type { Recipe, Allergen } from '../../types';

interface ModernRecipeCardProps {
  recipe: Recipe;
  mode: 'thumbnail' | 'full';
  onView?: () => void;
  onEdit?: () => void;
}

export const ModernRecipeCard: React.FC<ModernRecipeCardProps> = ({
  recipe,
  mode,
  onView,
  onEdit
}) => {
  const categoryColors: Record<string, string> = {
    appetizer: 'from-orange-400 to-rose-400',
    main_course: 'from-red-500 to-orange-500',
    salad: 'from-green-400 to-emerald-500',
    soup: 'from-amber-400 to-yellow-500',
    dessert: 'from-pink-400 to-purple-500',
    sub_recipe: 'from-blue-400 to-cyan-500',
    other: 'from-gray-400 to-slate-500'
  };

  const gradientClass = categoryColors[recipe.category] || categoryColors.other;

  if (mode === 'thumbnail') {
    return (
      <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card">
        {/* Image Section with Gradient Overlay */}
        <div className="relative h-48 overflow-hidden">
          {recipe.imageUrl ? (
            <img 
              src={recipe.imageUrl} 
              alt={recipe.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
              <Icon name="chef-hat" className="w-16 h-16 text-white/30" />
            </div>
          )}
          
          {/* Category Badge - Floating */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-sm">
              {recipe.category === 'main_course' ? 'Κυρίως' : 
               recipe.category === 'appetizer' ? 'Ορεκτικό' :
               recipe.category === 'dessert' ? 'Επιδόρπιο' : 
               recipe.category === 'salad' ? 'Σαλάτα' :
               recipe.category === 'soup' ? 'Σούπα' : 'Άλλο'}
            </span>
          </div>

          {/* Quick Actions - Show on Hover */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
            <Button 
              size="sm" 
              variant="secondary"
              className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white"
              onClick={onEdit}
            >
              <Icon name="edit" className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <CardHeader className="pb-3">
          <CardTitle className="text-lg line-clamp-1">{recipe.name}</CardTitle>
          {recipe.name_en && (
            <CardDescription className="text-xs line-clamp-1">{recipe.name_en}</CardDescription>
          )}
        </CardHeader>

        <CardContent className="pb-3 space-y-3">
          {/* Quick Stats */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Icon name="clock" className="w-4 h-4" />
              <span>{recipe.prepTime + recipe.cookTime} λεπτά</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="users" className="w-4 h-4" />
              <span>{recipe.yield.quantity} μερίδες</span>
            </div>
          </div>

          {/* Allergens */}
          {recipe.allergens && recipe.allergens.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {recipe.allergens.slice(0, 4).map((allergen) => (
                <AllergenIcon key={allergen} allergen={allergen as Allergen} />
              ))}
              {recipe.allergens.length > 4 && (
                <span className="text-xs text-muted-foreground">+{recipe.allergens.length - 4}</span>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-3 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-center gap-2"
            onClick={onView}
          >
            Προβολή
            <Icon name="arrow-right" className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Full Mode - Detailed Card
  return (
    <Card className="overflow-hidden border-border/50 bg-card">
      <div className="grid md:grid-cols-5 gap-0">
        {/* Left: Image (2 columns) */}
        <div className="md:col-span-2 relative h-64 md:h-full min-h-[300px]">
          {recipe.imageUrl ? (
            <img 
              src={recipe.imageUrl} 
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
              <Icon name="chef-hat" className="w-24 h-24 text-white/20" />
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-black/70 text-white backdrop-blur-sm">
              {recipe.category === 'main_course' ? 'Κυρίως Πιάτο' : 
               recipe.category === 'appetizer' ? 'Ορεκτικό' :
               recipe.category === 'dessert' ? 'Επιδόρπιο' : 
               recipe.category === 'salad' ? 'Σαλάτα' :
               recipe.category === 'soup' ? 'Σούπα' : 'Άλλο'}
            </span>
          </div>
        </div>

        {/* Right: Content (3 columns) */}
        <div className="md:col-span-3 flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-1">{recipe.name}</CardTitle>
                {recipe.name_en && (
                  <CardDescription className="text-base">{recipe.name_en}</CardDescription>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Icon name="edit" className="w-4 h-4 mr-2" />
                  Επεξεργασία
                </Button>
                <Button size="sm">
                  <Icon name="printer" className="w-4 h-4 mr-2" />
                  Εκτύπωση
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Icon name="clock" className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <div className="text-sm font-medium">{recipe.prepTime}′</div>
                <div className="text-xs text-muted-foreground">Προετ.</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Icon name="flame" className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <div className="text-sm font-medium">{recipe.cookTime}′</div>
                <div className="text-xs text-muted-foreground">Μαγείρ.</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Icon name="users" className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <div className="text-sm font-medium">{recipe.yield.quantity}</div>
                <div className="text-xs text-muted-foreground">Μερίδες</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Icon name="trending-up" className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <div className="text-sm font-medium">{recipe.difficulty || 'Μέτρια'}</div>
                <div className="text-xs text-muted-foreground">Δυσκολία</div>
              </div>
            </div>

            {/* Description */}
            {recipe.description && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Περιγραφή</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {recipe.description}
                </p>
              </div>
            )}

            {/* Allergens */}
            {recipe.allergens && recipe.allergens.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Icon name="alert-triangle" className="w-4 h-4 text-amber-500" />
                  Αλλεργιογόνα
                </h4>
                <div className="flex flex-wrap gap-2">
                  {recipe.allergens.map((allergen) => (
                    <AllergenIcon key={allergen} allergen={allergen as Allergen} />
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients Preview */}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Υλικά ({recipe.ingredients.length})</h4>
                <div className="grid grid-cols-2 gap-1 text-sm">
                  {recipe.ingredients.slice(0, 6).map((ing, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-muted-foreground">
                      <Icon name="circle" className="w-1.5 h-1.5 fill-current" />
                      <span>{ing.name}</span>
                    </div>
                  ))}
                  {recipe.ingredients.length > 6 && (
                    <div className="text-xs text-muted-foreground">
                      +{recipe.ingredients.length - 6} ακόμα...
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  );
};
