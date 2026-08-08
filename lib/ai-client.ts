// Server-only AI client.
// Supports Groq (100% Free), OpenRouter (Free models), Together AI, Anthropic, and OpenAI.

const GROQ_BASE = "https://api.groq.com/openai/v1";
const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const TOGETHER_BASE = "https://api.together.xyz/v1";
const ANTHROPIC_BASE = "https://api.anthropic.com/v1";
const OPENAI_BASE = "https://api.openai.com/v1";

// Defaults based on active provider
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_OPENROUTER_MODEL = "meta-llama/llama-3.3-70b-instruct:free";
const DEFAULT_TOGETHER_MODEL = "deepseek-ai/DeepSeek-V4-Pro";

const DEFAULT_VISION_MODEL = "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8";
const FALLBACK_VISION_MODELS = [
  "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo",
  "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
];

// Models known to wrap output in <think>...</think> blocks (reasoning models).
const REASONING_MODEL_PATTERNS = [/deepseek-r1/i, /deepseek-v4/i, /qwq/i, /reasoning/i, /thinking/i, /\bo1\b/i, /\bo3\b/i];

function isReasoningModel(model: string): boolean {
  return REASONING_MODEL_PATTERNS.some(re => re.test(model));
}

function stripThinkBlocks(content: string): string {
  let cleaned = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  cleaned = cleaned.replace(/<thinking>[\s\S]*?<\/thinking>/gi, "").trim();
  if (cleaned.includes("<think>") && !cleaned.includes("</think>")) {
    const lastThink = cleaned.lastIndexOf("<think>");
    cleaned = cleaned.slice(0, lastThink).trim();
  }
  return cleaned;
}

export type ChatMessage = {
  role: "user" | "system" | "assistant";
  content: string | Array<{ type: string; [key: string]: any }>;
};

export type ChatOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
};

export type ProviderSettings = {
  provider: "groq" | "openrouter" | "together" | "anthropic" | "openai";
  model?: string;
  apiKey?: string;
};

async function fetchWithRetry(url: string, init: RequestInit, providerName: string, maxAttempts = 4): Promise<Response> {
  let lastErr: any;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(url, init);
    if (res.ok) return res;
    if (res.status >= 500 || res.status === 429) {
      const body = await res.text().catch(() => "");
      lastErr = new Error(`${providerName} error ${res.status}: ${body.slice(0, 400)}`);
      if (attempt < maxAttempts) {
        const delay = Math.min(8000, 500 * Math.pow(2, attempt - 1));
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw lastErr;
    }
    const body = await res.text().catch(() => "");
    throw new Error(`${providerName} error ${res.status}: ${body.slice(0, 400)}`);
  }
  throw lastErr ?? new Error(`${providerName} request failed after ${maxAttempts} attempts`);
}

async function chatOpenAICompatible(baseUrl: string, apiKey: string, providerName: string, messages: ChatMessage[], opts: ChatOptions, defaultModel: string): Promise<string> {
  const model = opts.model ?? process.env.AI_MODEL ?? defaultModel;
  const reasoning = isReasoningModel(model);
  const requestedTokens = opts.maxTokens ?? 2000;
  const maxTokens = reasoning ? Math.max(requestedTokens * 5, 12000) : requestedTokens;

  const body: any = {
    model,
    messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: maxTokens,
  };
  if (opts.jsonMode) body.response_format = { type: "json_object" };

  const response = await fetchWithRetry(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  }, providerName);

  const result = await response.json();
  const choice = result.choices?.[0];
  let content = choice?.message?.content ?? "";

  if (!content && choice?.message?.reasoning_content) {
    const reasoningPreview = String(choice.message.reasoning_content).slice(-1500);
    throw new Error(
      `${model} hit token budget while reasoning. Preview: "...${reasoningPreview}".`
    );
  }

  if (!content) {
    const finishReason = choice?.finish_reason ?? "unknown";
    const errMsg = result.error?.message ?? result.error ?? JSON.stringify(result).slice(0, 400);
    throw new Error(
      `${model} returned empty content. finish_reason="${finishReason}". Response: ${errMsg}`
    );
  }

  if (reasoning) content = stripThinkBlocks(content);
  return content.trim();
}

