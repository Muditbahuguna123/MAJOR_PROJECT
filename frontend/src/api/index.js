
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

export const getSensorData = () => request('/sensor/latest');

export const getSensorHistory = (limit = 50) =>
  request(`/sensor/history?limit=${limit}`);

export const getCropRecommendation = (params) =>
  request('/predict-crop', { method: 'POST', body: JSON.stringify(params) });

export const getIrrigationPrediction = (params) =>
  request('/ml/irrigation', { method: 'POST', body: JSON.stringify(params) });

export const detectDisease = (file) => {
  const form = new FormData();
  form.append('image', file);
  return fetch(`${BASE}/ml/disease`, { method: 'POST', body: form })
    .then((r) => r.json());
};

export const getAnalytics = () => request('/layer1-status');

