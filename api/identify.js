export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    const HF_KEY = process.env.HF_API_KEY;

    if (!HF_KEY) {
      return res.status(500).json({ error: "Missing HF_API_KEY" });
    }

    // Convert base64 → binary buffer
    const buffer = Buffer.from(image, "base64");

    const response = await fetch(
      "https://api-inference.huggingface.co/models/nateraw/flower-classification",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_KEY}`,
        },
        body: buffer,
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    // Best prediction
    const flower = data?.[0]?.label;

    return res.status(200).json({
      result: flower || "Flower not identified",
    });
  } catch (err) {
    return res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
}
