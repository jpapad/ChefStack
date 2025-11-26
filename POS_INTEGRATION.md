# POS Integration Guide - ChefStack Kitchen Display System

This guide explains how to integrate your Point of Sale (POS) system with ChefStack's Kitchen Display System (KDS).

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Supported Integration Methods](#supported-integration-methods)
3. [Quick Start](#quick-start)
4. [POS-Specific Guides](#pos-specific-guides)
5. [Webhook Setup](#webhook-setup)
6. [Testing Integration](#testing-integration)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

```
┌──────────────┐
│  POS System  │ (Square, Lightspeed, SoftOne, etc.)
└──────┬───────┘
       │ Webhook/API
       ▼
┌─────────────────────┐
│ Supabase Edge       │ (Serverless middleware)
│ Function (Webhook)  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Supabase Database  │
│  (kitchen_orders)   │
└──────┬──────────────┘
       │ Realtime
       ▼
┌─────────────────────┐
│   ChefStack KDS     │ (Kitchen Display)
│   (React App)       │
└─────────────────────┘
```

**Data Flow:**
1. Customer places order on POS terminal
2. POS sends webhook to Supabase Edge Function
3. Edge Function validates & transforms data using POS Adapter
4. Order saved to Supabase `kitchen_orders` table
5. Supabase Realtime pushes to all connected KDS screens
6. KDS displays new order with sound notification

---

## 🔌 Supported Integration Methods

### Method 1: Webhooks (Recommended ✅)
- **Real-time** order updates
- **Automatic** - no polling needed
- **Efficient** - server pushes data

**Requirements:**
- POS must support outgoing webhooks
- Public HTTPS endpoint (Supabase Edge Function)

### Method 2: Polling API
- KDS **polls** POS API every N seconds
- Works when POS doesn't support webhooks
- Higher latency (30-60 seconds typical)

**Requirements:**
- POS API with authentication
- API endpoints to fetch recent orders

### Method 3: Manual Entry
- Kitchen staff manually inputs orders
- Fallback when no POS integration available
- Built-in to ChefStack

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js
```

### Step 2: Configure Supabase

Create `.env.local` in project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: Create Database Table

Run this SQL in Supabase SQL Editor:

```sql
-- Kitchen Orders Table
CREATE TABLE kitchen_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  table_number TEXT,
  customer_name TEXT,
  station TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL CHECK (status IN ('new', 'in-progress', 'ready', 'served', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  source TEXT DEFAULT 'manual' CHECK (source IN ('pos', 'manual', 'online', 'tablet')),
  external_order_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  served_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  estimated_time INTEGER,
  assigned_to UUID REFERENCES users(id),
  notes TEXT
);

-- Indexes for performance
CREATE INDEX idx_kitchen_orders_team_id ON kitchen_orders(team_id);
CREATE INDEX idx_kitchen_orders_status ON kitchen_orders(status);
CREATE INDEX idx_kitchen_orders_created_at ON kitchen_orders(created_at DESC);
CREATE INDEX idx_kitchen_orders_external_id ON kitchen_orders(external_order_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE kitchen_orders;
```

### Step 4: Enable Realtime in Supabase Dashboard

1. Go to **Database** → **Replication**
2. Enable `kitchen_orders` table for Realtime
3. Save changes

### Step 5: Test with Manual Order

Open ChefStack KDS view and click "**Νέα Παραγγελία**" (New Order). If you see the order appear with Live indicator, Realtime is working! ✅

---

## 📱 POS-Specific Guides

### Generic JSON Webhook (Works with most POS)

If your POS can send JSON webhooks with this structure:

```json
{
  "orderNumber": "ORD-12345",
  "tableNumber": "T5",
  "customerName": "John Doe",
  "items": [
    {
      "id": "recipe-1",
      "name": "Margherita Pizza",
      "quantity": 2,
      "notes": "Extra cheese"
    },
    {
      "id": "recipe-2",
      "name": "Caesar Salad",
      "quantity": 1
    }
  ],
  "station": "Hot Kitchen",
  "priority": "normal",
  "source": "pos",
  "notes": "Table 5 - Anniversary"
}
```

You're ready to use the **Generic Adapter** (already included).

---

### Square POS Integration

**Step 1:** Get API Credentials
- Go to [Square Developer Dashboard](https://developer.squareup.com/)
- Create application
- Copy **Application ID** and **Access Token**

**Step 2:** Create Square Webhook Subscription
```bash
curl https://connect.squareup.com/v2/webhooks/subscriptions \
  -X POST \
  -H 'Square-Version: 2023-10-18' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "subscription": {
      "name": "ChefStack KDS Orders",
      "event_types": ["order.created", "order.updated"],
      "notification_url": "https://your-project.supabase.co/functions/v1/pos-webhook"
    }
  }'
```

**Step 3:** Uncomment Square Adapter in `services/posAdapters.ts`

**Step 4:** Configure mapping (Square categories → ChefStack stations)

---

### Lightspeed Restaurant POS

Coming soon...

---

### SoftOne (Greece)

Coming soon...

---

## 🪝 Webhook Setup

### Create Supabase Edge Function

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Create function
supabase functions new pos-webhook
```

**File: `supabase/functions/pos-webhook/index.ts`**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Import your POS adapter logic here
// For now, we'll use generic adapter

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    // Parse incoming webhook
    const payload = await req.json()
    console.log('Received webhook:', payload)

    // Validate (basic)
    if (!payload.orderNumber && !payload.order_number) {
      return new Response(JSON.stringify({ error: 'Missing orderNumber' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Transform to ChefStack format (Generic Adapter)
    const order = {
      team_id: payload.teamId || payload.team_id, // You need to pass this or map it
      order_number: payload.orderNumber || payload.order_number || `ORD-${Date.now()}`,
      table_number: payload.tableNumber || payload.table_number,
      customer_name: payload.customerName || payload.customer_name,
      station: payload.station,
      items: payload.items || [],
      status: 'new',
      priority: payload.priority || 'normal',
      source: payload.source || 'pos',
      external_order_id: payload.externalOrderId || payload.id,
      notes: payload.notes
    }

    // Save to Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await supabase
      .from('kitchen_orders')
      .insert(order)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('Order created:', data)

    return new Response(JSON.stringify({ success: true, order: data }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

**Deploy:**

```bash
supabase functions deploy pos-webhook
```

**Your webhook URL:**
```
https://your-project.supabase.co/functions/v1/pos-webhook
```

---

## 🧪 Testing Integration

### Test with cURL

```bash
curl -X POST https://your-project.supabase.co/functions/v1/pos-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": "your-team-uuid",
    "orderNumber": "TEST-001",
    "tableNumber": "T1",
    "items": [
      {
        "id": "recipe-uuid",
        "name": "Test Pizza",
        "quantity": 1
      }
    ],
    "priority": "high"
  }'
```

### Test with Postman

1. Create POST request to webhook URL
2. Add JSON body (example above)
3. Send request
4. Check ChefStack KDS - order should appear with notification sound! 🔔

---

## 🐛 Troubleshooting

### Issue: "Realtime not connected"

**Solution:**
1. Check `.env.local` has correct Supabase URL and key
2. Verify Realtime is enabled in Supabase Dashboard
3. Check browser console for connection errors

### Issue: "Webhook returns 400"

**Solution:**
- Check payload structure matches expected format
- Ensure `teamId` is included
- Verify JSON is valid

### Issue: "Orders not appearing in KDS"

**Solution:**
1. Check `kitchen_orders` table in Supabase - is order there?
2. Check `team_id` matches your current team
3. Verify Realtime subscription is active (see browser console)

### Issue: "No sound notification"

**Solution:**
- Browser may block autoplay - user interaction required first
- Check browser console for audio errors
- Test: Click anywhere on page, then trigger order

---

## 📞 Support

For integration help:
- Check [ChefStack Documentation](/)
- Open GitHub issue
- Contact: support@chefstack.app

---

## 🎯 Next Steps

1. ✅ Setup Supabase & Realtime
2. ✅ Test with manual orders
3. 🔧 Deploy webhook Edge Function
4. 🔌 Configure your POS to send webhooks
5. 🧪 Test end-to-end flow
6. 🚀 Go live!

**Pro Tips:**
- Start with **test mode** in POS
- Use **ngrok** for local testing
- Monitor Supabase logs for errors
- Add **signature verification** for production

---

**Last Updated:** November 2025
**Version:** 1.0.0
