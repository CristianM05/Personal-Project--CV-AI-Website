import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_LOCAL_TTS_URL = "http://localhost:5002/tts";
const CANDIDATE_AUDIO_KEYS = ["audioUrl", "url", "audio_url", "file", "path"] as const;
const CANDIDATE_BASE64_KEYS = ["audioBase64", "base64", "audio"] as const;

function resolveUrl(candidate: string, baseUrl: string): string {
  try {
    return new URL(candidate, baseUrl).toString();
  } catch {
    return candidate;
  }
}

function pickFirstString(data: unknown, keys: readonly string[]): string | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function extractBase64Payload(value: string): { base64: string; mimeType: string } | null {
  const maybeDataUrl = value.match(/^data:(audio\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (maybeDataUrl) {
    return { mimeType: maybeDataUrl[1], base64: maybeDataUrl[2] };
  }

  if (/^[A-Za-z0-9+/=\r\n]+$/.test(value) && value.length > 64) {
    return { mimeType: "audio/wav", base64: value.replace(/\s+/g, "") };
  }

  return null;
}

async function streamAudioFromUrl(audioUrl: string): Promise<NextResponse> {
  const audioResponse = await fetch(audioUrl, { cache: "no-store" });
  if (!audioResponse.ok) {
    const detail = await audioResponse.text().catch(() => "");
    return NextResponse.json(
      {
        error: "Local TTS returned a URL but audio fetch failed",
        status: audioResponse.status,
        detail,
      },
      { status: 502 }
    );
  }

  const audioType = audioResponse.headers.get("content-type") || "audio/wav";
  const audioBuffer = await audioResponse.arrayBuffer();
  return new NextResponse(audioBuffer, {
    status: 200,
    headers: {
      "Content-Type": audioType,
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const text = typeof payload?.text === "string" ? payload.text.trim() : "";

    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const localTtsUrl = process.env.LOCAL_TTS_URL || DEFAULT_LOCAL_TTS_URL;
    const localResponse = await fetch(localTtsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...payload, text }),
      cache: "no-store",
    });

    if (!localResponse.ok) {
      const detail = await localResponse.text().catch(() => "");
      return NextResponse.json(
        {
          error: "Local TTS request failed",
          status: localResponse.status,
          detail,
        },
        { status: 502 }
      );
    }

    const contentType = (localResponse.headers.get("content-type") || "").toLowerCase();
    const isDirectAudio = contentType.startsWith("audio/") || contentType.includes("octet-stream");

    if (isDirectAudio) {
      const audioBuffer = await localResponse.arrayBuffer();
      return new NextResponse(audioBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType || "audio/wav",
          "Cache-Control": "no-store",
        },
      });
    }

    if (contentType.includes("application/json")) {
      const body = await localResponse.json();

      const base64Raw = pickFirstString(body, CANDIDATE_BASE64_KEYS);
      if (base64Raw) {
        const parsed = extractBase64Payload(base64Raw);
        if (parsed) {
          const binary = Buffer.from(parsed.base64, "base64");
          return new NextResponse(binary, {
            status: 200,
            headers: {
              "Content-Type": parsed.mimeType,
              "Cache-Control": "no-store",
            },
          });
        }
      }

      const audioRef = pickFirstString(body, CANDIDATE_AUDIO_KEYS);
      if (audioRef) {
        const resolvedUrl = resolveUrl(audioRef, localTtsUrl);
        return streamAudioFromUrl(resolvedUrl);
      }

      return NextResponse.json(
        {
          error: "Local TTS JSON response did not include audio data",
        },
        { status: 502 }
      );
    }

    const unknownBody = await localResponse.arrayBuffer();
    return new NextResponse(unknownBody, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("TTS proxy error:", error);
    return NextResponse.json({ error: "Failed to synthesize speech" }, { status: 500 });
  }
}
