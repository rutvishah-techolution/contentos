import { getAzureConfig } from "@/lib/env";

interface ClaudeOptions {
  system: string;
  user: string;
  maxTokens?: number;
  webSearch?: boolean;
  fast?: boolean; // use the faster deployment if configured
}

/**
 * Calls Claude through Azure AI Foundry's Anthropic Messages API passthrough.
 * Endpoint + auth were verified by probing: POST /anthropic/v1/messages with
 * the `x-api-key` header. The web_search server tool is executed by the model
 * automatically within the request, so no client-side tool loop is needed.
 */
export async function callClaude({
  system,
  user,
  maxTokens = 4096,
  webSearch = true,
  fast = false,
}: ClaudeOptions): Promise<string> {
  const { endpoint, apiKey, apiVersion, deployment, fastDeployment } =
    getAzureConfig();
  const model = fast ? fastDeployment : deployment;
  if (!model) {
    throw new Error(
      "AZURE_CLAUDE_DEPLOYMENT is not set in .env. Add your Azure Foundry Claude deployment name.",
    );
  }

  const url = `${endpoint}/anthropic/v1/messages?api-version=${apiVersion}`;
  const body: Record<string, unknown> = {
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  };
  if (webSearch) {
    body.tools = [
      { type: "web_search_20250305", name: "web_search", max_uses: 6 },
    ];
  }

  const data = (await postWithRetry(url, apiKey, body)) as {
    content?: Array<{ type: string; text?: string }>;
  };
  return (data.content || [])
    .filter((b) => b.type === "text" && b.text)
    .map((b) => b.text as string)
    .join("\n")
    .trim();
}

const RETRYABLE = new Set([408, 409, 429, 500, 502, 503, 504, 529]);

/**
 * POSTs to the Azure Foundry endpoint with retry + exponential backoff on
 * transient failures (rate limits, timeouts, 5xx). Without this, a single 429
 * during parallel calls would fail an entire research/validation stream.
 */
async function postWithRetry(
  url: string,
  apiKey: string,
  body: Record<string, unknown>,
  maxAttempts = 4,
): Promise<unknown> {
  let lastErr = "";
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 120000);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) return await res.json();

      const text = await res.text();
      lastErr = `Claude (Azure) ${res.status}: ${text.slice(0, 300)}`;
      if (!RETRYABLE.has(res.status)) throw new Error(lastErr);
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
      // AbortError / network errors are retryable; a thrown non-retryable
      // status above re-throws immediately.
      if (e instanceof Error && e.message.startsWith("Claude (Azure)") &&
          !RETRYABLE.has(Number(e.message.match(/\s(\d{3}):/)?.[1]))) {
        throw e;
      }
    }
    if (attempt < maxAttempts) {
      const backoff = 800 * 2 ** (attempt - 1) + Math.floor(attempt * 250);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw new Error(`Claude (Azure) failed after ${maxAttempts} attempts: ${lastErr}`);
}
