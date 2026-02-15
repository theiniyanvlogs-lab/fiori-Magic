export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { image } = req.body;

    // ✅ Check Image
    if (!image) {
      return res.status(400).json({ error: "No image received" });
    }

    // ✅ Hugging Face Token
    const hfKey = process.env.HF_API_KEY;

    if (!hfKey) {
      return res.status(500).json({
        error: "Missing HF_API_KEY in Vercel Environment",
      });
    }

    // ✅ Convert Base64 → Binary Buffer
    const base64Data = image.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    // ✅ BEST Flower Classifier Model
    const MODEL =
      "https://router.huggingface.co/hf-inference/models/dima806/flower-classification";

    // ✅ Call Hugging Face API
    const response = await fetch(MODEL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfKey}`,
        "Content-Type": "application/octet-stream",
      },
      body: buffer,
    });

    // ❌ If HF request fails
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({
        error: "Hugging Face Request Failed",
        details: errorText,
      });
    }

    const data = await response.json();

    console.log("HF Raw Response:", data);

    // ❌ Model Loading Case
    if (data.estimated_time) {
      return res.status(503).json({
        error: "Model is loading, please retry in few seconds",
        wait: data.estimated_time,
      });
    }

    // ❌ HF Error Case
    if (data.error) {
      return res.status(500).json({
        error: "Hugging Face Error",
        details: data.error,
      });
    }

    // ✅ Ensure array result
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(500).json({
        error: "Invalid model response",
        details: data,
      });
    }

    // ✅ Best Prediction
    const best = data[0];

    return res.status(200).json({
      result: `${best.label} (${(best.score * 100).toFixed(2)}%)`,
    });
  } catch (err) {
    console.error("SERVER CRASH:", err);

    return res.status(500).json({
      error: "Server crashed",
      details: err.message,
    });
  }
}
