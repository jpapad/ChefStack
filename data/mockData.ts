// Fix: Populated mockData.ts with sample data for the application.
import { Recipe, IngredientCost, Workstation, PrepTask, PrepTaskStatus, HaccpLog, HaccpLogType, HaccpLogCategoryKey, HaccpReminder, Supplier, InventoryItem, Menu, User, Team, Notification, Message, Shift, ShiftSchedule, Channel, InventoryLocation, InventoryTransaction, HaccpItem, WasteLog, KitchenOrder, RecipeVariation, EmailReport, ReportHistory } from '../types';

export const mockTeams: Team[] = [
    { id: 'team1', name: 'Κεντρική Κουζίνα' },
    { id: 'team2', name: 'A La Carte "Elia"' }
];

export const mockUsers: User[] = [
    {
        id: 'user1',
        name: 'Chef Yannis',
        email: 'chef@kitchen.app',
        memberships: [
            { teamId: 'team1', role: 'Admin' },
            { teamId: 'team2', role: 'Admin' }
        ],
    },
    {
        id: 'user2',
        name: 'Maria Sous',
        email: 'sous@kitchen.app',
        memberships: [
            { teamId: 'team1', role: 'Sous Chef' }
        ],
    },
    {
        id: 'user3',
        name: 'Nikos Cook',
        email: 'cook@kitchen.app',
        memberships: [
            { teamId: 'team1', role: 'Cook' }
        ],
    },
    {
        id: 'user4',
        name: 'Giorgos Cook',
        email: 'giorgos@kitchen.app',
        memberships: [
            { teamId: 'team2', role: 'Cook' }
        ],
    }
];


