import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import styles from "./graph.module.css";

const data = [
  { day: "Mon", temp: 26, humidity: 60, soilMoister: 47, rainfall: 12, sunlightHrs: 6.6, windSpeed: 14, soilPH: 6.4 },
  { day: "Tue", temp: 28, humidity: 64, soilMoister: 45, rainfall: 11, sunlightHrs: 6.6, windSpeed: 14, soilPH: 6.5 },
  { day: "Wed", temp: 30, humidity: 58, soilMoister: 49, rainfall: 14, sunlightHrs: 6.6, windSpeed: 14, soilPH: 6.6 },
  { day: "Thu", temp: 27, humidity: 70, soilMoister: 43, rainfall: 6, sunlightHrs: 6.7, windSpeed: 14, soilPH: 6.7 },
  { day: "Fri", temp: 29, humidity: 65, soilMoister: 44, rainfall: 9, sunlightHrs: 6.7, windSpeed: 14, soilPH: 6.5 },
  { day: "Sat", temp: 31, humidity: 55, soilMoister: 45, rainfall: 10, sunlightHrs: 6.7, windSpeed: 14, soilPH: 6.8 },
  { day: "Sun", temp: 28, humidity: 67, soilMoister: 44, rainfall: 7, sunlightHrs: 6.7, windSpeed: 14, soilPH: 6.8 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className={styles.tooltipRow}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function DataChart() {
  return (
    <div className={styles.card}>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1c2e23" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: "#5f8a6b", fontFamily: "DM Mono", fontSize: 11 }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tick={{ fill: "#5f8a6b", fontFamily: "DM Mono", fontSize: 10 }}
            axisLine={false} tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontFamily: "DM Mono", fontSize: 11, color: "#5f8a6b", paddingTop: 12 }}
          />
          <Line type="monotone" dataKey="temp" name="Temp (°C)" stroke="#f87171" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#60a5fa" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="soilMoister" name="Soil Moisture" stroke="#fbbf24" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="rainfall" name="Rainfall (mm)" stroke="#38bdf8" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="sunlightHrs" name="Sunlight (hrs)" stroke="#fde047" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="windSpeed" name="Wind Speed" stroke="#a78bfa" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="soilPH" name="Soil pH" stroke="#4ade80" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
