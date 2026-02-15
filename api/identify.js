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

    // ✅ Prepare FormData for iNaturalist
    const form = new FormData();

    // ⭐ Correct field name = "image"
    form.append("image", buffer, {
      filename: "flower.jpg",
      contentType: "image/jpeg",
    });

    // ✅ Call iNaturalist Vision API (FREE)
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

    // ✅ Extract Flower Name
    const flower =
      data?.results?.[0]?.taxon?.preferred_common_name ||
      data?.results?.[0]?.taxon?.name;

    if (!flower) {
      return res.status(200).json({
        result: "No flower identified 😢",
      });
    }

    return res.status(200).json({
      result: flower,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Server crashed",
      details: err.message,
    });
  }
}
