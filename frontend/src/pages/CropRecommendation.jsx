import { useState } from "react";

export default function CropRecommendation() {
  const [form, setForm] = useState({
    N: "",
    P: "",
    K: "",
    ph: "",
    rainfall: ""
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const response = await fetch("http://localhost:5000/predict-crop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        temperature: 28,   // from Layer 1 later
        humidity: 60       // from Layer 1 later
      })
    });

    const data = await response.json();
    setResult(data.recommended_crop);
  };

  return (
    <div>
      <h2>Crop Recommendation</h2>

      {["N", "P", "K", "ph", "rainfall"].map((field) => (
        <input
          key={field}
          name={field}
          placeholder={field}
          value={form[field]}
          onChange={handleChange}
        />
      ))}

      <button onClick={handleSubmit}>Predict</button>

      {result && <h3>Recommended Crop: {result}</h3>}
    </div>
  );
}
