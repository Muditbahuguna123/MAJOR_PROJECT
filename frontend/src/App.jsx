import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import CropRecommendation from "./pages/CropRecommendation";
import DiseaseDetection from "./pages/DiseaseDetection";

function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div>
      <div style={{ padding: "10px", background: "#eee" }}>
        <button onClick={() => setPage("dashboard")}>
          Dashboard
        </button>
        <button onClick={() => setPage("crop")}>
          Crop Recommendation
        </button>
        <button onClick={() => setPage("disease")}>
          Disease Detection
        </button>
      </div>

      {page === "dashboard" && <Dashboard />}
      {page === "crop" && <CropRecommendation />}
      {page === "disease" && <DiseaseDetection />}
    </div>
  );
}

export default App;
