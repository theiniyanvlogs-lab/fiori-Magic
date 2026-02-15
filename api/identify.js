export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { image, mimeType } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    // ✅ Use correct supported model
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Identify this flower. Reply only with flower name.",
                },
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
    if (data.error) {
      return res.status(500).json({
        error: data.error.message,
      });
    }

    // ✅ Extract Result
    const flowerName =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return res.status(200).json({
      result: flowerName || "No flower identified",
    });
  } catch (err) {
    return res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
}