async function chatAnthropic(messages: ChatMessage[], opts: ChatOptions, apiKey: string): Promise<string> {
  const model = opts.model ?? "claude-3-5-haiku-latest";
  const system = messages.find(m => m.role === "system");
  const userMessages = messages.filter(m => m.role !== "system");

  const body: any = {
    model,
    max_tokens: opts.maxTokens ?? 2000,
    temperature: opts.temperature ?? 0.7,
    messages: userMessages,
  };
  if (system) body.system = system.content;

  const response = await fetchWithRetry(`${ANTHROPIC_BASE}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  }, "Anthropic");
  const result = await response.json();
  return result.content?.[0]?.text?.trim() ?? "";
}

export async function chat(messages: ChatMessage[], opts: ChatOptions = {}, provider?: ProviderSettings): Promise<string> {
  // Check override or env variables in order of priority: Groq (Free) -> OpenRouter (Free) -> Together AI -> OpenAI -> Anthropic
  const groqKey = provider?.provider === "groq" ? provider.apiKey : (process.env.GROQ_API_KEY || (provider?.apiKey && provider?.provider === "groq" ? provider.apiKey : undefined));
  if (groqKey || provider?.provider === "groq") {
    const key = groqKey || process.env.GROQ_API_KEY;
    if (!key) throw new Error("GROQ_API_KEY is not set. Get a free API key at console.groq.com");
    return chatOpenAICompatible(GROQ_BASE, key, "Groq AI", messages, opts, DEFAULT_GROQ_MODEL);
  }

  const openRouterKey = provider?.provider === "openrouter" ? provider.apiKey : process.env.OPENROUTER_API_KEY;
  if (openRouterKey || provider?.provider === "openrouter") {
    const key = openRouterKey || process.env.OPENROUTER_API_KEY;
    if (!key) throw new Error("OPENROUTER_API_KEY is not set. Get a free key at openrouter.ai");
    return chatOpenAICompatible(OPENROUTER_BASE, key, "OpenRouter AI", messages, opts, DEFAULT_OPENROUTER_MODEL);
  }

  if (provider?.provider === "anthropic" && provider.apiKey) {
    return chatAnthropic(messages, { ...opts, model: opts.model ?? provider.model }, provider.apiKey);
  }
  if (provider?.provider === "openai" && provider.apiKey) {
    return chatOpenAICompatible(OPENAI_BASE, provider.apiKey, "OpenAI", messages, { ...opts, model: opts.model ?? provider.model }, "gpt-4o-mini");
  }

  const togetherKey = process.env.TOGETHER_API_KEY;
  if (togetherKey) {
    return chatOpenAICompatible(TOGETHER_BASE, togetherKey, "Together AI", messages, { ...opts, model: opts.model ?? provider?.model }, DEFAULT_TOGETHER_MODEL);
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    return chatOpenAICompatible(OPENAI_BASE, openaiKey, "OpenAI", messages, { ...opts, model: opts.model ?? provider?.model }, "gpt-4o-mini");
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    return chatAnthropic(messages, { ...opts, model: opts.model ?? provider?.model }, anthropicKey);
  }

  throw new Error("No AI API Key is configured. Please add GROQ_API_KEY (100% Free at console.groq.com) or OPENROUTER_API_KEY (Free at openrouter.ai) to your Vercel Environment Variables.");
}

export async function chatJSON<T>(messages: ChatMessage[], opts: ChatOptions = {}, provider?: ProviderSettings): Promise<T> {
  const raw = await chat(messages, { ...opts, jsonMode: true }, provider);
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  return JSON.parse(cleaned.trim()) as T;
}

export async function visionExtract(base64: string, mimeType: string, instruction: string): Promise<string> {
  const primaryModel = process.env.AI_VISION_MODEL ?? DEFAULT_VISION_MODEL;
  const modelsToTry = [primaryModel, ...FALLBACK_VISION_MODELS.filter(m => m !== primaryModel)];

  const messages: ChatMessage[] = [{
    role: "user",
    content: [
      { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}`, detail: "high" } },
      { type: "text", text: instruction },
    ],
  }];

  let lastError: Error | null = null;
  for (const model of modelsToTry) {
    try {
      return await chat(messages, { temperature: 0.1, maxTokens: 3000, model });
    } catch (e: any) {
      lastError = e;
      if (!/error 5\d\d/i.test(e.message ?? "")) throw e;
    }
  }
  throw lastError ?? new Error("All vision models failed");
}
