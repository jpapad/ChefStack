// Supabase Edge Function: image-proxy
// Proxies Google Imagen API calls for image generation
// Keeps API key secure and validates requests

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// Max request body size: 512KB (prompts shouldn't be huge)
const MAX_BODY_SIZE = 512 * 1024;

interface ImageProxyRequest {
  prompt: string;
  numberOfImages?: number;
  aspectRatio?: string;
  negativePrompt?: string;
}

interface ImageApiResponse {
  generatedImages?: Array<{
    imageBytes: string; // base64
    mimeType: string;
  }>;
  error?: {
    message: string;
    code?: number;
  };
}

// Max images to prevent huge payloads
const MAX_IMAGES = 2;

// Dynamic CORS origin from env (allowlist) or fallback to '*'
const getAllowedOrigin = (): string => {
  const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS');
  if (allowedOrigins) {
    return allowedOrigins.split(',')[0].trim();
  }
  return '*';
};

const getCorsHeaders = (origin?: string) => {
  const allowedOrigin = getAllowedOrigin();
  return {
    'Access-Control-Allow-Origin': allowedOrigin === '*' ? '*' : (origin || allowedOrigin),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
};

serve(async (req: Request) => {
  const startTime = Date.now();
  let userId: string | undefined;
  let status = 500;
  const origin = req.headers.get('origin') || undefined;
  const corsHeaders = getCorsHeaders(origin);

  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { 
        status: 204,
        headers: corsHeaders 
      });
    }

    // 1. Method validation - POST only
    if (req.method !== 'POST') {
      status = 405;
      console.log(JSON.stringify({ 
        fn: 'image-proxy',
        userId: 'anonymous', 
        feature: 'image_generation', 
        status, 
        durationMs: Date.now() - startTime
      }));
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use POST.' }),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Allow': 'POST, OPTIONS' } }
      );
    }

    // 2. Auth check - require valid Supabase session with JWT verification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      status = 401;
      console.log(JSON.stringify({ 
        fn: 'image-proxy',
        userId: 'anonymous', 
        feature: 'image_generation', 
        status, 
        durationMs: Date.now() - startTime
      }));
      return new Response(
        JSON.stringify({ error: 'Missing or invalid Authorization header' }),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract token from Bearer header
    const token = authHeader.replace('Bearer ', '');

    // Create Supabase client and verify JWT token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Verify token and get user - this validates the JWT signature
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      status = 401;
      console.log(JSON.stringify({ 
        fn: 'image-proxy',
        userId: 'anonymous', 
        feature: 'image_generation', 
        status, 
        durationMs: Date.now() - startTime
      }));
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    userId = user.id; // Store for logging

    // 3. Input size guard - prevent abuse (check before reading body)
    const contentLength = req.headers.get('Content-Length');
    if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
      status = 413;
      console.log(JSON.stringify({ 
        fn: 'image-proxy',
        userId: userId || 'anonymous', 
        feature: 'image_generation', 
        status, 
        durationMs: Date.now() - startTime
      }));
      return new Response(
        JSON.stringify({ error: `Request body too large. Max size: ${MAX_BODY_SIZE / 1024}KB` }),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Read body as text first to check actual size
    const bodyText = await req.text();
    if (bodyText.length > MAX_BODY_SIZE) {
      status = 413;
      console.log(JSON.stringify({ 
        fn: 'image-proxy',
        userId: userId || 'anonymous', 
        feature: 'image_generation', 
        status, 
        durationMs: Date.now() - startTime
      }));
      return new Response(
        JSON.stringify({ error: `Request body too large. Max size: ${MAX_BODY_SIZE / 1024}KB` }),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Get Gemini API key from environment
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      status = 500;
      console.error('GEMINI_API_KEY not set in Supabase secrets');
      console.log(JSON.stringify({ 
        fn: 'image-proxy',
        userId: userId || 'anonymous', 
        feature: 'image_generation', 
        status, 
        durationMs: Date.now() - startTime
      }));
      return new Response(
        JSON.stringify({ error: 'Server configuration error: AI service unavailable' }),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Parse and validate request body
    let body: ImageProxyRequest;
    try {
      body = JSON.parse(bodyText);
    } catch (parseError) {
      status = 400;
      console.log(JSON.stringify({ 
        fn: 'image-proxy',
        userId: userId || 'anonymous', 
        feature: 'image_generation', 
        status, 
        durationMs: Date.now() - startTime
      }));
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { prompt, numberOfImages = 1, aspectRatio, negativePrompt } = body;

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      status = 400;
      console.log(JSON.stringify({ 
        fn: 'image-proxy',
        userId: userId || 'anonymous', 
        feature: 'image_generation', 
        status, 
        durationMs: Date.now() - startTime
      }));
      return new Response(
        JSON.stringify({ error: 'Invalid prompt: must be a non-empty string' }),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate numberOfImages with MAX_IMAGES limit
    if (numberOfImages < 1 || numberOfImages > MAX_IMAGES) {
      status = 400;
      console.log(JSON.stringify({ 
        fn: 'image-proxy',
        userId: userId || 'anonymous', 
        feature: 'image_generation', 
        status, 
        durationMs: Date.now() - startTime
      }));
      return new Response(
        JSON.stringify({ error: `numberOfImages must be between 1 and ${MAX_IMAGES}` }),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Make request to Imagen API via REST
    // Note: Using REST API instead of SDK for better Edge Function compatibility
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout (images take longer)

    try {
      // Imagen 3 endpoint
      const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict`;
      
      const requestBody: any = {
        instances: [{
          prompt: prompt.trim(),
        }],
        parameters: {
          sampleCount: numberOfImages,
        }
      };

      // Add optional parameters
      if (aspectRatio) {
        requestBody.parameters.aspectRatio = aspectRatio;
      }
      if (negativePrompt) {
        requestBody.instances[0].negativePrompt = negativePrompt;
      }

      const imagenResponse = await fetch(imagenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiApiKey,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      status = imagenResponse.status;

      if (!imagenResponse.ok) {
        let errorDetail = 'Upstream error';
        try {
          const errorText = await imagenResponse.text();
          errorDetail = errorText.length > 500 ? errorText.substring(0, 500) + '...' : errorText;
        } catch {
          errorDetail = `HTTP ${imagenResponse.status}`;
        }
        
        console.log(JSON.stringify({ 
          fn: 'image-proxy',
          userId: userId || 'anonymous', 
          feature: 'image_generation', 
          status, 
          durationMs: Date.now() - startTime
        }));
        
        return new Response(
          JSON.stringify({ error: 'Image generation failed', detail: errorDetail }),
          { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Parse response
      const responseData = await imagenResponse.json();
      
      // Transform to expected format with MAX_IMAGES limit
      let generatedImages = responseData.predictions?.map((pred: any) => ({
        imageBytes: pred.bytesBase64Encoded,
        mimeType: pred.mimeType || 'image/png',
      })) || [];

      // Truncate to MAX_IMAGES to prevent huge payloads
      if (generatedImages.length > MAX_IMAGES) {
        generatedImages = generatedImages.slice(0, MAX_IMAGES);
      }

      // Log successful request (no prompts logged)
      console.log(JSON.stringify({ 
        fn: 'image-proxy',
        userId: userId || 'anonymous', 
        feature: 'image_generation', 
        status: 200, 
        durationMs: Date.now() - startTime,
        imagesGenerated: generatedImages.length
      }));

      return new Response(JSON.stringify({ generatedImages }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        status = 504;
        console.log(JSON.stringify({ 
          fn: 'image-proxy',
          userId: userId || 'anonymous', 
          feature: 'image_generation', 
          status, 
          durationMs: Date.now() - startTime
        }));
        return new Response(
          JSON.stringify({ error: 'Request timeout: Image generation took too long' }),
          { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw fetchError; // Re-throw to outer catch
    }
  } catch (error) {
    console.error('Error in image-proxy:', error);
    console.log(JSON.stringify({ 
      fn: 'image-proxy',
      userId: userId || 'anonymous', 
      feature: 'image_generation', 
      status, 
      durationMs: Date.now() - startTime
    }));
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
