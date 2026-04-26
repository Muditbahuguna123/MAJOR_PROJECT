import { useState, useEffect, useRef } from 'react';
import { ScrollText, RefreshCw, Circle } from 'lucide-react';
import { getLogs } from '../../api';
import './Logs.css';

const FILTERS = ['ALL', 'INFO', 'SUCCESS', 'WARNING', 'ERROR'];

const MOCK_LOGS = [
  { id: 1, time: '10:43:15 AM', level: 'INFO',    module: 'Auth',       message: 'User session established' },
  { id: 2, time: '10:45:30 AM', level: 'SUCCESS', module: 'Inference',  message: 'Crop image processed successfully (Leaf Blight: 94%)' },
  { id: 3, time: '10:46:01 AM', level: 'WARNING', module: 'IoT Gateway',message: 'High latency detected on prediction endpoint' },
  { id: 4, time: '10:48:22 AM', level: 'SUCCESS', module: 'ML Model',   message: 'Crop recommendation: Wheat (confidence: 91%)' },
  { id: 5, time: '10:49:03 AM', level: 'INFO',    module: 'Sensor',     message: 'Simulated data generated: T=28.4°C, H=67%, SM=42%' },
  { id: 6, time: '10:50:11 AM', level: 'SUCCESS', module: 'Irrigation', message: 'Irrigation prediction: Not required' },
  { id: 7, time: '10:51:33 AM', level: 'ERROR',   module: 'Database',   message: 'Connection timeout while saving prediction history' },
  { id: 8, time: '10:52:18 AM', level: 'INFO',    module: 'System',     message: 'Nightly backup completed' },
  { id: 9, time: '10:53:00 AM', level: 'WARNING', module: 'Sensor',     message: 'Soil pH out of optimal range (pH 5.2)' },
  { id: 10,time: '10:54:45 AM', level: 'SUCCESS', module: 'Disease',    message: 'Plant disease detected: Tomato Late Blight (89%)' },
  { id: 11,time: '10:55:30 AM', level: 'INFO',    module: 'Auth',       message: 'API key validated for request' },
  { id: 12,time: '10:56:12 AM', level: 'SUCCESS', module: 'ML Model',   message: 'Model loaded: irrigation_model.pkl (v1.2)' },
  { id: 13,time: '10:57:05 AM', level: 'INFO',    module: 'Sensor',     message: 'DHT11 reading: temperature=29.1°C, humidity=65%' },
  { id: 14,time: '10:58:40 AM', level: 'WARNING', module: 'ML Model',   message: 'Prediction confidence below threshold (61%)' },
  { id: 15,time: '10:59:22 AM', level: 'ERROR',   module: 'IoT Gateway',message: 'Failed to connect to sensor node 3 – retrying' },
];

const LEVEL_CONFIG = {
  INFO:    { cls: 'info',    dot: 'var(--blue)' },
  SUCCESS: { cls: 'success', dot: 'var(--green)' },
  WARNING: { cls: 'warning', dot: 'var(--amber)' },
  ERROR:   { cls: 'error',   dot: 'var(--red)' },
};

export default function SystemLogs() {
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [filter, setFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const bottomRef = useRef();

  const fetchLogs = async () => {
    setRefreshing(true);
    try {
      const res = await getLogs(filter);
      if (res?.logs?.length) setLogs(res.logs);
    } catch {
      // use mock
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [filter]);

  useEffect(() => {
    if (autoScroll) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, autoScroll]);

  const displayed = filter === 'ALL' ? logs : logs.filter(l => l.level === filter);

  const counts = FILTERS.slice(1).reduce((acc, f) => {
    acc[f] = logs.filter(l => l.level === f).length;
    return acc;
  }, {});

  return (
    <div className="fade-up logs-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">System Logs</h1>
          <p className="page-subtitle">Real-time system events and model inference tracking</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <label className="autoscroll-toggle">
            <input type="checkbox" checked={autoScroll} onChange={e => setAutoScroll(e.target.checked)} />
            Auto-scroll
          </label>
          <button className="btn btn-ghost" onClick={fetchLogs} disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="log-stats">
        {FILTERS.slice(1).map(f => (
          <div key={f} className={`log-stat log-stat--${f.toLowerCase()}`}>
            <Circle size={8} fill="currentColor" />
            <span>{counts[f] ?? 0}</span>
            <span className="log-stat-label">{f}</span>
          </div>
        ))}
        <span className="log-total">{logs.length} total events</span>
      </div>

      {/* Filter tabs */}
      <div className="log-filters">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`log-filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
            {f !== 'ALL' && <span className="filter-count">{counts[f] ?? 0}</span>}
          </button>
        ))}
      </div>

      {/* Log list */}
      <div className="log-container card">
        <div className="log-list">
          {displayed.length === 0 && (
            <div className="log-empty">
              <ScrollText size={28} />
              <p>No {filter !== 'ALL' ? filter.toLowerCase() : ''} logs found</p>
            </div>
          )}
          {displayed.map((log) => {
            const cfg = LEVEL_CONFIG[log.level] || LEVEL_CONFIG.INFO;
            return (
              <div key={log.id} className={`log-entry log-entry--${cfg.cls}`}>
                <span className="log-time mono">{log.time}</span>
                <span className={`log-level log-level--${cfg.cls}`}>{log.level}</span>
                <span className="log-module">[{log.module}]</span>
                <span className="log-message">{log.message}</span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
