# POS Integration - Quick Reference Card

**One-page cheat sheet for ChefStack POS Integration**

---

## 🚀 Quick Deploy (5 Minutes)

```bash
# 1. Install CLI
npm install -g supabase

# 2. Login & Link
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# 3. Deploy
cd c:\ChefStack\ChefStack
supabase db push                    # Create kitchen_orders table
supabase functions deploy pos-webhook  # Deploy webhook receiver

# 4. Set Secret
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 5. Enable Realtime (Supabase Dashboard)
# Database → Replication → Enable kitchen_orders

# 6. Get Webhook URL
# https://YOUR_PROJECT.supabase.co/functions/v1/pos-webhook
```

---

## 📡 Webhook Endpoint

**URL:** `https://YOUR_PROJECT.supabase.co/functions/v1/pos-webhook`

**Method:** `POST`

**Headers:**
```
Content-Type: application/json
x-pos-adapter: generic  (optional, auto-detects if omitted)
```

**Payload (Generic):**
```json
{
  "teamId": "uuid-required",           // ⚠️ REQUIRED
  "orderNumber": "ORD-12345",
  "tableNumber": "T5",
  "customerName": "John Doe",          // optional
  "items": [
    {
      "name": "Margherita Pizza",
      "quantity": 2,
      "notes": "Extra cheese"
    }
  ],
  "station": "Hot Kitchen",            // optional, auto-detected
  "priority": "normal",                // low | normal | high
  "source": "pos",                     // optional
  "notes": "VIP customer"              // optional
}
```

**Response (Success):**
```json
{
  "success": true,
  "orderId": "uuid-here",
  "orderNumber": "ORD-12345"
}
```

**Response (Error):**
```json
{
  "error": "Error message",
  "details": "Detailed error info"
}
```

---

## 🧪 Test Commands

### PowerShell
```powershell
$body = @{
    teamId = "YOUR_TEAM_UUID"
    orderNumber = "TEST-001"
    tableNumber = "T1"
    items = @(
        @{ name = "Test Pizza"; quantity = 1 }
    )
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://YOUR_PROJECT.supabase.co/functions/v1/pos-webhook" `
  -Method Post -Body $body -ContentType "application/json"
```

### cURL (Bash)
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/pos-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": "YOUR_TEAM_UUID",
    "orderNumber": "TEST-001",
    "items": [{"name": "Test Pizza", "quantity": 1}]
  }'
```

---

## 🗄️ Database Schema

**Table:** `kitchen_orders`

```sql
-- Key fields
id UUID PRIMARY KEY
team_id UUID NOT NULL
order_number TEXT NOT NULL
table_number TEXT
customer_name TEXT
station TEXT
items JSONB NOT NULL
status TEXT (new | in-progress | ready | served | cancelled)
priority TEXT (low | normal | high)
source TEXT (pos | manual | online | tablet)
external_order_id TEXT
created_at TIMESTAMPTZ
started_at TIMESTAMPTZ
ready_at TIMESTAMPTZ
served_at TIMESTAMPTZ
cancelled_at TIMESTAMPTZ
```

**Indexes:**
- `team_id` (most common query)
- `status` (filter active orders)
- `created_at DESC` (recent orders)
- `external_order_id` (POS lookups)

**Queries:**
```sql
-- Recent orders
SELECT * FROM kitchen_orders 
WHERE team_id = 'YOUR_TEAM_UUID'
ORDER BY created_at DESC 
LIMIT 20;

-- Active orders
SELECT * FROM kitchen_orders 
WHERE team_id = 'YOUR_TEAM_UUID' 
  AND status IN ('new', 'in-progress')
ORDER BY created_at;

-- Orders by source
SELECT source, COUNT(*) 
FROM kitchen_orders 
WHERE team_id = 'YOUR_TEAM_UUID'
GROUP BY source;
```

---

## 🔧 Common Tasks

### Check Edge Function Logs
```bash
supabase functions logs pos-webhook --tail
```

### Check Realtime Status
```sql
-- Check if Realtime enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
  AND tablename = 'kitchen_orders';
```

### Manual Order Insert (Testing)
```sql
INSERT INTO kitchen_orders (team_id, order_number, items, status, priority, source)
VALUES (
  'YOUR_TEAM_UUID',
  'MANUAL-001',
  '[{"id": "1", "recipeName": "Test Pizza", "quantity": 1}]'::jsonb,
  'new',
  'normal',
  'manual'
);
```

