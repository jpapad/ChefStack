# Edge Functions QA & Deployment Guide

**Date**: January 15, 2026  
**Status**: Production-ready with full security hardening

---

## 🚀 Deployment Commands

### 1. Set Secrets

```bash
# Required: Gemini API key (same for both functions)
supabase secrets set GEMINI_API_KEY=your_actual_api_key_here

# Optional: CORS allowlist (comma-separated origins)
supabase secrets set ALLOWED_ORIGINS=https://yourapp.com,https://app.yourapp.com
```

**Note**: If `ALLOWED_ORIGINS` is not set, functions will use `*` (allow all origins) for development convenience.

### 2. Deploy Functions

```bash
# Deploy both functions
supabase functions deploy gemini-proxy
supabase functions deploy image-proxy

# Verify deployment
supabase functions list
# Should show:
# - gemini-proxy   | ACTIVE
# - image-proxy    | ACTIVE
```

### 3. Check Logs

```bash
# Real-time logs
supabase functions logs gemini-proxy --tail
supabase functions logs image-proxy --tail

# Search logs for specific user
supabase functions logs gemini-proxy --grep "userId.*abc123"
```

---

## ✅ Smoke Tests

### Test 1: CORS Preflight

```bash
curl -X OPTIONS https://your-project.supabase.co/functions/v1/gemini-proxy \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type" \
  -H "Origin: https://yourapp.com" \
  -v

# Expected: 204 No Content with CORS headers
```

### Test 2: Auth Required (401)

```bash
curl -X POST https://your-project.supabase.co/functions/v1/gemini-proxy \
  -H "Content-Type: application/json" \
  -d '{"feature":"chef_copilot","prompt":"test"}' \
  -v

# Expected: 401 {"error":"Missing or invalid Authorization header"}
```

### Test 3: Method Not Allowed (405)

```bash
curl -X GET https://your-project.supabase.co/functions/v1/gemini-proxy \
  -H "Authorization: Bearer valid_token" \
  -v

# Expected: 405 {"error":"Method not allowed. Use POST."}
# Headers include: Allow: POST, OPTIONS
```

### Test 4: Input Size Guard (413)

```bash
# Create 2MB payload (exceeds 1MB limit for gemini-proxy)
python -c "print('x' * (1024 * 1024 * 2))" > large.txt

curl -X POST https://your-project.supabase.co/functions/v1/gemini-proxy \
  -H "Authorization: Bearer valid_token" \
  -H "Content-Type: application/json" \
  --data-binary "@large.txt" \
  -v

# Expected: 413 {"error":"Request body too large. Max size: 1024KB"}
```

### Test 5: Valid Request (200)

```bash
# Get auth token from Supabase session (from browser dev tools)
TOKEN="your_valid_supabase_jwt_token"

curl -X POST https://your-project.supabase.co/functions/v1/gemini-proxy \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "feature": "chef_copilot",
    "contents": [{"parts": [{"text": "Πες μου ένα tip για food cost"}]}]
  }' | jq

# Expected: 200 with Gemini response
```

### Test 6: Image Generation (200)

```bash
TOKEN="your_valid_supabase_jwt_token"

curl -X POST https://your-project.supabase.co/functions/v1/image-proxy \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful pasta dish with tomato sauce",
    "numberOfImages": 1
  }' | jq '.generatedImages[0].mimeType'

# Expected: 200 with base64 image(s)
# Check: imagesGenerated count in logs
```

---

## 📊 Log Monitoring

### What to Look For

**Structured Log Format**:
```json
{
  "fn": "gemini-proxy" | "image-proxy",
  "userId": "abc-123-def",
  "feature": "chef_copilot" | "menu_generator" | etc.,
  "status": 200 | 401 | 413 | etc.,
  "durationMs": 1234,
  "imagesGenerated": 1  // Only for image-proxy
}
```

### Healthy Patterns

✅ **Normal operation**:
- status: 200
- durationMs: 500-3000ms (text), 10000-30000ms (images)
- No error field

