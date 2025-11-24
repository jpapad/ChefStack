# ChefStack - AI Agent Instructions

## Architecture Overview

**ChefStack** is a React + TypeScript kitchen management system (recipes, inventory, HACCP, menus, staffing, waste) built with Vite, Supabase, and bilingual support (Greek/English).

### Data Flow & State Management

```
App.tsx (auth, initial fetch) 
  ↓ props-drilling
KitchenInterface.tsx (global state hub: 40+ entity types)
  ↓ filtered by currentTeamId & currentView
Feature Views (DashboardView, InventoryView, etc.)
  ↓ mutations via setters passed as props
api.ts (Supabase abstraction; falls back to mockData.ts if unconfigured)
```

**Critical pattern**: All state is centralized in `KitchenInterface` props. No Context API, Redux, or local Context. This is intentional for simplicity and explicit data flow visibility.

**Why prop drilling?** This architectural decision makes data flow explicit and traceable. Each component's dependencies are visible in its props interface, making it easier to understand what data a component needs and where mutations occur. While verbose, this prevents hidden dependencies and makes refactoring safer.

### Environment Modes

- **Mock mode** (development default): `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` missing → `api.useMockApi = true` → returns deep-copied `mockData.ts`
- **Real mode**: Env vars set → Supabase queries executed; auth required
- **Graceful fallback**: Service layer detects missing env and switches automatically; components never know the difference
- **AI features**: `VITE_GEMINI_API_KEY` required for AI image generation, menu suggestions, waste analysis, and coaching features

**Environment variables** (`.env.local`):
```bash
VITE_SUPABASE_URL=<url>           # If missing: mock data mode
VITE_SUPABASE_ANON_KEY=<key>      # If missing: mock data mode
VITE_GEMINI_API_KEY=<key>         # For AI features (optional but required for AI functionality)
```

**Important**: Vite uses `VITE_` prefix for env vars exposed to frontend. Access via `import.meta.env.VITE_*`, NOT `process.env`. Mock data works offline without any env configuration.

## Build & Development

```bash
npm install              # Install dependencies
npm run dev             # Start Vite dev server on http://localhost:3000
npm run build           # Production build (generates dist/)
npm run preview         # Preview production build
```

**Dev Server**: Configured in `vite.config.ts` to run on port 3000 with path alias `@/` pointing to project root. Service worker registered for offline support.

## Project Structure & Patterns

### Type System (`types.ts` - 605 lines)

- **Single source of truth**: All domain entities defined here (Recipe, InventoryItem, Menu, HaccpLog, User, Team, Shift, WasteLog, etc.)
- **Discriminated unions** for variants: `Menu` is a union with `type: 'a_la_carte' | 'buffet'`; each branch has different required fields
- **Allergen system**: `ALLERGENS_LIST` (union type, 14 items) + `ALLERGEN_TRANSLATIONS` (el/en for each)
- **Units**: Mix of metric (`'g' | 'kg' | 'ml' | 'L'`) and Greek colloquial (`'τεμ'` for items, `'κ.γ.'`/`'κ.σ.'` for teaspoon/tablespoon)
- **Bilingual fields**: Key entities have `name` (Greek) + `name_en` (English); e.g., `Recipe`, `SHIFT_TYPE_KEYS`, `WASTE_REASON_KEYS`
- **Multi-team support**: All entities include `teamId` field; used to filter by `currentTeamId` in views
- **View type**: Discriminated union defining all available views (`'dashboard' | 'recipes' | 'inventory' | ...`); controls routing in `KitchenInterface.tsx`

### Component Hierarchy

**View Components** (e.g., `DashboardView.tsx`, `InventoryView.tsx`):
- Accept **all** domain state + setters as individual props (no prop object destructuring for clarity)
- Manage local UI state separately: filters, sort, search, modal open/close
- Fetch data is pre-filtered by `currentTeamId` before being passed; views don't filter themselves
- Often 300-600 lines; split complex sections into sub-components

**Form Components** (e.g., `RecipeForm.tsx`, `HaccpLogForm.tsx`):
- Accept `toEdit?: Entity | null` + `onSave` callback + `onCancel` callback
- Initialize with `recipeToEdit || initialRecipeState` to support both create and edit modes
- Call `onSave()` with complete entity object; parent handles upsert logic
- Pattern: `setRecipes(prev => prev.map(r => r.id === recipe.id ? recipe : r))` for updates

**Card & List Components** (e.g., `RecipeCard.tsx`, `RecipeGridCard.tsx`):
- Display read-only data; accept click callbacks for drill-down (e.g., `onViewRecipe`, `onEditRecipe`)
- Render allergen icons using `AllergenIcon.tsx` component (passes allergen name, renders with translation)
- Use translated labels from `useTranslation()` hook

**Modal Components** (e.g., `ConfirmationModal.tsx`, `AIImageModal.tsx`, `QRScanner.tsx`):
- Controlled via parent boolean state (`isOpen` prop)
- Accept `onConfirm`/`onCancel` callbacks
- Handle async operations (file uploads, API calls) with try/catch; show loading state
- Pattern: `{ isOpen && <Modal ... /> }` or `<Modal open={isOpen} ... />`

