# Image Proxy Edge Function

Secure backend proxy for Google Imagen API image generation requests.

## Overview

This Edge Function provides a secure backend interface for the `AIImageModal` component to generate images using Google's Imagen API without exposing the API key to the frontend.

## Features

- ✅ **Full JWT authentication** with `auth.getUser(token)`
- ✅ **POST-only** requests (405 for other methods)
- ✅ **Input size guard** (512KB max)
- ✅ **Request logging** with `{userId, feature, status, durationMs}` (no prompts logged)
- ✅ **60s timeout** for image generation (longer than text)
- ✅ **CORS support** for frontend requests

## Request Format

```typescript
POST /functions/v1/image-proxy
Authorization: Bearer <supabase-jwt-token>
Content-Type: application/json

{
  "prompt": "A beautiful plate of pasta carbonara with fresh parmesan",
  "numberOfImages": 1,  // Optional, 1-4, default: 1
  "aspectRatio": "1:1", // Optional: "1:1", "16:9", "9:16", etc.
  "negativePrompt": "blurry, low quality" // Optional
}
```

## Response Format

**Success (200)**:
```json
{
  "generatedImages": [
    {
      "imageBytes": "base64_encoded_image_data",
      "mimeType": "image/png"
    }
  ]
}
```

**Error (4xx/5xx)**:
```json
{
  "error": "Error message"
}
```

## Error Codes

- **401**: Missing or invalid authentication
- **405**: Method not allowed (must be POST)
- **413**: Request body too large (>512KB)
- **400**: Invalid request (missing/invalid prompt, bad numberOfImages)
- **500**: Server configuration error (missing `GEMINI_API_KEY`)
- **504**: Request timeout (>60s)

## Deployment

```bash
# Set Gemini API key as Supabase secret (same key as gemini-proxy)
supabase secrets set GEMINI_API_KEY=your_gemini_api_key

# Deploy the function
supabase functions deploy image-proxy

# Verify
supabase functions list
```

## Local Development

```bash
# Start Supabase locally
supabase start

# Create local env file (if not exists)
echo "GEMINI_API_KEY=your_dev_key" > supabase/.env

# Serve function locally
supabase functions serve image-proxy --env-file supabase/.env

# Test with curl
curl -X POST http://localhost:54321/functions/v1/image-proxy \
  -H "Authorization: Bearer <your-local-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"A delicious pizza"}'
```

## Frontend Integration

The `AIImageModal` component automatically uses this Edge Function:

```tsx
// Old (insecure - API key in frontend):
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
const response = await ai.models.generateImages({ ... });

// New (secure - backend proxy):
const { data } = await supabase.functions.invoke('image-proxy', {
  body: { prompt: 'A beautiful dish' }
});
const imageBytes = data?.generatedImages?.[0]?.imageBytes;
```

## Logging

All requests are logged with structured JSON (prompts NOT logged for privacy):

```json
{
  "userId": "uuid-here",
  "feature": "image_generation",
  "status": 200,
  "durationMs": 15234,
  "imagesGenerated": 1
}
```

View logs in Supabase Dashboard:
- **Functions** → **image-proxy** → **Logs**

## Security

- **No API key in frontend**: Gemini API key stored as Supabase secret
- **JWT validation**: All requests must have valid user session
- **Input validation**: Prompt length, numberOfImages range checked
- **Size limits**: Max 512KB request body
- **Timeout protection**: 60s limit prevents runaway requests

## Performance

- **Typical latency**: 10-30 seconds (image generation is slow)
- **Max timeout**: 60 seconds
- **Recommended**: Show loading indicator, don't allow concurrent requests

## Rate Limiting

**Not yet implemented**. To add:

```typescript
// Track usage per user
const dailyUsage = await getUserImageGenerationCount(userId);
if (dailyUsage >= MAX_IMAGES_PER_DAY) {
  return new Response(
    JSON.stringify({ error: 'Daily image generation limit exceeded' }),
    { status: 429 }
  );
}
```

## Troubleshooting

**"Server configuration error: AI service unavailable"**
- Check: `supabase secrets list` - is `GEMINI_API_KEY` set?
- Verify: Key has access to Imagen API in Google Cloud Console

**"Invalid or expired token"**
- User needs to re-login
- Check: Frontend is passing `Authorization: Bearer <token>`

**"Request timeout"**
- Image generation can be slow (20-60s)
- Increase timeout if needed (edit `setTimeout(60000)`)

**"Imagen API error"**
- Check Google AI Studio for API status
- Verify billing is enabled for your project
- Check quota limits

## Cost Considerations

**Imagen API pricing** (as of 2026):
- ~$0.04 per image (1024x1024)
- ~$0.08 for high-quality images

**Recommendation**: Implement rate limiting per user/team to control costs.

## API Version

- **Imagen Model**: `imagen-3.0-generate-001`
- **API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict`

---

**See also**:
- [gemini-proxy README](../gemini-proxy/README.md) - Text generation proxy
- [Gemini Backend Migration Guide](../../../docs/GEMINI_BACKEND_MIGRATION.md)
