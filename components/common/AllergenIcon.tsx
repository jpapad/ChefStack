import React from 'react';
import { Allergen } from '../../types';

interface AllergenIconProps extends React.SVGProps<SVGSVGElement> {
  allergen: Allergen;
}

// Replaced placeholder icons with new, more descriptive and standard pictograms for allergens.
const ALLERGEN_ICONS: Record<Allergen, React.ReactNode> = {
  Gluten: <path d="M20 8.54V22h-2v-6.32l-6-3.46-6 3.46V22H4V8.54l8-4.62 8 4.62zM4 6.34V4.5a2.5 2.5 0 0 1 5 0v1.84l-2.5 1.44L4 6.34zM15 4.5a2.5 2.5 0 0 1 5 0v1.84l-2.5 1.44-2.5-1.44V4.5z"/>,
  Crustaceans: <g fill="none"><path d="M15 14a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1 5 0z" /><path d="M21 11.23a10.24 10.24 0 0 0-9-5.23 10.24 10.24 0 0 0-9 5.23" /><path d="M3 12a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4" /><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2" /><path d="M7 16v4" /><path d="M17 16v4" /></g>,
  Eggs: <g fill="none"><path d="M12 2C8.69 2 6 5.58 6 10c0 2.97 1.48 5.62 3.72 7.15.5.34 1.14.53 1.82.57.6.04 1.2-.14 1.7-.5.54-.4.99-1.02 1.2-1.74.26-.82.26-1.74 0-2.56-.2-.64-.6-1.2-1.08-1.64C13.52 10.4 12.48 8.89 12.48 7.4c0-1.05.85-1.9 1.9-1.9s1.9.85 1.9 1.9c0 .7-.21 1.34-.58 1.88" /></g>,
  Fish: <g fill="none"><path d="M15.65 15.65a2 2 0 0 0 2.83 0l3.53-3.53a2 2 0 0 0 0-2.83l-3.53-3.53a2 2 0 0 0-2.83 0L3 14.82V17a2 2 0 0 0 2 2h2.18l8.47-8.47Z M14.24 14.24l-8.49 8.49" /></g>,
  Peanuts: <><path d="M12.35 8.65a3 3 0 0 0-4.24 4.24l-1.06 1.06a3 3 0 0 0 4.24 4.24l4.24-4.24a3 3 0 0 0 0-4.24l-1.06-1.06a3 3 0 0 0-2.12-.88z" /><path d="M12.35 15.35a3 3 0 0 0 4.24-4.24l1.06-1.06a3 3 0 0 0-4.24-4.24l-4.24 4.24a3 3 0 0 0 0 4.24l1.06 1.06a3 3 0 0 0 2.12.88z" /></>,
  Soybeans: <><path d="M14.23 2.21a2 2 0 0 0-2.46 0l-5 3A2 2 0 0 0 5.5 7.05l-1.2 4.09a2 2 0 0 0 1.54 2.5l5.54 1.63a2 2 0 0 0 2.22-1.12l3.4-6.8a2 2 0 0 0-1.04-2.65l-5.73-2.5z" /><path d="M5.5 7.05l-1.2 4.09a2 2 0 0 0 1.54 2.5l5.54 1.63a2 2 0 0 0 2.22-1.12l3.4-6.8a2 2 0 0 0-1.04-2.65l-5.73-2.5a2 2 0 0 0-1.27.11z" /><circle cx="11.5" cy="8.5" r="1" /><circle cx="9.5" cy="11.5" r="1" /></>,
  Milk: <><path d="M8 4h8v10a4 4 0 1 1-8 0V4z" /><g fill="none"><path d="M12 2v2" /><path d="M4.5 14h15" /></g></>,
  Nuts: <path d="M15.42 16.63c1.2-1.2 1.55-3.2.7-4.74l-2.06-3.79a3 3 0 0 0-5.12 0L6.88 11.9c-.84 1.54-.5 3.54.7 4.74 1.2 1.2 3.2 1.55 4.74.7l.74-.42.74.43c1.54.84 3.54.5 4.74-.7z" />,
  Celery: <path d="M12 22c-.6 0-1-.4-1-1v-2c0-1.1-.9-2-2-2h-1c-1.1 0-2-.9-2-2v-1c0-1.1-.9-2-2-2V9c0-1.1.9-2 2-2h1c1.1 0 2-.9 2-2V4c0-.6.4-1 1-1s1 .4 1 1v1c0 1.1.9 2 2 2h1c1.1 0 2 .9 2 2v3c0 1.1-.9 2-2 2h-1c-1.1 0-2 .9-2 2v1c0 1.1-.9 2-2 2v2c0 .6-.4 1-1 1z" />,
  Mustard: <path d="M12.65 2.65A5.02 5.02 0 0 0 8 2c-3.14 0-5 2.5-5 5.5 0 2.86 1.86 4.5 3.5 5.5l1.5 1 1.5-1c1.64-1 3.5-2.64 3.5-5.5a5.03 5.03 0 0 0-1.35-3.35zM16 12l2 2-1.5 1.5-2-2-1.5 1.5-2-2-1.5 1.5-2-2L6 14l2-2-2-2 1.5-1.5 2 2 1.5-1.5 2 2 1.5-1.5 2 2L18 10l-2 2z" />,
  'Sesame seeds': <><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="19" r="1.5" /><circle cx="19" cy="12" r="1.5" /><circle cx="5" cy="12" r="1.5" /><circle cx="16.5" cy="16.5" r="1.5" /><circle cx="7.5" cy="7.5" r="1.5" /><circle cx="16.5" cy="7.5" r="1.5" /><circle cx="7.5" cy="16.5" r="1.5" /></>,
  'Sulphur dioxide and sulphites': <><text x="6" y="18" fontSize="12" fontWeight="bold" fill="currentColor">S</text><text x="11" y="18" fontSize="12" fontWeight="bold" fill="currentColor">O</text><text x="16" y="20" fontSize="8" fontWeight="bold" fill="currentColor">2</text><circle cx="12" cy="12" r="10" strokeWidth="1.5" stroke="currentColor" fill="none" /></>,
  Lupin: <><path d="M12 2a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3 3 3 0 0 0 3-3V5a3 3 0 0 0-3-3z" /><path d="M12 11a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3 3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3z" /><path d="M6 7a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3 3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3z" /><path d="M18 7a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3 3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3z" /></>,
  Molluscs: <path d="M12 4c-5.12 0-9.28 3.23-10 7.54.24-.12.5-.24.77-.34A5.44 5.44 0 0 1 7.2 9.5c.34-.04.68-.06 1.02-.06 2.05 0 3.84.97 5.02 2.48.59-1.22 1.5-2.29 2.6-3.13A10.99 10.99 0 0 0 12 4zM2.8 12.5c-.24.12-.48.25-.7.38.72 4.31 4.88 7.54 10 7.54s9.28-3.23 10-7.54c-.22-.13-.46-.26-.7-.38-1.1 1.74-2.9 3.01-5.02 3.49-1.18 1.48-2.97 2.43-5.04 2.43s-3.86-.95-5.04-2.43c-2.12-.48-3.92-1.75-5.02-3.49z" />,
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