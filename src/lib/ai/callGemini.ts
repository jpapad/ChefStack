// Frontend helper for calling Gemini via Supabase Edge Function
// Centralizes all AI calls and handles auth/error handling

import { supabase } from '../../../services/supabaseClient';

export type GeminiFeature =
  | 'chef_copilot'
  | 'haccp_coach'
  | 'costing'
  | 'menu_generator'
  | 'inventory_insights'
  | 'shopping_suggestions'
  | 'waste_analysis'
  | 'ops_coach'
  | 'haccp_autofill'
  | 'image_generation';

export interface GeminiCallOptions {
  feature: GeminiFeature;
  prompt?: string; // Simple string prompt - will be converted to contents
  contents?: any[]; // Advanced: pre-formatted contents array
  model?: string; // Default: gemini-2.0-flash
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
  };
}

export interface GeminiResponse {
  text?: string; // Extracted text from first candidate
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
  error?: string;
}

/**
 * Call Gemini API via Supabase Edge Function proxy
 * Handles authentication, request formatting, and error parsing
 */
export async function callGemini(options: GeminiCallOptions): Promise<GeminiResponse> {
  const { feature, prompt, contents, model = 'gemini-2.0-flash', generationConfig } = options;

  // Check if Supabase is configured
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. AI features require a valid Supabase connection.'
    );
  }

  // Format contents: accept either prompt or pre-formatted contents
  let finalContents: any[];
  if (prompt) {
    finalContents = [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ];
  } else if (contents) {
    finalContents = contents;
  } else {
    throw new Error('Either "prompt" or "contents" must be provided');
  }

  try {
    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
      body: {
        feature,
        model,
        contents: finalContents,
        ...(generationConfig && { generationConfig }),
      },
    });

    if (error) {
      console.error('Edge Function error:', error);
      return {
        error: error.message || 'Failed to call AI service',
      };
    }

    // Handle upstream Gemini API errors
    if (data?.error) {
      console.error('Gemini API error:', data.error);
      return {
        error: data.error.message || 'AI service returned an error',
      };
    }

    // Extract text from response (convenience)
    let extractedText: string | undefined;
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      extractedText = data.candidates[0].content.parts[0].text;
    }

    return {
      text: extractedText,
      candidates: data?.candidates,
    };
  } catch (err) {
    console.error('callGemini exception:', err);
    return {
      error: err instanceof Error ? err.message : 'Unknown error calling AI service',
    };
  }
}

/**
 * Call Gemini with conversation history (for chat interfaces)
 * Accepts an array of messages and appends new user prompt
 */
export async function callGeminiWithHistory(
  feature: GeminiFeature,
  conversationHistory: Array<{ role: string; parts: Array<{ text: string }> }>,
  userPrompt: string,
  model?: string
): Promise<GeminiResponse> {
  const contents = [
    ...conversationHistory,
    {
      role: 'user',
      parts: [{ text: userPrompt }],
    },
  ];

  return callGemini({
    feature,
    contents,
    model,
  });
}
