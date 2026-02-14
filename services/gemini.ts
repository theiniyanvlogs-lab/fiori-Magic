import { GoogleGenAI, Type } from "@google/genai";
import { FlowerDetails } from "../types";

/* ✅ Correct Vite Environment Variable */
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
});

/* ---------------------------------------------------
   ✅ Identify Flower Function
--------------------------------------------------- */
export const identifyFlower = async (
  base64Image: string
): Promise<FlowerDetails> => {
  const model = "gemini-1.5-flash";

  const prompt = `Identify this flower and return ONLY valid JSON with:

  commonName
  scientificName
  description
  sun
  soilNeeds
  bloomsIn
  naturalHabitat
  flowerType
  funFact
  origin`;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(",")[1],
          },
        },
        { text: prompt },
      ],
    },
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text.trim());
};

/* ---------------------------------------------------
   ✅ Translate Tamil Function
--------------------------------------------------- */
export const translateDetailsToTamil = async (
  details: FlowerDetails
): Promise<NonNullable<FlowerDetails["tamil"]>> => {
  const model = "gemini-1.5-flash";

  const prompt = `Translate into Tamil and return ONLY JSON:

  commonName
  description
  sun
  soilNeeds
  bloomsIn
  naturalHabitat
  flowerType
  funFact

  Data:
  ${JSON.stringify(details)}
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text.trim());
};
