// Supabase Edge Function: gemini-proxy
// Proxies all Gemini API calls from frontend to backend
// Keeps API key secure and validates requests

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// Max request body size: 1MB (prevents abuse)
const MAX_BODY_SIZE = 1024 * 1024; // 1MB

// Allowed feature identifiers - whitelist for security
const ALLOWED_FEATURES = [
  'chef_copilot',
  'haccp_coach',
  'costing',
  'menu_generator',
  'inventory_insights',
  'shopping_suggestions',
  'waste_analysis',
  'ops_coach',
  'haccp_autofill',
  'image_generation',
] as const;

type AllowedFeature = typeof ALLOWED_FEATURES[number];

interface GeminiProxyRequest {
  feature: string;
  model?: string;
  contents: any;
  generationConfig?: any;
}

interface GeminiApiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
  error?: {
    message: string;
    code?: number;
  };
}

// Dynamic CORS origin from env (allowlist) or fallback to '*'
const getAllowedOrigin = (): string => {
  const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS');
  if (allowedOrigins) {
    return allowedOrigins.split(',')[0].trim(); // Use first origin for simplicity
  }
  return '*'; // Fallback for development
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
  let feature: string | undefined;
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
        fn: 'gemini-proxy',
        userId: 'anonymous', 
        feature: 'unknown', 
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
        fn: 'gemini-proxy',
        userId: 'anonymous', 
        feature: 'unknown', 
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
        fn: 'gemini-proxy',
        userId: 'anonymous', 
        feature: 'unknown', 
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
        fn: 'gemini-proxy',
        userId: userId || 'anonymous', 
        feature: 'unknown', 
        status, 
        durationMs: Date.now() - startTime
      }));
      return new Response(
        JSON.stringify({ error: `Request body too large. Max size: ${MAX_BODY_SIZE / 1024}KB` }),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Read body as text first to check actual size if Content-Length missing
    const bodyText = await req.text();
    if (bodyText.length > MAX_BODY_SIZE) {
      status = 413;
      console.log(JSON.stringify({ 
        fn: 'gemini-proxy',
        userId: userId || 'anonymous', 
        feature: 'unknown', 
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
        fn: 'gemini-proxy',
        userId: userId || 'anonymous', 
        feature: 'unknown', 
        status, 
        durationMs: Date.now() - startTime
      }));
      return new Response(
        JSON.stringify({ error: 'Server configuration error: AI service unavailable' }),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Parse and validate request body
    let body: GeminiProxyRequest;
    try {
      body = JSON.parse(bodyText);
    } catch (parseError) {
      status = 400;
      console.log(JSON.stringify({ 
        fn: 'gemini-proxy',
        userId: userId || 'anonymous', 
        feature: 'unknown', 
        status, 
        durationMs: Date.now() - startTime
      }));
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    feature = body.feature; // Store for logging
    const { model = 'gemini-2.0-flash', contents, generationConfig } = body;

    // Validate feature is in allowlist
    if (!feature || !ALLOWED_FEATURES.includes(feature as AllowedFeature)) {
      status = 400;
      console.log(JSON.stringify({ 
        fn: 'gemini-proxy',
        userId: userId || 'anonymous', 
        feature: feature || 'unknown', 
        status, 
        durationMs: Date.now() - startTime
      }));
      return new Response(
        JSON.stringify({
          error: `Invalid feature: ${feature}. Allowed: ${ALLOWED_FEATURES.join(', ')}`,
        }),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate contents
    if (!contents || !Array.isArray(contents)) {
      status = 400;
      console.log(JSON.stringify({ 
        fn: 'gemini-proxy',
        userId: userId || 'anonymous', 
        feature: feature || 'unknown', 
        status, 
        durationMs: Date.now() - startTime
      }));
      return new Response(
        JSON.stringify({ error: 'Invalid contents: must be an array' }),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Make proxied request to Gemini API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiApiKey,
        },
        body: JSON.stringify({
          contents,
          ...(generationConfig && { generationConfig }),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Get response body
      const responseData: GeminiApiResponse = await geminiResponse.json();
      
      status = geminiResponse.status;

      // Log successful request (no prompts logged)
      console.log(JSON.stringify({ 
        fn: 'gemini-proxy',
        userId: userId || 'anonymous', 
        feature: feature || 'unknown', 
        status, 
        durationMs: Date.now() - startTime
      }));

      // Return with original status code
      return new Response(JSON.stringify(responseData), {
        status: geminiResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        status = 504;
        console.log(JSON.stringify({ 
          fn: 'gemini-proxy',
          userId: userId || 'anonymous', 
          feature: feature || 'unknown', 
          status, 
          durationMs: Date.now() - startTime
        }));
        return new Response(
          JSON.stringify({ error: 'Request timeout: Gemini API took too long to respond' }),
          { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw fetchError; // Re-throw to outer catch
    }
  } catch (error) {
    console.error('Error in gemini-proxy:', error);
    console.log(JSON.stringify({ 
      fn: 'gemini-proxy',
      userId: userId || 'anonymous', 
      feature: feature || 'unknown', 
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
