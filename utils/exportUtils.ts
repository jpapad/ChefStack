import { Recipe, Menu, InventoryItem, IngredientCost, WasteLog, Supplier, PurchaseUnit } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export utilities for converting data to downloadable formats
 */

// Helper: Convert data to CSV
export function arrayToCSV(data: any[], headers: string[]): string {
  const rows = [headers.join(',')];
  
  data.forEach(item => {
    const row = headers.map(header => {
      const value = item[header];
      // Handle nested objects, arrays, and special characters
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""');
      if (typeof value === 'string' && value.includes(',')) return `"${value.replace(/"/g, '""')}"`;
      return value;
    });
    rows.push(row.join(','));
  });
  
  return rows.join('\n');
}

// Helper: Trigger download
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export Recipes to CSV
export function exportRecipesToCSV(recipes: Recipe[]): void {
  const headers = ['id', 'name', 'name_en', 'category', 'servings', 'prepTime', 'cookTime', 'teamId'];
  const csv = arrayToCSV(recipes, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `recipes_${timestamp}.csv`, 'text/csv');
}

// Export Recipes with full details (including ingredients) to CSV
export function exportRecipesDetailedToCSV(recipes: Recipe[]): void {
  const detailedData = recipes.map(r => ({
    id: r.id,
    name: r.name,
    name_en: r.name_en,
    category: r.category,
    servings: r.servings,
    prepTime: r.prepTime,
    cookTime: r.cookTime,
    description: r.description || '',
    ingredients: r.ingredients?.map(i => `${i.name} (${i.quantity}${i.unit})`).join('; ') || '',
    allergens: r.allergens?.join(', ') || '',
    steps: r.steps?.map(s => s.content).join(' | ') || '',
    teamId: r.teamId,
  }));
  
  const headers = ['id', 'name', 'name_en', 'category', 'servings', 'prepTime', 'cookTime', 'description', 'ingredients', 'allergens', 'steps', 'teamId'];
  const csv = arrayToCSV(detailedData, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `recipes_detailed_${timestamp}.csv`, 'text/csv');
}

// Export Inventory to CSV
export function exportInventoryToCSV(inventory: InventoryItem[]): void {
  const data = inventory.map(item => ({
    id: item.id,
    name: item.name,
    totalQuantity: item.locations.reduce((sum, loc) => sum + loc.quantity, 0),
    unit: item.unit,
    reorderPoint: item.reorderPoint,
    supplierId: item.supplierId || '',
    locations: item.locations.map(l => `${l.locationId}: ${l.quantity}`).join('; '),
    teamId: item.teamId,
  }));
  
  const headers = ['id', 'name', 'totalQuantity', 'unit', 'reorderPoint', 'supplierId', 'locations', 'teamId'];
  const csv = arrayToCSV(data, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `inventory_${timestamp}.csv`, 'text/csv');
}

// Export Ingredient Costs to CSV
export function exportIngredientCostsToCSV(costs: IngredientCost[]): void {
  const headers = ['id', 'name', 'cost', 'purchaseUnit', 'teamId'];
  const csv = arrayToCSV(costs, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `ingredient_costs_${timestamp}.csv`, 'text/csv');
}

// Export Waste Logs to CSV
export function exportWasteLogsToCSV(wasteLogs: WasteLog[]): void {
  const data = wasteLogs.map(log => ({
    id: log.id,
    inventoryItemId: log.inventoryItemId,
    quantity: log.quantity,
    unit: log.unit,
    reason: log.reason,
    timestamp: log.timestamp,
    notes: log.notes || '',
    teamId: log.teamId,
  }));
  
  const headers = ['id', 'inventoryItemId', 'quantity', 'unit', 'reason', 'timestamp', 'notes', 'teamId'];
  const csv = arrayToCSV(data, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `waste_logs_${timestamp}.csv`, 'text/csv');
}

// Export Suppliers to CSV
export function exportSuppliersToCSV(suppliers: Supplier[]): void {
  const data = suppliers.map(s => ({
    id: s.id,
    name: s.name,
    contactPerson: s.contactPerson || '',
    phone: s.phone || '',
    email: s.email || '',
    teamId: s.teamId,
  }));
  
  const headers = ['id', 'name', 'contactPerson', 'phone', 'email', 'teamId'];
  const csv = arrayToCSV(data, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `suppliers_${timestamp}.csv`, 'text/csv');
}

