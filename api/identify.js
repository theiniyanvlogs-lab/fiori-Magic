export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { image } = req.body;

    const token = process.env.HF_API_KEY;

    if (!token) {
      return res.status(500).json({ error: "Missing HF_API_KEY" });
    }

    // Hugging Face flower classification model
    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/resnet-50",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: image,
        }),
      }
    );

    const result = await response.json();

    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    // Best prediction
    const flowerName = result?.[0]?.label;

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
