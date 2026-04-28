import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  MapPin, RefreshCw, CloudRain, Sun, Cloud, CloudSnow,
  Wind, Droplets, Thermometer, Eye, Gauge, CloudLightning, CloudDrizzle, Search
} from 'lucide-react';
import './Weather.css';

// ── Open-Meteo — free, no API key needed ──────────────────────────────────
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const WMO_CODES = {
  0:  { label: 'Clear Sky',        icon: 'sun',       rain: false },
  1:  { label: 'Mainly Clear',     icon: 'sun',       rain: false },
  2:  { label: 'Partly Cloudy',    icon: 'cloud-sun', rain: false },
  3:  { label: 'Overcast',         icon: 'cloud',     rain: false },
  45: { label: 'Foggy',            icon: 'cloud',     rain: false },
  48: { label: 'Icy Fog',          icon: 'cloud',     rain: false },
  51: { label: 'Light Drizzle',    icon: 'drizzle',   rain: true  },
  53: { label: 'Drizzle',          icon: 'drizzle',   rain: true  },
  55: { label: 'Heavy Drizzle',    icon: 'drizzle',   rain: true  },
  61: { label: 'Light Rain',       icon: 'rain',      rain: true  },
  63: { label: 'Rain',             icon: 'rain',      rain: true  },
  65: { label: 'Heavy Rain',       icon: 'rain',      rain: true  },
  71: { label: 'Light Snow',       icon: 'snow',      rain: false },
  73: { label: 'Snow',             icon: 'snow',      rain: false },
  75: { label: 'Heavy Snow',       icon: 'snow',      rain: false },
  80: { label: 'Rain Showers',     icon: 'rain',      rain: true  },
  81: { label: 'Rain Showers',     icon: 'rain',      rain: true  },
  82: { label: 'Violent Showers',  icon: 'rain',      rain: true  },
  95: { label: 'Thunderstorm',     icon: 'thunder',   rain: true  },
  96: { label: 'Thunderstorm+Hail',icon: 'thunder',   rain: true  },
  99: { label: 'Thunderstorm+Hail',icon: 'thunder',   rain: true  },
};

function getWmo(code) {
  return WMO_CODES[code] ?? { label: 'Unknown', icon: 'cloud', rain: false };
}

