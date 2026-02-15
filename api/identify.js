export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image received" });
    }

    const base64Data = image.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    const formData = new FormData();
    formData.append(
      "image",
      new Blob([buffer], { type: "image/jpeg" }),
      "flower.jpg"
    );

    const response = await fetch(
      "https://api.inaturalist.org/v1/computervision/score_image",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    console.log("iNaturalist Response:", data);

    // ✅ If nothing detected
    if (!data.results || data.results.length === 0) {
      return res.status(200).json({
        result: "❌ Could not detect flower. Try a closer photo.",
      });
    }

    // ✅ Top prediction
    const top = data.results[0];

    const flower =
      top.taxon.preferred_common_name ||
      top.taxon.name ||
      "Unknown Flower";

    return res.status(200).json({
      result: `🌸 ${flower}`,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Server crashed",
      details: err.message,
    });
  }
}