### Delete Test Orders
```sql
DELETE FROM kitchen_orders 
WHERE order_number LIKE 'TEST-%';
```

---

## 🎛️ Environment Variables

**ChefStack App (`.env.local`):**
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Supabase Secrets (Edge Function):**
```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key
supabase secrets set SQUARE_WEBHOOK_SECRET=your_square_secret  # Optional
```

**Get Keys from Supabase Dashboard:**
- Settings → API
- Copy `URL` and `anon public` key

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **Webhook returns 400** | Check `teamId` is in payload, verify JSON is valid |
| **Orders not in KDS** | Verify `team_id` matches, check Realtime enabled |
| **"Realtime not connected"** | Check `.env.local`, refresh page, check console |
| **No sound notification** | Click page first (autoplay policy), check permissions |
| **Duplicate orders** | Should NOT happen - check only one subscription active |
| **Edge Function errors** | Check logs: `supabase functions logs pos-webhook` |

---

## 📁 File Locations

```
c:\ChefStack\ChefStack\
├── POS_INTEGRATION.md          # Complete integration guide
├── IMPLEMENTATION_SUMMARY.md   # Implementation overview
├── supabase/
│   ├── README.md              # Supabase directory guide
│   ├── DEPLOYMENT.md          # Deployment step-by-step
│   ├── TESTING.md             # Test scripts
│   ├── functions/
│   │   └── pos-webhook/
│   │       └── index.ts       # Webhook receiver (320 lines)
│   └── migrations/
│       └── 20251115000000_create_kitchen_orders.sql
├── components/
│   └── kds/
│       └── KitchenDisplayView.tsx  # KDS UI (Realtime integrated)
├── services/
│   ├── api.ts                 # API layer (3 new CRUD methods)
│   └── posAdapters.ts         # POS adapters (Generic, Square)
└── types.ts                   # KitchenOrder interface
```

---

## 🔌 Supported POS Systems

| POS | Status | Adapter | Notes |
|-----|--------|---------|-------|
| **Generic** | ✅ Ready | `GenericPOSAdapter` | Works with any JSON webhook |
| **Square** | ✅ Ready | `SquarePOSAdapter` | Needs signature verification |
| **Lightspeed** | 🚧 Coming | - | Adapter template available |
| **SoftOne** | 🚧 Coming | - | Greece market |
| **Toast** | ⏳ Planned | - | Add custom adapter |
| **Clover** | ⏳ Planned | - | Add custom adapter |

**To add new adapter:** Edit `supabase/functions/pos-webhook/index.ts`

---

## 🎯 Verification Checklist

- [ ] Database: `kitchen_orders` table exists
- [ ] Database: Realtime enabled for table
- [ ] Edge Function: `pos-webhook` deployed
- [ ] Edge Function: Secrets configured
- [ ] ChefStack: `.env.local` configured
- [ ] ChefStack: KDS shows "Live" indicator
- [ ] Test: Webhook responds to test call
- [ ] Test: Order appears in KDS
- [ ] Test: Sound plays on new order
- [ ] Test: Multi-screen sync works

---

## 📊 Performance Metrics

**Expected Latency:**
- Webhook processing: < 100ms
- Database insert: < 50ms
- Realtime delivery: < 200ms
- **Total (POS → KDS): < 500ms**

**Free Tier Limits:**
- Database: 500 MB
- Realtime: 200 concurrent connections
- Edge Functions: 500,000 invocations/month

**Production Capacity:**
- 100+ orders/minute
- 50+ concurrent KDS screens
- Sub-second latency

---

## 🆘 Quick Help

**Logs:**
```bash
supabase functions logs pos-webhook      # Edge Function logs
supabase logs db                        # Database logs
```

**Status:**
```bash
supabase status                         # Local Supabase status
supabase functions list                 # Deployed functions
```

**Docs:**
- [POS_INTEGRATION.md](./POS_INTEGRATION.md)
- [supabase/DEPLOYMENT.md](./supabase/DEPLOYMENT.md)
- [supabase/TESTING.md](./supabase/TESTING.md)

**Support:**
- GitHub: [jpapad/ChefStack/issues](https://github.com/jpapad/ChefStack/issues)
- Email: support@chefstack.app

---

**Version:** 1.0.0 | **Last Updated:** November 2025