function WeatherIcon({ type, size = 20, className = '' }) {
  const props = { size, className };
  switch (type) {
    case 'sun':       return <Sun {...props} />;
    case 'cloud-sun': return <Cloud {...props} />;
    case 'cloud':     return <Cloud {...props} />;
    case 'rain':      return <CloudRain {...props} />;
    case 'drizzle':   return <CloudDrizzle {...props} />;
    case 'snow':      return <CloudSnow {...props} />;
    case 'thunder':   return <CloudLightning {...props} />;
    default:          return <Cloud {...props} />;
  }
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtDay(dateStr) {
  const d = new Date(dateStr);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function fmtShortDay(dateStr) {
  const d = new Date(dateStr);
  return DAYS[d.getDay()];
}

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

async function geocode(query) {
  const r = await fetch(`${GEO_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
  const d = await r.json();
  return d.results ?? [];
}

async function fetchForecast(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    daily: [
      'weathercode','temperature_2m_max','temperature_2m_min',
      'precipitation_sum','precipitation_probability_max',
      'windspeed_10m_max','uv_index_max','sunrise','sunset'
    ].join(','),
    hourly: [
      'temperature_2m','precipitation_probability','precipitation',
      'windspeed_10m','relativehumidity_2m'
    ].join(','),
    current_weather: true,
    timezone: 'auto',
    forecast_days: 7,
  });
  const r = await fetch(`${FORECAST_URL}?${params}`);
  return r.json();
}

function parseData(raw) {
  const { daily, hourly, current_weather } = raw;
  const days = daily.time.map((date, i) => ({
    date,
    label:    fmtDay(date),
    shortDay: fmtShortDay(date),
    wmo:      getWmo(daily.weathercode[i]),
    code:     daily.weathercode[i],
    tempMax:  daily.temperature_2m_max[i],
    tempMin:  daily.temperature_2m_min[i],
    precip:   daily.precipitation_sum[i],
    precipProb: daily.precipitation_probability_max[i],
    wind:     daily.windspeed_10m_max[i],
    uv:       daily.uv_index_max[i],
    sunrise:  daily.sunrise[i]?.slice(11) ?? '--',
    sunset:   daily.sunset[i]?.slice(11) ?? '--',
  }));

  // Next 24 hourly points
  const hours = hourly.time.slice(0, 24).map((t, i) => ({
    time:    t.slice(11, 16),
    temp:    hourly.temperature_2m[i],
    precipP: hourly.precipitation_probability[i],
    precip:  hourly.precipitation[i],
    wind:    hourly.windspeed_10m[i],
    humidity:hourly.relativehumidity_2m[i],
  }));

  return { days, hours, current: current_weather };
}

// ── Component ──────────────────────────────────────────────────────────────
export default function Weather() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [location, setLocation] = useState(null); // { name, lat, lon, country }
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);

  // Auto-detect location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      setGeoLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lon } = pos.coords;
          // Reverse geocode using open-meteo geo API trick — just use lat/lon directly
          await loadForecast({ name: 'Your Location', lat, lon, country: '' });
          setGeoLoading(false);
        },
        () => {
          // Fallback to New Delhi if denied
          loadForecast({ name: 'New Delhi', lat: 28.6139, lon: 77.2090, country: 'India' });
          setGeoLoading(false);
        }
      );
    } else {
      loadForecast({ name: 'New Delhi', lat: 28.6139, lon: 77.2090, country: 'India' });
    }
  }, []);

  const loadForecast = useCallback(async (loc) => {
    setLoading(true);
    setError(null);
    setLocation(loc);
    setSuggestions([]);
    setQuery('');
    setSelectedDay(0);
    try {
      const raw = await fetchForecast(loc.lat, loc.lon);
      setData(parseData(raw));
    } catch {
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Search suggestions
  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    const t = setTimeout(async () => {
      try {
        const results = await geocode(query);
        setSuggestions(results.slice(0, 5));
      } catch { setSuggestions([]); }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const today = data?.days[selectedDay];
  const rainyDays = data?.days.filter(d => d.wmo.rain).length ?? 0;
  const maxPrecipDay = data?.days.reduce((a, b) => b.precipProb > a.precipProb ? b : a, data.days[0]);

  // Rain alert banner
  const rainIn2Days = data?.days.slice(0, 3).some(d => d.wmo.rain);

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Weather Forecast</h1>
          <p className="page-subtitle">7-day outlook to plan irrigation and field operations</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="weather-search-wrap card">
        <div className="weather-search-inner">
          <Search size={15} className="search-icon-w" />
          <input
            className="weather-search-input"
            placeholder="Search city or region…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {geoLoading && <RefreshCw size={14} className="spin text-muted" />}
        </div>
        {suggestions.length > 0 && (
          <ul className="geo-suggestions">
            {suggestions.map(s => (
              <li
                key={s.id}
                className="geo-suggestion-item"
                onClick={() => loadForecast({ name: s.name, lat: s.latitude, lon: s.longitude, country: s.country })}
              >
                <MapPin size={12} />
                <span>{s.name}</span>
                <span className="geo-country">{s.admin1 ? `${s.admin1}, ` : ''}{s.country}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <div className="weather-error card">{error}</div>}

      {loading && (
        <div className="weather-loading card">
          <RefreshCw size={20} className="spin" />
          <span>Fetching forecast…</span>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Location + current conditions */}
          <div className="weather-hero card">
            <div className="hero-left">
              <div className="hero-location">
                <MapPin size={13} />
                <span>{location?.name}{location?.country ? `, ${location.country}` : ''}</span>
              </div>
              <div className="hero-temp">
                {data.current.temperature.toFixed(1)}
                <span className="hero-unit">°C</span>
              </div>
              <div className="hero-condition">
                <WeatherIcon type={getWmo(data.current.weathercode).icon} size={16} />
                <span>{getWmo(data.current.weathercode).label}</span>
              </div>
              <div className="hero-range">
                <Thermometer size={12} />
                <span>H: {data.days[0].tempMax.toFixed(0)}° / L: {data.days[0].tempMin.toFixed(0)}°</span>
              </div>
            </div>

            <div className="hero-right">
              <WeatherIcon type={getWmo(data.current.weathercode).icon} size={72} className="hero-big-icon" />
            </div>

            {/* Quick stats */}
            <div className="hero-stats">
              <div className="hero-stat">
                <Wind size={13} />
                <span>{data.current.windspeed.toFixed(0)} km/h</span>
                <span className="hero-stat-label">Wind</span>
              </div>
              <div className="hero-stat">
                <CloudRain size={13} />
                <span>{data.days[0].precipProb}%</span>
                <span className="hero-stat-label">Rain chance</span>
              </div>
              <div className="hero-stat">
                <Droplets size={13} />
                <span>{data.days[0].precip.toFixed(1)} mm</span>
                <span className="hero-stat-label">Precip.</span>
              </div>
              <div className="hero-stat">
                <Sun size={13} />
                <span>{data.days[0].uv.toFixed(0)}</span>
                <span className="hero-stat-label">UV Index</span>
              </div>
            </div>
          </div>

          {/* Rain advisory banner */}
          {rainIn2Days && (
            <div className={`rain-alert card ${rainyDays >= 4 ? 'rain-alert--heavy' : ''}`}>
              <CloudRain size={16} />
              <div>
                <strong>Rain Advisory —</strong>{' '}
                {rainyDays >= 4
                  ? `Heavy rain expected across ${rainyDays} of the next 7 days. Consider delaying field operations and checking drainage.`
                  : `Rain is expected in the next 2–3 days. Best to irrigate today or hold off until after the rain.`}
              </div>
              <div className="rain-alert-badge">
                {maxPrecipDay?.precipProb}% peak chance on {maxPrecipDay?.shortDay}
              </div>
            </div>
          )}

          {!rainIn2Days && (
            <div className="rain-alert rain-alert--clear card">
              <Sun size={16} />
              <div>
                <strong>Clear Stretch —</strong>{' '}
                No rain in the next 2–3 days. Good window for irrigation, spraying, or harvesting.
              </div>
            </div>
          )}

          {/* 7-day strip */}
          <div className="forecast-strip">
            {data.days.map((d, i) => (
              <button
                key={d.date}
                className={`forecast-card card ${selectedDay === i ? 'forecast-card--active' : ''} ${d.wmo.rain ? 'forecast-card--rain' : ''}`}
                onClick={() => setSelectedDay(i)}
              >
                <span className="fc-day">{i === 0 ? 'Today' : d.shortDay}</span>
                <WeatherIcon type={d.wmo.icon} size={18} className="fc-icon" />
                <span className="fc-high">{d.tempMax.toFixed(0)}°</span>
                <span className="fc-low">{d.tempMin.toFixed(0)}°</span>
                {d.wmo.rain && (
                  <span className="fc-rain-pill">{d.precipProb}%</span>
                )}
              </button>
            ))}
          </div>

          {/* Selected day detail */}
          {today && (
            <div className="weather-grid-2">
              <div className="card day-detail">
                <h3 className="chart-title">{selectedDay === 0 ? "Today's Details" : today.label}</h3>
                <div className="day-detail-grid">
                  {[
                    { icon: <Thermometer size={14} />, label: 'High / Low', value: `${today.tempMax.toFixed(1)}° / ${today.tempMin.toFixed(1)}°` },
                    { icon: <CloudRain size={14} />,   label: 'Rain Chance', value: `${today.precipProb}%` },
                    { icon: <Droplets size={14} />,    label: 'Precipitation', value: `${today.precip.toFixed(1)} mm` },
                    { icon: <Wind size={14} />,        label: 'Max Wind', value: `${today.wind.toFixed(0)} km/h` },
                    { icon: <Sun size={14} />,         label: 'UV Index', value: today.uv.toFixed(1) },
                    { icon: <Eye size={14} />,         label: 'Sunrise', value: today.sunrise },
                    { icon: <Eye size={14} />,         label: 'Sunset', value: today.sunset },
                    { icon: <Gauge size={14} />,       label: 'Condition', value: today.wmo.label },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="detail-row">
                      <span className="detail-icon">{icon}</span>
                      <span className="detail-label">{label}</span>
                      <span className="detail-value">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Agri tip */}
                <div className="agri-tip">
                  <span className="agri-tip-label">🌾 Agri Tip</span>
                  <span>{getAgriTip(today)}</span>
                </div>
              </div>

              {/* Hourly rain probability chart */}
              <div className="card">
                <h3 className="chart-title">Hourly Rain Probability — Next 24h</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={data.hours} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="rainProbGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--blue)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} interval={3} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="precipP" stroke="var(--blue)" fill="url(#rainProbGrad)" strokeWidth={2} name="Rain %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Weekly charts row */}
          <div className="weather-grid-2">
            <div className="card">
              <h3 className="chart-title">7-Day Temperature Range</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.days} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="shortDay" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} unit="°" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="tempMax" fill="var(--amber)" radius={[3, 3, 0, 0]} name="High °C" />
                  <Bar dataKey="tempMin" fill="var(--blue)" radius={[3, 3, 0, 0]} name="Low °C" opacity={0.7} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="chart-title">7-Day Precipitation Forecast</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.days} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="precipBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--blue)" stopOpacity={1} />
                      <stop offset="100%" stopColor="var(--blue)" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="shortDay" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} unit=" mm" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="precip" fill="url(#precipBarGrad)" radius={[3, 3, 0, 0]} name="Precipitation mm" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hourly temp + wind */}
          <div className="card">
            <h3 className="chart-title">Hourly Temperature &amp; Wind — Next 24h</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.hours} margin={{ top: 8, right: 16, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="tempHourGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--amber)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--amber)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} interval={3} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="temp" stroke="var(--amber)" fill="url(#tempHourGrad)" strokeWidth={2} name="Temp °C" />
                <Area type="monotone" dataKey="wind" stroke="var(--blue)" fill="none" strokeWidth={1.5} strokeDasharray="4 2" name="Wind km/h" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

function getAgriTip(day) {
  if (day.precipProb >= 70)
    return 'High rain probability. Avoid pesticide/fertilizer application. Check field drainage.';
  if (day.precipProb >= 40)
    return 'Moderate rain chance. Hold irrigation — natural rainfall may suffice.';
  if (day.tempMax >= 38)
    return 'Very high temperature. Irrigate early morning or evening to reduce evaporation.';
  if (day.wind >= 30)
    return 'Strong winds expected. Postpone spraying operations to avoid drift.';
  if (day.uv >= 8)
    return 'High UV. Protect crops with shade netting if sensitive. Ideal for drying harvests.';
  return 'Favourable conditions. Good day for field operations, planting, or spraying.';
}
