import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { getAnalytics, getSensorHistory } from '../../api';
import './Analytics.css';

// Mock data used when backend is offline
const MOCK_WEEKLY = Array.from({ length: 7 }, (_, i) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return {
    day: days[i],
    temperature: 22 + Math.random() * 12,
    humidity: 55 + Math.random() * 25,
    soil_moisture: 35 + Math.random() * 30,
    rainfall: Math.random() * 20,
    sunlight_hours: 4 + Math.random() * 6,
    wind_speed_kmh: 5 + Math.random() * 20,
    soil_ph: 5.8 + Math.random() * 2,
  };
});

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color || p.fill }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [weeklyData, setWeeklyData] = useState(MOCK_WEEKLY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [analytics, history] = await Promise.all([getAnalytics(), getSensorHistory(50)]);
        if (history?.length) {
          const mapped = history.slice(-7).map((d, i) => ({
            day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i % 7],
            temperature: d.temperature,
            humidity: d.humidity,
            soil_moisture: d.soil_moisture,
            rainfall: d.rainfall_mm,
            sunlight_hours: d.sunlight_hours,
            wind_speed_kmh: d.wind_speed_kmh,
            soil_ph: d.soil_ph,
          }));
          setWeeklyData(mapped);
        }
      } catch {
        // use mock data
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const avg = (key) =>
    (weeklyData.reduce((a, d) => a + (d[key] || 0), 0) / weeklyData.length).toFixed(1);

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Real-time prediction metrics from your backend</p>
      </div>

      {/* Row 1 — Temperature & Humidity | Soil Moisture & Rainfall */}
      <div className="analytics-grid-2">
        <div className="card">
          <h3 className="chart-title">Temperature &amp; Humidity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--amber)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--amber)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--blue)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="temperature" stroke="var(--amber)" fill="url(#tempGrad)" strokeWidth={1.5} name="Temp °C" />
              <Area type="monotone" dataKey="humidity" stroke="var(--blue)" fill="url(#humGrad)" strokeWidth={1.5} name="Humidity %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="chart-title">Soil Moisture &amp; Rainfall</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="soil_moisture" fill="var(--green)" radius={[3, 3, 0, 0]} name="Soil Moisture %" />
              <Bar dataKey="rainfall" fill="var(--blue)" radius={[3, 3, 0, 0]} name="Rainfall mm" opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 — Sunlight Hours | Wind Speed */}
      <div className="analytics-grid-2">
        <div className="card">
          <h3 className="chart-title">Sunlight Hours</h3>
          <div className="chart-stat-badge">
            <span className="chart-stat-val" style={{ color: 'var(--amber)' }}>{avg('sunlight_hours')}</span>
            <span className="chart-stat-unit">hrs avg / day</span>
          </div>
          <ResponsiveContainer width="100%" height={175}>
            <AreaChart data={weeklyData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="sunGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--amber)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--amber)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={[0, 12]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="sunlight_hours" stroke="var(--amber)" fill="url(#sunGrad)" strokeWidth={2} name="Sunlight hrs" dot={{ fill: 'var(--amber)', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="chart-title">Wind Speed</h3>
          <div className="chart-stat-badge">
            <span className="chart-stat-val" style={{ color: 'var(--blue)' }}>{avg('wind_speed_kmh')}</span>
            <span className="chart-stat-unit">km/h avg</span>
          </div>
          <ResponsiveContainer width="100%" height={175}>
            <LineChart data={weeklyData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="wind_speed_kmh" stroke="var(--blue)" strokeWidth={2} dot={{ fill: 'var(--blue)', r: 3 }} name="Wind km/h" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3 — Soil pH | Irrigation Need */}
      <div className="analytics-grid-2">
        <div className="card">
          <h3 className="chart-title">Soil pH</h3>
          <div className="chart-stat-badge">
            <span className="chart-stat-val" style={{ color: 'var(--green)' }}>{avg('soil_ph')}</span>
            <span className="chart-stat-unit">pH avg</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weeklyData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="phGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--green)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--green)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={[4, 9]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="soil_ph" stroke="var(--green)" fill="url(#phGrad)" strokeWidth={2} name="Soil pH" dot={{ fill: 'var(--green)', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="ph-legend">
            <span className="ph-tag acidic">Acidic &lt;6</span>
            <span className="ph-tag neutral">Neutral 6–7.5</span>
            <span className="ph-tag alkaline">Alkaline &gt;7.5</span>
          </div>
        </div>

        <div className="card">
          <h3 className="chart-title">Avg Soil Moisture</h3>
          <div className="chart-stat-badge">
            <span className="chart-stat-val" style={{ color: 'var(--green)' }}>{avg('soil_moisture')}%</span>
            <span className="chart-stat-unit">avg / last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--green)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--green)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="soil_moisture" stroke="var(--green)" fill="url(#soilGrad)" strokeWidth={2} name="Soil Moisture %" dot={{ fill: 'var(--green)', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4 — All Parameters Overview (full width) */}
      <div className="card">
        <h3 className="chart-title">All Parameters — Performance Over Time</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={weeklyData} margin={{ top: 8, right: 16, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
            <Line type="monotone" dataKey="soil_moisture" stroke="var(--green)" strokeWidth={2} dot={false} name="Soil Moisture %" />
            <Line type="monotone" dataKey="temperature" stroke="var(--amber)" strokeWidth={2} dot={false} strokeDasharray="4 2" name="Temp °C" />
            <Line type="monotone" dataKey="sunlight_hours" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="2 3" name="Sunlight hrs" />
            <Line type="monotone" dataKey="wind_speed_kmh" stroke="var(--blue)" strokeWidth={1.5} dot={false} name="Wind km/h" />
            <Line type="monotone" dataKey="soil_ph" stroke="var(--red)" strokeWidth={1.5} dot={false} strokeDasharray="6 2" name="Soil pH" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
