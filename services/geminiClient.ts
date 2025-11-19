// services/geminiClient.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

if (!apiKey) {
  console.warn("VITE_GEMINI_API_KEY is not set. AI features will be disabled.");
}

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const getMenuModel = () => {
  if (!genAI) {
    throw new Error("Gemini API key is not configured. Set VITE_GEMINI_API_KEY.");
  }
  // μπορείς να αλλάξεις μοντέλο αν θες (π.χ. gemini-1.5-flash)
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
};
