import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "❌ Missing GEMINI_API_KEY in Vercel" },
        { status: 500 }
      );
    }

    // ✅ Call Gemini Model
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Identify this flower. Reply only flower name.",
                },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: image,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    console.log("Gemini Raw Data:", data);

    // ✅ Extract Result Text Safely
    const flowerText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    // ✅ If Gemini returns nothing
    if (!flowerText) {
      return NextResponse.json({
        result: "❌ No flower identified",
      });
    }

    // ✅ Return Clean Output
    return NextResponse.json({
      result: flowerText,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "❌ Server Error", details: err },
      { status: 500 }
    );
  }
}
