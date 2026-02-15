import { useState } from "react";

export default function App() {
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleIdentify = async () => {
    if (!image) {
      alert("Upload a flower image first!");
      return;
    }

    setLoading(true);
    setResult("🌼 Identifying... Please wait");

    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        const base64 = reader.result?.toString().split(",")[1];

        const res = await fetch("/api/identify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: base64,
            mimeType: image.type, // ✅ JPEG/PNG support
          }),
        });

        const data = await res.json();

        if (data.result) {
          setResult("🌸 Flower Identified:\n\n" + data.result);
        } else {
          setResult("❌ " + (data.error || "No flower found"));
        }
      } catch (err) {
        setResult("❌ Error identifying flower");
      }

      setLoading(false);
    };

    reader.readAsDataURL(image);
  };

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>🌸 Trova Fiori</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
      />

      {image && (
        <p>
          ✅ Selected: <b>{image.name}</b>
          <br />
          📌 Type: <b>{image.type}</b>
        </p>
      )}

      <button
        onClick={handleIdentify}
        disabled={loading}
        style={{
          padding: "14px 30px",
          marginTop: 20,
          backgroundColor: loading ? "gray" : "#0f9d58",
          color: "white",
          border: "none",
          borderRadius: 12,
        }}
      >
        {loading ? "Identifying..." : "Identify Flower 🌼"}
      </button>

      {result && (
        <div
          style={{
            marginTop: 30,
            padding: 20,
            background: "#f0fdf4",
            borderRadius: 12,
            whiteSpace: "pre-line",
          }}
        >
          {result}
        </div>
      )}
    </div>
  );
}
