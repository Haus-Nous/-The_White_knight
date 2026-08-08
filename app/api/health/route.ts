import { NextResponse } from "next/server";
import { chat } from "../../../lib/ai-client";

export const runtime = "nodejs";

export async function GET() {
  const results: Record<string, any> = {
    env: {
      GROQ_API_KEY: process.env.GROQ_API_KEY ? `set (${process.env.GROQ_API_KEY.slice(0, 6)}...)` : "not set",
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? `set (${process.env.OPENROUTER_API_KEY.slice(0, 6)}...)` : "not set",
      TOGETHER_API_KEY: process.env.TOGETHER_API_KEY ? `set (${process.env.TOGETHER_API_KEY.slice(0, 6)}...)` : "not set",
      AI_MODEL: process.env.AI_MODEL ?? "default",
    },
    modelTest: null,
    error: null,
  };

  try {
    const reply = await chat(
      [{ role: "user", content: "Reply with exactly: OK" }],
      { temperature: 0, maxTokens: 10 }
    );
    results.modelTest = { success: true, reply };
  } catch (e: any) {
    results.error = e.message;
  }

  const allGood = !results.error && results.modelTest?.success;
  return NextResponse.json(results, { status: allGood ? 200 : 500 });
}