export const mockRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Μοσχαράκι Κοκκινιστό',
    name_en: 'Beef Kokkinisto',
    description: 'Κλασική συνταγή για τρυφερό μοσχαράκι στην κατσαρόλα.',
    imageUrl: 'https://images.unsplash.com/photo-1608772955527-4e58b2e3532c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
    category: 'main_course',
    prepTime: 20,
    cookTime: 120,
    servings: 4,
    price: 18.50,
    ingredients: [
      { id: 'ing1', name: 'Μοσχάρι', quantity: 1, unit: 'kg', isSubRecipe: false },
      { id: 'ing2', name: 'Κρεμμύδι', quantity: 2, unit: 'τεμ', isSubRecipe: false },
      { id: 'ing3', name: 'Σκόρδο', quantity: 3, unit: 'τεμ', isSubRecipe: false },
      { id: 'ing4', name: 'Ντομάτες κονκασέ', quantity: 400, unit: 'g', isSubRecipe: false },
      { id: 'ing5', name: 'Ελαιόλαδο', quantity: 50, unit: 'ml', isSubRecipe: false },
      { id: 'ing6', name: 'Αλάτι', quantity: 1, unit: 'κ.γ.', isSubRecipe: false },
      { id: 'ing7', name: 'Πιπέρι', quantity: 0.5, unit: 'κ.γ.', isSubRecipe: false },
      { id: 'ing8', name: 'Κρασί κόκκινο', quantity: 100, unit: 'ml', isSubRecipe: false },
    ],
    steps: [
      { id: 's1-1', type: 'step', content: 'Κόβουμε το μοσχάρι σε κύβους.' },
      { id: 's1-2', type: 'step', content: 'Σοτάρουμε το κρεμμύδι και το σκόρδο στο ελαιόλαδο.' },
      { id: 's1-3', type: 'step', content: 'Προσθέτουμε το μοσχάρι και το σοτάρουμε μέχρι να ροδίσει.' },
      { id: 's1-4', type: 'step', content: 'Σβήνουμε με το κρασί.' },
      { id: 's1-5', type: 'step', content: 'Προσθέτουμε τις ντομάτες, το αλάτι, το πιπέρι και λίγο νερό.' },
      { id: 's1-6', type: 'step', content: 'Σιγοβράζουμε για 2 ώρες μέχρι να μαλακώσει το κρέας.' }
    ],
    allergens: ['Celery'],
    teamId: 'team1',
  },
  {
    id: '2',
    name: 'Σπανακόπιτα',
    name_en: 'Spanakopita (Spinach Pie)',
    description: 'Παραδοσιακή ελληνική σπανακόπιτα με φέτα.',
    imageUrl: 'https://images.unsplash.com/photo-1629683833902-b3c79a7f0e48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
    category: 'appetizer',
    prepTime: 30,
    cookTime: 45,
    servings: 8,
    price: 8.00,
    ingredients: [
      { id: 'ing9', name: 'Σπανάκι', quantity: 1, unit: 'kg', isSubRecipe: false },
      { id: 'ing10', name: 'Φέτα', quantity: 400, unit: 'g', isSubRecipe: false },
      { id: 'ing11', name: 'Κρεμμύδι', quantity: 1, unit: 'τεμ', isSubRecipe: false },
      { id: 'ing12', name: 'Άνηθος', quantity: 50, unit: 'g', isSubRecipe: false },
      { id: 'ing13', name: 'Ελαιόλαδο', quantity: 100, unit: 'ml', isSubRecipe: false },
      { id: 'ing14', name: 'Φύλλο κρούστας', quantity: 1, unit: 'τεμ', isSubRecipe: false },
      { id: 'ing15', name: 'Αυγό', quantity: 2, unit: 'τεμ', isSubRecipe: false }
    ],
    steps: [
      { id: 's2-1', type: 'step', content: 'Ζεματάμε το σπανάκι και το στραγγίζουμε καλά.' },
      { id: 's2-2', type: 'step', content: 'Σε ένα μπολ ανακατεύουμε το σπανάκι, τη φέτα, το κρεμμύδι, τον άνηθο και τα αυγά.' },
      { id: 's2-3', type: 'step', content: 'Λαδώνουμε ένα ταψί και στρώνουμε τα μισά φύλλα, λαδώνοντας το καθένα.' },
      { id: 's2-4', type: 'step', content: 'Απλώνουμε τη γέμιση.' },
      { id: 's2-5', type: 'step', content: 'Σκεπάζουμε με τα υπόλοιπα φύλλα, λαδώνοντάς τα.' },
      { id: 's2-6', type: 'step', content: 'Χαράζουμε την πίτα και ψήνουμε στους 180°C για 45 λεπτά.' }
    ],
    allergens: ['Gluten', 'Eggs', 'Milk'],
    teamId: 'team1',
  },
  {
    id: '3',
    name: 'Λαβράκι Σχάρας',
    name_en: 'Grilled Sea Bass',
    description: 'Φρέσκο λαβράκι στη σχάρα με λαδολέμονο.',
    imageUrl: 'https://images.unsplash.com/photo-1598511659752-9e222f281e5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
    category: 'main_course',
    prepTime: 10,
    cookTime: 15,
    servings: 1,
    price: 22.00,
    ingredients: [
        { id: 'ing16', name: 'Λαβράκι', quantity: 300, unit: 'g', isSubRecipe: false },
        { id: 'ing17', name: 'Ελαιόλαδο', quantity: 30, unit: 'ml', isSubRecipe: false },
        { id: 'ing18', name: 'Λεμόνι', quantity: 1, unit: 'τεμ', isSubRecipe: false },
        { id: 'ing19', name: 'Ρίγανη', quantity: 1, unit: 'κ.γ.', isSubRecipe: false },
        { id: 'ing20', name: 'Αλάτι', quantity: 0.5, unit: 'κ.γ.', isSubRecipe: false },
        { id: 'ing21', name: 'Πιπέρι', quantity: 0.25, unit: 'κ.γ.', isSubRecipe: false },
    ],
    steps: [
      { id: 's3-1', type: 'step', content: 'Καθαρίζουμε και πλένουμε το ψάρι.' },
      { id: 's3-2', type: 'step', content: 'Το αλατοπιπερώνουμε και το ραντίζουμε με ελαιόλαδο.' },
      { id: 's3-3', type: 'step', content: 'Ψήνουμε στη σχάρα για 7-8 λεπτά από κάθε πλευρά.' },
      { id: 's3-4', type: 'step', content: 'Ετοιμάζουμε ένα απλό λαδολέμονο με ρίγανη.' },
      { id: 's3-5', type: 'step', content: 'Περιχύνουμε το ψάρι με το λαδολέμονο και σερβίρουμε.' }
    ],
    allergens: ['Fish'],
    teamId: 'team2',
  },
  {
    id: 'sub1',
    name: 'Σάλτσα Μπεσαμέλ',
    name_en: 'Béchamel Sauce',
    description: 'Κλασική γαλλική λευκή σάλτσα, βάση για πολλές παρασκευές.',
    imageUrl: 'https://images.unsplash.com/photo-1608772955527-4e58b2e3532c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60', // Placeholder
    category: 'sub_recipe',
    prepTime: 5,
    cookTime: 15,
    servings: 1, // This represents 1 batch
    yield: { quantity: 1, unit: 'kg'},
    ingredients: [
      { id: 'ing-b1', name: 'Βούτυρο', quantity: 60, unit: 'g', isSubRecipe: false },
      { id: 'ing-b2', name: 'Αλεύρι', quantity: 60, unit: 'g', isSubRecipe: false },
      { id: 'ing-b3', name: 'Γάλα', quantity: 1, unit: 'L', isSubRecipe: false },
      { id: 'ing-b4', name: 'Μοσχοκάρυδο', quantity: 1, unit: 'κ.γ.', isSubRecipe: false },
      { id: 'ing-b5', name: 'Αλάτι', quantity: 1, unit: 'κ.γ.', isSubRecipe: false },
    ],
    steps: [
      { id: 's-sub1-1', type: 'step', content: 'Λιώνουμε το βούτυρο σε μια κατσαρόλα.' },
      { id: 's-sub1-2', type: 'step', content: 'Προσθέτουμε το αλεύρι και ανακατεύουμε για 1 λεπτό (roux).' },
      { id: 's-sub1-3', type: 'step', content: 'Προσθέτουμε σταδιακά το γάλα, ανακατεύοντας συνεχώς με αυγοδάρτη.' },
      { id: 's-sub1-4', type: 'step', content: 'Αφήνουμε τη σάλτσα να πήξει σε χαμηλή φωτιά.' },
      { id: 's-sub1-5', type: 'step', content: 'Προσθέτουμε το μοσχοκάρυδο και το αλάτι.' }
    ],
    allergens: ['Gluten', 'Milk'],
    teamId: 'team1',
  },
   {
    id: '4',
    name: 'Παστίτσιο',
    name_en: 'Pastitsio',
    description: 'Η αγαπημένη ελληνική συνταγή για παστίτσιο φούρνου.',
    imageUrl: 'https://images.unsplash.com/photo-1627906933484-2a6d1112b327?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
    category: 'main_course',
    prepTime: 40,
    cookTime: 60,
    servings: 8,
    price: 15.00,
    ingredients: [
      { id: 'ing-p1', name: 'Μακαρόνια για Παστίτσιο', quantity: 500, unit: 'g', isSubRecipe: false },
      { id: 'ing-p2', name: 'Κιμάς Μοσχαρίσιος', quantity: 750, unit: 'g', isSubRecipe: false },
      { id: 'ing-p3', name: 'Σάλτσα Μπεσαμέλ', quantity: 1, unit: 'kg', isSubRecipe: true, recipeId: 'sub1' },
      { id: 'ing-p4', name: 'Κεφαλοτύρι', quantity: 200, unit: 'g', isSubRecipe: false },
      { id: 'ing-p5', name: 'Κρεμμύδι', quantity: 1, unit: 'τεμ', isSubRecipe: false },
      { id: 'ing-p6', name: 'Κρασί κόκκινο', quantity: 50, unit: 'ml', isSubRecipe: false },
      { id: 'ing-p7', name: 'Ντομάτες κονκασέ', quantity: 200, unit: 'g', isSubRecipe: false },
      { id: 'ing-p8', name: 'Ελαιόλαδο', quantity: 30, unit: 'ml', isSubRecipe: false },
      { id: 'ing-p9', name: 'Βούτυρο', quantity: 50, unit: 'g', isSubRecipe: false },
      { id: 'ing-p10', name: 'Σκόρδο', quantity: 1, unit: 'τεμ', isSubRecipe: false },
      { id: 'ing-p11', name: 'Καρότο', quantity: 1, unit: 'τεμ', isSubRecipe: false },
      { id: 'ing-p12', name: 'Κονιάκ', quantity: 30, unit: 'ml', isSubRecipe: false },
      { id: 'ing-p13', name: 'Δαφνόφυλλο', quantity: 1, unit: 'τεμ', isSubRecipe: false },
      { id: 'ing-p14', name: 'Ξύλο Κανέλας', quantity: 1, unit: 'τεμ', isSubRecipe: false },
    ],
    steps: [
      { id: 's4-h1', type: 'heading', content: 'ΚΙΜΑΣ' },
      { id: 's4-1', type: 'step', content: 'Σε πλασοτέ κατσαρόλα ζεσταίνουμε το βούτυρο με το ελαιόλαδο και σοτάρουμε τον κιμά, απλώνοντάς τον με κουτάλα.' },
      { id: 's4-2', type: 'step', content: 'Αφήνουμε να ψήνεται καλά για να μη βγάζει τα υγρά του με το συνεχές ανακάτεμα. Αυτό διαρκεί περίπου 8 λεπτά. Στο τέλος, αφού ψηθεί ο κιμάς τον σπάμε σε μικρά κομμάτια με την κουτάλα.' },
      { id: 's4-3', type: 'step', content: 'Τότε προσθέτουμε το κρεμμύδι, το σκόρδο, το καρότο και σοτάρουμε επιπλέον για 2 με 3 λεπτά, μέχρι να γίνουν διάφανα.' },
      { id: 's4-4', type: 'step', content: 'Σβήνουμε με το κονιάκ. Αφήνουμε για 1 με 2 λεπτά να εξατμιστεί το αλκοόλ.' },
      { id: 's4-5', type: 'step', content: 'Προσθέτουμε την ντομάτα, το αλάτι, το πιπέρι, το δαφνόφυλλο και το ξύλο κανέλας.' },
      { id: 's4-6', type: 'step', content: 'Αφήνουμε την κανέλα ν’ αρωματίσει για 5 λεπτά τον κιμά και την αφαιρούμε.' },
      { id: 's4-7', type: 'step', content: 'Σκεπάζουμε τη σάλτσα κιμά, χαμηλώνουμε τη φωτιά και σιγοβράζουμε για 20 λεπτά (χωρίς προσθήκη υγρών) μέχρι να πιει τα υγρά του τελείως και να συμπυκνωθούν οι γεύσεις.' },
      { id: 's4-8', type: 'step', content: 'Όταν βράσει ο κιμάς, προσθέτουμε στη σάλτσα κιμά μερικές κουταλιές μπεσαμέλ και ανακατεύουμε.' },
      { id: 's4-h2', type: 'heading', content: 'ΣΤΟ ΤΑΨΙ' },
      { id: 's4-9', type: 'step', content: 'Στο μεταξύ, έχουμε βράσει για 6′ τα μακαρόνια σε αλατισμένο νερό.' },
      { id: 's4-10', type: 'step', content: 'Τα σουρώνουμε, να στραγγίσουν καλά και τα ξαναβάζουμε στην κατσαρόλα.' },
      { id: 's4-11', type: 'step', content: 'Προσθέτουμε το βούτυρο και τα ανακατεύουμε.' },
      { id: 's4-12', type: 'step', content: 'Βάζουμε τα μισά βουτυρωμένα μακαρόνια σε ταψί 25Χ35εκ. και πασπαλίζουμε με λίγο κεφαλοτύρι.' },
      { id: 's4-13', type: 'step', content: 'Αδειάζουμε τον κιμά στα μακαρόνια.' },
      { id: 's4-14', type: 'step', content: 'Προσθέτουμε τα υπόλοιπα μακαρόνια σε μία στρώση.' },
      { id: 's4-15', type: 'step', content: 'Περιχύνουμε με την Σάλτσα Μπεσαμέλ.' },
      { id: 's4-16', type: 'step', content: 'Κουνάμε ελαφρά το ταψί, να στρώσει η επιφάνεια του παστίτσιου.' },
      { id: 's4-17', type: 'step', content: 'Πασπαλίζουμε με το υπόλοιπο κεφαλοτύρι.' },
      { id: 's4-18', type: 'step', content: 'Ψήνουμε σε προθερμασμένο φούρνο στους 180°C στις αντιστάσεις, στην τελευταία σχάρα, για 45 λεπτά, μέχρι να ροδίσει η επιφάνεια και να κάνει ωραία κρούστα.' },
      { id: 's4-19', type: 'step', content: 'Αφήνουμε το ψημένο παστίτσιο να σταθεί για 10 λεπτά, κόβουμε και σερβίρουμε.' }
    ],
    allergens: ['Gluten', 'Milk', 'Celery'],
    teamId: 'team1',
  }
];

