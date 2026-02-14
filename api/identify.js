export default async function handler(req, res) {
  // ✅ Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { image, mimeType } = req.body;

    // ✅ Check image exists
    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    // ✅ API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    // ✅ Call Gemini API
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

    // ✅ Handle Gemini API Errors
    if (!response.ok) {
      return res.status(500).json({
        error: "Gemini API Error",
        details: data,
      });
    }

    // ✅ Extract flower name
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
