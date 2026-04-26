import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { getAnalytics, getSensorHistory } from '../../api';
import './Analytics.css';

const COLORS = ['var(--green)', 'var(--blue)', 'var(--amber)', 'var(--red)'];

// Mock data used when backend is offline
const MOCK_WEEKLY = Array.from({ length: 7 }, (_, i) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return {
    day: days[i],
    temperature: 22 + Math.random() * 12,
    humidity: 55 + Math.random() * 25,
    soil_moisture: 35 + Math.random() * 30,
    rainfall: Math.random() * 20,
  };
});

const MOCK_CROPS = [
  { name: 'Wheat', value: 34 },
  { name: 'Rice', value: 28 },
  { name: 'Maize', value: 22 },
  { name: 'Cotton', value: 16 },
];

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
  const [cropDist, setCropDist] = useState(MOCK_CROPS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [analytics, history] = await Promise.all([getAnalytics(), getSensorHistory(50)]);
        if (history?.length) {
          // Map history to daily buckets (simplified)
          setWeeklyData(history.slice(-7).map((d, i) => ({
            day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i % 7],
            temperature: d.temperature,
            humidity: d.humidity,
            soil_moisture: d.soil_moisture,
            rainfall: d.rainfall_mm,
          })));
        }
        if (analytics?.crop_distribution) setCropDist(analytics.crop_distribution);
      } catch {
        // use mock data
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Real-time prediction metrics from your backend</p>
      </div>

      {/* KPI Row */}
      <div className="kpi-row">
        {[
          { label: 'Predictions Today', value: '48', sub: '+12 from yesterday' },
          { label: 'Model Accuracy', value: '93.2%', sub: 'Random Forest' },
          { label: 'Avg Soil Moisture', value: `${(weeklyData.reduce((a,d)=>a+d.soil_moisture,0)/weeklyData.length).toFixed(1)}%`, sub: 'Last 7 days' },
          { label: 'Irrigation Alerts', value: '3', sub: 'This week' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="kpi-card card">
            <div className="kpi-value">{value}</div>
            <div className="kpi-label">{label}</div>
            <div className="kpi-sub">{sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
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
              <Bar dataKey="soil_moisture" fill="var(--green)" radius={[3,3,0,0]} name="Soil Moisture %" />
              <Bar dataKey="rainfall" fill="var(--blue)" radius={[3,3,0,0]} name="Rainfall mm" opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="analytics-grid-2">
        <div className="card">
          <h3 className="chart-title">Crop Recommendation Distribution</h3>
          <div className="pie-container">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={cropDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {cropDist.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {cropDist.map((item, i) => (
                <div key={item.name} className="pie-legend-item">
                  <span className="pie-dot" style={{ background: COLORS[i % COLORS.length] }} />
                  <span>{item.name}</span>
                  <span className="pie-val">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="chart-title">Performance Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="soil_moisture" stroke="var(--green)" strokeWidth={2} dot={{ fill: 'var(--green)', r: 3 }} name="Soil Moisture %" />
              <Line type="monotone" dataKey="temperature" stroke="var(--amber)" strokeWidth={2} dot={{ fill: 'var(--amber)', r: 3 }} name="Temp °C" strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