export const mockIngredientCosts: IngredientCost[] = [
  { id: 'ic1', name: 'Μοσχάρι', cost: 12, purchaseUnit: 'kg', teamId: 'team1' },
  { id: 'ic2', name: 'Κρεμμύδι', cost: 0.8, purchaseUnit: 'kg', teamId: 'team1' },
  { id: 'ic3', name: 'Σκόρδο', cost: 3, purchaseUnit: 'kg', teamId: 'team1' },
  { id: 'ic4', name: 'Ντομάτες κονκασέ', cost: 2.5, purchaseUnit: 'kg', teamId: 'team1' }, // 1 EUR for 400g -> 2.5 EUR/kg
  { id: 'ic5', name: 'Ελαιόλαδο', cost: 9, purchaseUnit: 'L', teamId: 'team1' },
  { id: 'ic6', name: 'Αλάτι', cost: 1.5, purchaseUnit: 'kg', teamId: 'team1' },
  { id: 'ic7', name: 'Πιπέρι', cost: 20, purchaseUnit: 'kg', teamId: 'team1' },
  { id: 'ic8', name: 'Κρασί κόκκινο', cost: 6.67, purchaseUnit: 'L', teamId: 'team1' }, // 5 EUR for 0.75L -> 6.67 EUR/L
  { id: 'ic9', name: 'Σπανάκι', cost: 2, purchaseUnit: 'kg', teamId: 'team1' },
  { id: 'ic10', name: 'Φέτα', cost: 10, purchaseUnit: 'kg', teamId: 'team1' },
  { id: 'ic11', name: 'Άνηθος', cost: 10, purchaseUnit: 'kg', teamId: 'team1' },
  { id: 'ic12', name: 'Φύλλο κρούστας', cost: 2, purchaseUnit: 'τεμ', teamId: 'team1' },
  { id: 'ic13', name: 'Αυγό', cost: 0.2, purchaseUnit: 'τεμ', teamId: 'team1' },
  { id: 'ic14', name: 'Λαβράκι', cost: 15, purchaseUnit: 'kg', teamId: 'team2' },
  { id: 'ic15', name: 'Λεμόνι', cost: 1.2, purchaseUnit: 'kg', teamId: 'team2' },
  { id: 'ic16', name: 'Βούτυρο', cost: 8, purchaseUnit: 'kg', teamId: 'team1' },
  { id: 'ic17', name: 'Αλεύρι', cost: 1.2, purchaseUnit: 'kg', teamId: 'team1' },
  { id: 'ic18', name: 'Γάλα', cost: 1.5, purchaseUnit: 'L', teamId: 'team1' },
  { id: 'ic19', name: 'Μοσχοκάρυδο', cost: 50, purchaseUnit: 'kg', teamId: 'team1' },
  { id: 'ic20', name: 'Μακαρόνια για Παστίτσιο', cost: 2, purchaseUnit: 'kg', teamId: 'team1' },
  { id: 'ic21', name: 'Κιμάς Μοσχαρίσιος', cost: 10, purchaseUnit: 'kg', teamId: 'team1' },
  { id: 'ic22', name: 'Κεφαλοτύρι', cost: 12, purchaseUnit: 'kg', teamId: 'team1' },
  { id: 'ic23', name: 'Καρότο', cost: 1, purchaseUnit: 'kg', teamId: 'team1' },
  { id: 'ic24', name: 'Κονιάκ', cost: 15, purchaseUnit: 'L', teamId: 'team1' },
  { id: 'ic25', name: 'Δαφνόφυλλο', cost: 30, purchaseUnit: 'kg', teamId: 'team1' },
  { id: 'ic26', name: 'Ξύλο Κανέλας', cost: 25, purchaseUnit: 'kg', teamId: 'team1' },
];


