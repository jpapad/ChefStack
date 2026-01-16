# 🚀 ChefStack Gemini Backend - Deployment Checklist

**Use this checklist when deploying the new Gemini backend architecture.**

---

## ✅ Pre-Deployment (Development)

### 1. Code Verification
- [ ] All refactored components compile without errors
- [ ] Import paths are correct (especially `callGemini.ts`)
- [ ] No `VITE_GEMINI_API_KEY` references in migrated components
- [ ] Edge Function `index.ts` has no syntax errors

### 2. Local Testing with Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Create local env file for Edge Function
echo "GEMINI_API_KEY=your_dev_gemini_key" > supabase/.env

# Start local Supabase
supabase start

# Serve Edge Function locally
supabase functions serve gemini-proxy --env-file supabase/.env
```

- [ ] Supabase starts successfully
- [ ] Edge Function serves on http://localhost:54321/functions/v1/gemini-proxy
- [ ] No errors in function logs

### 3. Frontend Local Testing

```bash
# In another terminal, start frontend
npm run dev
```

Test these AI features:
- [ ] Chef Copilot: Can ask questions and get responses
- [ ] Menu Generator: Can generate menus
- [ ] HACCP Coach: Can get HACCP advice
- [ ] Costing Insights: Can analyze costs
- [ ] Ops Coach: Can get operational suggestions

### 4. Check Error Handling

Test failure scenarios:
- [ ] Logout and try AI feature → Should require login
- [ ] Stop Edge Function and try AI → Should show error gracefully
- [ ] Use invalid prompt → Should show Gemini error

---

## 🌐 Production Deployment

### Step 1: Set Production Secrets

```bash
# Set Gemini API key as Supabase secret
supabase secrets set GEMINI_API_KEY=your_production_gemini_api_key

# Verify it was set
supabase secrets list
# Should show: GEMINI_API_KEY | ********************** | <timestamp>
```

- [ ] Secret set successfully
- [ ] Secret visible in `supabase secrets list`

### Step 2: Deploy Edge Function

```bash
# Deploy the gemini-proxy function
supabase functions deploy gemini-proxy

# Expected output:
# Deploying gemini-proxy (project ref: ...)
# Bundled gemini-proxy (X KB)
# Deployed gemini-proxy (version: ...)
```

- [ ] Deployment completes without errors
- [ ] Function URL returned (https://...supabase.co/functions/v1/gemini-proxy)

### Step 3: Verify Deployment

```bash
# List all functions
supabase functions list

# Should show:
# NAME           VERSION   STATUS   REGIONS   UPDATED
# gemini-proxy   1         ACTIVE   [...]     <timestamp>
```

- [ ] `gemini-proxy` appears in list
- [ ] Status is `ACTIVE`

### Step 4: Test Edge Function Directly

```bash
# Get a valid access token from your browser:
# 1. Open app in browser (logged in)
# 2. DevTools → Application → Local Storage → sb-*-auth-token
# 3. Copy the access_token value

export AUTH_TOKEN="eyJ..." # Replace with actual token

# Test the function
curl -X POST \
  https://your-project-ref.supabase.co/functions/v1/gemini-proxy \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "feature": "chef_copilot",
    "model": "gemini-2.0-flash",
    "contents": [
      {
        "role": "user",
        "parts": [{"text": "Hello, test!"}]
      }
    ]
  }'

# Expected: JSON response with candidates array
```

- [ ] Returns 200 OK
- [ ] Response contains `candidates` array
- [ ] Response contains text from Gemini

### Step 5: Deploy Frontend

**Option A: Vercel/Netlify**
```bash
# Build frontend
npm run build

# Deploy (example for Vercel)
vercel --prod
```

**Option B: Manual**
```bash
# Build
npm run build

