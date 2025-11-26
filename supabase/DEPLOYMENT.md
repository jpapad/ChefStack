# POS Integration Deployment Guide

Step-by-step guide to deploy the complete POS integration system for ChefStack KDS.

## 📋 Prerequisites

- [x] Supabase account (free tier works)
- [x] Node.js 16+ installed
- [x] ChefStack project cloned
- [x] Basic terminal/command line knowledge

## 🚀 Deployment Steps

### Step 1: Install Supabase CLI

**Windows (PowerShell):**
```powershell
scoop install supabase
# or
npm install -g supabase
```

**Mac/Linux:**
```bash
npm install -g supabase
```

Verify installation:
```bash
supabase --version
```

---

### Step 2: Login to Supabase

```bash
supabase login
```

This opens a browser window to authenticate. Follow the prompts.

---

### Step 3: Link Project

```bash
cd c:\ChefStack\ChefStack
supabase link --project-ref YOUR_PROJECT_REF
```

**Find your project ref:**
- Go to Supabase Dashboard
- Click on your project
- Look at URL: `https://app.supabase.com/project/YOUR_PROJECT_REF`

---

### Step 4: Apply Database Migration

**Option A: Via Supabase CLI**

```bash
supabase db push
```

This applies the migration in `supabase/migrations/20251115000000_create_kitchen_orders.sql`

**Option B: Via Supabase Dashboard**

1. Go to **SQL Editor** in Supabase Dashboard
2. Open `supabase/migrations/20251115000000_create_kitchen_orders.sql`
3. Copy entire file
4. Paste into SQL Editor
5. Click **Run**

**Verify migration:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'kitchen_orders';
```

Should return one row.

---

### Step 5: Enable Realtime

1. Go to **Database** → **Replication** in Supabase Dashboard
2. Find `kitchen_orders` table
3. Toggle **Enable Realtime** to ON
4. Click **Save**

**Verify Realtime:**
- Go to **Database** → **Publications**
- Check that `supabase_realtime` includes `kitchen_orders`

---

### Step 6: Deploy Edge Function

```bash
# From project root
supabase functions deploy pos-webhook
```

**Set environment secrets:**
```bash
# Service role key (for webhook to write to DB)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Square webhook secret (if using Square)
supabase secrets set SQUARE_WEBHOOK_SECRET=your_square_secret
```

**Get webhook URL:**
After deployment, you'll see:
```
https://YOUR_PROJECT.supabase.co/functions/v1/pos-webhook
```

Copy this URL - you'll need it for POS configuration.

---

### Step 7: Configure Environment Variables

Create or update `.env.local` in project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GEMINI_API_KEY=your_gemini_key  # Optional for AI features
```

**Find your keys:**
- Supabase Dashboard → **Settings** → **API**
- Copy `URL` and `anon public` key

---

### Step 8: Test Webhook

**PowerShell:**
```powershell
$webhookUrl = "https://YOUR_PROJECT.supabase.co/functions/v1/pos-webhook"
$teamId = "YOUR_TEAM_UUID"  # Get from ChefStack app or database

$body = @{
    teamId = $teamId
    orderNumber = "DEPLOY-TEST-001"
    tableNumber = "T1"
    items = @(
        @{
            name = "Test Pizza"
            quantity = 1
        }
    )
    priority = "high"
} | ConvertTo-Json

Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $body -ContentType "application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "orderId": "uuid-here",
  "orderNumber": "DEPLOY-TEST-001"
}
```

---

### Step 9: Test ChefStack KDS

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser:** `http://localhost:3000`

3. **Navigate to:** Kitchen Display view (Οθόνη Κουζίνας)

4. **Check for:**
   - ✅ Green "Live" indicator (pulsing)
   - ✅ No errors in browser console

5. **Send test webhook** (from Step 8)

6. **Verify:**
   - Order appears immediately
   - Sound plays 🔔
   - Browser notification shows (if permitted)

---

### Step 10: Configure Your POS System

This varies by POS. See [POS_INTEGRATION.md](../POS_INTEGRATION.md) for specific guides.

**Generic Webhook Setup:**

Most POS systems have a settings page like:
- **Webhooks** or **Integrations**
- **Add New Webhook**
- **URL:** `https://YOUR_PROJECT.supabase.co/functions/v1/pos-webhook`
- **Events:** `Order Created`, `Order Updated`
- **Format:** JSON

**Fields to include in webhook payload:**
```json
{
  "teamId": "YOUR_TEAM_UUID",  // ⚠️ CRITICAL - must include
  "orderNumber": "...",
  "tableNumber": "...",
  "items": [...],
  "priority": "normal"
}
```

---

## 🧪 Verification Checklist

After deployment, verify:

- [ ] **Database**
  - [ ] `kitchen_orders` table exists
  - [ ] Indexes created
  - [ ] RLS policies active
  - [ ] Realtime enabled

