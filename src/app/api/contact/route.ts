import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required fields" },
        { status: 400 }
      );
    }

    // Placeholder: Resend API dispatch will be called here
    // Example:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({ ... });

    return NextResponse.json({
      success: true,
      message: "Contact inquiry received successfully (stub mode). Configure RESEND_API_KEY in .env.local to dispatch real emails.",
    });
  } catch (error) {
    console.error("Contact API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
