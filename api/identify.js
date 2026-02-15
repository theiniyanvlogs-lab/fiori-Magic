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

    // ✅ Create FormData for iNaturalist
    const formData = new FormData();
    formData.append(
      "image",
      new Blob([buffer], { type: "image/jpeg" }),
      "flower.jpg"
    );

    // ✅ Call iNaturalist API
    const response = await fetch(
      "https://api.inaturalist.org/v1/computervision/score_image",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    console.log("iNaturalist Response:", data);

    if (!data.results || data.results.length === 0) {
      return res.status(200).json({
        result: "No flower identified",
      });
    }

    // ✅ Best Match
    const top = data.results[0];

    return res.status(200).json({
      result: `${top.taxon.name} (${top.taxon.preferred_common_name})`,
      score: top.score,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Server crashed",
      details: err.message,
    });
  }
}
