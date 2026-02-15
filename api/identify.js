import FormData from "form-data";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image received" });
    }

    // ✅ Convert Base64 → Buffer
    const base64Data = image.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    // ✅ Node FormData (works in Vercel)
    const form = new FormData();
    form.append("image", buffer, {
      filename: "flower.jpg",
      contentType: "image/jpeg",
    });

    // ✅ Call iNaturalist Free API
    const response = await fetch(
      "https://api.inaturalist.org/v1/computervision/score_image",
      {
        method: "POST",
        body: form,
        headers: form.getHeaders(),
      }
    );

    const data = await response.json();

    console.log("iNaturalist Response:", data);

    // ❌ No results
    if (!data.results || data.results.length === 0) {
      return res.json({ result: "No flower identified" });
    }

    // ✅ Best match
    const top = data.results[0];

    return res.json({
      result: `${top.taxon.preferred_common_name} (${top.taxon.name})`,
      score: top.score,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Server crashed",
      details: err.message,
    });
  }
}
