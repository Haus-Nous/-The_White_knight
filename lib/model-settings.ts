export type ModelProvider = "groq" | "openrouter" | "together" | "anthropic" | "openai";

export type ModelSettings = {
  provider: ModelProvider;
  model: string;
  apiKey?: string;
};

export const MODEL_OPTIONS = [
  {
    provider: "groq" as const,
    model: "llama-3.3-70b-versatile",
    label: "Llama 3.3 70B (Groq — 100% Free)",
    sublabel: "Groq AI",
    description: "Ultra-fast, 100% free model API powered by Groq LPU hardware. Zero credit card needed.",
    pricing: "100% Free (console.groq.com)",
    requiresKey: true,
    keyPlaceholder: "gsk_...",
    keyLink: "https://console.groq.com/keys",
  },
  {
    provider: "openrouter" as const,
    model: "meta-llama/llama-3.3-70b-instruct:free",
    label: "Llama 3.3 70B (OpenRouter — Free)",
    sublabel: "OpenRouter",
    description: "Free access to top-tier open-weights LLMs. Zero credit card needed.",
    pricing: "100% Free (openrouter.ai)",
    requiresKey: true,
    keyPlaceholder: "sk-or-v1-...",
    keyLink: "https://openrouter.ai/keys",
  },
  {
    provider: "together" as const,
    model: "deepseek-ai/DeepSeek-V4-Pro",
    label: "DeepSeek V4 Pro",
    sublabel: "Together AI",
    description: "High-quality model for reasoning and agentic tasks. 128K context.",
    pricing: "~$0.50 / 1M tokens",
    requiresKey: false,
  },
  {
    provider: "anthropic" as const,
    model: "claude-3-5-haiku-latest",
    label: "Claude 3.5 Haiku",
    sublabel: "Anthropic",
    description: "Fast, intelligent Claude model. Great for resume tailoring and Q&A.",
    pricing: "~$1 / 1M tokens",
    requiresKey: true,
    keyPlaceholder: "sk-ant-api03-...",
    keyLink: "https://console.anthropic.com/settings/keys",
  },
  {
    provider: "openai" as const,
    model: "gpt-4o-mini",
    label: "GPT-4o mini",
    sublabel: "OpenAI",
    description: "OpenAI's fast and lightweight model.",
    pricing: "~$0.15 / 1M input",
    requiresKey: true,
    keyPlaceholder: "sk-...",
    keyLink: "https://platform.openai.com/api-keys",
  },
] as const;

const SETTINGS_KEY = "careeros_model_settings";
const DEFAULT: ModelSettings = { provider: "groq", model: "llama-3.3-70b-versatile" };

export function getModelSettings(): ModelSettings {
  if (typeof window === "undefined") return DEFAULT;
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return DEFAULT;
  try { return JSON.parse(raw); } catch { return DEFAULT; }
}

export function saveModelSettings(settings: ModelSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
