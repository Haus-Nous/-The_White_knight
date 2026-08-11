# Deployment

## Vercel Environment Variables

Go to your Vercel project → **Settings → Environment Variables** and configure the variables below.

### 1. Primary AI Provider (Recommended)

| Variable | Value | Description |
|---|---|---|
| `GROQ_API_KEY` | `gsk_...` | Groq API Key (100% Free at [console.groq.com](https://console.groq.com)) |
| `AI_MODEL` | `llama-3.3-70b-versatile` | (Optional) Primary LLM model ID |
| `AI_VISION_MODEL` | `meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8` | (Optional) Primary Vision model ID |

### 2. Alternative AI Providers (Supported Fallbacks)

The application automatically checks for configured API keys in order of priority (`Groq` → `OpenRouter` → `Together AI` → `OpenAI` → `Anthropic`):

| Variable | Value | Provider Link |
|---|---|---|
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | [OpenRouter AI](https://openrouter.ai) (Free tier supported) |
| `TOGETHER_API_KEY` | `...` | [Together AI](https://api.together.ai) (`deepseek-ai/DeepSeek-V4-Pro`) |
| `OPENAI_API_KEY` | `sk-...` | [OpenAI Console](https://platform.openai.com) (`gpt-4o-mini`) |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | [Anthropic Console](https://console.anthropic.com) |

### 3. Database Persistence (Redis / Vercel KV)

| Variable | Value | Description |
|---|---|---|
| `KV_REST_API_URL` / `UPSTASH_REDIS_REST_URL` | `https://...` | Upstash Redis or Vercel KV REST Endpoint |
| `KV_REST_API_TOKEN` / `UPSTASH_REDIS_REST_TOKEN` | `...` | Upstash Redis or Vercel KV REST Access Token |

---

## Model: Groq Llama 3.3 70B (Primary)

Default runtime LLM is `llama-3.3-70b-versatile` hosted on **Groq LPU** — providing instant inference, JSON Mode, structured evaluations, and high-throughput document generation.

---

## Vercel Deploy Steps

1. Repository is hosted on GitHub: `https://github.com/Haus-Nous/-The_White_knight.git`.
2. Import project at https://vercel.com/new → select **`Haus-Nous/-The_White_knight`**.
3. Add the environment variables listed above.
4. Click **Deploy**. Vercel will automatically redeploy on every push to `main`.