export const mockWorkstations: Workstation[] = [
    { id: 'ws1', name: 'Κρύα Κουζίνα', teamId: 'team1' },
    { id: 'ws2', name: 'Ζεστή Κουζίνα', teamId: 'team1' },
    { id: 'ws3', name: 'Ζαχαροπλαστείο', teamId: 'team1' },
    { id: 'ws4', name: 'A La Carte Grill', teamId: 'team2' }
];

export const mockPrepTasks: PrepTask[] = [
    { id: 'pt1', description: 'Κόψιμο λαχανικών για κοκκινιστό', recipeName: 'Μοσχαράκι Κοκκινιστό', workstationId: 'ws2', status: PrepTaskStatus.ToDo, teamId: 'team1' },
    { id: 'pt2', description: 'Μαρινάρισμα μοσχαριού', recipeName: 'Μοσχαράκι Κοκκινιστό', workstationId: 'ws2', status: PrepTaskStatus.ToDo, teamId: 'team1' },
    { id: 'pt3', description: 'Πλύσιμο και κόψιμο σπανακιού', recipeName: 'Σπανακόπιτα', workstationId: 'ws1', status: PrepTaskStatus.InProgress, teamId: 'team1' },
    { id: 'pt4', description: 'Ετοιμασία γέμισης για σπανακόπιτα', recipeName: 'Σπανακόπιτα', workstationId: 'ws1', status: PrepTaskStatus.Done, teamId: 'team1' },
    { id: 'pt5', description: 'Ετοιμασία βάσης για Crème brûlée', recipeName: 'Crème brûlée', workstationId: 'ws3', status: PrepTaskStatus.ToDo, teamId: 'team1' },
    { id: 'pt6', description: 'Φιλετάρισμα ψαριών', recipeName: 'Λαβράκι Σχάρας', workstationId: 'ws4', status: PrepTaskStatus.ToDo, teamId: 'team2' }
];

