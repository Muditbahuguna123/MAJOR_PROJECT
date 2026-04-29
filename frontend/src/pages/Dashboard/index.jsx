import { useState, useEffect, useCallback } from 'react';
import {
  Thermometer, Droplets, CloudRain, Sun, Wind, FlaskConical,
  Sprout, Waves, AlertTriangle, CheckCircle2
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import StatCard from '../../components/StatCard';
import { getSensorData, getSensorHistory, getCropRecommendation, getIrrigationPrediction } from '../../api';
import './Dashboard.css';

const REFRESH_INTERVAL_MS = 3000;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <strong>{p.value?.toFixed(1)}</strong>
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [sensor, setSensor] = useState(null);
  const [history, setHistory] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [irrigation, setIrrigation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const [sensorResult, histResult] = await Promise.allSettled([
        getSensorData(),
        getSensorHistory(40),
      ]);

      if (sensorResult.status === 'fulfilled') {
        const sensorRes = sensorResult.value;
        setSensor(sensorRes);

        const [cropRes, irrRes] = await Promise.all([
          getCropRecommendation({
            N: sensorRes.nitrogen ?? 50,
            P: sensorRes.phosphorus ?? 40,
            K: sensorRes.potassium ?? 35,
            temperature: sensorRes.temperature,
            humidity: sensorRes.humidity,
            ph: sensorRes.soil_ph,
            rainfall: sensorRes.rainfall_mm,
          }),
          getIrrigationPrediction({
            temperature: sensorRes.temperature,
            humidity: sensorRes.humidity,
            soil_moisture: sensorRes.soil_moisture,
            rainfall: sensorRes.rainfall_mm,
            sunlight_hours: sensorRes.sunlight_hours,
            wind_speed_kmh: sensorRes.wind_speed_kmh,
            soil_ph: sensorRes.soil_ph,
          }),
        ]);
        setPrediction(cropRes);
        setIrrigation(irrRes);
      } else {
        setSensor(null);
        setPrediction(null);
        setIrrigation(null);
        setError(sensorResult.reason?.message || 'No sensor data available');
      }

      if (histResult.status === 'fulfilled' && histResult.value?.length) {
        setHistory(histResult.value);
      } else if (histResult.status === 'fulfilled') {
        setHistory([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Poll the backend every few seconds so the dashboard feels live.
  useEffect(() => {
    const id = setInterval(fetchData, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchData]);

  const s = sensor || {};
  const needsIrrigation = irrigation?.irrigation_needed ?? irrigation?.prediction === 'Yes';

  return (
    <div className="fade-up">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Live environmental monitoring &amp; predictions</p>
        </div>

      </div>

      {error && (
        <div className="error-banner">
          <AlertTriangle size={14} />
          {error}
        </div>
      )}

      {/* Prediction Cards */}
      <div className="prediction-row">
        <div className="prediction-card prediction-crop">
          <div className="pred-label">Recommended Crop</div>
          <div className="pred-main">
            <Sprout size={20} />
            <span>{prediction?.crop ?? '—'}</span>
          </div>
          {prediction?.confidence && (
            <div className="pred-confidence">
              <div className="conf-bar">
                <div className="conf-fill" style={{ width: `${(prediction.confidence * 100).toFixed(0)}%` }} />
              </div>
              <span>{(prediction.confidence * 100).toFixed(0)}% confidence</span>
            </div>
          )}
        </div>

        <div className={`prediction-card prediction-irrigation ${needsIrrigation ? 'needs-water' : 'no-water'}`}>
          <div className="pred-label">Irrigation Status</div>
          <div className="pred-main">
            {needsIrrigation
              ? <><Waves size={20} /><span>Needs Irrigation</span></>
              : <><CheckCircle2 size={20} /><span>No Irrigation Needed</span></>}
          </div>
          <p className="pred-sub">
            {needsIrrigation ? 'Soil moisture below optimal threshold' : 'Moisture levels are sufficient'}
          </p>
        </div>

        <div className="prediction-card prediction-stress">
          <div className="pred-label">Crop Stress Level</div>
          <div className="pred-main">
            <span className={`stress-badge ${s.soil_moisture < 30 || s.temperature > 38 ? 'high' : s.humidity < 40 ? 'moderate' : 'low'}`}>
              {s.soil_moisture < 30 || s.temperature > 38 ? 'High Stress' : s.humidity < 40 ? 'Moderate' : 'Healthy'}
            </span>
          </div>
          <p className="pred-sub">Based on current sensor parameters</p>
        </div>
      </div>

      {/* Sensor Stats */}
      <h2 className="section-title">Live Sensor Readings</h2>
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <StatCard icon={Thermometer} label="Temperature" value={s.temperature?.toFixed(1)} unit="°C" color="amber" />
        <StatCard icon={Droplets} label="Humidity" value={s.humidity?.toFixed(0)} unit="%" color="blue" />
        <StatCard icon={FlaskConical} label="Soil Moisture" value={s.soil_moisture?.toFixed(0)} unit="%" color="green" />
        <StatCard icon={CloudRain} label="Rainfall" value={s.rainfall_mm?.toFixed(1)} unit="mm" color="blue" />
        <StatCard icon={Sun} label="Sunlight Hours" value={s.sunlight_hours?.toFixed(1)} unit="hrs" color="amber" />
        <StatCard icon={Wind} label="Wind Speed" value={s.wind_speed_kmh?.toFixed(0)} unit="km/h" color="green" />
      </div>

      {/* Trend Chart */}
      <h2 className="section-title">Trends — Last 7 Days</h2>
      <div className="card chart-card">
        {history.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={history} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="temperature" stroke="var(--amber)" strokeWidth={1.5} dot={false} name="Temp (°C)" />
                <Line type="monotone" dataKey="humidity" stroke="var(--blue)" strokeWidth={1.5} dot={false} name="Humidity (%)" />
                <Line type="monotone" dataKey="soil_moisture" stroke="var(--green)" strokeWidth={1.5} dot={false} name="Soil Moisture (%)" />
              </LineChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              <span style={{ color: 'var(--amber)' }}>● Temp (°C)</span>
              <span style={{ color: 'var(--blue)' }}>● Humidity (%)</span>
              <span style={{ color: 'var(--green)' }}>● Soil Moisture (%)</span>
            </div>
          </>
        ) : (
          <div className="log-empty">
            <p>No sensor history available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