### Hooks

**`useLocalStorage<T>(key, initialValue)`**: 
- Persists state to `localStorage`; returns `[value, setValue]` tuple like `useState`
- Handles JSON serialization/parsing
- Used for UI preferences (sidebar collapse, language choice, currentTeamId, currentUser)
- **Note**: Removed cross-tab sync listener; app uses centralized state, not multi-tab sync

**`useTranslation()`**: 
- Returns `{ language, t }` where `language` is `'el' | 'en'` and `t(key: string): string` retrieves translated strings
- Reads from `i18n.ts` context; language toggled via state, persisted to `localStorage`
- Access translated UI constants: `t('nav_recipes')`, `t('confirm_delete_title')`

### Service Layer (`services/api.ts` & `services/supabaseClient.ts`)

**Flow**: `supabaseClient.ts` returns `null` if env vars missing → `api.ts` detects and sets `useMockApi = true` → all methods return deep-copied mock data

**Key methods**:
- `api.fetchAllData()`: Returns all entities (users, teams, recipes, inventory, etc.) as one Promise; checks `useMockApi` internally
- Individual CRUD methods assume Supabase table names: plural snake_case (e.g., `ingredient_costs`, `haccp_logs`, `inventory_transactions`)
- Always deep-copy mock data before returning: `JSON.parse(JSON.stringify(mockData))` prevents accidental state mutation

**State initialization** (`App.tsx`):
1. Fetch all data with `api.fetchAllData()`
2. Check Supabase session if configured; otherwise auto-login first mock user
3. Restore `currentTeamId` from localStorage if user is still member
4. Pass all state and setters to `KitchenInterface.tsx`

**Mapper pattern**: For Supabase integration, use `mapEntityToDb()` (camelCase → snake_case) and `mapEntityFromDb()` (snake_case → camelCase) functions. Always include these when adding new entity types.

### Icons & Styling

- **`Icon.tsx`**: Custom component wrapping icon rendering; use `<Icon name="icon-name" />` (e.g., `"clock"`, `"trash"`, `"loader-2"`)
- **Styling**: Tailwind CSS with dark mode support
  - Light mode: `bg-light-bg`, `text-light-text-secondary`
  - Dark mode: `dark:bg-dark-bg`, `dark:text-dark-text-secondary`
  - Brand color: `bg-brand-yellow`, `text-brand-yellow`
- **Allergen rendering**: Import `AllergenIcon` component; it handles icon + translation lookup internally

## Common Workflows

### Adding a New Feature View

1. **Create view component**: `components/<feature>/<FeatureName>View.tsx` (300-600 lines typically)
   ```tsx
   interface FeatureViewProps {
     data: Entity[];
     setData: React.Dispatch<React.SetStateAction<Entity[]>>;
     currentTeamId: string;
     // ... all required state
   }
   ```

2. **Add to View type**: `types.ts` → add case to `View` discriminated union:
   ```tsx
   export type View = '...' | 'my_new_feature';
   ```

3. **Route in KitchenInterface**: Add import + case to render switch:
   ```tsx
   case 'my_new_feature':
     return <MyNewFeatureView data={data} setData={setData} currentTeamId={currentTeamId} />;
   ```

4. **Handle mutations**: Use setter functions pattern:
   ```tsx
   // CREATE: Generate unique ID, include teamId
   const newEntity = { id: `${Date.now()}`, ...formData, teamId: currentTeamId };
   setData(prev => [...prev, newEntity]);
   
   // UPDATE: Map and replace
   setData(prev => prev.map(e => e.id === entity.id ? { ...e, ...changes } : e));
   
   // DELETE: Filter out
   setData(prev => prev.filter(e => e.id !== entityId));
   ```

### Editing a Recipe or Entity

**Pattern** (used in `RecipeForm.tsx`, `HaccpLogForm.tsx`, etc.):
```tsx
const initialState = { name: '', teamId: '' /* ... */ };

interface FormProps {
  toEdit?: Entity | null;
  onSave: (entity: Entity | Omit<Entity, 'id'>) => void;
  onCancel: () => void;
}

// In component:
const [entity, setEntity] = useState(toEdit || initialState);

useEffect(() => {
  setEntity(toEdit || initialState);  // Sync on prop change
}, [toEdit]);

// On save: call parent setter and parent handles upsert
onSave(entity);  // Parent decides if create or update
```

**Parent side** (`InventoryView.tsx` example):
```tsx
const handleSaveInventoryForm = (item: InventoryItem | Omit<InventoryItem, 'id'>) => {
  if ('id' in item) {
    // Update
    setInventory(prev => prev.map(i => i.id === item.id ? item : i));
  } else {
    // Create
    const newItem = { ...item, id: `${Date.now()}`, teamId: currentTeamId };
    setInventory(prev => [...prev, newItem]);
  }
  setEditingItemId(null);
};
```

### Accessing Translations

```tsx
import { useTranslation } from '../i18n';

const MyComponent = () => {
  const { t, language } = useTranslation();
  
  return (
    <>
      <h1>{t('nav_recipes')}</h1>  // English-agnostic key
      {language === 'el' && <p>Ελληνικά</p>}
      {language === 'en' && <p>English</p>}
    </>
  );
};
```

