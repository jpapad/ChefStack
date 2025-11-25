import { FilterOptions } from '../components/common/FilterPanel';

export interface FilterPreset {
  id: string;
  name: string;
  name_en: string;
  icon: string;
  filters: FilterOptions;
}

export const DEFAULT_FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'quick_meals',
    name: 'Γρήγορα Γεύματα',
    name_en: 'Quick Meals',
    icon: '⚡',
    filters: {
      categories: [],
      allergens: [],
      difficulties: ['easy'],
      prepTimeRange: [0, 30],
      costRange: null,
      ratingRange: null,
      vegetarian: null,
      vegan: null,
      tags: []
    }
  },
  {
    id: 'budget_friendly',
    name: 'Οικονομικά',
    name_en: 'Budget-Friendly',
    icon: '💰',
    filters: {
      categories: [],
      allergens: [],
      difficulties: [],
      prepTimeRange: null,
      costRange: [0, 5],
      ratingRange: null,
      vegetarian: null,
      vegan: null,
      tags: []
    }
  },
  {
    id: 'highly_rated',
    name: 'Κορυφαία Αξιολόγηση',
    name_en: 'Highly Rated',
    icon: '⭐',
    filters: {
      categories: [],
      allergens: [],
      difficulties: [],
      prepTimeRange: null,
      costRange: null,
      ratingRange: [4, 5],
      vegetarian: null,
      vegan: null,
      tags: []
    }
  },
  {
    id: 'vegetarian',
    name: 'Χορτοφαγικά',
    name_en: 'Vegetarian',
    icon: '🌱',
    filters: {
      categories: [],
      allergens: ['Fish'],
      difficulties: [],
      prepTimeRange: null,
      costRange: null,
      ratingRange: null,
      vegetarian: true,
      vegan: null,
      tags: []
    }
  },
  {
    id: 'vegan',
    name: 'Vegan',
    name_en: 'Vegan',
    icon: '🥬',
    filters: {
      categories: [],
      allergens: ['Fish', 'Eggs', 'Milk'],
      difficulties: [],
      prepTimeRange: null,
      costRange: null,
      ratingRange: null,
      vegetarian: null,
      vegan: true,
      tags: []
    }
  },
  {
    id: 'allergen_free',
    name: 'Χωρίς Κοινά Αλλεργιογόνα',
    name_en: 'Allergen-Free',
    icon: '🚫',
    filters: {
      categories: [],
      allergens: ['Gluten', 'Nuts', 'Milk', 'Eggs', 'Soybeans', 'Crustaceans'],
      difficulties: [],
      prepTimeRange: null,
      costRange: null,
      ratingRange: null,
      vegetarian: null,
      vegan: null,
      tags: []
    }
  },
  {
    id: 'party_food',
    name: 'Για Πάρτι',
    name_en: 'Party Food',
    icon: '🎉',
    filters: {
      categories: ['appetizer', 'dessert'],
      allergens: [],
      difficulties: [],
      prepTimeRange: null,
      costRange: null,
      ratingRange: [3.5, 5],
      vegetarian: null,
      vegan: null,
      tags: []
    }
  },
  {
    id: 'main_courses',
    name: 'Κυρίως Πιάτα',
    name_en: 'Main Courses',
    icon: '🍽️',
    filters: {
      categories: ['main_course'],
      allergens: [],
      difficulties: [],
      prepTimeRange: null,
      costRange: null,
      ratingRange: null,
      vegetarian: null,
      vegan: null,
      tags: []
    }
  }
];
