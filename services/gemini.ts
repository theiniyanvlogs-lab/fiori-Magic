import { GoogleGenAI, Type } from "@google/genai";
import { FlowerDetails } from "../types";

/* ✅ Correct Vite Environment Variable */
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("❌ Gemini API Key missing. Add VITE_GEMINI_API_KEY in Vercel.");
}

/* ✅ Gemini Client */
const ai = new GoogleGenAI({
  apiKey: API_KEY,
});

/* ----------------------------------------------------
   ✅ Identify Flower Function
---------------------------------------------------- */
export const identifyFlower = async (
  base64Image: string
): Promise<FlowerDetails> => {
  const model = "gemini-1.5-flash";

  const prompt = `Identify this flower. Provide the following details in JSON:
  - commonName
  - scientificName
  - description (2 sentences)
  - sun
  - soilNeeds
  - bloomsIn
  - naturalHabitat
  - flowerType
  - funFact
  - origin

  If not a flower, return placeholder values.`;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(",")[1] || base64Image,
          },
        },
        { text: prompt },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          commonName: { type: Type.STRING },
          scientificName: { type: Type.STRING },
          description: { type: Type.STRING },
          sun: { type: Type.STRING },
          soilNeeds: { type: Type.STRING },
          bloomsIn: { type: Type.STRING },
          naturalHabitat: { type: Type.STRING },
          flowerType: { type: Type.STRING },
          funFact: { type: Type.STRING },
          origin: { type: Type.STRING },
        },
        required: [
          "commonName",
          "scientificName",
          "description",
          "sun",
          "soilNeeds",
          "bloomsIn",
          "naturalHabitat",
          "flowerType",
          "funFact",
          "origin",
        ],
      },
    },
  });

  return JSON.parse(response.text.trim());
};

/* ----------------------------------------------------
   ✅ Translate Flower Details to Tamil
---------------------------------------------------- */
export const translateDetailsToTamil = async (
  details: FlowerDetails
): Promise<NonNullable<FlowerDetails["tamil"]>> => {
  const model = "gemini-1.5-flash";

  const prompt = `Translate into Tamil (gardening context). Return only JSON:

  Common Name: ${details.commonName}
  Description: ${details.description}
  Sun: ${details.sun}
  Soil Needs: ${details.soilNeeds}
  Blooms In: ${details.bloomsIn}
  Natural Habitat: ${details.naturalHabitat}
  Flower Type: ${details.flowerType}
  Fun Fact: ${details.funFact}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          commonName: { type: Type.STRING },
          description: { type: Type.STRING },
          sun: { type: Type.STRING },
          soilNeeds: { type: Type.STRING },
          bloomsIn: { type: Type.STRING },
          naturalHabitat: { type: Type.STRING },
          flowerType: { type: Type.STRING },
          funFact: { type: Type.STRING },
        },
        required: [
          "commonName",
          "description",
          "sun",
          "soilNeeds",
          "bloomsIn",
          "naturalHabitat",
          "flowerType",
          "funFact",
        ],
      },
    },
  });

  return JSON.parse(response.text.trim());
};