export const mockHaccpItems: HaccpItem[] = [
    { id: 'haccp1', name: 'Ψυγείο Συντήρησης #1', category: 'fridge', teamId: 'team1' },
    { id: 'haccp2', name: 'Καταψύκτης #2', category: 'freezer', teamId: 'team1' },
    { id: 'haccp3', name: 'Θερμοθάλαμος Service', category: 'hot_holding', teamId: 'team1' },
    { id: 'haccp4', name: 'Πάγκοι Εργασίας', category: 'kitchen_area', teamId: 'team1' },
    { id: 'haccp5', name: 'Ψυγείο a la carte', category: 'fridge', teamId: 'team2' },
];

export const mockHaccpLogs: HaccpLog[] = [
    { id: 'log1', timestamp: new Date('2023-10-27T08:00:00Z'), type: HaccpLogType.Temperature, haccpItemId: 'haccp1', value: '3°C', user: 'Γιάννης', teamId: 'team1' },
    { id: 'log2', timestamp: new Date('2023-10-27T08:05:00Z'), type: HaccpLogType.Temperature, haccpItemId: 'haccp2', value: '-18°C', user: 'Γιάννης', teamId: 'team1' },
    { id: 'log3', timestamp: new Date('2023-10-27T12:00:00Z'), type: HaccpLogType.Temperature, haccpItemId: 'haccp3', value: '65°C', user: 'Μαρία', teamId: 'team1' },
    { id: 'log4', timestamp: new Date('2023-10-26T22:00:00Z'), type: HaccpLogType.Cleaning, haccpItemId: 'haccp4', user: 'Κώστας', teamId: 'team1' },
    { id: 'log5', timestamp: new Date('2023-10-27T09:00:00Z'), type: HaccpLogType.Temperature, haccpItemId: 'haccp5', value: '4°C', user: 'Giorgos', teamId: 'team2' }
];

export const mockHaccpReminders: HaccpReminder[] = [
    { 
      id: 'rem1', 
      haccpItemId: 'haccp1', 
      frequency: 'every_4_hours', 
      nextCheckDue: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      assignedUserId: 'u1',
      teamId: 'team1' 
    },
    { 
      id: 'rem2', 
      haccpItemId: 'haccp2', 
      frequency: 'daily', 
      nextCheckDue: new Date(Date.now() + 10 * 60 * 60 * 1000), // 10 hours from now
      assignedUserId: 'u1',
      teamId: 'team1' 
    },
    { 
      id: 'rem3', 
      haccpItemId: 'haccp3', 
      frequency: 'every_2_hours', 
      nextCheckDue: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes overdue
      assignedUserId: 'u2',
      teamId: 'team1',
      isOverdue: true
    },
    { 
      id: 'rem4', 
      haccpItemId: 'haccp4', 
      frequency: 'weekly', 
      nextCheckDue: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      assignedUserId: 'u3',
      teamId: 'team1' 
    },
    { 
      id: 'rem5', 
      haccpItemId: 'haccp5', 
      frequency: 'every_4_hours', 
      nextCheckDue: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
      assignedUserId: 'u4',
      teamId: 'team2' 
    }
];

export const mockInventoryLocations: InventoryLocation[] = [
    { id: 'loc1', name: 'Κεντρική Αποθήκη', teamId: 'team1' },
    { id: 'loc2', name: 'Αποθήκη Ημέρας - Κουζίνα', teamId: 'team1' },
    { id: 'loc3', name: 'A La Carte Αποθήκη', teamId: 'team2' },
];

export const mockSuppliers: Supplier[] = [
  { id: 'sup1', name: 'Κεντρική Λαχαναγορά', contactPerson: 'Νίκος Παππάς', phone: '2101234567', email: 'orders@laxanagora.gr', teamId: 'team1' },
  { id: 'sup2', name: 'Meat House Α.Ε.', contactPerson: 'Ελένη Γεωργίου', phone: '2109876543', teamId: 'team1' },
  { id: 'sup3', name: 'Τυροκομικά Ήπειρος', email: 'sales@epirus-cheese.gr', teamId: 'team1' },
  { id: 'sup4', name: 'Aegean Fish Market', contactPerson: 'Κατερίνα', phone: '2284012345', email: 'orders@aegeanfish.gr', teamId: 'team2' }
];

export const mockInventory: InventoryItem[] = [
  { id: 'inv1', name: 'Μοσχάρι', locations: [{ locationId: 'loc1', quantity: 12.5 }, { locationId: 'loc2', quantity: 3 }], unit: 'kg', reorderPoint: 5, supplierId: 'sup2', ingredientCostId: 'ic1', teamId: 'team1' },
  { id: 'inv2', name: 'Κρεμμύδι', locations: [{ locationId: 'loc1', quantity: 20 }], unit: 'kg', reorderPoint: 10, supplierId: 'sup1', ingredientCostId: 'ic2', teamId: 'team1' },
  { id: 'inv3', name: 'Σκόρδο', locations: [{ locationId: 'loc1', quantity: 2 }], unit: 'kg', reorderPoint: 1, supplierId: 'sup1', ingredientCostId: 'ic3', teamId: 'team1' },
  { id: 'inv4', name: 'Ελαιόλαδο', locations: [{ locationId: 'loc1', quantity: 25 }, { locationId: 'loc2', quantity: 5 }], unit: 'L', reorderPoint: 10, supplierId: 'sup1', ingredientCostId: 'ic5', teamId: 'team1' },
  { id: 'inv5', name: 'Φέτα', locations: [{ locationId: 'loc1', quantity: 8.2 }], unit: 'kg', reorderPoint: 4, supplierId: 'sup3', ingredientCostId: 'ic10', teamId: 'team1' },
  { id: 'inv6', name: 'Αυγό', locations: [{ locationId: 'loc2', quantity: 60 }], unit: 'τεμ', reorderPoint: 24, supplierId: 'sup1', ingredientCostId: 'ic13', teamId: 'team1' },
  { id: 'inv7', name: 'Λαβράκι', locations: [{ locationId: 'loc3', quantity: 5 }], unit: 'kg', reorderPoint: 2, supplierId: 'sup4', ingredientCostId: 'ic14', teamId: 'team2' }
];

