import { NextRequest, NextResponse } from "next/server";
import { searchEvidence, getEvidence } from "@/lib/data";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.trim() === "") {
    return NextResponse.json(getEvidence());
  }
  return NextResponse.json(searchEvidence(q));
}
