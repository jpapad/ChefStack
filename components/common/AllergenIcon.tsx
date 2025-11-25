import React from 'react';
import { Allergen, AllergenIconVariant } from '../../types';

interface AllergenIconProps extends React.SVGProps<SVGSVGElement> {
  allergen: Allergen;
  variant?: AllergenIconVariant; // Default: 'colored'
}

// Color scheme for each allergen (based on common food allergen color standards)
const ALLERGEN_COLORS: Record<Allergen, string> = {
  'Gluten': '#FF8C00',        // Orange (wheat/grains)
  'Crustaceans': '#FF6B6B',   // Coral red (shellfish)
  'Eggs': '#4ECDC4',          // Turquoise blue (egg)
  'Fish': '#FF6B6B',          // Salmon pink
  'Peanuts': '#8B4513',       // Brown (peanut shell)
  'Soybeans': '#90C695',      // Green (soy pods)
  'Milk': '#4A90E2',          // Blue (milk)
  'Nuts': '#8B4513',          // Brown (tree nuts)
  'Celery': '#A8D5A3',        // Light green (celery)
  'Mustard': '#FFD700',       // Gold/yellow (mustard)
  'Sesame seeds': '#D4A574',  // Tan/beige (sesame)
  'Sulphur dioxide and sulphites': '#708090', // Gray (chemical)
  'Lupin': '#9370DB',         // Purple (lupin flower)
  'Molluscs': '#FF7F7F',      // Pink (shellfish)
};

