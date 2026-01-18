/**
 * Recipe Card Style Switcher
 * 
 * Χρησιμοποιήστε αυτό το αρχείο για να επιλέξετε ποιο card design θέλετε:
 * - 'classic': Το υπάρχον RecipeGridCard (compact, efficient)
 * - 'modern': Το νέο RecipeCardModern (large image, elegant)
 * 
 * Αλλάξτε την τιμή του ACTIVE_CARD_STYLE παρακάτω.
 */

export type CardStyle = 'classic' | 'modern';

export const ACTIVE_CARD_STYLE: CardStyle = 'modern'; // ⬅️ Αλλάξτε εδώ!

// Import το κατάλληλο component
import RecipeGridCard from '../RecipeGridCard';
import RecipeCardModern from './RecipeCardModern';

// Export το ενεργό component
export const ActiveRecipeCard = ACTIVE_CARD_STYLE === 'modern' 
  ? RecipeCardModern 
  : RecipeGridCard;

export default ActiveRecipeCard;
