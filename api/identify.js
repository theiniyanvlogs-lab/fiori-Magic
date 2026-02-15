export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image received" });
    }

    // ✅ Convert Base64 → Blob
    const base64Data = image.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    // ✅ Create native FormData (no package)
    const formData = new FormData();

    // ⭐ Correct field name = "image"
    formData.append(
      "image",
      new Blob([buffer], { type: "image/jpeg" }),
      "flower.jpg"
    );

    // ✅ Call iNaturalist FREE API
    const response = await fetch(
      "https://api.inaturalist.org/v1/computervision/score_image",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    console.log("iNaturalist Response:", data);

    // ✅ Extract Flower Name
    const flower =
      data?.results?.[0]?.taxon?.preferred_common_name ||
      data?.results?.[0]?.taxon?.name;

    return res.status(200).json({
      result: flower || "No flower identified 😢",
    });
  } catch (err) {
    return res.status(500).json({
      error: "Server crashed",
      details: err.message,
    });
  }
}
