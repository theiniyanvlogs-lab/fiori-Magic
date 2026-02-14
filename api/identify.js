export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { image, mimeType } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;

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
                  mimeType: mimeType,
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

  const flowerText =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  return res.status(200).json({
    result: flowerText || "No flower identified",
  });
}
