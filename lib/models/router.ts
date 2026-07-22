import { callClaude } from "@/lib/models/claude";
import { callGemini } from "@/lib/models/gemini";
import { callOpenAICompatible } from "@/lib/models/openaiCompatible";
import { getGrokConfig, getDeepSeekConfig } from "@/lib/env";

export type ModelName = "claude" | "gemini" | "grok" | "deepseek";

export const KNOWN_MODELS: ModelName[] = ["claude", "gemini", "grok", "deepseek"];

export function normalizeModel(raw: string | undefined): ModelName {
  const m = (raw || "").trim().toLowerCase();
  if (m === "gemini") return "gemini";
  if (m === "grok") return "grok";
  if (m === "deepseek") return "deepseek";
  return "claude"; // default / fallback
}

interface CallOptions {
  system: string;
  user: string;
  maxTokens?: number;
  webSearch?: boolean;
}

/** Routes a call to the right model client. All four support web search
 *  (Claude + Gemini natively; Grok + DeepSeek via the hybrid web_search tool). */
export async function callModel(
  model: ModelName,
  { system, user, maxTokens = 4096, webSearch = true }: CallOptions,
): Promise<string> {
  switch (model) {
    case "gemini":
      // Gemini grounding is always on inside callGemini.
      return callGemini({ system, user, maxTokens });
    case "grok": {
      const c = getGrokConfig();
      return callOpenAICompatible({
        ...c,
        system,
        user,
        maxTokens,
        webSearch,
        label: "grok",
      });
    }
    case "deepseek": {
      const c = getDeepSeekConfig();
      return callOpenAICompatible({
        ...c,
        system,
        user,
        maxTokens,
        webSearch,
        label: "deepseek",
      });
    }
    case "claude":
    default:
      return callClaude({ system, user, maxTokens, webSearch });
  }
}
