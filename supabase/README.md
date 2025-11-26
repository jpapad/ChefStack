# Supabase Configuration for ChefStack

This directory contains all Supabase-related configuration for the ChefStack POS integration system.

## 📁 Directory Structure

```
supabase/
├── functions/              # Edge Functions (serverless)
│   └── pos-webhook/       # Webhook receiver for POS systems
│       └── index.ts       # Main webhook handler
├── migrations/            # Database migrations
│   └── 20251115000000_create_kitchen_orders.sql
├── DEPLOYMENT.md          # Step-by-step deployment guide
├── TESTING.md            # Testing scripts and procedures
└── README.md             # This file
```

## 🚀 Quick Start

### For First-Time Setup

1. **Install Supabase CLI:**
   ```powershell
   npm install -g supabase
   ```

2. **Login:**
   ```bash
   supabase login
   ```

3. **Link your project:**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. **Apply database migration:**
   ```bash
   supabase db push
   ```

5. **Deploy Edge Function:**
   ```bash
   supabase functions deploy pos-webhook
   ```

6. **See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete guide**

### For Development

**Run Edge Function locally:**
```bash
supabase functions serve pos-webhook
```

**Test locally:**
```bash
curl -X POST http://localhost:54321/functions/v1/pos-webhook \
  -H "Content-Type: application/json" \
  -d '{"teamId": "test", "orderNumber": "001", "items": []}'
```

## 📦 What's Included

### Edge Function: `pos-webhook`

**Purpose:** Receives webhooks from POS systems and creates orders in ChefStack

**Features:**
- Generic adapter for any POS system
- Square POS adapter (ready to uncomment)
- Webhook validation
- Automatic order transformation
- Error handling and logging

**Endpoint:** `https://YOUR_PROJECT.supabase.co/functions/v1/pos-webhook`

**Supported POS Systems:**
- ✅ Generic JSON webhooks
- ✅ Square POS (requires configuration)
- 🚧 Lightspeed (coming soon)
- 🚧 SoftOne (coming soon)

### Database Migration: `kitchen_orders` table

**Purpose:** Stores all kitchen orders from any source (POS, manual, online)

**Features:**
- Multi-tenant (team_id filtering)
- Row Level Security (RLS)
- Realtime enabled
- Auto-timestamps on status changes
- JSONB items for flexibility

**Fields:**
- Order identification (order_number, table_number, customer_name)
- Kitchen workflow (station, status, priority, assigned_to)
- Integration (source, external_order_id)
- Timing (created_at, started_at, ready_at, served_at, cancelled_at)

## 🔧 Configuration

### Environment Variables

