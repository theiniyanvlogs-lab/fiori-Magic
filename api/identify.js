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

    // ✅ API Key check
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    // ✅ Timeout Controller (Fix stuck loading)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20 sec

    // ✅ Correct Gemini Vision Model (Latest Working)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Identify this flower. Reply only the flower name.",
                },
                {
                  inlineData: {
                    mimeType: mimeType || "image/jpeg", // ✅ JPG + PNG supported
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

    // ✅ Gemini API Error Handling
    if (data.error) {
      return res.status(500).json({
        error: data.error.message || "Gemini API Error",
      });
    }

    // ✅ Extract Result
    const flowerName =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return res.status(200).json({
      result: flowerName?.trim() || "No flower identified",
    });
  } catch (err) {
    return res.status(500).json({
      error: "Request failed or timed out",
      details: err.message,
    });
  }
}