export const mockInventoryTransactions: InventoryTransaction[] = [];

export const mockWasteLogs: WasteLog[] = [
    { id: 'waste1', timestamp: new Date(Date.now() - 86400000 * 2), inventoryItemId: 'inv1', quantity: 1.2, unit: 'kg', reason: 'expired', userId: 'user2', teamId: 'team1', notes: 'Forgot in back of fridge' },
    { id: 'waste2', timestamp: new Date(Date.now() - 86400000), inventoryItemId: 'inv7', quantity: 0.8, unit: 'kg', reason: 'spoiled', userId: 'user4', teamId: 'team2' },
];

export const mockMenus: Menu[] = [
  {
    id: 'menu1',
    type: 'a_la_carte',
    name: 'Μενού ημέρας - 28/10',
    description: 'Ένα κλασικό ελληνικό μενού για την εθνική εορτή.',
    recipeIds: ['1', '2'],
    teamId: 'team1',
  },
  {
    id: 'menu2',
    type: 'buffet',
    name: 'Χριστουγεννιάτικος Μπουφές',
    description: 'Πλούσιος μπουφές για την περίοδο των εορτών.',
    pax: 120,
    startDate: '2024-12-24',
    endDate: '2024-12-26',
    dailyPlans: [
      {
        date: '2024-12-24',
        mealPeriods: [
          {
            id: 'mp1',
            name: 'dinner',
            categories: [
              {
                id: 'cat1',
                name: 'Ζεστά Πιάτα',
                recipes: [
                  { recipeId: '1', quantity: 100 }
                ]
              },
              {
                id: 'cat2',
                name: 'Ορεκτικά',
                recipes: [
                  { recipeId: '2', quantity: 80 },
                ]
              }
            ]
          }
        ]
      },
      {
        date: '2024-12-25',
        mealPeriods: [
            {
                id: 'mp2',
                name: 'lunch',
                categories: [
                    {
                        id: 'cat3',
                        name: 'Κυρίως Πιάτα',
                        recipes: [
                             { recipeId: '1', quantity: 120 }
                        ]
                    }
                ]
            }
        ]
      }
    ],
    teamId: 'team1',
  },
  {
    id: 'menu3',
    type: 'a_la_carte',
    name: 'Elia A La Carte',
    description: 'Signature dishes from our a la carte restaurant.',
    recipeIds: ['3'],
    teamId: 'team2',
  }
];

export const mockNotifications: Notification[] = [
    {
        id: 'notif1',
        userId: 'user1',
        teamId: 'team1',
        senderName: 'Maria Sous',
        title: 'Αίτημα Αγορών',
        body: 'Το απόθεμα για το "Μοσχάρι" είναι χαμηλό. Χρειάζεται νέα παραγγελία.',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        link: { view: 'inventory', itemId: 'inv1' },
    },
    {
        id: 'notif2',
        userId: 'user1',
        teamId: 'team1',
        senderName: 'System',
        title: 'Ενημέρωση HACCP',
        body: 'Μην ξεχάσετε την καταγραφή θερμοκρασίας για το μεσημέρι.',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
        id: 'notif3',
        userId: 'user1',
        teamId: 'team1',
        senderName: 'Nikos Cook',
        title: 'Νέα Συνταγή',
        body: 'Η συνταγή για "Σπανακόπιτα" ενημερώθηκε.',
        read: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        link: { view: 'recipes', itemId: '2' },
    },
];

export const mockChannels: Channel[] = [
    { id: 'channel-general-1', name: 'Γενικές Ανακοινώσεις', teamId: 'team1' },
    { id: 'channel-service-1', name: 'Σέρβις Βραδινό', teamId: 'team1' },
];

