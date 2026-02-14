import { useState } from "react";

export default function App() {
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // ✅ Button click function
  const handleIdentify = async () => {
    if (!image) {
      alert("Please upload a flower image first!");
      return;
    }

    setLoading(true);
    setResult("🌼 Identifying flower... Please wait");

    // ✅ Convert image to Base64
    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        const base64 = reader.result?.toString().split(",")[1];

        // ✅ Call Backend API Route
        const res = await fetch("/api/identify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: base64,
          }),
        });

        const data = await res.json();

        console.log("Gemini Response:", data);

        // ✅ Extract flower text from Gemini response
        const flowerText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text;

        setResult(flowerText || "❌ No flower identified");
      } catch (err) {
        console.error("Error:", err);
        setResult("❌ Error identifying flower");
      }

      setLoading(false);
    };

    reader.readAsDataURL(image);
  };

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "sans-serif",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>
        🌸 Trova Fiori
      </h1>

      <p style={{ fontSize: "18px", marginBottom: "30px" }}>
        Upload a flower image and identify it using AI.
      </p>

      {/* Upload Input */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
      />

      <br />
      <br />

      {/* Show selected image name */}
      {image && (
        <p style={{ fontSize: "16px" }}>
          ✅ Selected: <b>{image.name}</b>
        </p>
      )}

      <br />

      {/* Identify Button */}
      <button
        onClick={handleIdentify}
        disabled={loading}
        style={{
          padding: "14px 30px",
          backgroundColor: loading ? "gray" : "#0f9d58",
          color: "white",
          border: "none",
          borderRadius: "12px",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        {loading ? "Identifying..." : "Identify Flower 🌼"}
      </button>

      <br />
      <br />

      {/* Result Output */}
      {result && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            borderRadius: "12px",
            background: "#f0fdf4",
            fontSize: "18px",
            whiteSpace: "pre-line",
          }}
        >
          {result}
        </div>
      )}
    </div>
  );
}