**Required for Edge Function:**
```bash
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Optional:**
```bash
SQUARE_WEBHOOK_SECRET=your_square_secret  # For Square POS
```

**Set secrets:**
```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key
```

### Required in ChefStack App (.env.local)

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 🧪 Testing

See [TESTING.md](./TESTING.md) for comprehensive testing scripts including:
- Generic webhook tests
- POS-specific tests (Square, etc.)
- Load testing
- Error handling tests
- Realtime verification
- Multi-screen sync tests

**Quick test:**
```powershell
$body = @{
    teamId = "YOUR_TEAM_ID"
    orderNumber = "TEST-001"
    items = @(@{ name = "Pizza"; quantity = 1 })
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://YOUR_PROJECT.supabase.co/functions/v1/pos-webhook" `
  -Method Post -Body $body -ContentType "application/json"
```

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[TESTING.md](./TESTING.md)** - Testing scripts and procedures
- **[../POS_INTEGRATION.md](../POS_INTEGRATION.md)** - Integration guide for different POS systems

## 🏗️ Architecture

```
┌─────────────┐
│ POS System  │ (Square, Lightspeed, etc.)
└──────┬──────┘
       │ Webhook (JSON)
       ▼
┌─────────────────────────┐
│ Edge Function           │ (pos-webhook)
│ - Validates webhook     │
│ - Transforms data       │
│ - Inserts to DB         │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Supabase Database       │
│ kitchen_orders table    │
└──────┬──────────────────┘
       │ Realtime (WebSocket)
       ▼
┌─────────────────────────┐
│ ChefStack KDS           │ (React App)
│ - Real-time updates     │
│ - Sound notifications   │
│ - Multi-screen sync     │
└─────────────────────────┘
```

## 🔐 Security

**Row Level Security (RLS):**
- Users can only see orders from their team
- Team isolation enforced at database level
- Service role bypasses RLS for webhooks

**Webhook Security:**
- Consider adding API key validation
- Verify signatures for specific POS (Square, etc.)
- Rate limiting recommended for production

**Environment:**
- Service role key kept in Supabase secrets (never committed)
- Anon key safe to expose (RLS protects data)

## 📊 Monitoring

### View Edge Function Logs

```bash
supabase functions logs pos-webhook --tail
```

Or in Supabase Dashboard:
- **Edge Functions** → `pos-webhook` → **Logs**

### Check Database

```sql
-- Recent orders
SELECT * FROM kitchen_orders 
ORDER BY created_at DESC 
LIMIT 10;

-- Orders by source
SELECT source, COUNT(*) 
FROM kitchen_orders 
GROUP BY source;
```

### Monitor in ChefStack

- Dashboard view shows order statistics
- KDS view shows real-time orders
- Green "Live" indicator confirms Realtime connection

## 🛠️ Development

### Local Development

1. **Start Supabase locally:**
   ```bash
   supabase start
   ```

2. **Run Edge Function:**
   ```bash
   supabase functions serve pos-webhook
   ```

3. **Test locally:**
   ```bash
   curl http://localhost:54321/functions/v1/pos-webhook -d '...'
   ```

### Adding New POS Adapter

1. **Edit** `functions/pos-webhook/index.ts`
2. **Create adapter class** implementing `POSAdapter` interface
3. **Add to registry:**
   ```typescript
   const ADAPTERS = {
     generic: new GenericPOSAdapter(),
     square: new SquarePOSAdapter(),
     mypos: new MyPOSAdapter()  // Your adapter
   };
   ```
4. **Deploy:**
   ```bash
   supabase functions deploy pos-webhook
   ```

### Updating Migration

**Create new migration:**
```bash
supabase migration new your_migration_name
```

**Apply migrations:**
```bash
supabase db push
```

## 🚨 Troubleshooting

### Edge Function Issues

**Problem:** Function returns 500 error

**Solution:**
1. Check logs: `supabase functions logs pos-webhook`
2. Verify environment secrets are set
3. Test payload structure
4. Review function code for errors

### Database Issues

**Problem:** Orders not saving

**Solution:**
1. Check RLS policies allow service role
2. Verify table exists
3. Check field types match payload
4. Review database logs

### Realtime Issues

**Problem:** Orders not appearing in KDS

**Solution:**
1. Verify Realtime enabled for `kitchen_orders`
2. Check publication includes table
3. Verify team_id filtering
4. Check browser console for connection errors

## 📞 Support

- **Documentation:** See [DEPLOYMENT.md](./DEPLOYMENT.md) and [TESTING.md](./TESTING.md)
- **Supabase Docs:** https://supabase.com/docs
- **ChefStack Issues:** https://github.com/jpapad/ChefStack/issues
- **Email:** support@chefstack.app

## 🎯 Next Steps

1. ✅ Review [DEPLOYMENT.md](./DEPLOYMENT.md)
2. ✅ Test with sample data ([TESTING.md](./TESTING.md))
3. 🔧 Configure your POS system
4. 🚀 Deploy to production
5. 📊 Monitor and iterate

---

**Last Updated:** November 2025
**Version:** 1.0.0
**Maintainer:** ChefStack Team
