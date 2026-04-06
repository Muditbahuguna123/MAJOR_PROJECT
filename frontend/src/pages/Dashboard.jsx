import { useEffect, useState } from "react";
import { fetchLayer1Status } from "../api/layer1";
import SensorCard from "../components/SensorCard";
import StressStatus from "../components/StressStatus";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchLayer1Status();
        setData(res);
        setError(null);
      } catch (err) {
        setError("Failed to fetch data");
      }
    };

    fetchData(); // initial load

    const interval = setInterval(fetchData, 5000); // auto-refresh

    return () => clearInterval(interval);
  }, []);

  if (error) return <p>{error}</p>;
  if (!data) return <p>Loading Layer 1 data...</p>;

  if (data.message) return <p>{data.message}</p>;

  return (
    <div style={{ padding: "30px" }}>
      <h1>🌾 Precision Farming – Layer 1</h1>

      <div style={{ display: "flex", gap: "20px" }}>
        <SensorCard
          title="Avg Temperature"
          value={`${data.averages.avg_temperature} °C`}
        />
        <SensorCard
          title="Avg Humidity"
          value={`${data.averages.avg_humidity} %`}
        />
      </div>

      <StressStatus
        stress={data.stress_level}
        irrigation={data.irrigation_signal}
      />
    </div>
  );
}
