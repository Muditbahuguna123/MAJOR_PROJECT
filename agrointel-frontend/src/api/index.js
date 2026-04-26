// Centralized API layer for AgroIntel
// All requests proxy through Vite to http://localhost:5000

const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Sensor / Dashboard ─────────────────────────────────────────────────────

/** Fetch latest sensor reading (real DHT11 + simulated) */
export const getSensorData = () => request('/sensor/latest');

/** Fetch last N sensor readings for trend charts */
export const getSensorHistory = (limit = 50) =>
  request(`/sensor/history?limit=${limit}`);

/** Trigger a new simulated sensor reading */
export const simulateSensor = () =>
  request('/sensor/simulate', { method: 'POST' });

// ── ML Predictions ──────────────────────────────────────────────────────────

/**
 * Get crop recommendation
 * @param {Object} params - { N, P, K, temperature, humidity, ph, rainfall }
 */
export const getCropRecommendation = (params) =>
  request('/ml/crop', { method: 'POST', body: JSON.stringify(params) });

/**
 * Get irrigation prediction
 * @param {Object} params - { temperature, humidity, soil_moisture, rainfall, sunlight_hours, wind_speed_kmh, soil_ph }
 */
export const getIrrigationPrediction = (params) =>
  request('/ml/irrigation', { method: 'POST', body: JSON.stringify(params) });

// ── Disease Detection ────────────────────────────────────────────────────────

/**
 * Upload leaf image for disease detection
 * @param {File} file - Image file
 */
export const detectDisease = (file) => {
  const form = new FormData();
  form.append('image', file);
  return fetch(`${BASE}/ml/disease`, { method: 'POST', body: form })
    .then((r) => r.json());
};

// ── Analytics ────────────────────────────────────────────────────────────────

export const getAnalytics = () => request('/analytics/summary');

// ── System Logs ───────────────────────────────────────────────────────────────

export const getLogs = (filter = 'ALL') =>
  request(`/logs?filter=${filter}`);

// ── Settings ──────────────────────────────────────────────────────────────────

export const getProfile = () => request('/settings/profile');

export const updateProfile = (data) =>
  request('/settings/profile', { method: 'PUT', body: JSON.stringify(data) });

export const getModelConfig = () => request('/settings/model-config');

export const updateModelConfig = (data) =>
  request('/settings/model-config', { method: 'PUT', body: JSON.stringify(data) });