// Export Menus to CSV
export function exportMenusToCSV(menus: Menu[]): void {
  const data = menus.map(m => ({
    id: m.id,
    name: m.name,
    description: m.description,
    type: m.type,
    recipeIds: m.type === 'a_la_carte' ? (m.recipeIds || []).join('; ') : '',
    startDate: m.type === 'buffet' ? m.startDate || '' : '',
    endDate: m.type === 'buffet' ? m.endDate || '' : '',
    pax: m.type === 'buffet' ? m.pax : '',
    teamId: m.teamId,
  }));
  
  const headers = ['id', 'name', 'description', 'type', 'recipeIds', 'startDate', 'endDate', 'pax', 'teamId'];
  const csv = arrayToCSV(data, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `menus_${timestamp}.csv`, 'text/csv');
}

// Parse CSV to array of objects
export function parseCSV(csvText: string): any[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const data: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const obj: any = {};
    
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    
    data.push(obj);
  }
  
  return data;
}

// Import Recipes from CSV
export async function importRecipesFromCSV(file: File): Promise<Partial<Recipe>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        
        const recipes: Partial<Recipe>[] = data.map(row => ({
          name: row.name || '',
          name_en: row.name_en || row.name || '',
          category: row.category || 'Κυρίως Πιάτα',
          servings: parseInt(row.servings) || 4,
          prepTime: parseInt(row.prepTime) || 0,
          cookTime: parseInt(row.cookTime) || 0,
          totalTime: parseInt(row.totalTime) || 0,
          // Parse ingredients if provided as "name (quantity unit); ..."
          ingredients: row.ingredients ? row.ingredients.split(';').map((ing: string) => {
            const match = ing.trim().match(/(.+?)\s*\((.+?)(.*?)\)/);
            if (match) {
              return {
                name: match[1].trim(),
                quantity: parseFloat(match[2].trim()) || 0,
                unit: match[3].trim() || 'g',
              };
            }
            return { name: ing.trim(), quantity: 0, unit: 'g' };
          }) : [],
          allergens: row.allergens ? row.allergens.split(',').map((a: string) => a.trim()) : [],
          instructions: row.instructions || '',
        }));
        
        resolve(recipes);
      } catch (error) {
        reject(new Error('Σφάλμα κατά την ανάγνωση του αρχείου CSV'));
      }
    };
    
    reader.onerror = () => reject(new Error('Σφάλμα κατά την ανάγνωση του αρχείου'));
    reader.readAsText(file);
  });
}

// Import Inventory from CSV
export async function importInventoryFromCSV(file: File): Promise<Partial<InventoryItem>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        
        const items: Partial<InventoryItem>[] = data.map(row => ({
          name: row.name || '',
          locations: [
            {
              locationId: row.locationId || 'Κεντρική Αποθήκη',
              quantity: parseFloat(row.quantity) || 0,
            }
          ],
          unit: (row.unit as PurchaseUnit) || 'kg',
          reorderPoint: parseFloat(row.reorderPoint) || 0,
          supplierId: row.supplierId || '',
        }));
        
        resolve(items);
      } catch (error) {
        reject(new Error('Σφάλμα κατά την ανάγνωση του αρχείου CSV'));
      }
    };
    
    reader.onerror = () => reject(new Error('Σφάλμα κατά την ανάγνωση του αρχείου'));
    reader.readAsText(file);
  });
}

// ============================
// PDF Export Functions
// ============================

