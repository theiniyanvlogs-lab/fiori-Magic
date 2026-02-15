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
      return res.status(500).json({ error: "Missing HF_API_KEY in Vercel" });
    }

    // ✅ Convert Base64 → Buffer
    const base64Data = image.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    // ✅ Use Stable Working Model
    const MODEL =
      "nateraw/flower-classification";

    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfKey}`,
          "Content-Type": "application/octet-stream",
        },
        body: buffer,
      }
    );

    const data = await response.json();

    console.log("HF Response:", data);

    if (!response.ok) {
      return res.status(500).json({
        error: "Hugging Face Request Failed",
        details: data,
      });
    }

    // ✅ Best Prediction
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
