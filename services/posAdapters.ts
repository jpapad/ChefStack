import { KitchenOrder, OrderItem } from '../types';

/**
 * Generic POS Adapter Interface
 * Implement this interface for each POS system you want to integrate
 */
export interface POSAdapter {
  /** Name of the POS system */
  name: string;
  
  /** Version of the adapter */
  version: string;
  
  /**
   * Transform raw POS data to ChefStack KitchenOrder format
   * @param rawData - Raw data from POS webhook/API
   * @returns Transformed KitchenOrder object
   */
  transformOrder(rawData: any): Omit<KitchenOrder, 'id' | 'teamId' | 'createdAt'>;
  
  /**
   * Validate incoming webhook data
   * @param data - Webhook payload
   * @param signature - Optional webhook signature for verification
   * @returns true if valid, false otherwise
   */
  validateWebhook(data: any, signature?: string): boolean;
  
  /**
   * Extract order items from POS data
   * @param rawData - Raw POS order data
   * @returns Array of order items
   */
  extractOrderItems(rawData: any): OrderItem[];
  
  /**
   * Get station/workstation from POS data (e.g., "Hot Kitchen", "Cold Station")
   * @param rawData - Raw POS order data
   * @returns Station name or undefined
   */
  getStation(rawData: any): string | undefined;
  
  /**
   * Determine order priority from POS data
   * @param rawData - Raw POS order data
   * @returns Priority level
   */
  getPriority(rawData: any): 'low' | 'normal' | 'high';
}

/**
 * Generic POS Adapter - Fallback for unknown/unsupported POS systems
 * Expects JSON with common fields: orderNumber, tableNumber, items, etc.
 */
export class GenericPOSAdapter implements POSAdapter {
  name = 'Generic POS';
  version = '1.0.0';

  transformOrder(rawData: any): Omit<KitchenOrder, 'id' | 'teamId' | 'createdAt'> {
    return {
      orderNumber: rawData.orderNumber || rawData.order_number || `ORD-${Date.now()}`,
      tableNumber: rawData.tableNumber || rawData.table_number || rawData.table,
      customerName: rawData.customerName || rawData.customer_name || rawData.customer,
      items: this.extractOrderItems(rawData),
      station: this.getStation(rawData),
      priority: this.getPriority(rawData),
      status: 'new',
      source: rawData.source || 'pos',
      externalOrderId: rawData.externalOrderId || rawData.external_order_id || rawData.id,
      notes: rawData.notes || rawData.special_instructions,
    };
  }

  validateWebhook(data: any, signature?: string): boolean {
    // Basic validation - check if required fields exist
    if (!data) return false;
    
    // At minimum, we need some order identifier
    const hasOrderId = !!(data.orderNumber || data.order_number || data.id);
    
    // Optional: Verify signature if provided
    if (signature && data.signature) {
      // Implement signature verification based on your POS system
      // Example: HMAC-SHA256 comparison
      return data.signature === signature;
    }
    
    return hasOrderId;
  }

  extractOrderItems(rawData: any): OrderItem[] {
    const items = rawData.items || rawData.orderItems || rawData.products || [];
    
    return items.map((item: any, index: number) => ({
      id: item.id || `item-${Date.now()}-${index}`,
      recipeId: item.recipeId || item.recipe_id || item.productId || item.product_id || item.id || '',
      recipeName: item.recipeName || item.recipe_name || item.productName || item.product_name || item.name || 'Unknown Item',
      quantity: item.quantity || item.qty || 1,
      notes: item.notes || item.special_instructions || item.modifiers,
      specialRequests: item.specialRequests || item.special_requests || (item.modifiers ? [item.modifiers] : undefined),
    }));
  }

  getStation(rawData: any): string | undefined {
    return rawData.station || rawData.workstation || rawData.department;
  }

  getPriority(rawData: any): 'low' | 'normal' | 'high' {
    const priority = rawData.priority?.toLowerCase();
    
    if (priority === 'urgent' || priority === 'high') return 'high';
    if (priority === 'low') return 'low';
    
    // Auto-detect high priority based on order characteristics
    if (rawData.isVIP || rawData.is_vip) return 'high';
    if (rawData.expressDelivery || rawData.express_delivery) return 'high';
    
    return 'normal';
  }
}

/**
 * Example: Square POS Adapter
 * Uncomment and customize when you connect to Square
 */
/*
export class SquarePOSAdapter implements POSAdapter {
  name = 'Square POS';
  version = '1.0.0';

  transformOrder(rawData: any): Omit<KitchenOrder, 'id' | 'teamId' | 'createdAt'> {
    // Square-specific transformation
    return {
      orderNumber: rawData.order.id,
      tableNumber: rawData.order.location_id,
      customerName: rawData.order.customer?.given_name + ' ' + rawData.order.customer?.family_name,
      items: this.extractOrderItems(rawData),
      station: this.getStation(rawData),
      priority: this.getPriority(rawData),
      status: 'new',
      source: 'pos',
      externalOrderId: rawData.order.id,
      notes: rawData.order.note,
    };
  }

  validateWebhook(data: any, signature?: string): boolean {
    // Square webhook validation logic
    // Verify X-Square-Signature header
    return true;
  }

  extractOrderItems(rawData: any): Array<{ recipeId: string; quantity: number; notes?: string }> {
    return rawData.order.line_items.map((item: any) => ({
      recipeId: item.catalog_object_id,
      quantity: parseInt(item.quantity, 10),
      notes: item.note,
    }));
  }

  getStation(rawData: any): string | undefined {
    // Map Square categories to stations
    const category = rawData.order.line_items[0]?.catalog_object?.item_data?.category_id;
    // Implement your category → station mapping
    return undefined;
  }

  getPriority(rawData: any): 'low' | 'normal' | 'high' {
    return rawData.order.metadata?.priority || 'normal';
  }
}
*/

/**
 * POS Adapter Registry
 * Add your adapters here
 */
export const POS_ADAPTERS = {
  generic: new GenericPOSAdapter(),
  // square: new SquarePOSAdapter(),
  // lightspeed: new LightspeedPOSAdapter(),
  // softone: new SoftOnePOSAdapter(),
};

/**
 * Get adapter by name
 */
export function getPOSAdapter(name: string): POSAdapter {
  const adapter = (POS_ADAPTERS as any)[name.toLowerCase()];
  if (!adapter) {
    console.warn(`POS adapter "${name}" not found, using generic adapter`);
    return POS_ADAPTERS.generic;
  }
  return adapter;
}
