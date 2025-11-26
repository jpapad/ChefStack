// @ts-nocheck
/**
 * Supabase Edge Function: POS Webhook Receiver
 * 
 * This function receives incoming webhooks from POS systems,
 * validates and transforms the data, then inserts orders into
 * the kitchen_orders table for real-time display in ChefStack KDS.
 * 
 * Supported POS Systems:
 * - Generic JSON (any POS with customizable webhooks)
 * - Square POS
 * - Lightspeed Restaurant
 * - SoftOne (Greece)
 * - Custom adapters can be added
 * 
 * NOTE: This file runs in Deno runtime on Supabase Edge Functions.
 * TypeScript errors here are expected when viewed in VS Code.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ============================================================================
// POS Adapter Interface
// ============================================================================

interface POSAdapter {
  name: string;
  validateWebhook(req: Request, payload: any): Promise<boolean>;
  transformOrder(payload: any): KitchenOrderInsert;
}

interface KitchenOrderInsert {
  team_id: string;
  order_number: string;
  table_number?: string;
  customer_name?: string;
  station?: string;
  items: OrderItem[];
  status: 'new' | 'in-progress' | 'ready' | 'served' | 'cancelled';
  priority: 'low' | 'normal' | 'high';
  source: 'pos' | 'manual' | 'online' | 'tablet';
  external_order_id?: string;
  notes?: string;
  estimated_time?: number;
}

interface OrderItem {
  id: string;
  recipeId?: string;
  recipeName: string;
  quantity: number;
  notes?: string;
  specialRequests?: string;
}

// ============================================================================
// Generic POS Adapter (Default)
// ============================================================================

class GenericPOSAdapter implements POSAdapter {
  name = 'Generic';

  async validateWebhook(req: Request, payload: any): Promise<boolean> {
    // Basic validation - check for required fields
    return !!(
      payload &&
      (payload.orderNumber || payload.order_number) &&
      (payload.items || payload.orderItems)
    );
  }

  transformOrder(payload: any): KitchenOrderInsert {
    // Support both camelCase and snake_case
    const items = (payload.items || payload.orderItems || []).map((item: any, index: number) => ({
      id: item.id || `item-${Date.now()}-${index}`,
      recipeId: item.recipeId || item.recipe_id,
      recipeName: item.name || item.recipeName || item.recipe_name || 'Unknown Item',
      quantity: item.quantity || 1,
      notes: item.notes,
      specialRequests: item.specialRequests || item.special_requests
    }));

    return {
      team_id: payload.teamId || payload.team_id || '', // Must be provided by POS
      order_number: payload.orderNumber || payload.order_number || `ORD-${Date.now()}`,
      table_number: payload.tableNumber || payload.table_number,
      customer_name: payload.customerName || payload.customer_name,
      station: payload.station || this.guessStation(items),
      items,
      status: 'new',
      priority: payload.priority || 'normal',
      source: 'pos',
      external_order_id: payload.externalOrderId || payload.external_order_id || payload.id,
      notes: payload.notes,
      estimated_time: payload.estimatedTime || payload.estimated_time
    };
  }

  private guessStation(items: OrderItem[]): string {
    // Simple heuristics - can be improved
    const allNames = items.map(i => i.recipeName.toLowerCase()).join(' ');
    
    if (allNames.includes('coffee') || allNames.includes('καφέ')) return 'Bar';
    if (allNames.includes('salad') || allNames.includes('σαλάτα')) return 'Cold Kitchen';
    if (allNames.includes('pizza') || allNames.includes('pasta')) return 'Hot Kitchen';
    if (allNames.includes('dessert') || allNames.includes('γλυκό')) return 'Pastry';
    
    return 'Hot Kitchen'; // Default
  }
}

// ============================================================================
// Square POS Adapter
// ============================================================================

class SquarePOSAdapter implements POSAdapter {
  name = 'Square';

  async validateWebhook(req: Request, payload: any): Promise<boolean> {
    // Square sends signature in header
    const signature = req.headers.get('x-square-signature');
    if (!signature) return false;

    // TODO: Verify signature using SQUARE_WEBHOOK_SECRET
    // const webhookSecret = Deno.env.get('SQUARE_WEBHOOK_SECRET');
    // ... signature verification logic ...

    return payload?.type === 'order.created' || payload?.type === 'order.updated';
  }

  transformOrder(payload: any): KitchenOrderInsert {
    const order = payload.data?.object?.order;
    if (!order) throw new Error('Invalid Square webhook: missing order data');

    const items = (order.line_items || []).map((lineItem: any, index: number) => ({
      id: lineItem.uid || `item-${index}`,
      recipeId: lineItem.catalog_object_id,
      recipeName: lineItem.name,
      quantity: parseInt(lineItem.quantity) || 1,
      notes: lineItem.note,
      specialRequests: lineItem.modifiers?.map((m: any) => m.name).join(', ')
    }));

    return {
      team_id: '', // Must be configured via environment or mapping
      order_number: order.reference_id || order.id.slice(0, 8),
      table_number: order.location_id, // Or parse from metadata
      customer_name: order.customer_id,
      station: this.mapCategory(order.line_items?.[0]?.catalog_object_id),
      items,
      status: 'new',
      priority: 'normal',
      source: 'pos',
      external_order_id: order.id,
      notes: order.note
    };
  }

  private mapCategory(catalogId?: string): string {
    // TODO: Map Square catalog categories to ChefStack stations
    return 'Hot Kitchen';
  }
}

// ============================================================================
// Adapter Registry
// ============================================================================

const ADAPTERS: Record<string, POSAdapter> = {
  generic: new GenericPOSAdapter(),
  square: new SquarePOSAdapter()
  // Add more adapters here
};

function getPOSAdapter(req: Request, payload: any): POSAdapter {
  // Check for adapter hint in header
  const adapterHint = req.headers.get('x-pos-adapter');
  if (adapterHint && ADAPTERS[adapterHint.toLowerCase()]) {
    return ADAPTERS[adapterHint.toLowerCase()];
  }

  // Auto-detect based on payload structure
  if (payload?.type?.startsWith('order.') && payload?.data?.object?.order) {
    return ADAPTERS.square;
  }

  // Default to generic
  return ADAPTERS.generic;
}

// ============================================================================
// Main Handler
// ============================================================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-pos-adapter, x-square-signature',
      }
    });
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Parse incoming webhook
    const payload = await req.json();
    console.log('📦 Received webhook:', JSON.stringify(payload, null, 2));

    // Select appropriate adapter
    const adapter = getPOSAdapter(req, payload);
    console.log(`🔌 Using adapter: ${adapter.name}`);

    // Validate webhook
    const isValid = await adapter.validateWebhook(req, payload);
    if (!isValid) {
      console.error('❌ Webhook validation failed');
      return new Response(JSON.stringify({ error: 'Invalid webhook payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Transform to ChefStack format
    const order = adapter.transformOrder(payload);
    console.log('✨ Transformed order:', JSON.stringify(order, null, 2));

    // Validate team_id
    if (!order.team_id) {
      console.error('❌ Missing team_id in order');
      return new Response(JSON.stringify({ 
        error: 'Missing team_id - configure POS to include teamId in webhook payload' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create Supabase client (service role for webhook)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Insert order into database
    const { data, error } = await supabase
      .from('kitchen_orders')
      .insert(order)
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to save order', 
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Order created successfully:', data.id);

    // Return success
    return new Response(JSON.stringify({ 
      success: true, 
      orderId: data.id,
      orderNumber: data.order_number
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
