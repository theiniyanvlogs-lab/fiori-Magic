export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image received" });
    }

    const hfKey = process.env.HF_API_KEY;

    if (!hfKey) {
      return res.status(500).json({ error: "HF_API_KEY missing in Vercel" });
    }

    // ✅ Convert Data URL → Base64 only
    const base64 = image.split(",")[1];

    // ✅ Call Hugging Face Router API
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/julien-c/flower-classification",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: image, // ✅ Send full Data URL
        }),
      }
    );

    const data = await response.json();

    console.log("HF RAW Response:", data);

    // ✅ If Hugging Face returns error
    if (data.error) {
      return res.status(500).json({
        error: "Hugging Face Error",
        details: data.error,
      });
    }

    // ✅ Output label
    return res.status(200).json({
      result: data?.[0]?.label || "Unknown Flower",
    });
  } catch (err) {
    return res.status(500).json({
      error: "Server crashed",
      details: err.message,
    });
  }
}