// Icon symbols (content only, no background circle)
const ALLERGEN_SYMBOLS: Record<Allergen, React.ReactNode> = {
  // 1. Gluten - Wheat stalk
  Gluten: (
    <>
      <path d="M12 7v9" strokeWidth="2.5" strokeLinecap="round" stroke="white" fill="none" />
      <path d="M9.5 9l2.5-2 2.5 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="white" fill="none" />
      <path d="M9.5 12l2.5-1.5 2.5 1.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="white" fill="none" />
      <path d="M9.5 15l2.5-1.5 2.5 1.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="white" fill="none" />
    </>
  ),
  // 2. Crustaceans - Shrimp
  Crustaceans: (
    <>
      <ellipse cx="12" cy="12.5" rx="5" ry="3.5" strokeWidth="2.5" stroke="white" fill="none" />
      <path d="M7.5 10.5l-1.5-1.5M16.5 10.5l1.5-1.5" strokeWidth="2.5" strokeLinecap="round" stroke="white" />
      <path d="M8.5 14l-1 1.5M15.5 14l1 1.5" strokeWidth="2.5" strokeLinecap="round" stroke="white" />
      <circle cx="10" cy="11" r="1" fill="white" />
      <circle cx="14" cy="11" r="1" fill="white" />
    </>
  ),
  // 3. Eggs - Egg shape
  Eggs: (
    <path d="M12 8c-2 0-3.5 1.5-3.5 4s1.5 4.5 3.5 4.5 3.5-2 3.5-4.5-1.5-4-3.5-4z" strokeWidth="2.5" stroke="white" fill="none" strokeLinecap="round" />
  ),
  // 4. Fish - Fish silhouette
  Fish: (
    <>
      <path d="M16.5 12c0-2-1.5-3.5-4-3.5s-4 1.5-4 3.5 1.5 3.5 4 3.5 4-1.5 4-3.5z" strokeWidth="2.5" stroke="white" fill="none" />
      <path d="M16.5 12l2.5-1.5M16.5 12l2.5 1.5" strokeWidth="2.5" strokeLinecap="round" stroke="white" />
      <circle cx="14" cy="11.5" r="1.2" fill="white" />
    </>
  ),
  // 5. Peanuts - Peanut shell
  Peanuts: (
    <>
      <path d="M8.5 12c0-1.5.8-2.8 2-2.8h3c1.2 0 2 1.3 2 2.8s-.8 2.8-2 2.8h-3c-1.2 0-2-1.3-2-2.8z" strokeWidth="2.5" stroke="white" fill="none" />
      <path d="M10.5 10v4M13.5 10v4" strokeWidth="2" strokeLinecap="round" stroke="white" />
    </>
  ),
  // 6. Soybeans - Soy pods
  Soybeans: (
    <>
      <path d="M8 11c0-1.5 1-2.5 2-2.5s2 1 2 2.5-1 2.5-2 2.5-2-1-2-2.5z" strokeWidth="2.5" stroke="white" fill="none" />
      <path d="M12 11c0-1.5 1-2.5 2-2.5s2 1 2 2.5-1 2.5-2 2.5-2-1-2-2.5z" strokeWidth="2.5" stroke="white" fill="none" />
      <path d="M10 14c0-1.2.8-2 1.5-2s1.5.8 1.5 2-.8 2-1.5 2-1.5-.8-1.5-2z" strokeWidth="2.5" stroke="white" fill="none" />
    </>
  ),
  // 7. Milk - Milk bottle
  Milk: (
    <>
      <path d="M10 8h4l.5 1v5.5c0 1.2-1 2-2.5 2s-2.5-.8-2.5-2V9l.5-1z" strokeWidth="2.5" stroke="white" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="10" y1="9" x2="14" y2="9" strokeWidth="2.5" strokeLinecap="round" stroke="white" />
    </>
  ),
  // 8. Tree Nuts - Hazelnut
  Nuts: (
    <>
      <circle cx="12" cy="13" r="3.5" strokeWidth="2.5" stroke="white" fill="none" />
      <path d="M12 9.5c-.5-1.2 0-2.5 1.2-2.8" strokeWidth="2.2" strokeLinecap="round" stroke="white" fill="none" />
      <path d="M13.2 7c.6 0 1.2.4 1.5 1.2" strokeWidth="2" strokeLinecap="round" stroke="white" fill="none" />
    </>
  ),
  // 9. Celery - Celery stalks
  Celery: (
    <>
      <path d="M9.5 16V11.5c0-.6.4-1 .8-1" strokeWidth="2.5" strokeLinecap="round" stroke="white" fill="none" />
      <path d="M12 16V10.5c0-.4.2-.8.4-.8" strokeWidth="2.5" strokeLinecap="round" stroke="white" fill="none" />
      <path d="M14.5 16V11.5c0-.6-.4-1-.8-1" strokeWidth="2.5" strokeLinecap="round" stroke="white" fill="none" />
      <circle cx="10" cy="9.5" r="1.2" fill="white" />
      <circle cx="12" cy="9" r="1.2" fill="white" />
      <circle cx="14" cy="9.5" r="1.2" fill="white" />
    </>
  ),
  // 10. Mustard - Mustard plant with seeds
  Mustard: (
    <>
      <text x="9.5" y="15" fontSize="7" fontWeight="900" fill="white" fontFamily="system-ui, sans-serif">M</text>
      <circle cx="9" cy="9.5" r="1.1" fill="white" />
      <circle cx="15" cy="9.5" r="1.1" fill="white" />
      <circle cx="10.5" cy="11.5" r="0.9" fill="white" />
      <circle cx="13.5" cy="11.5" r="0.9" fill="white" />
    </>
  ),
  // 11. Sesame - Scattered seeds
  'Sesame seeds': (
    <>
      <ellipse cx="12" cy="8.5" rx="1.1" ry="1.4" fill="white" />
      <ellipse cx="9" cy="11" rx="1" ry="1.3" fill="white" />
      <ellipse cx="15" cy="11" rx="1" ry="1.3" fill="white" />
      <ellipse cx="8" cy="14" rx="1" ry="1.3" fill="white" />
      <ellipse cx="16" cy="14" rx="1" ry="1.3" fill="white" />
      <ellipse cx="10.5" cy="15.5" rx="0.9" ry="1.2" fill="white" />
      <ellipse cx="13.5" cy="15.5" rx="0.9" ry="1.2" fill="white" />
    </>
  ),
  // 12. Sulphites - SO2
  'Sulphur dioxide and sulphites': (
    <text x="7.5" y="15.5" fontSize="8" fontWeight="900" fill="white" fontFamily="system-ui, sans-serif">SO₂</text>
  ),
  // 13. Lupin - Lupin flower
  Lupin: (
    <>
      <path d="M12 15v-3" strokeWidth="2.5" strokeLinecap="round" stroke="white" />
      <ellipse cx="12" cy="10" rx="2.2" ry="3" strokeWidth="2.3" stroke="white" fill="none" />
      <ellipse cx="9.5" cy="11" rx="1.6" ry="2.4" strokeWidth="2" stroke="white" fill="none" />
      <ellipse cx="14.5" cy="11" rx="1.6" ry="2.4" strokeWidth="2" stroke="white" fill="none" />
    </>
  ),
  // 14. Molluscs - Clam shell
  Molluscs: (
    <>
      <path d="M7 14c0-2.5 2-5 5-5s5 2.5 5 5" strokeWidth="2.5" stroke="white" fill="none" strokeLinecap="round" />
      <path d="M7 14c0 1.5 2 3 5 3s5-1.5 5-3" strokeWidth="2.5" stroke="white" fill="none" strokeLinecap="round" />
      <line x1="12" y1="9" x2="12" y2="14" strokeWidth="2.5" strokeLinecap="round" stroke="white" />
    </>
  ),
};

