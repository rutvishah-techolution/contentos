import { VertexAI } from "@google-cloud/vertexai";
import { getVertexConfig } from "@/lib/env";

interface GeminiOptions {
  system: string;
  user: string;
  maxTokens?: number;
}

/**
 * Calls Gemini through Google Vertex AI with Google Search grounding enabled.
 * Auth comes from GOOGLE_APPLICATION_CREDENTIALS (service account). Grounding
 * is what gives scouts real, current web awareness.
 */
export async function callGemini({
  system,
  user,
  maxTokens = 8192,
}: GeminiOptions): Promise<string> {
  const { project, location, model } = getVertexConfig();
  const vertex = new VertexAI({ project, location });

  const generativeModel = vertex.getGenerativeModel({
    model,
    systemInstruction: system,
    // Google Search grounding tool (Gemini 2.x).
    tools: [{ googleSearch: {} } as unknown as never],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.7,
      // Disable 2.5 "thinking" so the full token budget goes to the JSON
      // output (thinking tokens were truncating findings mid-stream).
      thinkingConfig: { thinkingBudget: 0 },
    } as unknown as never,
  });

  const resp = await generativeModel.generateContent({
    contents: [{ role: "user", parts: [{ text: user }] }],
  });

  const parts = resp.response.candidates?.[0]?.content?.parts || [];
  return parts
    .map((p) => (p as { text?: string }).text || "")
    .join("")
    .trim();
}

/**
 * Grounded web search used as the backend for other models' `web_search` tool.
 * Returns key facts with real, published source URLs (not redirect links).
 */
/**
 * Runs a grounded (Google Search) generation with the caller's FULL prompt,
 * verbatim — used by the news engine to control recency + source preferences.
 */
export async function groundedRaw(prompt: string, maxTokens = 1600): Promise<string> {
  const { project, location, model } = getVertexConfig();
  const vertex = new VertexAI({ project, location });
  const gm = vertex.getGenerativeModel({
    model,
    tools: [{ googleSearch: {} } as unknown as never],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.2,
      thinkingConfig: { thinkingBudget: 0 },
    } as unknown as never,
  });
  try {
    const resp = await gm.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const parts = resp.response.candidates?.[0]?.content?.parts || [];
    return (
      parts
        .map((p) => (p as { text?: string }).text || "")
        .join("")
        .trim() || "No results found."
    );
  } catch (e) {
    return `web_search error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

export async function groundedSearch(query: string): Promise<string> {
  const { project, location, model } = getVertexConfig();
  const vertex = new VertexAI({ project, location });
  const gm = vertex.getGenerativeModel({
    model,
    tools: [{ googleSearch: {} } as unknown as never],
    generationConfig: {
      maxOutputTokens: 1200,
      temperature: 0.2,
      thinkingConfig: { thinkingBudget: 0 },
    } as unknown as never,
  });
  const prompt = `Search the web for: ${query}

Return the key factual findings as short bullet points. After each finding, put its REAL published source URL in parentheses — the actual article URL on the publisher's domain (e.g. https://techcrunch.com/...), never a redirect or search URL. Prefer sources from the last few months.`;
  try {
    const resp = await gm.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const parts = resp.response.candidates?.[0]?.content?.parts || [];
    return (
      parts
        .map((p) => (p as { text?: string }).text || "")
        .join("")
        .trim() || "No results found."
    );
  } catch (e) {
    return `web_search error: ${e instanceof Error ? e.message : String(e)}`;
  }
}
