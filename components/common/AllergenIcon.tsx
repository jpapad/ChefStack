import React from 'react';
import { Allergen } from '../../types';

interface AllergenIconProps extends React.SVGProps<SVGSVGElement> {
  allergen: Allergen;
}

// Official EU allergen pictograms (Regulation 1169/2011) - simplified SVG representations
const ALLERGEN_ICONS: Record<Allergen, React.ReactNode> = {
  // 1. Cereals containing gluten (wheat symbol)
  Gluten: (
    <g>
      <circle cx="12" cy="12" r="11" fill="none" strokeWidth="1.5" />
      <path d="M12 5v14M9 7l3-2 3 2M9 11h6M9 15h6" strokeWidth="1.5" fill="none" />
    </g>
  ),
  // 2. Crustaceans (shrimp/lobster)
  Crustaceans: (
    <g>
      <circle cx="12" cy="12" r="11" fill="none" strokeWidth="1.5" />
      <ellipse cx="12" cy="13" rx="5" ry="3" strokeWidth="1.5" fill="none" />
      <path d="M7 13v3M17 13v3M9 10l-2-2M15 10l2-2M12 8v3" strokeWidth="1.5" fill="none" />
      <circle cx="10.5" cy="11" r="0.5" fill="currentColor" />
      <circle cx="13.5" cy="11" r="0.5" fill="currentColor" />
    </g>
  ),
  // 3. Eggs
  Eggs: (
    <g>
      <circle cx="12" cy="12" r="11" fill="none" strokeWidth="1.5" />
      <ellipse cx="12" cy="13" rx="5" ry="6.5" strokeWidth="1.5" fill="none" />
    </g>
  ),
  // 4. Fish
  Fish: (
    <g>
      <circle cx="12" cy="12" r="11" fill="none" strokeWidth="1.5" />
      <path d="M17 12c0-2-2-4-5-4s-5 2-5 4 2 4 5 4 5-2 5-4z" strokeWidth="1.5" fill="none" />
      <path d="M17 12l3-1.5L17 9M17 12l3 1.5L17 15" strokeWidth="1.5" fill="none" />
      <circle cx="14" cy="11" r="0.8" fill="currentColor" />
    </g>
  ),
  // 5. Peanuts
  Peanuts: (
    <g>
      <circle cx="12" cy="12" r="11" fill="none" strokeWidth="1.5" />
      <path d="M9 8c-1.5 0-2.5 1-2.5 2.5v3c0 1.5 1 2.5 2.5 2.5h6c1.5 0 2.5-1 2.5-2.5v-3c0-1.5-1-2.5-2.5-2.5H9z" strokeWidth="1.5" fill="none" />
      <path d="M9.5 11v2M12 11v2M14.5 11v2" strokeWidth="1.5" />
    </g>
  ),
  // 6. Soybeans
  Soybeans: (
    <g>
      <circle cx="12" cy="12" r="11" fill="none" strokeWidth="1.5" />
      <circle cx="9" cy="10" r="2.5" strokeWidth="1.5" fill="none" />
      <circle cx="15" cy="10" r="2.5" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="15" r="2.5" strokeWidth="1.5" fill="none" />
    </g>
  ),
  // 7. Milk
  Milk: (
    <g>
      <circle cx="12" cy="12" r="11" fill="none" strokeWidth="1.5" />
      <path d="M9 7h6l1 2v6c0 1.5-1.5 3-4 3s-4-1.5-4-3V9l1-2z" strokeWidth="1.5" fill="none" />
      <line x1="9" y1="9" x2="15" y2="9" strokeWidth="1.5" />
    </g>
  ),
  // 8. Nuts (tree nuts - hazelnut)
  Nuts: (
    <g>
      <circle cx="12" cy="12" r="11" fill="none" strokeWidth="1.5" />
      <circle cx="12" cy="13" r="4.5" strokeWidth="1.5" fill="none" />
      <path d="M12 8.5v-2M10 9l-1.5-1.5M14 9l1.5-1.5" strokeWidth="1.5" fill="none" />
      <line x1="10" y1="13" x2="14" y2="13" strokeWidth="1.5" />
    </g>
  ),
  // 9. Celery
  Celery: (
    <g>
      <circle cx="12" cy="12" r="11" fill="none" strokeWidth="1.5" />
      <path d="M9 17v-7c0-1 .5-2 1.5-2M12 17v-8c0-1 0-1.5.5-1.5M15 17v-7c0-1-.5-2-1.5-2" strokeWidth="1.5" fill="none" />
      <circle cx="9.5" cy="8" r="1" fill="currentColor" />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" />
      <circle cx="14.5" cy="8" r="1" fill="currentColor" />
    </g>
  ),
  // 10. Mustard
  Mustard: (
    <g>
      <circle cx="12" cy="12" r="11" fill="none" strokeWidth="1.5" />
      <path d="M12 7v5M10 14c0 1.1.9 2 2 2s2-.9 2-2" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="14" r="1.5" strokeWidth="1.5" fill="none" />
      <circle cx="9" cy="9" r="0.8" fill="currentColor" />
      <circle cx="15" cy="9" r="0.8" fill="currentColor" />
      <circle cx="10" cy="11" r="0.6" fill="currentColor" />
      <circle cx="14" cy="11" r="0.6" fill="currentColor" />
    </g>
  ),
  // 11. Sesame seeds
  'Sesame seeds': (
    <g>
      <circle cx="12" cy="12" r="11" fill="none" strokeWidth="1.5" />
      <circle cx="12" cy="8" r="1.2" fill="currentColor" />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
      <circle cx="8" cy="13" r="1.1" fill="currentColor" />
      <circle cx="16" cy="13" r="1.1" fill="currentColor" />
      <circle cx="10" cy="15" r="0.9" fill="currentColor" />
      <circle cx="14" cy="15" r="0.9" fill="currentColor" />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" />
    </g>
  ),
  // 12. Sulphur dioxide and sulphites
  'Sulphur dioxide and sulphites': (
    <g>
      <circle cx="12" cy="12" r="11" fill="none" strokeWidth="1.5" />
      <text x="8" y="16" fontSize="10" fontWeight="bold" fill="currentColor">SO₂</text>
    </g>
  ),
  // 13. Lupin
  Lupin: (
    <g>
      <circle cx="12" cy="12" r="11" fill="none" strokeWidth="1.5" />
      <path d="M12 16v-4" strokeWidth="1.5" fill="none" />
      <ellipse cx="12" cy="10" rx="2" ry="3" strokeWidth="1.5" fill="none" />
      <ellipse cx="9.5" cy="11" rx="1.5" ry="2.5" strokeWidth="1.5" fill="none" />
      <ellipse cx="14.5" cy="11" rx="1.5" ry="2.5" strokeWidth="1.5" fill="none" />
    </g>
  ),
  // 14. Molluscs (shellfish - clam)
  Molluscs: (
    <g>
      <circle cx="12" cy="12" r="11" fill="none" strokeWidth="1.5" />
      <path d="M7 15c0-2.5 2-5 5-5s5 2.5 5 5" strokeWidth="1.5" fill="none" />
      <path d="M7 15c0 1.5 2 3 5 3s5-1.5 5-3" strokeWidth="1.5" fill="none" />
      <line x1="12" y1="10" x2="12" y2="15" strokeWidth="1.5" />
    </g>
  ),
};

export const AllergenIcon: React.FC<AllergenIconProps> = ({ allergen, className, ...props }) => {
    return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          {...props}
        >
          {ALLERGEN_ICONS[allergen]}
        </svg>
    );
};