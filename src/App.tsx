import { useState } from "react";

export default function App() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Identify Flower (Hugging Face API)
  const handleIdentify = async () => {
    if (!image) {
      alert("🌸 Please upload a flower image first!");
      return;
    }

    // ✅ Image size limit (3MB)
    if (image.size > 3_000_000) {
      alert("❌ Image too large. Please upload below 3MB.");
      return;
    }

    setLoading(true);
    setResult("🌼 Identifying flower... Please wait");

    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        // ✅ Hugging Face needs FULL base64 Data URL
        const base64 = reader.result?.toString();

        // ✅ Call Backend API
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

        console.log("Hugging Face Response:", data);

        // ✅ Show Result
        if (data.result) {
          setResult("🌸 Flower Identified:\n\n" + data.result);
        } else {
          setResult("❌ " + (data.error || "No flower identified"));
        }
      } catch (err) {
        console.error(err);
        setResult("❌ Server error. Please try again.");
      }

      setLoading(false);
    };

    reader.readAsDataURL(image);
  };

  // ✅ Handle File Upload
  const handleFileChange = (file: File | null) => {
    setImage(file);
    setResult("");

    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "sans-serif",
        textAlign: "center",
      }}
    >
      {/* Title */}
      <h1 style={{ fontSize: "34px" }}>🌸 Trova Fiori</h1>
      <p style={{ fontSize: "18px", marginBottom: "25px" }}>
        Upload a flower image and identify it using Hugging Face AI.
      </p>

      {/* Upload Input */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
      />

      {/* Selected File Info */}
      {image && (
        <p style={{ marginTop: "15px" }}>
          ✅ Selected: <b>{image.name}</b>
          <br />
          📌 Type: <b>{image.type}</b>
        </p>
      )}

      {/* Image Preview */}
      {preview && (
        <div style={{ marginTop: "20px" }}>
          <img
            src={preview}
            alt="Flower Preview"
            style={{
              width: "200px",
              borderRadius: "15px",
              boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            }}
          />
        </div>
      )}

      {/* Identify Button */}
      <button
        onClick={handleIdentify}
        disabled={loading}
        style={{
          padding: "14px 35px",
          marginTop: "25px",
          backgroundColor: loading ? "gray" : "#0f9d58",
          color: "white",
          fontSize: "18px",
          border: "none",
          borderRadius: "14px",
          cursor: "pointer",
        }}
      >
        {loading ? "⏳ Identifying..." : "Identify Flower 🌼"}
      </button>

      {/* Result Output */}
      {result && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            background: "#f0fdf4",
            borderRadius: "15px",
            fontSize: "18px",
            whiteSpace: "pre-line",
            border: "1px solid #cce7d0",
          }}
        >
          {result}
        </div>
      )}
    </div>
  );
}
