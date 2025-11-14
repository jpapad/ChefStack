import React, { useMemo, useEffect } from 'react';
// Fix: Corrected RECIPE_CATEGORIES import to RECIPE_CATEGORY_KEYS.
import { Menu, Recipe, MenuPrintCustomizations, RECIPE_CATEGORY_KEYS, MenuStyle, MenuTemplate } from '../../types';

interface CustomerMenuPrintViewProps {
  menu: Menu;
  recipes: Recipe[];
  customizations: MenuPrintCustomizations;
}

const defaultStyle: MenuStyle = {
    templateName: 'classic',
    colors: {
        primary: '#333333',
        secondary: '#666666',
        accent: '#000000',
        background: '#FFFFFF',
    },
    fonts: {
        heading: "'Playfair Display', serif",
        body: "'Source Sans Pro', sans-serif",
    }
}

// --- Template Components ---
interface TemplateProps {
    menu: Menu;
    recipesByCategory: { category: string; recipes: Recipe[] }[];
    customizations: MenuPrintCustomizations;
    style: MenuStyle;
    formatPrice: (price: number | undefined) => string;
}

const ClassicTemplate: React.FC<TemplateProps> = ({ menu, recipesByCategory, customizations, style, formatPrice }) => (
    <div className="p-8" style={{ fontFamily: style.fonts.body, color: style.colors.primary }}>
      <header className="text-center mb-12">
        {customizations.logoUrl && <img src={customizations.logoUrl} alt="Logo" className="max-h-24 mx-auto mb-4" />}
        <h1 className="text-5xl font-bold tracking-wider" style={{ fontFamily: style.fonts.heading, color: style.colors.accent }}>{customizations.title || menu.name}</h1>
        {menu.description && <p className="text-lg italic mt-2" style={{ color: style.colors.secondary }}>{menu.description}</p>}
      </header>
      <main className="grid grid-cols-2 gap-x-12">
        {recipesByCategory.map(({ category, recipes: catRecipes }) => (
          <div key={category} className="break-inside-avoid-column mb-8">
            <h2 className="text-3xl font-semibold pb-2 mb-4" style={{ fontFamily: style.fonts.heading, borderBottom: `2px solid ${style.colors.accent}` }}>{category}</h2>
            <div className="space-y-5">
              {catRecipes.map(recipe => (
                <div key={recipe.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-xl font-bold" style={{ fontFamily: style.fonts.heading }}>{recipe.name}</h3>
                    <p className="text-lg font-bold" style={{ color: style.colors.primary }}>{formatPrice(recipe.price)}</p>
                  </div>
                  {recipe.description && <p className="text-base italic mt-1" style={{ color: style.colors.secondary }}>{recipe.description}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
);

const ModernTemplate: React.FC<TemplateProps> = ({ menu, recipesByCategory, customizations, style, formatPrice }) => (
    <div className="p-10" style={{ fontFamily: style.fonts.body, color: style.colors.primary }}>
      <header className="text-left mb-12 border-l-4 pl-4" style={{ borderColor: style.colors.accent }}>
        {customizations.logoUrl && <img src={customizations.logoUrl} alt="Logo" className="max-h-16 mb-4" />}
        <h1 className="text-5xl font-bold uppercase tracking-widest" style={{ fontFamily: style.fonts.heading, color: style.colors.accent }}>{customizations.title || menu.name}</h1>
        {menu.description && <p className="text-md mt-1" style={{ color: style.colors.secondary }}>{menu.description}</p>}
      </header>
      <main>
        {recipesByCategory.map(({ category, recipes: catRecipes }) => (
          <div key={category} className="mb-10">
            <h2 className="text-xl font-bold uppercase tracking-wider mb-4" style={{ fontFamily: style.fonts.heading, color: style.colors.primary }}>{category}</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {catRecipes.map(recipe => (
                <div key={recipe.id} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-lg font-bold uppercase" style={{ fontFamily: style.fonts.heading }}>{recipe.name}</h3>
                    <div className="flex-grow border-b border-dotted mx-2" style={{ borderColor: style.colors.secondary }}></div>
                    <p className="text-lg font-bold">{formatPrice(recipe.price)}</p>
                  </div>
                  {recipe.description && <p className="text-sm mt-1" style={{ color: style.colors.secondary }}>{recipe.description}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
);

const ElegantTemplate: React.FC<TemplateProps> = ({ menu, recipesByCategory, customizations, style, formatPrice }) => (
    <div className="p-8" style={{ fontFamily: style.fonts.body, color: style.colors.primary, border: `8px double ${style.colors.accent}`}}>
         <header className="text-center mb-10">
            {customizations.logoUrl && <img src={customizations.logoUrl} alt="Logo" className="max-h-20 mx-auto mb-4" />}
            <h1 className="text-4xl font-bold" style={{ fontFamily: style.fonts.heading, color: style.colors.accent }}>{customizations.title || menu.name}</h1>
        </header>
         <main className="space-y-8">
            {recipesByCategory.map(({ category, recipes: catRecipes }) => (
            <div key={category} className="text-center">
                <h2 className="text-2xl font-semibold tracking-widest uppercase mb-4" style={{ fontFamily: style.fonts.heading, color: style.colors.primary }}>{category}</h2>
                <div className="space-y-4">
                {catRecipes.map(recipe => (
                    <div key={recipe.id} className="break-inside-avoid">
                        <div className="flex justify-center items-baseline gap-2">
                           <h3 className="text-lg font-bold" style={{ fontFamily: style.fonts.heading }}>{recipe.name}</h3>
                           <p className="font-bold">{formatPrice(recipe.price)}</p>
                        </div>
                        {recipe.description && <p className="text-sm italic px-4" style={{ color: style.colors.secondary }}>{recipe.description}</p>}
                    </div>
                ))}
                </div>
            </div>
            ))}
        </main>
    </div>
);


const TEMPLATES: Record<MenuTemplate, React.FC<TemplateProps>> = {
    classic: ClassicTemplate,
    modern: ModernTemplate,
    elegant: ElegantTemplate,
};

const CustomerMenuPrintView: React.FC<CustomerMenuPrintViewProps> = ({ menu, recipes, customizations }) => {
  const style = customizations.style || defaultStyle;

  useEffect(() => {
    const headingFont = style.fonts.heading.split(',')[0].replace(/'/g, '').replace(/ /g, '+');
    const bodyFont = style.fonts.body.split(',')[0].replace(/'/g, '').replace(/ /g, '+');
    const linkId = 'google-fonts-for-print';
    let link = document.getElementById(linkId) as HTMLLinkElement | null;

    const fontUrl = `https://fonts.googleapis.com/css2?family=${headingFont}:wght@400;700;900&family=${bodyFont}:ital,wght@0,400;0,700;1,400&display=swap`;

    if (link) {
        link.href = fontUrl;
    } else {
        link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = fontUrl;
        document.head.appendChild(link);
    }
  }, [style.fonts]);

  const recipesByCategory = useMemo(() => {
    const grouped: { [key: string]: Recipe[] } = {};
    recipes.forEach(recipe => {
      if (!grouped[recipe.category]) {
        grouped[recipe.category] = [];
      }
      grouped[recipe.category].push(recipe);
    });
    // Fix: Changed filter/map to iterate over RECIPE_CATEGORY_KEYS array.
    return RECIPE_CATEGORY_KEYS.filter(cat => grouped[cat]).map(cat => ({
      category: cat,
      recipes: grouped[cat],
    }));
  }, [recipes]);
  
  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return '';
    return price.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' });
  };

  const SelectedTemplate = TEMPLATES[style.templateName] || TEMPLATES.classic;
  
  const templateProps: TemplateProps = { menu, recipesByCategory, customizations, style, formatPrice };

  return (
    <div className="font-sans" style={{ width: '210mm', minHeight: '297mm', backgroundColor: style.colors.background }}>
        <SelectedTemplate {...templateProps} />
        {customizations.footerText && (
            <footer 
                className="text-center text-xs" 
                style={{ 
                    color: style.colors.secondary, 
                    fontFamily: style.fonts.body,
                    position: 'absolute',
                    bottom: '20px',
                    left: 0,
                    right: 0,
                }}
            >
                <p>{customizations.footerText}</p>
            </footer>
        )}
    </div>
  );
};

export default CustomerMenuPrintView;