import { useState } from "react";

export default function DiseaseDetection() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:5000/disease/detect", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Prediction failed.");
        return;
      }

      setResult(data);
    } catch {
      setError("Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Crop Disease Detection</h2>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Detecting..." : "Detect Disease"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div>
          <h3>Disease: {result.disease}</h3>
          <p>Confidence: {(result.confidence * 100).toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
}
