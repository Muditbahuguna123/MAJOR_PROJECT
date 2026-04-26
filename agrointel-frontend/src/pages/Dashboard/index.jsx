import { useState, useEffect, useCallback } from 'react';
import {
  Thermometer, Droplets, CloudRain, Sun, Wind, FlaskConical,
  Sprout, Waves, RefreshCw, AlertTriangle, CheckCircle2
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import StatCard from '../../components/StatCard';
import { getSensorData, getSensorHistory, simulateSensor, getCropRecommendation, getIrrigationPrediction } from '../../api';
import './Dashboard.css';

const MOCK_HISTORY = Array.from({ length: 30 }, (_, i) => ({
  time: `${i * 10}m`,
  temperature: 24 + Math.sin(i * 0.4) * 6 + Math.random() * 2,
  humidity: 62 + Math.cos(i * 0.3) * 12 + Math.random() * 3,
  soil_moisture: 45 + Math.sin(i * 0.5) * 10 + Math.random() * 4,
}));

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
  const [history, setHistory] = useState(MOCK_HISTORY);
  const [prediction, setPrediction] = useState(null);
  const [irrigation, setIrrigation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [sensorRes, histRes] = await Promise.all([
        getSensorData(),
        getSensorHistory(40),
      ]);
      setSensor(sensorRes);
      if (histRes?.length) setHistory(histRes);

      // Run ML predictions with sensor data
      const d = sensorRes;
      const [cropRes, irrRes] = await Promise.all([
        getCropRecommendation({
          N: d.nitrogen ?? 50,
          P: d.phosphorus ?? 40,
          K: d.potassium ?? 35,
          temperature: d.temperature,
          humidity: d.humidity,
          ph: d.soil_ph,
          rainfall: d.rainfall_mm,
        }),
        getIrrigationPrediction({
          temperature: d.temperature,
          humidity: d.humidity,
          soil_moisture: d.soil_moisture,
          rainfall: d.rainfall_mm,
          sunlight_hours: d.sunlight_hours,
          wind_speed_kmh: d.wind_speed_kmh,
          soil_ph: d.soil_ph,
        }),
      ]);
      setPrediction(cropRes);
      setIrrigation(irrRes);
    } catch (e) {
      setError(e.message);
      // Use mock data so the UI is still usable
      setSensor({
        temperature: 28.4,
        humidity: 67,
        soil_moisture: 42,
        rainfall_mm: 12,
        sunlight_hours: 6.5,
        wind_speed_kmh: 14,
        soil_ph: 6.8,
      });
      setPrediction({ crop: 'Wheat', confidence: 0.91 });
      setIrrigation({ irrigation_needed: false, confidence: 0.87 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(fetchData, 30000);
    return () => clearInterval(id);
  }, [fetchData]);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      await simulateSensor();
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

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
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={handleSimulate} disabled={simulating}>
            <RefreshCw size={14} className={simulating ? 'spin' : ''} />
            {simulating ? 'Simulating…' : 'Use Simulated Data'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertTriangle size={14} />
          Backend unreachable — showing demo data. Start Flask with <code>python app.py</code>
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
      </div>
    </div>
  );
}
