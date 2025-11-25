<div align="center">

# 🍳 ChefStack

### Complete Kitchen Management System with AI-Powered Features

**Professional kitchen operations platform for recipes, inventory, HACCP compliance, menu planning, staff management, and waste tracking.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-3ecf8e)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI%20Powered-8e75b2)](https://ai.google.dev/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Architecture](#-architecture)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-features)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [Feature Modules](#-feature-modules)
- [AI Integration](#-ai-integration)
- [Multi-Team Support](#-multi-team-support)
- [Bilingual Support](#-bilingual-support)
- [Printing Features](#-printing-features)
- [User Roles & Permissions](#-user-roles--permissions)
- [Architecture](#-architecture)
- [Development](#-development)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**ChefStack** is a comprehensive kitchen management system designed for professional food service operations. Built with modern web technologies, it provides end-to-end solutions for recipe management, inventory control, HACCP compliance, menu engineering, staff scheduling, and operational analytics.

### Why ChefStack?

- ✅ **All-in-One Solution**: From recipes to HACCP logs, everything in one platform
- 🤖 **AI-Powered**: Gemini AI integration for intelligent insights and automation
- 🌍 **Bilingual**: Full Greek/English support throughout the application
- 👥 **Multi-Team**: Manage multiple kitchens or brands from one account
- 📱 **Offline-First**: Works with mock data during development, seamless Supabase integration for production
- 🖨️ **Print-Ready**: Professional PDF generation for menus, labels, HACCP logs, and recipe books
- 🔐 **Role-Based Access**: Granular permissions for different staff levels
- ⚡ **Optimized Build**: Tailwind CSS build system for 95% smaller bundle size (~150KB vs 3MB CDN)
- 🎨 **Modern UI**: Glassmorphism design with dark mode support
- 📊 **Advanced Analytics**: Export data to CSV/PDF, batch operations, advanced filtering
- 📱 **Offline-First**: Works with mock data during development, seamless Supabase integration for production
- 🖨️ **Print-Ready**: Professional PDF generation for menus, labels, HACCP logs, and recipe books
- 🔐 **Role-Based Access**: Granular permissions for different staff levels

---

## ✨ Features

### 🍽️ Recipe Management
- **Digital Recipe Book**: Store unlimited recipes with detailed ingredients, steps, and images
- **Sub-Recipes**: Link recipes as ingredients in other recipes for complex dishes
- **AI Image Generation**: Create professional food images using Gemini AI
- **Category Organization**: Appetizers, mains, salads, soups, desserts, sub-recipes
- **Allergen Tracking**: Automatic allergen detection and labeling (14 EU allergens)
- **Portion Calculator**: Scale recipes up/down automatically
- **Yield Tracking**: Define recipe yields for accurate costing
- **URL Import**: Import recipes from websites automatically
- **Print-Ready**: Generate professional recipe books for kitchen use

### 📦 Inventory Management
- **Multi-Location Tracking**: Track stock across multiple storage locations
- **Reorder Alerts**: Automatic low-stock notifications
- **QR Code Integration**: Print and scan QR codes for quick stock updates
- **Invoice Import**: Extract items from supplier invoices (AI-powered)
- **Stock Transfers**: Move inventory between locations with full audit trail
- **Quick Actions**: Rapid stock adjustments via modal interface
- **Cost Integration**: Link to ingredient costs for real-time valuation
- **Inventory History**: Complete transaction history with filtering and analytics
- **AI Insights**: Smart suggestions for inventory optimization

### 💰 Costing & Pricing
- **Ingredient Cost Database**: Maintain current costs per purchase unit
- **Recipe Costing**: Automatic calculation of recipe costs based on ingredients
- **Margin Analysis**: Set and track profit margins
- **Multi-Unit Support**: Handle kg, L, items, g, ml, teaspoons, tablespoons
- **Cost Alerts**: Notifications when ingredient prices change
- **Supplier Price Comparison**: Track costs across different suppliers

### 🗓️ Menu Planning
- **Multiple Menu Types**: À la carte, buffet, catering menus
- **Smart Menu Builder**: Drag-and-drop recipe selection
- **AI Menu Coach**: Get intelligent menu suggestions based on inventory, seasonality, and trends
- **Menu Costing**: Automatic pricing based on recipe costs and margins
- **Print Customization**: Professional menu printing with logo placement, QR codes
- **Production Sheets**: Generate prep lists from selected menus
- **Customer Menus**: Beautiful printable menus for guests
- **Buffet Planning**: Special interface for buffet service planning

### 🛡️ HACCP & Food Safety
- **Temperature Logs**: Digital temperature recording with time stamps
- **Critical Control Points**: Customizable HACCP checkpoints
- **Auto-Alerts**: Warnings for out-of-range temperatures
- **Print Logs**: Daily/weekly temperature log sheets
- **Compliance Reports**: Generate reports for health inspections
- **AI Coaching**: Get HACCP best practices and compliance tips
- **Mobile-Friendly**: Record temperatures on any device

### 🛒 Shopping Lists
- **Auto-Generation**: Create shopping lists from low-stock items
- **Menu-Based Lists**: Generate lists from planned menus
- **Supplier Grouping**: Organize items by supplier
- **Email/Print**: Share lists with procurement team
- **Stock Integration**: Auto-update inventory when purchases received

### 📊 Stock Takes (Inventory Counts)
- **Physical Count Interface**: Streamlined UI for periodic inventory counts
- **Variance Reports**: Compare actual vs system stock
- **Adjustment History**: Track all manual stock adjustments
- **Multi-User**: Multiple staff can count different areas simultaneously

### 🏷️ Label Generation
- **Allergen Labels**: Print ingredient and allergen labels for dishes
- **Date Labels**: FIFO date labels for food storage
- **Custom Labels**: Design labels with logo, QR codes, text
- **Batch Printing**: Print multiple labels at once
- **EU Compliance**: Meets food labeling regulations

### 👔 Staff & Shifts
- **Shift Scheduling**: Plan and manage staff schedules
- **Role Assignment**: Assign roles to shifts (Chef, Sous Chef, Cook, etc.)
- **Coverage Tracking**: Visualize staff coverage across time periods
- **Shift Reports**: Track labor hours and costs

### 🏢 Workstations (Prep Stations)
- **Station Setup**: Define prep areas (hot line, pastry, garde manger, etc.)
- **Task Assignment**: Assign prep tasks to stations
- **Task Status**: Track todo → in-progress → done
- **Production Tracking**: Monitor prep completion rates

### ♻️ Waste Tracking
- **Waste Logging**: Record waste by item, quantity, and reason
- **Waste Categories**: Spoilage, over-production, prep waste, customer returns
- **Cost Impact**: Calculate financial impact of waste
- **AI Analysis**: Get intelligent insights on waste patterns and reduction strategies
- **Trend Reports**: Identify waste hotspots and improvement opportunities

### 🚚 Supplier Management
- **Supplier Database**: Maintain supplier contacts and details
- **Performance Tracking**: Monitor supplier reliability and pricing
- **AI Coaching**: Get suggestions for supplier negotiations and optimization
- **Order History**: Link invoices and orders to suppliers

### 📱 Kitchen Service
- **Order Management**: Track incoming orders during service
- **Order Status**: Manage orders from received → preparing → ready → served
- **Kitchen Display System**: Real-time order display for kitchen staff
- **Priority Management**: Mark urgent orders

### 🔔 Notifications & Messaging
- **Team Chat**: Communication channels for kitchen teams
- **Direct Messages**: One-on-one staff communication
- **System Alerts**: Automated notifications for low stock, HACCP warnings, etc.
- **Real-Time**: Instant updates across the team

### ⚙️ Settings & Administration
- **User Profile**: Manage personal info and password
- **Team Management**: Create/manage teams, invite members
- **Role & Permissions**: Define custom roles with granular permissions
- **Inventory Locations**: Configure storage locations
- **HACCP Items**: Customize critical control points
- **Application Preferences**: Dark mode, language, UI customization

### 🤖 Chef Copilot (AI Assistant)
- **Conversational AI**: Chat with AI for kitchen advice
- **Recipe Suggestions**: Get recipe ideas based on available inventory
- **Menu Planning**: AI-powered menu creation assistance
- **Best Practices**: Food safety, cooking techniques, kitchen management tips

### 📖 User Manual
- **Built-In Help**: Comprehensive user guide within the app
- **Feature Documentation**: Step-by-step instructions for all modules
- **Video Tutorials**: Embedded video guides (placeholder for future content)

### 🚀 Advanced Features (New)

#### 📤 Export & Import System
- **CSV Export**: Export all data types to CSV format
- **PDF Export**: Generate professional PDFs for reports, recipes, menus, HACCP logs, shopping lists
- **14 Export Functions**: Recipes, inventory, costs, menus, HACCP, shifts, waste, suppliers, and more
- **Batch Export**: Export multiple entities at once

#### 🔍 Advanced Filtering
- **6 Filter Types**: Text search, date ranges, category, status, numeric ranges, multi-select
- **Filter Presets**: Save and reuse common filter combinations
- **Quick Filter Chips**: One-click filter toggles
- **Persistent Filters**: Filters saved to localStorage across sessions
- **Export Filtered Data**: Export only what you see

#### ⚡ Batch Operations
- **Bulk Selection**: Select multiple items with checkboxes
- **Floating Action Bar**: Contextual actions when items selected
- **Batch Edit**: Update multiple items simultaneously
- **Batch Delete**: Remove multiple items at once
- **Selective Actions**: Choose which fields to update in batch edit

#### 📺 Kitchen Display System (KDS)
- **Real-Time Order Board**: Live kanban view of active orders
- **4-Stage Workflow**: New → Preparing → Ready → Completed
- **Auto-Timers**: Track order age automatically
- **Priority Indicators**: Visual alerts for urgent orders
- **Drag & Drop**: Move orders between stages
- **Service Mode**: Optimized for kitchen display monitors

#### 🔄 Recipe Variations
- **8 Variation Types**: Seasonal, dietary, regional, size, difficulty, cost, technique, presentation
- **Ingredient Modifications**: Add, remove, or substitute ingredients per variation
- **Independent Costing**: Each variation has its own cost calculation
- **Easy Creation**: Create variations from existing recipes
- **Variation Switching**: Toggle between variations in recipe detail view

#### 📧 Email Reports & Scheduling
- **Automated Reports**: Schedule daily, weekly, monthly reports
- **4 Report Types**: Inventory summary, low stock alerts, HACCP compliance, waste analysis
- **Email Integration**: Send reports to multiple recipients
- **Cron-Like Scheduling**: Flexible scheduling with cron expressions
- **Report History**: View past reports with timestamps
- **Custom Recipients**: Configure different recipients per report type

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Modern Browser** (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/jpapad/ChefStack.git
cd ChefStack

# Install dependencies
npm install

# Run in development mode
npm run dev
```

The app will open at **http://localhost:3000**

### First Launch

On first launch, ChefStack runs in **mock data mode** with sample data. You can:
- Explore all features with pre-populated data
- Test the interface without setting up a database
- Learn the system before production deployment

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration (optional - runs with mock data if not provided)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini AI Integration (optional - required for AI features)
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Operating Modes

#### 1. **Mock Mode** (Default - No Configuration Needed)
- No Supabase credentials required
- Works completely offline
- Pre-populated with sample data
- Perfect for development and testing
- Data persists in browser localStorage

#### 2. **Production Mode** (Supabase)
- Requires Supabase configuration
- User authentication enabled
- Multi-user support
- Data persisted in cloud database
- Real-time updates

#### 3. **AI-Enhanced Mode**
- Requires Gemini API key
- Enables AI image generation
- Activates AI coaching features
- Powers smart menu suggestions
- Enables waste analysis insights

### Supabase Setup (Optional)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the database schema (see `docs/supabase-schema.sql` - to be created)
3. Copy your project URL and anon key to `.env.local`
4. Restart the dev server

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `.env.local` as `VITE_GEMINI_API_KEY`
4. Restart the dev server

---

## 📦 Feature Modules

### Dashboard
**Route**: `/dashboard`

The command center of your kitchen operations:
- **Daily Overview**: Today's scheduled menus, tasks, and alerts
- **Inventory Status Chart**: Visual representation of stock levels
- **Low Stock Alerts**: Immediate visibility of items needing reorder
- **Task Status**: Progress tracking for prep tasks
- **Quick Stats**: Total recipes, inventory items, active menus
- **AI Operations Coach**: Intelligent suggestions for daily operations

### Recipes
**Route**: `/recipes`

Complete recipe lifecycle management:
- **Grid/List View**: Toggle between visual cards and detailed lists
- **Search & Filter**: Find recipes by name, category, allergens
- **Recipe Details**: Full ingredient lists, steps, timing, yields
- **Create/Edit**: Intuitive forms with ingredient sub-recipe linking
- **AI Image Generation**: Generate professional food photography
- **Import from URL**: Auto-extract recipe data from websites
- **Recipe Book Mode**: Special view for kitchen printing
- **Allergen Auto-Detection**: Automatic allergen flagging

**Key Components**:
- `RecipeList.tsx` - Main recipe browser
- `RecipeDetail.tsx` - Full recipe view
- `RecipeForm.tsx` - Create/edit interface
- `RecipeCard.tsx` - Card display component

### Inventory
**Route**: `/inventory`

Advanced stock management system:
- **Multi-Location**: Track items across fridges, freezers, dry storage, etc.
- **Real-Time Quantities**: See total stock and per-location breakdown
- **Quick Actions**: Fast stock in/out via modal
- **QR Integration**: Scan codes for instant updates
- **Reorder Alerts**: Visual warnings for low stock
- **Cost Tracking**: See current stock value
- **Invoice Import**: AI-powered invoice parsing
- **Transfer Stock**: Move items between locations
- **AI Insights**: Get optimization suggestions

**Related Views**:
- `InventoryView.tsx` - Main inventory interface
- `InventoryHistoryView.tsx` - Transaction history and reports
- `QRScanner.tsx` - Camera-based QR scanning
- `InvoiceImportModal.tsx` - Invoice processing

### Menus
**Route**: `/menus`

Professional menu engineering:
- **Menu Types**: À la carte (with courses) or Buffet (item grid)
- **Recipe Selector**: Add recipes to menu with drag-and-drop
- **Pricing**: Automatic cost calculation from recipes
- **Production Sheets**: Generate prep lists for selected menus
- **AI Menu Coach**: Get intelligent menu suggestions
- **Print Customizer**: Design beautiful printed menus
- **Customer View**: Guest-facing menu display
- **QR Menu**: Generate QR codes for digital menus

**Menu Types**:
- **À la Carte**: Categorized by courses (appetizers, mains, desserts)
- **Buffet**: Grid layout for buffet service planning

### HACCP
**Route**: `/haccp`

Complete food safety compliance:
- **Temperature Logs**: Record fridge, freezer, hot-hold temps
- **Custom Checkpoints**: Define your critical control points
- **Time-Stamped**: All logs include date/time
- **Range Alerts**: Visual warnings for out-of-range temps
- **Print Sheets**: Daily/weekly log sheets for manual recording
- **AI Coaching**: Best practices and compliance tips
- **History**: Search and filter past logs
- **Compliance Reports**: Generate reports for inspections

**HACCP Items** (Customizable):
- Refrigerator temperatures
- Freezer temperatures
- Hot holding temperatures
- Cooking temperatures
- Reheating temperatures
- Cooling logs

### Costing
**Route**: `/costing`

Ingredient cost management:
- **Cost Database**: Maintain current ingredient costs
- **Purchase Units**: Support for kg, L, items
- **Multi-Supplier**: Track costs from different suppliers
- **Recipe Integration**: Costs automatically used in recipe calculations
- **Price History**: Track cost changes over time
- **Bulk Import**: Import costs from CSV

### Suppliers
**Route**: `/suppliers`

Supplier relationship management:
- **Supplier Profiles**: Contact info, terms, notes
- **Performance Tracking**: Rate reliability and quality
- **AI Coaching**: Get negotiation tips and optimization suggestions
- **Order History**: Link invoices and orders
- **Multi-Team**: Share suppliers across teams or keep separate

### Shopping Lists
**Route**: `/shopping_list`

Automated procurement:
- **Auto-Generate**: Create lists from low-stock items
- **Menu-Based**: Generate from upcoming menus
- **Supplier Grouping**: Organize by supplier for efficient ordering
- **Manual Adjustments**: Add/remove items as needed
- **Print/Email**: Share with procurement team
- **Check-Off**: Mark items as ordered/received

### Stock Takes
**Route**: `/stock_take`

Physical inventory counting:
- **Count Interface**: Simple form for entering physical counts
- **Variance Reporting**: Compare actual vs system stock
- **Auto-Adjust**: Option to update system stock from count
- **History**: Track all stock takes over time
- **Multi-User**: Different staff can count different areas

### Waste Tracking
**Route**: `/waste_log`

Comprehensive waste management:
- **Waste Entry**: Log waste with item, quantity, reason, date
- **Waste Reasons**: Spoilage, over-production, prep waste, customer returns, other
- **Cost Impact**: See financial impact of each waste entry
- **AI Analysis**: Get insights on waste reduction strategies
- **Trend Reports**: Identify patterns and improvement areas
- **Supplier Link**: Track if waste relates to supplier quality issues

### Workstations
**Route**: `/workstations`

Prep station management:
- **Station Setup**: Define areas (hot line, pastry, cold prep, etc.)
- **Task Assignment**: Assign prep tasks to stations and staff
- **Status Tracking**: Todo → In Progress → Done
- **Production Visibility**: See what's being prepped where
- **Team Coordination**: Improve kitchen workflow

### Shifts
**Route**: `/shifts`

Staff scheduling system:
- **Shift Types**: Morning, Day, Evening, Night, Custom
- **Staff Assignment**: Assign team members to shifts
- **Role Definition**: Chef, Sous Chef, Cook, Prep Cook, Dishwasher
- **Schedule View**: Calendar view of upcoming shifts
- **Coverage Reports**: Ensure adequate staffing
- **Hour Tracking**: Monitor labor hours

### Labels
**Route**: `/labels`

Professional label printing:
- **Allergen Labels**: EU-compliant allergen information
- **Date Labels**: FIFO rotation labels
- **Custom Labels**: Create branded labels with logos
- **QR Codes**: Include QR codes for traceability
- **Batch Print**: Print multiple labels on label sheets
- **Templates**: Save label templates for reuse

### Kitchen Service
**Route**: `/kitchen_service`

Live order management:
- **Order Display**: Real-time incoming orders
- **Status Workflow**: Received → Preparing → Ready → Served
- **Priority Flags**: Mark urgent orders
- **Table/Order Info**: Track order source
- **Kitchen Display**: Large format for kitchen screens
- **Order History**: Review past service

### Notifications & Chat
**Route**: `/notifications`

Team communication hub:
- **Channels**: Team-wide discussion channels
- **Direct Messages**: Private staff communication
- **System Alerts**: Automated notifications (low stock, HACCP alerts)
- **Real-Time**: Instant message delivery
- **Message History**: Searchable message archive
- **Mentions**: @mention team members

### Settings
**Route**: `/settings`

Application configuration:
- **Profile**: Edit name, email, password
- **Team Management**: Create teams, invite members, manage access
- **Roles & Permissions**: Custom role creation with 20+ permissions
- **Inventory Locations**: Define storage areas
- **HACCP Items**: Configure critical control points
- **Language**: Switch between Greek and English
- **Theme**: Light/Dark mode (if implemented)

### User Manual
**Route**: `/user_manual`

Built-in documentation:
- **Getting Started**: Quick start guide
- **Feature Guides**: Step-by-step for each module
- **Best Practices**: Kitchen management tips
- **Troubleshooting**: Common issues and solutions
- **Video Tutorials**: Embedded training videos (placeholder)

### Chef Copilot
**Route**: `/copilot`

AI-powered kitchen assistant:
- **Conversational Interface**: Natural language chat
- **Recipe Assistance**: Get recipe suggestions and modifications
- **Menu Planning**: AI helps create balanced menus
- **Inventory Insights**: Suggestions based on stock levels
- **Cooking Advice**: Techniques, temperatures, timing
- **Food Safety**: HACCP and safety guidance

---

## 🤖 AI Integration

ChefStack leverages **Google Gemini AI** (gemini-2.0-flash model) for intelligent features:

### AI Features

#### 1. **Recipe Image Generation**
- Generate professional food photography for recipes
- Text-to-image via Gemini
- Multiple style options
- Save directly to recipe

**Usage**: Recipe Form → "Generate AI Image" button

#### 2. **Smart Menu Coach**
- AI analyzes your inventory, recipes, and trends
- Suggests balanced menu combinations
- Considers seasonality and cost
- Provides reasoning for suggestions

**Usage**: Menu View → "AI Menu Coach" button

#### 3. **Waste Analysis**
- AI analyzes waste patterns
- Identifies root causes
- Suggests reduction strategies
- Provides actionable recommendations

**Usage**: Waste Log View → "Analyze with Gemini" button

#### 4. **Supplier Coaching**
- AI reviews supplier performance
- Suggests negotiation strategies
- Identifies optimization opportunities
- Recommends best practices

**Usage**: Supplier View → AI Coach panel

#### 5. **HACCP Coaching**
- AI provides compliance guidance
- Suggests best practices
- Helps interpret regulations
- Offers training tips

**Usage**: HACCP View → AI Coach panel

#### 6. **Operations Insights**
- Dashboard AI coach
- Daily operational suggestions
- Efficiency improvements
- Cost reduction ideas

**Usage**: Dashboard → AI Coach panel

#### 7. **Inventory Optimization**
- AI analyzes stock levels and usage
- Suggests optimal reorder points
- Identifies slow-moving items
- Recommends stock adjustments

**Usage**: Inventory View → AI Insights panel

### API Key Management

ChefStack includes a user-friendly API key management system:

- **No Hard Errors**: Missing API key shows friendly modal, not crashes
- **Setup Instructions**: Clear guidance on getting Gemini API key
- **Per-Feature Checks**: Each AI feature validates key independently
- **Graceful Degradation**: App fully functional without AI features

**Implementation**: `withApiKeyCheck` wrapper pattern ensures consistent UX

---

## 👥 Multi-Team Support

ChefStack supports multiple teams/kitchens from a single account:

### Team Features

- **Team Creation**: Create unlimited teams
- **Team Switching**: Quick switcher in header
- **Data Isolation**: Each team's data is completely separate
- **Member Management**: Invite users to specific teams
- **Role Assignment**: Different roles per team
- **Shared Users**: Users can belong to multiple teams

### Use Cases

- **Multi-Location Restaurants**: Manage different locations
- **Restaurant Groups**: Handle multiple brands
- **Catering Companies**: Separate clients into teams
- **Cloud Kitchens**: Manage virtual brands independently
- **Training Environments**: Separate production from training

### Team Workflow

1. Create team in Settings → Team Management
2. Invite members via email
3. Assign roles (Admin, Manager, Cook, etc.)
4. Switch teams via header dropdown
5. All data automatically filtered by current team

---

## 🌍 Bilingual Support

Full Greek and English support throughout the application:

### Language Features

- **Complete Translation**: Every UI element translated
- **Entity Bilingual Fields**: Recipes, menus, etc. have both Greek (`name`) and English (`name_en`) fields
- **User Preference**: Each user chooses preferred language
- **Instant Switch**: Toggle language without reload
- **Print Support**: Choose language for printed documents

### Translated Elements

- Navigation menus
- Form labels and placeholders
- Buttons and actions
- Error messages
- Help text
- Email notifications
- Print templates

### Implementation

**Translation Hook**:
```tsx
import { useTranslation } from './i18n';

const MyComponent = () => {
  const { t, language } = useTranslation();
  
  return <h1>{t('nav_recipes')}</h1>;
};
```

**Entity Fields**:
```tsx
interface Recipe {
  name: string;      // Greek
  name_en: string;   // English
  // ...
}

// Display based on language
<h2>{language === 'el' ? recipe.name : recipe.name_en}</h2>
```

---

## 🖨️ Printing Features

Professional print layouts for various kitchen documents:

### Print Modules

#### 1. **Recipe Books**
- Print multiple recipes as a bound book
- Choose recipes to include
- Professional formatting
- Ingredient lists, steps, images
- Index/table of contents
- Logo placement

**Access**: Recipes → "Recipe Book Mode"

#### 2. **Menus**
- Customer-facing menu printing
- Multiple layout options
- Logo placement (top, bottom, left, right)
- QR code inclusion
- Price display options
- Allergen symbols

**Access**: Menu → "Print Menu"

#### 3. **HACCP Logs**
- Daily/weekly temperature log sheets
- Pre-filled dates and times
- Checkboxes for manual recording
- Compliance formatting
- Company logo

**Access**: HACCP → "Print Logs"

#### 4. **Labels**
- Allergen labels
- Date labels (FIFO)
- Custom labels
- QR codes for inventory
- Batch printing on label sheets

**Access**: Labels → "Print Labels"

#### 5. **Production Sheets**
- Prep lists from menus
- Ingredient aggregation
- Task assignment
- Station breakdown

**Access**: Menu → "Production Sheet"

#### 6. **Shopping Lists**
- Supplier-grouped lists
- Checkboxes for ordering
- Quantity and unit columns

**Access**: Shopping List → "Print"

#### 7. **Inventory Reports**
- Stock level reports
- Variance reports from stock takes
- Cost valuation reports

**Access**: Inventory History → "Print"

### Print Customization

Most print features include:
- Logo upload and placement
- Date range selection
- Content filtering
- Layout options
- Preview before print

---

## 🔐 User Roles & Permissions

Granular permission system for team security:

### Default Roles

#### 1. **Admin**
- **All Permissions**: Complete system access
- Cannot be restricted
- Team owner default role
- Can manage all users and settings

#### 2. **Manager**
- Manage recipes, menus, inventory
- View reports and analytics
- Manage suppliers and costs
- Cannot modify team settings or user roles

#### 3. **Chef**
- Manage recipes and menus
- View inventory
- Update HACCP logs
- Cannot modify costs or suppliers

#### 4. **Cook**
- View recipes
- Update task status
- Record HACCP logs
- Cannot edit recipes or inventory

#### 5. **Viewer**
- Read-only access
- View recipes and menus
- No editing capabilities
- Good for consultants or auditors

### Permissions List

ChefStack includes 20+ granular permissions:

**Recipe Management**:
- `view_recipes` - View recipe list and details
- `manage_recipes` - Create, edit, delete recipes
- `import_recipes` - Import from URLs

**Inventory**:
- `view_inventory` - See inventory levels
- `manage_inventory` - Edit stock, add items
- `view_inventory_history` - Access transaction history

**Costing**:
- `view_costs` - See ingredient costs
- `manage_costs` - Edit costs and pricing

**Menus**:
- `view_menus` - View menu list
- `manage_menus` - Create, edit menus

**HACCP**:
- `view_haccp` - View HACCP logs
- `manage_haccp` - Record and edit logs

**Suppliers**:
- `view_suppliers` - See supplier list
- `manage_suppliers` - Add, edit suppliers

**Staff & Scheduling**:
- `view_shifts` - View shift schedule
- `manage_shifts` - Create, edit shifts
- `manage_workstations` - Configure prep stations

**Waste**:
- `view_waste_logs` - View waste entries
- `manage_waste_logs` - Record waste

**Administrative**:
- `manage_team` - Invite/remove team members
- `manage_roles` - Edit role permissions
- `manage_settings` - Modify application settings

### Custom Roles

Admins can create custom roles:
1. Go to Settings → Roles & Permissions
2. Create new role
3. Select permissions
4. Assign to users

---

## 🏗️ Architecture

### Tech Stack

**Frontend**:
- **React 18.2** - UI framework
- **TypeScript 5.8** - Type safety
- **Vite 6.2** - Build tool and dev server (port 3000/3001)
- **Tailwind CSS 3.4** - Utility-first CSS with PostCSS build system
- **PostCSS + Autoprefixer** - CSS optimization and vendor prefixing
- **Custom Design System** - Reusable component classes (.card-*, .btn-*, .badge-*)
- **Custom Icons** - Icon component system
- **jsPDF** - PDF generation and export

**Backend/Database**:
- **Supabase** - PostgreSQL database, authentication, real-time
- **Supabase Storage** - File storage for images
- **Row-Level Security** - Built-in data isolation

**AI/ML**:
- **Google Gemini AI** - gemini-2.0-flash model
- **Generative AI SDK** - @google/generative-ai
- **AI Features**: Image generation, menu coaching, waste analysis, HACCP guidance

**State Management**:
- **Prop Drilling** - Intentional centralized state pattern
- **localStorage** - UI preferences and mock data persistence
- **No Redux/Context** - Explicit data flow for maintainability
- **localStorage** - Persistent UI preferences

**Key Libraries**:
- `@supabase/supabase-js` - Supabase client
- `@google/generative-ai` - Gemini AI integration

### Project Structure

```
ChefStack/
├── components/              # React components
│   ├── auth/               # Authentication views
│   ├── common/             # Shared components (modals, icons)
│   ├── costing/            # Cost management
│   ├── dashboard/          # Dashboard widgets
│   ├── haccp/              # HACCP compliance
│   ├── inventory/          # Stock management
│   ├── kitchen/            # Kitchen service
│   ├── labels/             # Label generation
│   ├── menu/               # Menu planning
│   ├── notifications/      # Messaging system
│   ├── settings/           # Settings views
│   ├── shifts/             # Staff scheduling
│   ├── shoppinglist/       # Shopping lists
│   ├── stocktake/          # Inventory counts
│   ├── suppliers/          # Supplier management
│   ├── team/               # Team management
│   ├── waste/              # Waste tracking
│   ├── workstations/       # Prep stations
│   ├── ai/                 # AI features (Copilot)
│   └── manual/             # User documentation
├── services/               # API and service layer
│   ├── api.ts              # Supabase abstraction (~1454 lines)
│   ├── supabaseClient.ts   # Supabase initialization
│   └── geminiClient.ts     # Gemini AI client
├── data/                   # Mock data for offline mode
│   └── mockData.ts         # Sample data (~494 lines)
├── hooks/                  # Custom React hooks
│   ├── useLocalStorage.ts  # Persistent state hook
│   ├── useDarkMode.ts      # Dark mode toggle
│   └── useSupabaseRecipes.ts # Recipe sync hook
├── types.ts                # TypeScript definitions (~605 lines)
├── i18n.ts                 # Translation system (~632 lines)
├── App.tsx                 # Root component (~323 lines)
├── KitchenInterface.tsx    # Main app shell (~1145 lines)
├── vite.config.ts          # Vite configuration
└── package.json            # Dependencies

Key Files:
- types.ts: All entity type definitions (40+ types)
- i18n.ts: Complete Greek/English translations
- KitchenInterface.tsx: Central state hub, view routing
- services/api.ts: Database abstraction with mock fallback
```

### Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
State Setter Function (passed via props)
    ↓
KitchenInterface State Update
    ↓
Re-render Affected Components
    ↓
(Optional) API Call to Persist
    ↓
Supabase Database Update
```

### State Management Pattern

ChefStack uses **explicit prop drilling** (no Context API):

**Why?**
- ✅ Explicit dependencies - easy to trace data flow
- ✅ No hidden global state
- ✅ Refactoring safety - TypeScript catches all usage
- ✅ Performance - only affected components re-render
- ❌ Verbose - many props per component

**Example**:
```tsx
// App.tsx fetches all data
const [recipes, setRecipes] = useState<Recipe[]>([]);

// Pass to KitchenInterface
<KitchenInterface 
  recipes={recipes} 
  setRecipes={setRecipes}
  // ... 40+ more props
/>

// KitchenInterface filters and passes to views
<RecipeList
  recipes={teamRecipes}
  onEdit={(recipe) => setRecipes(prev => prev.map(...))}
  onDelete={(id) => setRecipes(prev => prev.filter(...))}
/>
```

### Database Schema

Supabase tables (PostgreSQL):

**Core Tables**:
- `users` - User accounts
- `teams` - Kitchen teams/organizations
- `team_members` - User-team relationships
- `recipes` - Recipe data
- `ingredient_costs` - Cost database
- `inventory_items` - Stock items
- `inventory_locations` - Storage locations
- `inventory_transactions` - Stock movements
- `waste_logs` - Waste entries
- `menus` - Menu definitions
- `haccp_logs` - Temperature/safety logs
- `haccp_items` - Critical control points
- `suppliers` - Supplier profiles
- `workstations` - Prep stations
- `prep_tasks` - Task assignments
- `shifts` - Staff shifts
- `shift_schedules` - Shift planning
- `notifications` - System notifications
- `messages` - Chat messages
- `channels` - Chat channels

**Naming Conventions**:
- Tables: `snake_case` plural
- Columns: `snake_case`
- Foreign keys: `{table}_id`

**Mappers**: Automatic camelCase ↔ snake_case conversion in `api.ts`

---

## 💻 Development

### Development Workflow

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Adding a New Feature View

1. **Define View Type** (`types.ts`):
```tsx
export type View = '...' | 'my_new_feature';
```

2. **Create Component** (`components/myfeature/MyFeatureView.tsx`):
```tsx
interface MyFeatureViewProps {
  data: Entity[];
  setData: React.Dispatch<React.SetStateAction<Entity[]>>;
  currentTeamId: string;
  // ... other required props
}

const MyFeatureView: React.FC<MyFeatureViewProps> = ({
  data, setData, currentTeamId
}) => {
  // Local UI state
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Render view
  return <div>...</div>;
};
```

3. **Route in KitchenInterface** (`KitchenInterface.tsx`):
```tsx
case 'my_new_feature':
  return <MyFeatureView 
    data={data} 
    setData={setData} 
    currentTeamId={currentTeamId}
  />;
```

4. **Add Translation Keys** (`i18n.ts`):
```tsx
el: {
  nav_my_feature: 'Το Feature μου',
  // ...
},
en: {
  nav_my_feature: 'My Feature',
  // ...
}
```

### CRUD Operations Pattern

**Create**:
```tsx
const newEntity = {
  id: `${Date.now()}`,
  ...formData,
  teamId: currentTeamId
};
setData(prev => [...prev, newEntity]);
```

**Update**:
```tsx
setData(prev => prev.map(e => 
  e.id === entity.id ? { ...e, ...changes } : e
));
```

**Delete**:
```tsx
setData(prev => prev.filter(e => e.id !== entityId));
```

### Form Component Pattern

```tsx
interface FormProps {
  toEdit?: Entity | null;
  onSave: (entity: Entity | Omit<Entity, 'id'>) => void;
  onCancel: () => void;
}

const EntityForm: React.FC<FormProps> = ({ toEdit, onSave, onCancel }) => {
  const [entity, setEntity] = useState(toEdit || initialState);
  
  useEffect(() => {
    setEntity(toEdit || initialState);
  }, [toEdit]);
  
  const handleSubmit = () => {
    onSave(entity);
  };
  
  return <form>...</form>;
};
```

### Using AI Features

All AI features use the `withApiKeyCheck` pattern:

```tsx
interface MyViewProps {
  withApiKeyCheck: (action: () => void) => void;
}

const MyView: React.FC<MyViewProps> = ({ withApiKeyCheck }) => {
  const handleAIFeature = () => {
    withApiKeyCheck(async () => {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('Missing API key');
      
      // Call Gemini API
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
      
      // Process response
    });
  };
};
```

### Environment Variables

**Critical**: Use `import.meta.env.VITE_*`, NOT `process.env`

```tsx
// ✅ Correct
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// ❌ Wrong (won't work in Vite)
const apiKey = process.env.VITE_GEMINI_API_KEY;
```

### Bilingual Entity Fields

Always pair `name` (Greek) and `name_en` (English):

```tsx
interface Recipe {
  name: string;      // Greek - required
  name_en: string;   // English - required
}

// Forms: provide both inputs
<input 
  placeholder="Όνομα (Ελληνικά)"
  value={recipe.name}
  onChange={e => setRecipe({...recipe, name: e.target.value})}
/>
<input 
  placeholder="Name (English)"
  value={recipe.name_en}
  onChange={e => setRecipe({...recipe, name_en: e.target.value})}
/>

// Display: choose based on language
{language === 'el' ? recipe.name : recipe.name_en}
```

### Allergen Handling

```tsx
import { ALLERGENS_LIST, ALLERGEN_TRANSLATIONS } from './types';
import { AllergenIcon } from './components/common/AllergenIcon';

// Checkboxes
{ALLERGENS_LIST.map(allergen => (
  <label key={allergen}>
    <input
      type="checkbox"
      checked={selectedAllergens.includes(allergen)}
      onChange={e => {
        if (e.target.checked) {
          setSelectedAllergens([...selectedAllergens, allergen]);
        } else {
          setSelectedAllergens(selectedAllergens.filter(a => a !== allergen));
        }
      }}
    />
    {ALLERGEN_TRANSLATIONS[allergen][language]}
  </label>
))}

// Display icons
{selectedAllergens.map(allergen => (
  <AllergenIcon key={allergen} allergen={allergen} />
))}
```

---

## 📚 API Reference

### Service Layer (`services/api.ts`)

#### Data Fetching

```tsx
// Fetch all data at once
const data = await api.fetchAllData();
// Returns: { users, teams, recipes, inventory, ... }

// Individual entity fetches
const recipes = await api.fetchRecipes(teamId);
const inventory = await api.fetchInventory(teamId);
const menus = await api.fetchMenus(teamId);
```

#### CRUD Operations

```tsx
// Create
const newRecipe = await api.createRecipe(recipeData);

// Update
const updated = await api.updateRecipe(recipeId, changes);

// Delete
await api.deleteRecipe(recipeId);

// Upsert (create or update)
const saved = await api.upsertRecipe(recipe);
```

#### Authentication

```tsx
// Sign up
const user = await api.signUp(email, password, name);

// Sign in
const session = await api.signIn(email, password);

// Sign out
await api.signOut();

// Get current user
const { user, teams } = await api.getCurrentUserAndTeams();
```

#### Special Operations

```tsx
// Inventory transaction
await api.createInventoryTransaction({
  itemId,
  quantity,
  type: 'in' | 'out' | 'transfer',
  locationId,
  // ...
});

// Transfer stock
await api.transferStock(itemId, fromLocationId, toLocationId, quantity);

// Import invoice
const items = await api.extractInvoiceItems(file);
```

### Translation Hook

```tsx
import { useTranslation } from './i18n';

const MyComponent = () => {
  const { t, language } = useTranslation();
  
  return (
    <>
      <h1>{t('nav_recipes')}</h1>
      <p>Current language: {language}</p>
    </>
  );
};
```

### LocalStorage Hook

```tsx
import { useLocalStorage } from './hooks/useLocalStorage';

const MyComponent = () => {
  const [preference, setPreference] = useLocalStorage('myKey', 'defaultValue');
  
  // Works like useState but persists to localStorage
  return <button onClick={() => setPreference('newValue')}>Save</button>;
};
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/ChefStack.git`
3. Create a branch: `git checkout -b feature/my-feature`
4. Make changes
5. Test thoroughly in both mock and Supabase modes
6. Commit: `git commit -m "Add my feature"`
7. Push: `git push origin feature/my-feature`
8. Open a Pull Request

### Code Style

- **TypeScript**: Strict mode enabled
- **Components**: Functional components with TypeScript interfaces
- **Props**: Explicit prop drilling (no Context unless justified)
- **Naming**: camelCase for variables, PascalCase for components
- **Comments**: Greek or English, explain "why" not "what"
- **Formatting**: Prettier (if configured)

### Testing Checklist

Before submitting PR:
- [ ] Works in mock mode (no Supabase)
- [ ] Works with Supabase configured
- [ ] AI features degrade gracefully without API key
- [ ] Both Greek and English translations added
- [ ] Bilingual entity fields implemented (name + name_en)
- [ ] teamId filtering applied where relevant
- [ ] TypeScript compiles without errors
- [ ] No console errors in browser
- [ ] Mobile responsive (if UI changes)
- [ ] Print layouts work (if print feature)
- [ ] Tailwind CSS classes use design system where applicable

### Performance Guidelines

ChefStack uses optimized build system:
- **Tailwind CSS**: PostCSS build system (not CDN) for 95% smaller bundle
- **Design System**: Use `.card-primary`, `.btn-primary` classes instead of inline utilities
- **Code Splitting**: Vite handles automatic code splitting
- **Image Optimization**: Consider lazy loading for recipe images
- **Bundle Size**: Monitor with `npm run build` - main bundle should be ~500KB

### Contribution Ideas

**Features**:
- Advanced reporting/analytics
- Export to Excel/PDF
- Mobile app (React Native)
- Barcode scanning (beyond QR)
- Recipe scaling calculator improvements
- Nutrition calculation
- Photo upload from camera
- Offline-first with sync

**Improvements**:
- Dark mode refinement
- Accessibility (ARIA labels, keyboard nav)
- Performance optimization
- Unit tests
- E2E tests (Playwright/Cypress)
- Storybook for components

**Documentation**:
- Video tutorials
- API documentation
- Deployment guides
- Database migration scripts

---

## 📄 License

**MIT License**

Copyright (c) 2025 ChefStack

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

## 🆘 Support

### Documentation
- **User Manual**: Built into the app (route: `/user_manual`)
- **GitHub Issues**: [Report bugs or request features](https://github.com/jpapad/ChefStack/issues)
- **Discussions**: [Ask questions](https://github.com/jpapad/ChefStack/discussions)

### Common Issues

**Q: App shows "Supabase not configured" warning**
A: This is normal in development. The app works with mock data. To use Supabase, add credentials to `.env.local`.

**Q: AI features not working**
A: Add `VITE_GEMINI_API_KEY` to `.env.local` and restart dev server.

**Q: Changes not persisting**
A: In mock mode, data is in browser localStorage. Clear cache to reset. In production, check Supabase connection.

**Q: Can't switch teams**
A: Ensure user is a member of multiple teams. Check Settings → Team Management.

**Q: Translations missing**
A: Check `i18n.ts` for translation keys. Submit PR to add missing translations.

---

## 🗺️ Roadmap

### Version 2.0 - Advanced Features (COMPLETED ✅)
- [x] PDF export for all data types (14 export functions with jsPDF)
- [x] Advanced filtering system (6 filter types + presets + quick chips)
- [x] Batch operations (bulk edit/delete with floating UI)
- [x] Kitchen Display System (real-time kanban, 4-stage workflow)
- [x] Recipe variations (8 variation types with ingredient modifications)
- [x] Email reports & scheduling (4 report types with cron scheduling)
- [x] Tailwind CSS build system migration (95% bundle size reduction)
- [x] Design system with reusable component classes

### Version 2.1 - UI/UX Polish (IN PROGRESS 🚧)
- [ ] shadcn/ui component integration
- [ ] Micro-interactions & smooth transitions
- [ ] Loading skeletons replacing spinners
- [ ] Toast notifications with animations
- [ ] Typography hierarchy improvements
- [ ] Sophisticated color palette with gradients
- [ ] Enhanced dark mode contrast
- [ ] Floating label inputs
- [ ] Modal backdrop blur effects
- [ ] Card hover effects with depth

### Version 2.2 - Foundation & Quality (PLANNED)
- [ ] Console.log cleanup across codebase
- [ ] Error boundary implementation
- [ ] Accessibility enhancements (ARIA, keyboard navigation, screen readers)
- [ ] Loading state standardization
- [ ] React.memo optimization for performance
- [ ] Virtualization for long lists
- [ ] Image optimization and lazy loading
- [ ] TypeScript strict mode
- [ ] Component splitting for better maintainability
- [ ] Custom hooks for reusable logic

### Version 2.3 - Advanced Features (PLANNED)
- [ ] Offline-first PWA with service worker
- [ ] Real-time collaboration features
- [ ] Analytics dashboard with charts
- [ ] Comprehensive i18n (beyond Greek/English)
- [ ] Mobile PWA optimization
- [ ] Push notifications
- [ ] Camera integration for barcode scanning

### Version 2.4 - Professional Features (PLANNED)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Recipe versioning and changelog
- [ ] Nutrition calculation
- [ ] Allergen cross-contamination warnings
- [ ] Equipment management module
- [ ] Maintenance scheduling
- [ ] Customer feedback integration

### Version 2.5 (Future)
- [ ] Multi-currency support
- [ ] Tax calculation by region
- [ ] Integration with POS systems
- [ ] Online ordering integration
- [ ] Delivery management
- [ ] Customer database (CRM)

### Version 3.0 (Vision)
- [ ] Machine learning for demand forecasting
- [ ] Computer vision for portion recognition
- [ ] Voice commands for hands-free operation
- [ ] IoT integration (smart thermometers, scales)
- [ ] Blockchain for supply chain traceability

---

## 🙏 Acknowledgments

**Built with**:
- [React](https://reactjs.org/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool
- [Supabase](https://supabase.com/) - Backend & database
- [Google Gemini AI](https://ai.google.dev/) - AI features
- [Tailwind CSS](https://tailwindcss.com/) - Styling

**Inspired by**:
- Professional kitchen operations workflows
- HACCP food safety standards
- Restaurant management best practices
- Modern web application architecture

---

## 📞 Contact

**Repository**: [github.com/jpapad/ChefStack](https://github.com/jpapad/ChefStack)
**Issues**: [GitHub Issues](https://github.com/jpapad/ChefStack/issues)
**Discussions**: [GitHub Discussions](https://github.com/jpapad/ChefStack/discussions)

---

<div align="center">

**Made with ❤️ for professional kitchens**

⭐ Star us on GitHub if ChefStack helps your kitchen!

[Get Started](#-quick-start) • [View Features](#-features) • [Read Docs](#-documentation)

</div>