export const AllergenIcon: React.FC<AllergenIconProps> = ({ allergen, variant = 'colored', className, ...props }) => {
  const color = ALLERGEN_COLORS[allergen];
  
  // Variant A: Colored filled circles with white icons
  if (variant === 'colored') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        className={className}
        {...props}
      >
        <circle cx="12" cy="12" r="11" fill={color} />
        {ALLERGEN_SYMBOLS[allergen]}
      </svg>
    );
  }
  
  // Variant B: Monochrome (adapts to theme)
  if (variant === 'monochrome') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        {...props}
      >
        <circle cx="12" cy="12" r="11" fill="currentColor" />
        <g style={{ color: 'white' }}>
          {ALLERGEN_SYMBOLS[allergen]}
        </g>
      </svg>
    );
  }
  
  // Variant C: Outline only (no fill)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10.5" strokeWidth="2" />
      <g style={{ stroke: 'currentColor', fill: 'currentColor' }}>
        {/* Outline version - stroke only */}
        {allergen === 'Gluten' && (
          <>
            <path d="M12 7v9" strokeWidth="2" strokeLinecap="round" />
            <path d="M9.5 9l2.5-2 2.5 2M9.5 12l2.5-1.5 2.5 1.5M9.5 15l2.5-1.5 2.5 1.5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        {allergen === 'Crustaceans' && (
          <>
            <ellipse cx="12" cy="12.5" rx="5" ry="3.5" strokeWidth="2" />
            <path d="M7.5 10.5l-1.5-1.5M16.5 10.5l1.5-1.5M8.5 14l-1 1.5M15.5 14l1 1.5" strokeWidth="2" strokeLinecap="round" />
            <circle cx="10" cy="11" r="0.8" />
            <circle cx="14" cy="11" r="0.8" />
          </>
        )}
        {allergen === 'Eggs' && (
          <path d="M12 8c-2 0-3.5 1.5-3.5 4s1.5 4.5 3.5 4.5 3.5-2 3.5-4.5-1.5-4-3.5-4z" strokeWidth="2" strokeLinecap="round" />
        )}
        {allergen === 'Fish' && (
          <>
            <path d="M16.5 12c0-2-1.5-3.5-4-3.5s-4 1.5-4 3.5 1.5 3.5 4 3.5 4-1.5 4-3.5z" strokeWidth="2" />
            <path d="M16.5 12l2.5-1.5M16.5 12l2.5 1.5" strokeWidth="2" strokeLinecap="round" />
            <circle cx="14" cy="11.5" r="1" />
          </>
        )}
        {allergen === 'Peanuts' && (
          <>
            <path d="M8.5 12c0-1.5.8-2.8 2-2.8h3c1.2 0 2 1.3 2 2.8s-.8 2.8-2 2.8h-3c-1.2 0-2-1.3-2-2.8z" strokeWidth="2" />
            <path d="M10.5 10v4M13.5 10v4" strokeWidth="1.5" strokeLinecap="round" />
          </>
        )}
        {allergen === 'Soybeans' && (
          <>
            <ellipse cx="9" cy="10.5" rx="2" ry="2.8" strokeWidth="2" />
            <ellipse cx="15" cy="10.5" rx="2" ry="2.8" strokeWidth="2" />
            <ellipse cx="12" cy="14.5" rx="2" ry="2.8" strokeWidth="2" />
          </>
        )}
        {allergen === 'Milk' && (
          <>
            <path d="M10 8h4l.5 1v5.5c0 1.2-1 2-2.5 2s-2.5-.8-2.5-2V9l.5-1z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="10" y1="9" x2="14" y2="9" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
        {allergen === 'Nuts' && (
          <>
            <circle cx="12" cy="13" r="3.5" strokeWidth="2" />
            <path d="M12 9.5c-.5-1.2 0-2.5 1.2-2.8M13.2 7c.6 0 1.2.4 1.5 1.2" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
        {allergen === 'Celery' && (
          <>
            <path d="M9.5 16V11.5c0-.6.4-1 .8-1M12 16V10.5c0-.4.2-.8.4-.8M14.5 16V11.5c0-.6-.4-1-.8-1" strokeWidth="2" strokeLinecap="round" />
            <circle cx="10" cy="9.5" r="1" />
            <circle cx="12" cy="9" r="1" />
            <circle cx="14" cy="9.5" r="1" />
          </>
        )}
        {allergen === 'Mustard' && (
          <>
            <text x="9.5" y="15" fontSize="7" fontWeight="700" fontFamily="system-ui">M</text>
            <circle cx="9" cy="9.5" r="0.9" />
            <circle cx="15" cy="9.5" r="0.9" />
            <circle cx="10.5" cy="11.5" r="0.7" />
            <circle cx="13.5" cy="11.5" r="0.7" />
          </>
        )}
        {allergen === 'Sesame seeds' && (
          <>
            <ellipse cx="12" cy="8.5" rx="1" ry="1.3" />
            <ellipse cx="9" cy="11" rx="0.9" ry="1.2" />
            <ellipse cx="15" cy="11" rx="0.9" ry="1.2" />
            <ellipse cx="8" cy="14" rx="0.9" ry="1.2" />
            <ellipse cx="16" cy="14" rx="0.9" ry="1.2" />
            <ellipse cx="10.5" cy="15.5" rx="0.8" ry="1.1" />
            <ellipse cx="13.5" cy="15.5" rx="0.8" ry="1.1" />
          </>
        )}
        {allergen === 'Sulphur dioxide and sulphites' && (
          <text x="7.5" y="15.5" fontSize="7" fontWeight="700" fontFamily="system-ui">SO₂</text>
        )}
        {allergen === 'Lupin' && (
          <>
            <path d="M12 15v-3" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="12" cy="10" rx="2.2" ry="3" strokeWidth="2" />
            <ellipse cx="9.5" cy="11" rx="1.6" ry="2.4" strokeWidth="1.8" />
            <ellipse cx="14.5" cy="11" rx="1.6" ry="2.4" strokeWidth="1.8" />
          </>
        )}
        {allergen === 'Molluscs' && (
          <>
            <path d="M7 14c0-2.5 2-5 5-5s5 2.5 5 5M7 14c0 1.5 2 3 5 3s5-1.5 5-3" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="9" x2="12" y2="14" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
      </g>
    </svg>
  );
};