import { useState } from "react";

export default function App() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Identify Flower Button Click
  const handleIdentify = async () => {
    if (!image) {
      alert("🌸 Please upload a flower image first!");
      return;
    }

    // ✅ Limit image size
    if (image.size > 3_000_000) {
      alert("❌ Image too large. Upload below 3MB.");
      return;
    }

    setLoading(true);
    setResult("🌼 Identifying flower... Please wait");

    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        // ✅ FULL Base64 Data URL
        const base64 = reader.result?.toString();

        // ✅ Send request to backend
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

        console.log("API Response:", data);

        // ✅ Show error if backend fails
        if (!res.ok) {
          setResult("❌ Error: " + (data.error || "Server Failed"));
          setLoading(false);
          return;
        }

        // ✅ Show Flower Result
        if (data.result) {
          setResult("🌸 Flower Identified:\n\n" + data.result);
        } else {
          setResult("❌ No flower identified.");
        }
      } catch (err) {
        console.error(err);
        setResult("❌ Server error. Please try again.");
      }

      setLoading(false);
    };

    reader.readAsDataURL(image);
  };

  // ✅ Handle Upload
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
        fontFamily: "Arial",
        textAlign: "center",
      }}
    >
      {/* Title */}
      <h1 style={{ fontSize: "36px" }}>🌸 Trova Fiori</h1>

      <p style={{ fontSize: "18px", marginBottom: "25px" }}>
        Upload a flower image and identify it using Hugging Face AI 🌼
      </p>

      {/* Upload */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
      />

      {/* File Info */}
      {image && (
        <p style={{ marginTop: "15px" }}>
          ✅ Selected: <b>{image.name}</b>
          <br />
          📌 Type: <b>{image.type}</b>
        </p>
      )}

      {/* Preview */}
      {preview && (
        <div style={{ marginTop: "20px" }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              width: "260px",
              borderRadius: "18px",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.25)",
            }}
          />
        </div>
      )}

      {/* Button */}
      <button
        onClick={handleIdentify}
        disabled={loading}
        style={{
          padding: "16px 40px",
          marginTop: "25px",
          backgroundColor: loading ? "gray" : "#0f9d58",
          color: "white",
          fontSize: "20px",
          border: "none",
          borderRadius: "16px",
          cursor: "pointer",
        }}
      >
        {loading ? "⏳ Identifying..." : "Identify Flower 🌼"}
      </button>

      {/* Output */}
      {result && (
        <div
          style={{
            marginTop: "30px",
            padding: "22px",
            background: "#f0fdf4",
            borderRadius: "18px",
            fontSize: "20px",
            whiteSpace: "pre-line",
            border: "2px solid #cce7d0",
          }}
        >
          {result}
        </div>
      )}
    </div>
  );
}