# Upload dist/ folder to your hosting
```

Environment variables for frontend build:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
- `VITE_PUBLIC_URL` - Your production URL

**Do NOT include `VITE_GEMINI_API_KEY`** in production build (no longer needed).

- [ ] Frontend builds successfully
- [ ] No errors about missing `VITE_GEMINI_API_KEY`
- [ ] Deployed to production URL

### Step 6: Production Testing

Open production app and test:

#### Authentication
- [ ] Can login/signup
- [ ] Session persists on page refresh
- [ ] Can logout and login again

#### AI Features (Core)
- [ ] **Chef Copilot**: Dashboard → Ask question → Get response within 10s
- [ ] **Menu Generator**: Menus → AI Generator → Create menu → Recipes imported
- [ ] **HACCP Coach**: HACCP → AI Coach → Get compliance advice
- [ ] **Costing Insights**: Costing → AI Insights → Get cost analysis

#### AI Features (Secondary)
- [ ] **Ops Coach**: Dashboard → Ops AI Coach → Get suggestions
- [ ] **Inventory Insights**: Inventory → AI Insights → Get recommendations
- [ ] **Shopping Suggestions**: Shopping List → AI → Get optimizations
- [ ] **Waste Analysis**: Waste → Analyze → Get report
- [ ] **HACCP Autofill**: HACCP → Autofill → Get suggestions

#### Error Scenarios
- [ ] Logout → Try AI feature → Shows auth error (not crash)
- [ ] Invalid input → Shows friendly error
- [ ] Network issue → Shows retry/error message

---

## 📊 Post-Deployment Monitoring

### Day 1: Immediate Monitoring

```bash
# Watch Edge Function logs
supabase functions logs gemini-proxy --follow

# Or in Dashboard:
# Functions → gemini-proxy → Logs tab
```

Watch for:
- [ ] No 401 errors (auth failures)
- [ ] No 500 errors (server crashes)
- [ ] No timeout errors (504)
- [ ] Response times < 10s for most requests

### Week 1: Usage Tracking

Check Supabase Dashboard:
- [ ] Function invocation count (should match AI feature usage)
- [ ] Average response time
- [ ] Error rate (should be <1%)

Check Gemini API Dashboard (Google AI Studio):
- [ ] Request count matches Edge Function invocations
- [ ] No quota exceeded errors
- [ ] Costs within expected range

### Month 1: Performance Review

- [ ] Gather user feedback on AI features
- [ ] Check Edge Function logs for patterns
- [ ] Review Gemini API costs
- [ ] Decide on rate limiting implementation
- [ ] Plan caching strategy if needed

---

## 🐛 Troubleshooting

### Issue: "Server configuration error: AI service unavailable"

**Cause**: `GEMINI_API_KEY` not set in Supabase secrets

**Fix**:
```bash
supabase secrets set GEMINI_API_KEY=your_api_key
supabase functions deploy gemini-proxy # Re-deploy
```

### Issue: "Invalid or expired token"

**Cause**: User session expired or invalid

**Fix**: User needs to re-login. Check that auth is configured correctly.

### Issue: "Request timeout"

**Cause**: Gemini API is slow or prompt is too long

**Fix**:
- Reduce prompt length
- Check Gemini API status
- Increase timeout in Edge Function (currently 25s)

### Issue: Edge Function not found (404)

**Cause**: Function not deployed or wrong URL

**Fix**:
```bash
supabase functions list # Verify it's deployed
supabase functions deploy gemini-proxy # Redeploy if needed
```

### Issue: CORS errors in browser

**Cause**: Edge Function CORS headers misconfigured

**Fix**: Check `corsHeaders` in `index.ts` and re-deploy

### Issue: High costs

**Cause**: Too many AI requests or long prompts

**Fix**:
- Implement rate limiting (Phase 2)
- Add prompt length validation
- Cache common requests (Phase 3)

---

## 🔄 Rollback Plan

If critical issues arise, you can rollback:

### Option 1: Rollback Edge Function Only

```bash
# Revert to previous version
supabase functions deploy gemini-proxy --version <previous-version>
```

Frontend keeps using proxy, but with older function version.

### Option 2: Full Rollback to Frontend API Keys

1. Add `VITE_GEMINI_API_KEY` back to frontend env
2. Git revert migration commits:
   ```bash
   git log --oneline # Find migration commits
   git revert <commit-hash>..HEAD
   ```
3. Redeploy frontend

⚠️ **Security Warning**: Option 2 exposes API keys again. Only use if Edge Function is completely broken.

---

## 📝 Deployment Sign-Off

**Deployed by**: _________________  
**Date**: _________________  
**Environment**: [ ] Staging  [ ] Production  
**All tests passed**: [ ] Yes  [ ] No  

**Notes**:
```
(Add any deployment notes, issues encountered, or special configurations)



```

---

**Deployment Complete! 🎉**

Continue monitoring Edge Function logs for the first 24 hours. If any issues arise, refer to the troubleshooting section or rollback using the plan above.
