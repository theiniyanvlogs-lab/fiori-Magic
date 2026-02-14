import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // ✅ Receive image + mimeType from frontend
    const { image, mimeType } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    // ✅ Image size protection
    if (!image || image.length > 3_000_000) {
      return NextResponse.json(
        { error: "Image too large. Upload smaller flower image." },
        { status: 400 }
      );
    }

    // ✅ Timeout Controller (Fix Infinite Loading)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    // ✅ Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: "Identify this flower. Reply only flower name." },
                {
                  inlineData: {
                    // ✅ FIX: Supports JPG + PNG automatically
                    mimeType: mimeType || "image/jpeg",
                    data: image,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    clearTimeout(timeout);

    const data = await response.json();

    console.log("Gemini Response:", data);

    // ✅ If Gemini returns error
    if (data.error) {
      return NextResponse.json(
        { error: data.error.message },
        { status: 500 }
      );
    }

    // ✅ Extract Flower Name
    const flowerText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({
      result: flowerText || "No flower identified",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Request failed or timed out", details: err.message },
      { status: 500 }
    );
  }
}
