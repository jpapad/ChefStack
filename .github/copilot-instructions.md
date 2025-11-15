# ChefStack - AI Agent Instructions

## Architecture Overview

**ChefStack** is a React + TypeScript kitchen management system built with Vite, Supabase, and React. The app is bilingual (Greek/English) and manages recipes, inventory, HACCP compliance, menus, staffing, and waste tracking for commercial kitchens.

### Core Data Flow

1. **App.tsx** (root): Initializes app, manages auth session via Supabase, fetches all data via `api.fetchAllData()`
2. **KitchenInterface.tsx** (main container): Props-drilled state for ~40+ entity types; renders views based on `currentView` state
3. **Service layer** (`services/api.ts`): Abstracts Supabase calls; returns mock data if `SUPABASE_URL` not set
4. **Mock data** (`data/mockData.ts`): Fallback dataset for development; deep-copied on fetch to prevent mutations
5. **Component tree**: Feature views (RecipeList, InventoryView, etc.) read props, call setter functions to update state

### Key Design Decisions

- **Prop drilling instead of context**: State lives in `App.tsx` and `KitchenInterface.tsx`, passed down explicitly. No Redux/Context API.
- **Dual-mode operation**: App works offline with mock data if Supabase env vars missing; seamlessly switches when configured.
- **Team isolation**: All data entities have `teamId` field; `currentTeamId` filters visible data.
- **Bilingual support**: `i18n.ts` provides `useTranslation()` hook; UI components read `language` preference from `LanguageMode` state.

## Build & Development

```bash
npm install              # Install dependencies
npm run dev             # Start Vite dev server on http://localhost:3000
npm run build           # Production build (generates dist/)
npm run preview         # Preview production build
```

**Key env vars** (in `.env` or `.env.local`):
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anon key
- `GEMINI_API_KEY`: For AI image generation features

## Project Structure & Patterns

### Type System (`types.ts`)

- Centralized type definitions; 400+ lines covering all domain entities
- Key types: `Recipe`, `InventoryItem`, `Menu`, `HaccpLog`, `User`, `Team`, `Shift`
- Allergens hardcoded as union type with translations in `ALLERGEN_TRANSLATIONS`
- Units: `'g' | 'kg' | 'ml' | 'L' | 'τεμ' | 'κ.γ.' | 'κ.σ.'` (Greek abbreviations for items, teaspoons, tablespoons)

### Component Patterns

**Feature components** (e.g., `RecipeCard.tsx`, `RecipeDetail.tsx`):
- Accept data as props + callbacks for updates
- Use `useTranslation()` for i18n
- Destructure large prop sets; memoization rare
- Example: `RecipeCard` shows recipe with allergen icons, prep/cook times

**Modals & dialogs** (e.g., `AIImageModal.tsx`, `ConfirmationModal.tsx`):
- Controlled via parent state (`isOpen` boolean)
- Accept `onConfirm`/`onCancel` callbacks
- Handle async operations (API calls)

**View components** (e.g., `DashboardView.tsx`, `RecipeList.tsx`):
- Large feature containers, often 300-600 lines
- Manage local UI state (filters, sort, search) separately from global data state
- May delegate to sub-components for complex sections

### Hooks

**`useLocalStorage<T>(key, initialValue)`**: Persists state to `localStorage`, handles JSON serialization. Used for UI prefs (sidebar collapse, language choice).

**`useTranslation()`**: Returns `{ language, t }` where `t(key)` retrieves translated strings. Language toggled via state.

### Service Layer

**`api.ts` exports**:
- `api.fetchAllData()`: Returns all entities; checks `useMockApi` flag (true if Supabase unconfigured)
- Individual CRUD methods (not shown here) for creates/updates
- Table names assume Supabase uses plural snake_case (e.g., `ingredient_costs`)

**Supabase client** (`supabaseClient.ts`):
- Returns `null` if env vars missing; `api.ts` gracefully falls back to mock data
- Auth via Supabase session management

### Icons & Assets

- `Icon.tsx` component wraps icon rendering (uses `name` prop, e.g., `<Icon name="clock" />`)
- `assets.ts` likely contains reusable constants/icons
- Dark mode support via CSS classes: `dark:bg-white/5`, `light-text-primary`, etc.

## Common Workflows

### Adding a New Feature View

1. Create component in `components/<feature>/<FeatureName>View.tsx`
2. Add new `View` type to `types.ts` discriminated union
3. In `KitchenInterface.tsx`: import component, add case to render switch
4. Pass required state/setters as props from `KitchenInterface` props
5. Ensure component calls setter function for mutations (e.g., `setRecipes([...recipes, newRecipe])`)

### Editing a Recipe or Entity

- Forms (e.g., `RecipeForm.tsx`) accept `recipeToEdit?: Recipe` and `onSave` callback
- If editing, prefill form; if creating, use `initialState`
- Call `onSave()` with complete entity (with id if editing, omitted if creating)
- Parent component updates state: `setRecipes(prev => prev.map(r => r.id === recipe.id ? recipe : r))`

### Accessing Translations

```tsx
const { t, language } = useTranslation();
<div>{t('nav_recipes')}</div>  // Returns translated string
if (language === 'en') { /* English-specific logic */ }
```

### Handling Allergens

Always import from `types.ts`:
```tsx
import { ALLERGENS_LIST, ALLERGEN_TRANSLATIONS } from '../types';
// Render checkbox for each allergen in ALLERGENS_LIST
// Display translated name: ALLERGEN_TRANSLATIONS[allergen][language]
```

## Key Files Reference

- **`types.ts`**: Single source of truth for all entity types; ~416 lines
- **`App.tsx`**: Session management, initial data fetch; ~247 lines
- **`KitchenInterface.tsx`**: Central state hub, view routing; ~832 lines
- **`i18n.ts`**: Translation context provider; 625 lines with full i18n strings
- **`services/api.ts`**: Supabase abstraction layer; 254 lines
- **`data/mockData.ts`**: Sample data for all entities; 494 lines
- **`vite.config.ts`**: Dev server on port 3000, path alias `@/`

## Critical Patterns & Anti-Patterns

✅ **DO**:
- Preserve bilingual field naming: `name` (Greek) + `name_en` (English)
- Deep-copy mock data before returning to prevent mutations
- Add `teamId` to all new entities for multi-team support
- Use `useLocalStorage` for UI preferences, not sensitive data
- Filter data by `currentTeamId` in views

❌ **DON'T**:
- Mutate state directly (always use setter functions)
- Add new global state without discussing with team (prop drilling is intentional)
- Hardcode table names in components (centralize in `api.ts`)
- Assume Supabase is configured (always check `useMockApi` or handle gracefully)
- Store auth tokens in `localStorage` (Supabase handles this)

## Testing & Debugging

- Dev server runs on `http://localhost:3000`
- Browser console shows "Supabase not configured" warning if env vars missing (expected during dev with mock data)
- Service worker registered for offline support
- Dark mode CSS classes available; toggle via `useDarkMode` hook (if used)

## AI Features Integration

- `AIImageModal` and `AIResponseModal` components exist for Gemini API integration
- `GEMINI_API_KEY` passed via `process.env` to Vite
- Check `withApiKeyCheck` wrapper pattern in forms (e.g., `RecipeForm`) for API key validation

---

**Last updated**: November 2025 | **Repo**: jpapad/ChefStack
