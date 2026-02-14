import { useState } from "react";

export default function App() {
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState<string>("");

  // Button click function (AI will be added next)
  const handleIdentify = () => {
    if (!image) {
      alert("Please upload a flower image first!");
      return;
    }

    // Temporary output
    setResult("🌼 Identifying flower... (Gemini AI will be connected next)");
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
        style={{
          padding: "14px 30px",
          backgroundColor: "#0f9d58",
          color: "white",
          border: "none",
          borderRadius: "12px",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        Identify Flower 🌼
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
          }}
        >
          {result}
        </div>
      )}
    </div>
  );
}
