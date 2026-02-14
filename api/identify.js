const response = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: "What flower is this? Reply only name." },
            {
              inline_data: {
                mime_type: mimeType,
                data: image,
              },
            },
          ],
        },
      ],
    }),
  }
);
