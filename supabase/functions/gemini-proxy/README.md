# Gemini Proxy Edge Function

This Edge Function acts as a secure proxy for all Gemini AI API calls from the ChefStack frontend.

## Why a Proxy?

- **Security**: API keys stay on the server, never exposed to frontend code
- **Auth**: Validates Supabase user sessions before allowing AI calls
- **Rate limiting**: Centralized control over AI feature access
- **Monitoring**: Single point for logging/tracking AI usage
- **Cost control**: Backend can implement usage limits per user/team

## Supported Features

The function validates incoming `feature` parameter against an allowlist:

- `chef_copilot` - AI kitchen operations assistant
- `haccp_coach` - HACCP compliance coaching
- `costing` - Ingredient cost analysis
- `menu_generator` - AI menu creation
- `inventory_insights` - Inventory optimization suggestions
- `shopping_suggestions` - Smart shopping list recommendations
- `waste_analysis` - Waste reduction analysis
- `ops_coach` - Operations coaching panel
- `haccp_autofill` - HACCP log auto-fill suggestions
- `image_generation` - Recipe image generation (text-only, not Imagen)

## Deployment

### 1. Set the Gemini API Key as a Supabase Secret

```bash
# Production
supabase secrets set GEMINI_API_KEY=your_actual_gemini_api_key_here

# Local development (in supabase/.env file)
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 2. Deploy the Edge Function

```bash
# Deploy to production
supabase functions deploy gemini-proxy

# Serve locally for testing
supabase functions serve gemini-proxy
```

### 3. Verify Deployment

```bash
# Test with curl (replace with your auth token)
curl -X POST \
  https://your-project.supabase.co/functions/v1/gemini-proxy \
  -H "Authorization: Bearer your_supabase_access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "feature": "chef_copilot",
    "model": "gemini-2.0-flash",
    "contents": [
      {
        "role": "user",
        "parts": [{"text": "Hello, Chef!"}]
      }
    ]
  }'
```

## Request Format

```typescript
{
  feature: string;          // One of the allowed features (required)
  model?: string;           // Gemini model ID (default: gemini-2.0-flash)
  contents: Array<{         // Gemini API contents array (required)
    role: string;
    parts: Array<{text: string}>;
  }>;
  generationConfig?: {      // Optional generation config
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}
```

## Response Format

Success (status 200):
```typescript
{
  candidates: [{
    content: {
      parts: [{text: string}]
    }
  }]
}
```

Error (status 4xx/5xx):
```typescript
{
  error: string;
}
```

## Error Codes

- **401**: Missing or invalid Authorization header
- **400**: Invalid feature or malformed request body
- **500**: Server configuration error (missing GEMINI_API_KEY)
- **504**: Timeout (Gemini API took >25s to respond)

## Frontend Usage

The frontend uses the `callGemini()` helper from `src/lib/ai/callGemini.ts`:

```typescript
import { callGemini } from '../../src/lib/ai/callGemini';

const response = await callGemini({
  feature: 'chef_copilot',
  prompt: 'How can I reduce food cost?',
  model: 'gemini-2.0-flash',
});

if (response.error) {
  console.error('AI Error:', response.error);
} else {
  console.log('AI Response:', response.text);
}
```

## Monitoring

Check Edge Function logs in Supabase Dashboard:
- Functions > gemini-proxy > Logs
- Look for errors, timeouts, or authentication failures

## Troubleshooting

**"Server configuration error: AI service unavailable"**
- Check that `GEMINI_API_KEY` is set: `supabase secrets list`
- Verify the key is valid in Google AI Studio

**"Invalid or expired token"**
- User session expired - prompt re-login
- Check that Authorization header includes valid Supabase JWT

**"Request timeout"**
- Gemini API is slow or unresponsive
- Consider reducing prompt complexity or max tokens
- Check Google AI Studio API status

**"Invalid feature: X"**
- Feature name not in allowlist
- Check `ALLOWED_FEATURES` array in index.ts

## Security Notes

- Function validates ALL requests require valid Supabase authentication
- Gemini API key never exposed to client-side code
- Rate limiting can be added per user/team if needed
- Consider adding usage tracking for cost monitoring

## Development

Run locally with Supabase CLI:

```bash
# Start local Supabase
supabase start

# Serve function locally
supabase functions serve gemini-proxy --env-file supabase/.env

# Test locally
curl http://localhost:54321/functions/v1/gemini-proxy \
  -H "Authorization: Bearer <local_token>" \
  -d '{"feature":"chef_copilot","contents":[{"role":"user","parts":[{"text":"test"}]}]}'
```