### Handling Allergens

```tsx
import { ALLERGENS_LIST, ALLERGEN_TRANSLATIONS, Allergen } from '../types';
import { AllergenIcon } from './common/AllergenIcon';

// Render checkboxes:
{ALLERGENS_LIST.map(allergen => (
  <label key={allergen}>
    <input
      type="checkbox"
      checked={selectedAllergens.includes(allergen)}
      onChange={(e) => {
        if (e.target.checked) {
          setSelectedAllergens([...selectedAllergens, allergen]);
        } else {
          setSelectedAllergens(selectedAllergens.filter(a => a !== allergen));
        }
      }}
    />
    {ALLERGEN_TRANSLATIONS[allergen][language]}  // el/en translation
  </label>
))}

// Display allergen icons:
{selectedAllergens.map(allergen => (
  <AllergenIcon key={allergen} allergen={allergen} />
))}
```

### Handling Bilingual Fields

```tsx
// Types always pair name + name_en
interface Recipe {
  name: string;      // Greek
  name_en: string;   // English
  // ...
}

// In forms:
<input 
  name="name"
  placeholder="Όνομα συνταγής (Ελληνικά)"
  value={recipe.name}
  onChange={(e) => setRecipe({...recipe, name: e.target.value})}
/>
<input
  name="name_en"
  placeholder="Recipe Name (English)"
  value={recipe.name_en}
  onChange={(e) => setRecipe({...recipe, name_en: e.target.value})}
/>

// Display: show appropriate language
<h2>{language === 'el' ? recipe.name : recipe.name_en}</h2>
```

## Key Files Reference

- **`types.ts`**: Single source of truth for all entity types; ~605 lines
- **`App.tsx`**: Session management, initial data fetch; ~323 lines
- **`KitchenInterface.tsx`**: Central state hub, view routing; ~1145 lines
- **`i18n.ts`**: Translation context provider; ~632 lines with full i18n strings
- **`services/api.ts`**: Supabase abstraction layer; ~1454 lines
- **`data/mockData.ts`**: Sample data for all entities; ~494 lines
- **`vite.config.ts`**: Dev server on port 3000, path alias `@/`

## Critical Patterns & Anti-Patterns

✅ **DO**:
- Preserve bilingual field naming: `name` (Greek) + `name_en` (English)
- Deep-copy mock data before returning to prevent mutations
- Add `teamId` to all new entities for multi-team support
- Use `useLocalStorage` for UI preferences, not sensitive data
- Filter data by `currentTeamId` in views
- Use `withApiKeyCheck` wrapper for all AI features (passed as prop from `KitchenInterface`)
- Access Vite env vars via `import.meta.env.VITE_*` (NOT `process.env`)

❌ **DON'T**:
- Mutate state directly (always use setter functions)
- Add new global state without discussing with team (prop drilling is intentional)
- Hardcode table names in components (centralize in `api.ts`)
- Assume Supabase is configured (always check `useMockApi` or handle gracefully)
- Store auth tokens in `localStorage` (Supabase handles this)
- Use `process.env` for Vite env vars (use `import.meta.env` instead)

## Testing & Debugging

- Dev server runs on `http://localhost:3000`
- Browser console shows "Supabase not configured" warning if env vars missing (expected during dev with mock data)
- Service worker registered for offline support
- Dark mode CSS classes available; toggle via `useDarkMode` hook (if used)

## AI Features Integration

ChefStack integrates Google's Gemini AI for multiple features:

### `withApiKeyCheck` Pattern

**Critical**: All AI features must be wrapped with `withApiKeyCheck` prop passed from `KitchenInterface`:

```tsx
// In component props:
interface MyViewProps {
  withApiKeyCheck: (action: () => void) => void;
  // ... other props
}

// Usage:
const handleAIFeature = () => {
  withApiKeyCheck(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    if (!apiKey) {
      throw new Error('Missing VITE_GEMINI_API_KEY');
    }
    // Proceed with AI feature...
  });
};
```

**How it works**:
- `KitchenInterface.tsx` defines `withApiKeyCheck` and passes it to all feature views
- Before executing AI action, checks if `VITE_GEMINI_API_KEY` exists
- If missing, shows `ApiKeyPromptModal` with user-friendly instructions
- If present, executes the wrapped action
- Components never directly check for API key; always use wrapper

### AI Feature Areas

- **Recipe Images**: `AIImageModal` for generating recipe images via Gemini
- **Menu Suggestions**: `SmartMenuCoach` for AI-powered menu planning
- **Waste Analysis**: Gemini analyzes waste patterns and suggests improvements
- **Supplier Coaching**: AI insights on supplier management
- **HACCP Coaching**: AI guidance on food safety compliance

### Gemini API Integration

```tsx
// Standard pattern (from WasteLogView example):
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  }
);
```

**Model**: Use `gemini-2.0-flash` for all features (fast, cost-effective)

---

**Last updated**: November 2025 | **Repo**: jpapad/ChefStack