- [ ] **Edge Function**
  - [ ] Deployed successfully
  - [ ] Secrets configured
  - [ ] Logs showing no errors

- [ ] **ChefStack App**
  - [ ] Env vars set correctly
  - [ ] Dev server running
  - [ ] KDS view shows "Live" indicator
  - [ ] Manual orders work

- [ ] **Integration**
  - [ ] Webhook responds to test calls
  - [ ] Orders appear in database
  - [ ] Orders appear in KDS real-time
  - [ ] Sound notifications work
  - [ ] Multi-screen sync works

---

## 📊 Monitoring

### Check Logs

**Edge Function Logs:**
```bash
supabase functions logs pos-webhook
```

Or in Supabase Dashboard:
- **Edge Functions** → `pos-webhook` → **Logs**

**Database Logs:**
```bash
supabase logs db
```

### Monitor Orders

**SQL Query:**
```sql
-- Recent orders
SELECT order_number, table_number, status, source, created_at 
FROM kitchen_orders 
ORDER BY created_at DESC 
LIMIT 20;

-- Orders by source
SELECT source, COUNT(*) as count 
FROM kitchen_orders 
GROUP BY source;

-- Orders by status
SELECT status, COUNT(*) as count 
FROM kitchen_orders 
GROUP BY status;
```

**ChefStack Dashboard:**
- Navigate to Dashboard view
- Check order statistics
- Monitor active orders

---

## 🔒 Security Checklist

- [ ] **Webhook Authentication**
  - [ ] Consider adding API key validation
  - [ ] Verify webhook signatures (for Square, etc.)
  - [ ] Rate limiting configured

- [ ] **Database**
  - [ ] RLS policies tested
  - [ ] Service role key kept secret
  - [ ] Team isolation working

- [ ] **Environment**
  - [ ] `.env.local` in `.gitignore`
  - [ ] Production keys different from dev
  - [ ] Secrets managed via Supabase CLI

---

## 🚨 Troubleshooting

### Issue: "Realtime not connected"

**Fix:**
1. Check `.env.local` has correct URL and key
2. Verify Realtime enabled in Supabase
3. Check browser console for errors
4. Try refreshing page

### Issue: "Webhook returns 500"

**Fix:**
1. Check Edge Function logs: `supabase functions logs pos-webhook`
2. Verify `SUPABASE_SERVICE_ROLE_KEY` secret is set
3. Check database connection
4. Review payload structure

### Issue: "Orders not appearing in KDS"

**Fix:**
1. Check `teamId` in webhook payload matches current team
2. Verify RLS policies allow viewing
3. Check Realtime subscription in browser console
4. Ensure table exists in database

### Issue: "Duplicate orders"

**Fix:**
- Should not happen with current code
- Check only one Realtime subscription active
- Verify `handleCreateOrder` logic
- Check browser console for errors

---

## 🎯 Production Deployment

### Performance Optimization

1. **Database Indexes**
   - Already created in migration
   - Monitor slow queries in Supabase Dashboard

2. **Edge Function**
   - Already optimized
   - Consider adding caching for validation

3. **Realtime**
   - Filter subscriptions by `team_id` (already done)
   - Consider pagination for large order lists

### Scaling Considerations

**Free Tier Limits:**
- Database: 500 MB
- Realtime: 200 concurrent connections
- Edge Functions: 500,000 invocations/month

**When to upgrade:**
- Multiple restaurant locations (10+ teams)
- High order volume (1000+ orders/day)
- Many concurrent KDS screens (50+)

### Backup Strategy

**Automated Backups:**
- Supabase provides daily backups (Pro plan)
- Free tier: manual exports recommended

**Export orders:**
```sql
COPY (
  SELECT * FROM kitchen_orders 
  WHERE created_at > NOW() - INTERVAL '30 days'
) TO '/path/to/backup.csv' CSV HEADER;
```

---

## 📞 Support

### Resources

- [ChefStack Documentation](/)
- [Supabase Documentation](https://supabase.com/docs)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Realtime Guide](https://supabase.com/docs/guides/realtime)

### Getting Help

1. Check [TESTING.md](./TESTING.md) for test scripts
2. Review [POS_INTEGRATION.md](../POS_INTEGRATION.md) for POS-specific help
3. Open GitHub issue with:
   - Error messages
   - Steps to reproduce
   - Edge Function logs
   - Browser console output

### Contact

- Email: support@chefstack.app
- GitHub: [jpapad/ChefStack](https://github.com/jpapad/ChefStack)

---

## ✅ Deployment Complete!

Your POS integration is now live! 🎉

**Next Steps:**
1. Configure your POS to send webhooks
2. Train kitchen staff on KDS interface
3. Monitor first few orders closely
4. Gather feedback and iterate

**Pro Tips:**
- Start with manual orders during quiet hours
- Test thoroughly before peak service
- Have backup plan (manual entry) ready
- Monitor Edge Function logs during first week

Happy cooking! 👨‍🍳
