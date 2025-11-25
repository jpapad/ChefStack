import React from 'react';
import { Allergen } from '../../types';

interface AllergenIconProps extends React.SVGProps<SVGSVGElement> {
  allergen: Allergen;
}

// Modern EU allergen pictograms - Clean, recognizable designs based on official guidelines
const ALLERGEN_ICONS: Record<Allergen, React.ReactNode> = {
  // 1. Cereals containing gluten - Modern wheat stalk
  Gluten: (
    <g>
      <circle cx="12" cy="12" r="10.5" fill="none" strokeWidth="2" />
      <path d="M12 6v10" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 8l3-2 3 2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M9 11l3-1.5 3 1.5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M9 14l3-1.5 3 1.5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
  ),
  // 2. Crustaceans - Modern lobster/shrimp silhouette
  Crustaceans: (
    <g>
      <circle cx="12" cy="12" r="10.5" fill="none" strokeWidth="2" />
      <ellipse cx="12" cy="12.5" rx="5.5" ry="4" strokeWidth="2" fill="none" />
      <path d="M7 10l-2-2M17 10l2-2" strokeWidth="2" strokeLinecap="round" />
      <path d="M8.5 13.5l-1.5 2M15.5 13.5l1.5 2" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="10.5" r="1" fill="currentColor" />
      <circle cx="14" cy="10.5" r="1" fill="currentColor" />
      <path d="M12 8v2" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  ),
  // 3. Eggs - Clean egg shape
  Eggs: (
    <g>
      <circle cx="12" cy="12" r="10.5" fill="none" strokeWidth="2" />
      <path d="M12 7c-2.5 0-4 2-4 5s1.5 5 4 5 4-2 4-5-1.5-5-4-5z" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  // 4. Fish - Modern fish profile
  Fish: (
    <g>
      <circle cx="12" cy="12" r="10.5" fill="none" strokeWidth="2" />
      <path d="M17 12c0-2.5-2-4.5-5-4.5S7 9.5 7 12s2 4.5 5 4.5 5-2 5-4.5z" strokeWidth="2" fill="none" />
      <path d="M17 12l3.5-2M17 12l3.5 2" strokeWidth="2" strokeLinecap="round" />
      <circle cx="14.5" cy="11" r="1.2" fill="currentColor" />
      <path d="M10 12h2" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  ),
  // 5. Peanuts - Peanut shell with texture
  Peanuts: (
    <g>
      <circle cx="12" cy="12" r="10.5" fill="none" strokeWidth="2" />
      <path d="M8 12c0-2 1-3.5 2.5-3.5h3c1.5 0 2.5 1.5 2.5 3.5s-1 3.5-2.5 3.5h-3C9 15.5 8 14 8 12z" strokeWidth="2" fill="none" />
      <path d="M11 9.5v5M13 9.5v5" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9.5 12h5" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  ),
  // 6. Soybeans - Three bean pods
  Soybeans: (
    <g>
      <circle cx="12" cy="12" r="10.5" fill="none" strokeWidth="2" />
      <ellipse cx="8.5" cy="10" rx="2.2" ry="3" strokeWidth="1.8" fill="none" />
      <ellipse cx="15.5" cy="10" rx="2.2" ry="3" strokeWidth="1.8" fill="none" />
      <ellipse cx="12" cy="14.5" rx="2.2" ry="3" strokeWidth="1.8" fill="none" />
      <circle cx="8.5" cy="9.5" r="0.8" fill="currentColor" />
      <circle cx="15.5" cy="9.5" r="0.8" fill="currentColor" />
      <circle cx="12" cy="14" r="0.8" fill="currentColor" />
    </g>
  ),
  // 7. Milk - Modern milk carton/glass
  Milk: (
    <g>
      <circle cx="12" cy="12" r="10.5" fill="none" strokeWidth="2" />
      <path d="M9.5 7.5h5l.5 1.5v6c0 1.5-1.3 2.5-3 2.5s-3-1-3-2.5V9l.5-1.5z" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="9.5" y1="9" x2="14.5" y2="9" strokeWidth="2" strokeLinecap="round" />
      <path d="M10.5 12c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </g>
  ),
  // 8. Tree Nuts - Hazelnut with leaf
  Nuts: (
    <g>
      <circle cx="12" cy="12" r="10.5" fill="none" strokeWidth="2" />
      <circle cx="12" cy="13.5" r="4" strokeWidth="2" fill="none" />
      <path d="M12 9.5c-.5-1.5 0-3 1.5-3.5" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M13.5 6.5c.8 0 1.5.5 2 1.5" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <line x1="10.5" y1="13.5" x2="13.5" y2="13.5" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  ),
  // 9. Celery - Celery stalks with leaves
  Celery: (
    <g>
      <circle cx="12" cy="12" r="10.5" fill="none" strokeWidth="2" />
      <path d="M9.5 16.5V11c0-.8.5-1.5 1-1.5" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M12 16.5V10c0-.5.3-1 .5-1" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M14.5 16.5V11c0-.8-.5-1.5-1-1.5" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="10" cy="8.5" r="1.3" fill="currentColor" />
      <circle cx="12" cy="8" r="1.3" fill="currentColor" />
      <circle cx="14" cy="8.5" r="1.3" fill="currentColor" />
    </g>
  ),
  // 10. Mustard - Mustard plant with seeds
  Mustard: (
    <g>
      <circle cx="12" cy="12" r="10.5" fill="none" strokeWidth="2" />
      <path d="M12 7.5v4" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="14" r="2.5" strokeWidth="2" fill="none" />
      <circle cx="9" cy="9.5" r="1" fill="currentColor" />
      <circle cx="15" cy="9.5" r="1" fill="currentColor" />
      <circle cx="10" cy="11.5" r="0.8" fill="currentColor" />
      <circle cx="14" cy="11.5" r="0.8" fill="currentColor" />
      <circle cx="11" cy="8" r="0.7" fill="currentColor" />
      <circle cx="13" cy="8" r="0.7" fill="currentColor" />
    </g>
  ),
  // 11. Sesame seeds - Scattered sesame seeds pattern
  'Sesame seeds': (
    <g>
      <circle cx="12" cy="12" r="10.5" fill="none" strokeWidth="2" />
      <ellipse cx="12" cy="8" rx="1.2" ry="1.5" fill="currentColor" />
      <ellipse cx="8.5" cy="10.5" rx="1" ry="1.3" fill="currentColor" />
      <ellipse cx="15.5" cy="10.5" rx="1" ry="1.3" fill="currentColor" />
      <ellipse cx="7.5" cy="13.5" rx="1.1" ry="1.4" fill="currentColor" />
      <ellipse cx="16.5" cy="13.5" rx="1.1" ry="1.4" fill="currentColor" />
      <ellipse cx="10" cy="15.5" rx="1" ry="1.2" fill="currentColor" />
      <ellipse cx="14" cy="15.5" rx="1" ry="1.2" fill="currentColor" />
      <ellipse cx="12" cy="17" rx="1" ry="1.3" fill="currentColor" />
    </g>
  ),
  // 12. Sulphites - Modern SO₂ representation
  'Sulphur dioxide and sulphites': (
    <g>
      <circle cx="12" cy="12" r="10.5" fill="none" strokeWidth="2" />
      <text x="7.5" y="15.5" fontSize="9" fontWeight="700" fill="currentColor" fontFamily="system-ui, -apple-system, sans-serif">SO₂</text>
    </g>
  ),
  // 13. Lupin - Lupin flower
  Lupin: (
    <g>
      <circle cx="12" cy="12" r="10.5" fill="none" strokeWidth="2" />
      <path d="M12 15.5v-3.5" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="12" cy="9.5" rx="2.5" ry="3.5" strokeWidth="2" fill="none" />
      <ellipse cx="9" cy="10.5" rx="1.8" ry="2.8" strokeWidth="1.8" fill="none" />
      <ellipse cx="15" cy="10.5" rx="1.8" ry="2.8" strokeWidth="1.8" fill="none" />
      <circle cx="12" cy="9" r="0.8" fill="currentColor" />
    </g>
  ),
  // 14. Molluscs - Clam shell
  Molluscs: (
    <g>
      <circle cx="12" cy="12" r="10.5" fill="none" strokeWidth="2" />
      <path d="M6.5 14.5c0-3 2.5-6 5.5-6s5.5 3 5.5 6" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M6.5 14.5c0 1.8 2.5 3.5 5.5 3.5s5.5-1.7 5.5-3.5" strokeWidth="2" fill="none" strokeLinecap="round" />
      <line x1="12" y1="8.5" x2="12" y2="14.5" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 11l3-2.5 3 2.5" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
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