import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Placeholder: RAG logic will embed user question, query Supabase pgvector,
    // and stream or return LLM completion.
    return NextResponse.json({
      reply: `[RAG Chatbot Initialized] Received inquiry: "${message}". Configure OPENAI_API_KEY and SUPABASE credentials in .env.local to enable live semantic vector retrieval.`,
      sources: [],
    });
  } catch (error) {
    console.error("Chat API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
