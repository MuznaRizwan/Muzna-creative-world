import { NextResponse } from "next/server";

/** @param {import("next/server").NextRequest} req */
export async function POST(req) {
  try {
    // Ingest route to populate knowledge base documents into Supabase pgvector
    // Requires SUPABASE_SERVICE_ROLE_KEY and OPENAI_API_KEY
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      status: "ready",
      message: "Knowledge base ingestion endpoint ready for vector embeddings.",
    });
  } catch (error) {
    console.error("Ingest API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
