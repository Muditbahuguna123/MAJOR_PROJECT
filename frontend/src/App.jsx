import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import CropRecommendation from "./pages/CropRecommendation";

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
      </div>

      {page === "dashboard" && <Dashboard />}
      {page === "crop" && <CropRecommendation />}
    </div>
  );
}

export default App;
