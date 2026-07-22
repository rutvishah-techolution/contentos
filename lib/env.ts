import path from "path";

/** Claude via Azure AI Foundry (Anthropic Messages API passthrough). */
export function getAzureConfig() {
  const endpoint = (process.env.AZURE_AI_FOUNDRY_ENDPOINT || "").replace(
    /\/+$/,
    "",
  );
  const apiKey = process.env.AZURE_AI_FOUNDRY_API_KEY || "";
  const apiVersion =
    process.env.AZURE_AI_FOUNDRY_API_VERSION || "2024-10-01-preview";
  // Deployment name is specific to the Foundry resource — supplied via .env.
  const deployment = process.env.AZURE_CLAUDE_DEPLOYMENT || "";
  const fastDeployment =
    process.env.AZURE_CLAUDE_DEPLOYMENT_FAST || deployment;

  if (!endpoint || !apiKey) {
    throw new Error(
      "Azure Foundry endpoint/key missing. Set AZURE_AI_FOUNDRY_ENDPOINT and AZURE_AI_FOUNDRY_API_KEY in .env.",
    );
  }
  return { endpoint, apiKey, apiVersion, deployment, fastDeployment };
}

/** Grok via Azure AI Foundry (OpenAI-compatible chat completions). */
export function getGrokConfig() {
  const endpoint = (process.env.AZURE_GROK_FOUNDRY_ENDPOINT || "").replace(
    /\/+$/,
    "",
  );
  const apiKey = process.env.AZURE_GROK_FOUNDRY_API_KEY || "";
  const model = process.env.GROK_MODEL || "grok-4.3";
  if (!endpoint || !apiKey) {
    throw new Error(
      "Grok config missing. Set AZURE_GROK_FOUNDRY_ENDPOINT and AZURE_GROK_FOUNDRY_API_KEY in .env.",
    );
  }
  return { endpoint, apiKey, model };
}

/** DeepSeek via Azure AI Foundry (OpenAI-compatible; same host as Grok). */
export function getDeepSeekConfig() {
  // key var name contains dots/hyphens → read via bracket access
  const apiKey =
    process.env["DeepSeek-V4-Pro_API_KEY"] ||
    process.env.DEEPSEEK_API_KEY ||
    "";
  const endpoint = (
    process.env.AZURE_DEEPSEEK_FOUNDRY_ENDPOINT ||
    process.env.AZURE_GROK_FOUNDRY_ENDPOINT ||
    ""
  ).replace(/\/+$/, "");
  const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-pro";
  if (!endpoint || !apiKey) {
    throw new Error(
      "DeepSeek config missing. Set the DeepSeek key (and a Foundry endpoint) in .env.",
    );
  }
  return { endpoint, apiKey, model };
}

/** Gemini via Google Vertex AI (service-account auth). */
export function getVertexConfig() {
  const project = process.env.GCP_PROJECT_ID || "";
  const location = process.env.GCP_LOCATION || "us-central1";
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  // Ensure the service-account path is absolute so google-auth resolves it
  // regardless of process cwd.
  const cred = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (cred && !path.isAbsolute(cred)) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(
      process.cwd(),
      cred,
    );
  }

  if (!project) {
    throw new Error("GCP_PROJECT_ID missing in .env for Vertex AI (Gemini).");
  }
  return { project, location, model };
}
