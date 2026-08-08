# The White Knight ⚔️

> An AI-Powered Personal Job Application Command Center for Autonomous Candidate Sourcing, Scoring, and Application Tailoring.

---

## 🚀 Overview

**The White Knight** (CareerOS) is a modern, full-stack Next.js web application that serves as an intelligent job application command center. It empowers job seekers by automating company research, ATS resume scoring, cover letter drafting, and interactive application form Q&A generation using state-of-the-art LLM integrations.

---

## ✨ Key Features

- 🎯 **ATS Fit Scoring & Analysis**: Quantitative scoring of candidate profile alignment against job descriptions with actionable gap analysis.
- 📄 **Document Generation**: Tailor resumes, cover letters, executive summaries, and strategic problem-solver pitches tailored to target roles.
- 💬 **Interactive Form Question Answerer**: AI-generated answers for complex application portal questions grounded in your master career persona.
- 🔎 **Automated Company Research**: Deep research integration (via Exa API) to retrieve realtime background information on target employers.
- 👤 **Dynamic Profile Enrichment**: Automatically detects new experience or skills from user notes and updates the candidate persona corpus.
- ⚡ **Realtime Model Switching**: Supports multi-provider AI backends including Together AI, Anthropic Claude, and OpenAI APIs.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server API Routes)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, CSS Glassmorphism & Micro-animations
- **Database / Cache**: Redis (Upstash Redis / Vercel KV)
- **AI Integrations**: Together AI API, Anthropic API, OpenAI API, Exa.ai API
- **Deployment**: Vercel Serverless

---

## ⚙️ Environment Variables & Configuration

Copy `.env.example` to `.env.local` and set the appropriate credentials:

```bash
# Redis Storage (Upstash or Vercel KV)
KV_REST_API_URL="https://your-upstash-redis-url.upstash.io"
KV_REST_API_TOKEN="your-upstash-redis-token"

# AI Model Provider API Keys
TOGETHER_API_KEY="your-together-ai-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"      # Optional fallback provider
OPENAI_API_KEY="your-openai-api-key"            # Optional fallback provider
EXA_API_KEY="your-exa-api-key"                  # Optional company research provider

# App Authentication Secret
AUTH_SECRET="your-random-jwt-secret-key"
```

> ⚠️ **Security Notice**: Never commit actual API keys or secrets to git. All credentials should be stored securely in your deployment provider's environment settings.

---

## 💻 Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Haus-Nous/-The_White_knight.git
   cd -The_White_knight
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:3000` to view the application.

---

## 🤖 AI Tool Declaration

For details on the generative AI tools used during development and runtime architecture, please refer to [AI_USAGE.md](AI_USAGE.md).