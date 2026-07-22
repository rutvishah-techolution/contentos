import { groundedSearch } from "@/lib/models/gemini";

interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}
interface ToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

interface Options {
  endpoint: string; // already includes the base path (…/openai/v1)
  apiKey: string;
  model: string;
  system: string;
  user: string;
  maxTokens?: number;
  webSearch?: boolean;
  label?: string; // for error messages
}

const WEB_SEARCH_TOOL = {
  type: "function" as const,
  function: {
    name: "web_search",
    description:
      "Search the web for current, real information. Returns key facts with real published source URLs.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query." },
      },
      required: ["query"],
    },
  },
};

/**
 * Calls an OpenAI-compatible chat endpoint (Grok / DeepSeek on Azure Foundry).
 * Since these routes don't expose native live search, we give the model a
 * `web_search` function and fulfill each call via Gemini grounding — so the
 * model still gets current, real-sourced web data.
 */
export async function callOpenAICompatible(opts: Options): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: opts.system },
    { role: "user", content: opts.user },
  ];
  const useTools = !!opts.webSearch;
  const MAX_TOOL_STEPS = 8;

  for (let step = 0; step <= MAX_TOOL_STEPS; step++) {
    // On the final step, drop tools so the model MUST produce its answer
    // instead of searching forever (some models over-research).
    const forceAnswer = step === MAX_TOOL_STEPS;
    const res = await postChat(opts, {
      model: opts.model,
      messages,
      max_tokens: opts.maxTokens || 4096,
      ...(useTools && !forceAnswer
        ? { tools: [WEB_SEARCH_TOOL], tool_choice: "auto" }
        : {}),
    });

    const msg = res.choices?.[0]?.message as ChatMessage | undefined;
    if (!msg) return "";

    if (!forceAnswer && msg.tool_calls && msg.tool_calls.length > 0) {
      // record the assistant's tool request (content null to satisfy strict APIs)
      messages.push({
        role: "assistant",
        content: msg.content || null,
        tool_calls: msg.tool_calls,
      });
      for (const tc of msg.tool_calls) {
        let result = "";
        try {
          const args = JSON.parse(tc.function.arguments || "{}");
          result = await groundedSearch(String(args.query || ""));
        } catch {
          result = "web_search failed to parse arguments.";
        }
        messages.push({ role: "tool", tool_call_id: tc.id, content: result });
      }
      continue; // loop back so the model can use the results
    }

    if (msg.content && msg.content.trim()) return msg.content.trim();
  }
  return "";
}

const RETRYABLE = new Set([408, 409, 429, 500, 502, 503, 504, 529]);

async function postChat(
  opts: Options,
  body: Record<string, unknown>,
  maxAttempts = 4,
): Promise<{ choices?: Array<{ message?: ChatMessage }> }> {
  const url = `${opts.endpoint}/chat/completions`;
  let lastErr = "";
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 120000);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "api-key": opts.apiKey,
          Authorization: `Bearer ${opts.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) return await res.json();
      const text = await res.text();
      lastErr = `${opts.label || opts.model} ${res.status}: ${text.slice(0, 300)}`;
      if (!RETRYABLE.has(res.status)) throw new Error(lastErr);
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
      const status = Number(lastErr.match(/\s(\d{3}):/)?.[1]);
      if (status && !RETRYABLE.has(status)) throw new Error(lastErr);
    }
    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, 800 * 2 ** (attempt - 1)));
    }
  }
  throw new Error(`${opts.label || opts.model} failed after retries: ${lastErr}`);
}
