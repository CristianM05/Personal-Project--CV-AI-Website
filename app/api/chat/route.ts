import { NextRequest, NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/chat-engine";

export async function POST(req: NextRequest) {
  try {
    const { message, mode = "normal" } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }
    const result = await generateChatResponse(message, mode);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