// Helper: Create PDF with table
function createPDFWithTable(
  title: string,
  headers: string[],
  rows: any[][],
  filename: string
): void {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 20);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Ημερομηνία: ${new Date().toLocaleDateString('el-GR')}`, 14, 28);
  
  // Add table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 35,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });
  
  // Save
  doc.save(filename);
}

// Export Recipes to PDF
export function exportRecipesToPDF(recipes: Recipe[]): void {
  const headers = ['Όνομα', 'Κατηγορία', 'Μερίδες', 'Χρόνος Προετ.', 'Χρόνος Μαγ.'];
  const rows = recipes.map(r => [
    r.name,
    r.category,
    r.servings.toString(),
    `${r.prepTime} λεπτά`,
    `${r.cookTime} λεπτά`,
  ]);
  
  const timestamp = new Date().toISOString().split('T')[0];
  createPDFWithTable('Λίστα Συνταγών', headers, rows, `recipes_${timestamp}.pdf`);
}

// Export Recipes Detailed to PDF
export function exportRecipesDetailedToPDF(recipes: Recipe[]): void {
  const doc = new jsPDF();
  let yPos = 20;
  
  doc.setFontSize(18);
  doc.text('Αναλυτικές Συνταγές', 14, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.text(`Ημερομηνία: ${new Date().toLocaleDateString('el-GR')}`, 14, yPos);
  yPos += 10;
  
  recipes.forEach((recipe, index) => {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Recipe header
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`${index + 1}. ${recipe.name}`, 14, yPos);
    yPos += 8;
    
    // Details
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Κατηγορία: ${recipe.category} | Μερίδες: ${recipe.servings}`, 14, yPos);
    yPos += 6;
    doc.text(`Χρόνος: ${recipe.prepTime + recipe.cookTime} λεπτά`, 14, yPos);
    yPos += 8;
    
    // Ingredients
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      doc.setFont(undefined, 'bold');
      doc.text('Υλικά:', 14, yPos);
      yPos += 5;
      doc.setFont(undefined, 'normal');
      
      recipe.ingredients.forEach(ing => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${ing.name}: ${ing.quantity} ${ing.unit}`, 20, yPos);
        yPos += 5;
      });
      yPos += 3;
    }
    
    // Allergens
    if (recipe.allergens && recipe.allergens.length > 0) {
      if (yPos > 265) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFont(undefined, 'bold');
      doc.text('Αλλεργιογόνα:', 14, yPos);
      yPos += 5;
      doc.setFont(undefined, 'normal');
      doc.text(recipe.allergens.join(', '), 20, yPos);
      yPos += 8;
    }
    
    yPos += 5; // Space between recipes
  });
  
  const timestamp = new Date().toISOString().split('T')[0];
  doc.save(`recipes_detailed_${timestamp}.pdf`);
}

// Export Inventory to PDF
export function exportInventoryToPDF(inventory: InventoryItem[]): void {
  const headers = ['Όνομα', 'Σύνολο', 'Μονάδα', 'Reorder Point', 'Θέσεις'];
  const rows = inventory.map(item => [
    item.name,
    item.locations.reduce((sum, loc) => sum + loc.quantity, 0).toFixed(2),
    item.unit,
    item.reorderPoint.toFixed(2),
    item.locations.length.toString(),
  ]);
  
  const timestamp = new Date().toISOString().split('T')[0];
  createPDFWithTable('Απόθεμα Κουζίνας', headers, rows, `inventory_${timestamp}.pdf`);
}

// Export Ingredient Costs to PDF
export function exportIngredientCostsToPDF(costs: IngredientCost[]): void {
  const headers = ['Υλικό', 'Κόστος', 'Μονάδα'];
  const rows = costs.map(c => [
    c.name,
    `€${c.cost.toFixed(2)}`,
    c.purchaseUnit,
  ]);
  
  const timestamp = new Date().toISOString().split('T')[0];
  createPDFWithTable('Κόστη Υλικών', headers, rows, `ingredient_costs_${timestamp}.pdf`);
}

// Export Waste Logs to PDF
export function exportWasteLogsToPDF(wasteLogs: WasteLog[]): void {
  const headers = ['Ημερομηνία', 'Είδος', 'Ποσότητα', 'Μονάδα', 'Αιτία'];
  const rows = wasteLogs.map(log => [
    new Date(log.timestamp).toLocaleDateString('el-GR'),
    log.inventoryItemId,
    log.quantity.toFixed(2),
    log.unit,
    log.reason,
  ]);
  
  const timestamp = new Date().toISOString().split('T')[0];
  createPDFWithTable('Αρχείο Φθορών', headers, rows, `waste_logs_${timestamp}.pdf`);
}

// Export Suppliers to PDF
export function exportSuppliersToPDF(suppliers: Supplier[]): void {
  const headers = ['Όνομα', 'Υπεύθυνος', 'Τηλέφωνο', 'Email'];
  const rows = suppliers.map(s => [
    s.name,
    s.contactPerson || '-',
    s.phone || '-',
    s.email || '-',
  ]);
  
  const timestamp = new Date().toISOString().split('T')[0];
  createPDFWithTable('Προμηθευτές', headers, rows, `suppliers_${timestamp}.pdf`);
}

// Export Menus to PDF
export function exportMenusToPDF(menus: Menu[]): void {
  const headers = ['Όνομα', 'Τύπος', 'Περιγραφή'];
  const rows = menus.map(m => [
    m.name,
    m.type === 'a_la_carte' ? 'À la carte' : 'Buffet',
    m.description || '-',
  ]);
  
  const timestamp = new Date().toISOString().split('T')[0];
  createPDFWithTable('Μενού', headers, rows, `menus_${timestamp}.pdf`);
}