✅ **Auth failures** (expected if users aren't logged in):
- status: 401
- userId: "anonymous"

✅ **Rate limiting** (if you add it later):
- status: 429
- Clear userId to track abuse

### Unhealthy Patterns

❌ **Many 500 errors**: Check `GEMINI_API_KEY` secret
```bash
supabase secrets list  # Verify key exists
```

❌ **Many 504 timeouts**:
- gemini-proxy: timeout > 25s (increase if needed)
- image-proxy: timeout > 60s (normal for image generation)

❌ **All requests 413**: Check if clients sending huge payloads
- Max: 1MB (gemini-proxy), 512KB (image-proxy)

---

## 🔒 Security Checklist

### JWT Validation

- [x] Uses `supabaseClient.auth.getUser(token)` for full validation
- [x] Rejects requests without valid JWT (401)
- [x] Logs only `userId`, never email/metadata

### Input Validation

- [x] POST-only enforcement (405 for other methods)
- [x] Content-Length header checked before parsing
- [x] Body size limits: 1MB (text), 512KB (images)
- [x] Feature allowlist enforced (gemini-proxy only)

### Privacy Logging

- [x] Logs **DO NOT** include:
  - Prompts
  - Responses
  - API keys
  - Headers (except CORS origin for debugging)
  
- [x] Logs **DO** include:
  - Function name (`fn`)
  - User ID (for audit trail)
  - Feature name
  - Status code
  - Duration (performance monitoring)
  - Images count (image-proxy only)

### CORS

- [x] Preflight (OPTIONS) returns 204
- [x] Dynamic `Access-Control-Allow-Origin`:
  - Uses `ALLOWED_ORIGINS` env var if set (production)
  - Falls back to `*` (development)
- [x] Allowed headers: `authorization`, `content-type`, `x-client-info`, `apikey`
- [x] Allowed methods: `POST`, `OPTIONS`
- [x] Max age: 86400s (24 hours)

### Timeout Protection

- [x] gemini-proxy: 25s timeout
- [x] image-proxy: 60s timeout
- [x] Returns 504 Gateway Timeout on abort

### Error Handling

- [x] Upstream errors sanitized (no sensitive data leaked)
- [x] Large error messages truncated (max 500 chars)
- [x] All errors return JSON with `{ error: "...", detail?: "..." }`

---

## 🧪 Integration Testing

### Test All 10 AI Features

**Text-based features** (via gemini-proxy):
1. ✅ Chef Copilot (Kitchen AI Coach)
2. ✅ HACCP AI Coach
3. ✅ Costing Insights
4. ✅ Menu Generator / Smart Menu Coach
5. ✅ Inventory Insights
6. ✅ Shopping Suggestions
7. ✅ Waste Analysis
8. ✅ Ops Coach (Suppliers, Shifts, Team Comms)
9. ✅ HACCP Autofill

**Image generation** (via image-proxy):
10. ✅ AI Image Modal (recipe images)

### Testing Flow

1. **Login** to ChefStack with valid user
2. **Open browser DevTools** → Network tab
3. **Trigger each AI feature** one by one
4. **Verify** in Network tab:
   - Request goes to `supabase.co/functions/v1/gemini-proxy` or `/image-proxy`
   - Status: 200
   - Response has expected structure
5. **Check logs** for structured output:
   ```bash
   supabase functions logs gemini-proxy --tail
   ```

---

## 🎯 Performance Benchmarks

| Feature | Expected Duration | Timeout | Notes |
|---------|------------------|---------|-------|
| Chef Copilot | 1-3s | 25s | Simple Q&A |
| Menu Generator | 2-5s | 25s | Multi-bullet response |
| HACCP Coach | 1-4s | 25s | Safety guidance |
| Waste Analysis | 2-4s | 25s | Requires data summarization |
| Image Generation | 10-30s | 60s | Imagen API is slower |

**If you see consistent timeouts**:
- Check Gemini API quota/billing
- Verify network connectivity to googleapis.com
- Consider increasing timeout values

---

## 🐛 Troubleshooting

### Problem: "Server configuration error: AI service unavailable"

**Cause**: `GEMINI_API_KEY` not set  
**Fix**:
```bash
supabase secrets set GEMINI_API_KEY=your_key
supabase functions deploy gemini-proxy
supabase functions deploy image-proxy
```

### Problem: CORS errors in browser

**Cause**: Missing CORS headers  
**Fix**: Check if OPTIONS preflight returns 204  
**Verify**:
```bash
# In browser console:
fetch('https://your-project.supabase.co/functions/v1/gemini-proxy', {
  method: 'OPTIONS'
}).then(r => console.log(r.headers))
```

### Problem: "Invalid or expired token"

**Cause**: JWT expired or user logged out  
**Fix**: Re-login in ChefStack app  
**Verify**: Check Supabase session expiry (default: 1 hour)

### Problem: Logs show "anonymous" for all requests

**Cause**: Frontend not sending Authorization header  
**Fix**: Check `supabase.functions.invoke()` call includes auth automatically  
**Verify**: 
```typescript
// ✅ Good: uses current session auth
await supabase.functions.invoke('gemini-proxy', { body: {...} });

// ❌ Bad: missing auth context
await fetch('/functions/v1/gemini-proxy', {
  method: 'POST',
  body: JSON.stringify({...})
  // Missing: headers: { Authorization: `Bearer ${token}` }
});
```

---

## 📈 Next Steps (Optional Enhancements)

1. **Rate limiting**: Add per-user quotas (e.g., 100 requests/day)
2. **Usage tracking**: Log token counts for cost analysis
3. **Caching**: Cache common prompts (e.g., "what is HACCP")
4. **A/B testing**: Route 10% of traffic to different models
5. **Metrics dashboard**: Visualize status codes, latency, user activity

---

## 📚 Related Documentation

- [SECURITY_HARDENING.md](SECURITY_HARDENING.md) - Detailed security improvements
- [GEMINI_MIGRATION_SUMMARY.md](GEMINI_MIGRATION_SUMMARY.md) - Full migration overview
- [gemini-proxy README](../supabase/functions/gemini-proxy/README.md)
- [image-proxy README](../supabase/functions/image-proxy/README.md)

---

**Ready for production! 🚀**
