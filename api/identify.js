export default async function handler(req, res) {
  // ✅ GET Test
  if (req.method === "GET") {
    return res.status(200).send("API Working ✅ Use POST");
  }

  // ✅ Only POST Allowed
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { image, mimeType } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    // ✅ Define apiKey properly
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Missing GEMINI_API_KEY in Vercel Environment Variables",
      });
    }

    // ✅ Gemini API Call
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: "Identify this flower. Reply only flower name." },
                {
                  inlineData: {
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

    const data = await response.json();

    // ✅ Gemini Error Handling
    if (!response.ok) {
      return res.status(500).json({
        error: "Gemini API Error",
        details: data,
      });
    }

    // ✅ Extract Result
    const flowerText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return res.status(200).json({
      result: flowerText || "No flower identified",
    });
  } catch (err) {
    return res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
}