export const mockMessages: Message[] = [
    // General channel for team1
    {
        id: 'msg1',
        conversationId: 'channel-general-1',
        teamId: 'team1',
        senderId: 'user1',
        content: 'Καλημέρα ομάδα! Σήμερα το μενού περιλαμβάνει το κοκκινιστό. Ας δώσουμε προσοχή στην προετοιμασία.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    },
    {
        id: 'msg2',
        conversationId: 'channel-general-1',
        teamId: 'team1',
        senderId: 'user2',
        content: 'Καλημέρα Chef! Έλαβα.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.9),
    },
    // Private conversation between user1 and user2
    {
        id: 'msg3',
        conversationId: 'user1-user2',
        teamId: 'team1',
        senderId: 'user1',
        content: 'Μαρία, μπορείς να τσεκάρεις τις παραλαβές από τον προμηθευτή "Κεντρική Λαχαναγορά" σήμερα;',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
        id: 'msg4',
        conversationId: 'user1-user2',
        teamId: 'team1',
        senderId: 'user2',
        content: 'Φυσικά Chef, θα το αναλάβω αμέσως.',
        timestamp: new Date(Date.now() - 1000 * 60 * 29),
    },
];

export const mockShifts: Shift[] = [
    // Maria Sous (user2)
    { id: 'shift1', userId: 'user2', teamId: 'team1', date: '2025-11-10', type: 'morning' },
    { id: 'shift2', userId: 'user2', teamId: 'team1', date: '2025-11-11', type: 'morning' },
    { id: 'shift3', userId: 'user2', teamId: 'team1', date: '2025-11-12', type: 'split' },
    { id: 'shift4', userId: 'user2', teamId: 'team1', date: '2025-11-13', type: 'day_off' },
    { id: 'shift5', userId: 'user2', teamId: 'team1', date: '2025-11-14', type: 'evening' },
    { id: 'shift6', userId: 'user2', teamId: 'team1', date: '2025-11-15', type: 'evening' },
    { id: 'shift7', userId: 'user2', teamId: 'team1', date: '2025-11-16', type: 'day_off' },

    // Nikos Cook (user3)
    { id: 'shift8', userId: 'user3', teamId: 'team1', date: '2025-11-10', type: 'evening' },
    { id: 'shift9', userId: 'user3', teamId: 'team1', date: '2025-11-11', type: 'day_off' },
    { id: 'shift10', userId: 'user3', teamId: 'team1', date: '2025-11-12', type: 'morning' },
    { id: 'shift11', userId: 'user3', teamId: 'team1', date: '2025-11-13', type: 'morning' },
    { id: 'shift12', userId: 'user3', teamId: 'team1', date: '2025-11-14', type: 'split' },
    { id: 'shift13', userId: 'user3', teamId: 'team1', date: '2025-11-15', type: 'day_off' },
    { id: 'shift14', userId: 'user3', teamId: 'team1', date: '2025-11-16', type: 'evening' },
];

export const mockShiftSchedules: ShiftSchedule[] = [
    {
        id: 'schedule1',
        name: 'Πρόγραμμα Νοεμβρίου 2025 (10-16)',
        teamId: 'team1',
        startDate: '2025-11-10',
        endDate: '2025-11-16',
        userIds: ['user1', 'user2', 'user3'],
    }
];

export const mockOrders: KitchenOrder[] = [
    {
        id: 'order1',
        orderNumber: 'ORD-001',
        tableNumber: '5',
        station: 'hot',
        items: [
            { id: 'item1', recipeId: 'recipe1', recipeName: 'Μουσακάς', quantity: 2, notes: '', specialRequests: [] },
            { id: 'item2', recipeId: 'recipe2', recipeName: 'Σαλάτα Χωριάτικη', quantity: 1, notes: '', specialRequests: [] }
        ],
        status: 'new',
        priority: 'normal',
        createdAt: new Date().toISOString(),
        estimatedTime: 25,
        teamId: 'team1',
        notes: ''
    },
    {
        id: 'order2',
        orderNumber: 'ORD-002',
        tableNumber: '12',
        station: 'grill',
        items: [
            { id: 'item3', recipeId: 'recipe3', recipeName: 'Μπριζόλα Χοιρινή', quantity: 2, notes: '', specialRequests: ['Καλοψημένη'] }
        ],
        status: 'in-progress',
        priority: 'high',
        createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        startedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        estimatedTime: 15,
        assignedTo: 'user3',
        teamId: 'team1',
        notes: 'Πελάτης βιάζεται'
    },
    {
        id: 'order3',
        orderNumber: 'ORD-003',
        tableNumber: '8',
        station: 'hot',
        items: [
            { id: 'item4', recipeId: 'recipe4', recipeName: 'Παστίτσιο', quantity: 1, notes: '', specialRequests: [] }
        ],
        status: 'ready',
        priority: 'normal',
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        startedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        readyAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        estimatedTime: 20,
        assignedTo: 'user2',
        teamId: 'team1',
        notes: ''
    },
    {
        id: 'order4',
        orderNumber: 'ORD-004',
        tableNumber: '3',
        station: 'cold',
        items: [
            { id: 'item5', recipeId: 'recipe5', recipeName: 'Τζατζίκι', quantity: 3, notes: '', specialRequests: [] }
        ],
        status: 'served',
        priority: 'low',
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        startedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
        readyAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        servedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        estimatedTime: 5,
        assignedTo: 'user3',
        teamId: 'team1',
        notes: ''
    }
];

export const mockVariations: RecipeVariation[] = [
    {
        id: 'var1',
        parentRecipeId: 'recipe1', // Μουσακάς
        variationType: 'vegan',
        name: 'Μουσακάς Vegan',
        name_en: 'Vegan Moussaka',
        description: 'Χωρίς κιμά και γαλακτοκομικά, με φακές και φυτική μπεσαμέλ',
        ingredientModifications: [
            { action: 'remove', originalIngredientId: 'beef', notes: 'Αφαίρεση κιμά' },
            { action: 'remove', originalIngredientId: 'milk', notes: 'Αφαίρεση γάλα' },
            { action: 'add', notes: 'Προσθήκη φακές' }
        ],
        allergenChanges: [],
        isActive: true,
        createdAt: '2025-11-01T10:00:00Z',
        teamId: 'team1'
    },
    {
        id: 'var2',
        parentRecipeId: 'recipe1', // Μουσακάς
        variationType: 'portion-size',
        name: 'Μουσακάς Μικρή Μερίδα',
        name_en: 'Small Portion Moussaka',
        description: 'Μισή μερίδα για παιδικό πιάτο',
        scaleFactor: 0.5,
        ingredientModifications: [],
        isActive: true,
        createdAt: '2025-11-05T14:00:00Z',
        teamId: 'team1'
    },
    {
        id: 'var3',
        parentRecipeId: 'recipe2', // Τυρόπιτα
        variationType: 'gluten-free',
        name: 'Τυρόπιτα Χωρίς Γλουτένη',
        name_en: 'Gluten-Free Cheese Pie',
        description: 'Με φύλλο χωρίς γλουτένη',
        ingredientModifications: [
            { action: 'replace', originalIngredientId: 'phyllo', notes: 'Αντικατάσταση με φύλλο χωρίς γλουτένη' }
        ],
        allergenChanges: [],
        isActive: true,
        createdAt: '2025-11-10T09:00:00Z',
        teamId: 'team1'
    }
];

export const mockReports: EmailReport[] = [
    {
        id: 'report1',
        name: 'Ημερήσια Αναφορά Αποθέματος',
        reportType: 'inventory',
        frequency: 'daily',
        scheduledTime: '08:00',
        recipients: ['chef@kitchen.app', 'sous@kitchen.app'],
        format: 'both',
        dateRange: 'last-7-days',
        includeCharts: true,
        customNotes: 'Ελεγχος για προιόντα χαμηλών αποθεμάτων',
        isActive: true,
        lastSent: '2025-12-01T08:00:00Z',
        nextScheduled: '2025-12-02T08:00:00Z',
        createdAt: '2025-11-01T10:00:00Z',
        createdBy: 'user1',
        teamId: 'team1'
    },
    {
        id: 'report2',
        name: 'Εβδομαδιαία Αναφορά Σπατάλης',
        reportType: 'waste',
        frequency: 'weekly',
        scheduledTime: '18:00',
        scheduledDay: 5, // Friday
        recipients: ['chef@kitchen.app', 'admin@kitchen.app'],
        format: 'pdf',
        dateRange: 'last-30-days',
        includeCharts: true,
        customNotes: 'Ανάλυση για μείωση σπατάλης',
        isActive: true,
        lastSent: '2025-11-29T18:00:00Z',
        nextScheduled: '2025-12-06T18:00:00Z',
        createdAt: '2025-10-15T12:00:00Z',
        createdBy: 'user1',
        teamId: 'team1'
    },
    {
        id: 'report3',
        name: 'Μηνιαία Αναφορά HACCP',
        reportType: 'haccp',
        frequency: 'monthly',
        scheduledTime: '09:00',
        scheduledDate: 1,
        recipients: ['chef@kitchen.app', 'compliance@kitchen.app'],
        format: 'both',
        dateRange: 'last-month',
        includeCharts: true,
        customNotes: 'Πλήρης αναφορά για έλεγχο συμμόρφωσης',
        isActive: true,
        lastSent: '2025-11-01T09:00:00Z',
        nextScheduled: '2025-12-01T09:00:00Z',
        createdAt: '2025-09-01T08:00:00Z',
        createdBy: 'user1',
        teamId: 'team1'
    },
    {
        id: 'report4',
        name: 'Αναφορά Κόστους Υλικών',
        reportType: 'costing',
        frequency: 'weekly',
        scheduledTime: '17:00',
        scheduledDay: 0, // Sunday
        recipients: ['chef@kitchen.app'],
        format: 'csv',
        dateRange: 'last-7-days',
        includeCharts: false,
        isActive: false,
        lastSent: '2025-10-20T17:00:00Z',
        createdAt: '2025-09-10T14:00:00Z',
        createdBy: 'user2',
        teamId: 'team1'
    }
];

export const mockReportHistory: ReportHistory[] = [
    {
        id: 'history1',
        reportId: 'report1',
        reportName: 'Ημερήσια Αναφορά Αποθέματος',
        reportType: 'inventory',
        sentAt: '2025-12-01T08:00:00Z',
        recipients: ['chef@kitchen.app', 'sous@kitchen.app'],
        format: 'both',
        status: 'sent',
        fileSize: 245678,
        downloadUrl: '/reports/inventory-2025-12-01.pdf'
    },
    {
        id: 'history2',
        reportId: 'report1',
        reportName: 'Ημερήσια Αναφορά Αποθέματος',
        reportType: 'inventory',
        sentAt: '2025-11-30T08:00:00Z',
        recipients: ['chef@kitchen.app', 'sous@kitchen.app'],
        format: 'both',
        status: 'sent',
        fileSize: 238456,
        downloadUrl: '/reports/inventory-2025-11-30.pdf'
    },
    {
        id: 'history3',
        reportId: 'report2',
        reportName: 'Εβδομαδιαία Αναφορά Σπατάλης',
        reportType: 'waste',
        sentAt: '2025-11-29T18:00:00Z',
        recipients: ['chef@kitchen.app', 'admin@kitchen.app'],
        format: 'pdf',
        status: 'sent',
        fileSize: 512678,
        downloadUrl: '/reports/waste-2025-11-29.pdf'
    },
    {
        id: 'history4',
        reportId: 'report2',
        reportName: 'Εβδομαδιαία Αναφορά Σπατάλης',
        reportType: 'waste',
        sentAt: '2025-11-22T18:00:00Z',
        recipients: ['chef@kitchen.app', 'admin@kitchen.app'],
        format: 'pdf',
        status: 'sent',
        fileSize: 498234,
        downloadUrl: '/reports/waste-2025-11-22.pdf'
    },
    {
        id: 'history5',
        reportId: 'report3',
        reportName: 'Μηνιαία Αναφορά HACCP',
        reportType: 'haccp',
        sentAt: '2025-11-01T09:00:00Z',
        recipients: ['chef@kitchen.app', 'compliance@kitchen.app'],
        format: 'both',
        status: 'sent',
        fileSize: 1024567,
        downloadUrl: '/reports/haccp-2025-11.pdf'
    },
    {
        id: 'history6',
        reportId: 'report3',
        reportName: 'Μηνιαία Αναφορά HACCP',
        reportType: 'haccp',
        sentAt: '2025-10-01T09:00:00Z',
        recipients: ['chef@kitchen.app', 'compliance@kitchen.app'],
        format: 'both',
        status: 'sent',
        fileSize: 987654,
        downloadUrl: '/reports/haccp-2025-10.pdf'
    },
    {
        id: 'history7',
        reportId: 'report4',
        reportName: 'Αναφορά Κόστους Υλικών',
        reportType: 'costing',
        sentAt: '2025-10-20T17:00:00Z',
        recipients: ['chef@kitchen.app'],
        format: 'csv',
        status: 'sent',
        fileSize: 45678
    },
    {
        id: 'history8',
        reportId: 'report1',
        reportName: 'Ημερήσια Αναφορά Αποθέματος',
        reportType: 'inventory',
        sentAt: '2025-11-29T08:05:00Z',
        recipients: ['chef@kitchen.app', 'sous@kitchen.app'],
        format: 'both',
        status: 'failed',
        errorMessage: 'SMTP connection timeout'
    }
];
