export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { image } = req.body;

    const hfKey = process.env.HF_API_KEY;
    if (!hfKey) {
      return res.status(500).json({ error: "Missing HF_API_KEY" });
    }

    // ✅ Flower-Specific Model
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/julien-c/flower-classification",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: image,
        }),
      }
    );

    const result = await response.json();

    console.log("HF Result:", result);

    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    // ✅ Best Prediction
    const flowerName =
      result?.[0]?.label || "No flower identified";

    return res.status(200).json({
      result: flowerName,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
}
