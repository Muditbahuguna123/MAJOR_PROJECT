import { useState } from 'react';
import { Sprout, FlaskConical, AlertCircle, RotateCcw, ChevronRight } from 'lucide-react';
import { getCropRecommendation } from '../../api';
import './CropRecommendation.css';

const FIELDS = [
  {
    key: 'N',
    label: 'Nitrogen (N)',
    unit: 'mg/kg',
    placeholder: '0 – 140',
    min: 0, max: 140,
    hint: 'Available nitrogen in the soil',
    color: 'blue',
  },
  {
    key: 'P',
    label: 'Phosphorus (P)',
    unit: 'mg/kg',
    placeholder: '0 – 145',
    min: 0, max: 145,
    hint: 'Available phosphorus content',
    color: 'amber',
  },
  {
    key: 'K',
    label: 'Potassium (K)',
    unit: 'mg/kg',
    placeholder: '0 – 205',
    min: 0, max: 205,
    hint: 'Available potassium content',
    color: 'green',
  },
  {
    key: 'temperature',
    label: 'Temperature',
    unit: '°C',
    placeholder: '0 – 50',
    min: 0, max: 50,
    hint: 'Average ambient temperature',
    color: 'amber',
  },
  {
    key: 'humidity',
    label: 'Humidity',
    unit: '%',
    placeholder: '0 – 100',
    min: 0, max: 100,
    hint: 'Relative humidity of the environment',
    color: 'blue',
  },
  {
    key: 'ph',
    label: 'Soil pH',
    unit: 'pH',
    placeholder: '0 – 14',
    min: 0, max: 14,
    step: 0.1,
    hint: 'Acidity or alkalinity of the soil',
    color: 'green',
  },
  {
    key: 'rainfall',
    label: 'Rainfall',
    unit: 'mm',
    placeholder: '0 – 300',
    min: 0, max: 300,
    hint: 'Average annual rainfall',
    color: 'blue',
  },
];

const EMPTY = Object.fromEntries(FIELDS.map((f) => [f.key, '']));

const CROP_INFO = {
  Rice:       { icon: '🌾', tip: 'Thrives in waterlogged, warm conditions with high humidity.' },
  Wheat:      { icon: '🌾', tip: 'Best grown in cool, dry climates with well-drained loamy soil.' },
  Maize:      { icon: '🌽', tip: 'Requires warm temperatures and moderate rainfall.' },
  Cotton:     { icon: '🌿', tip: 'Prefers well-drained, deep soils with long frost-free periods.' },
  Sugarcane:  { icon: '🎋', tip: 'Needs hot, humid climate with high rainfall or irrigation.' },
  Jute:       { icon: '🌿', tip: 'Grows best in warm and humid climate with alluvial soil.' },
  Coffee:     { icon: '☕', tip: 'Thrives in tropical highlands with well-distributed rainfall.' },
  Banana:     { icon: '🍌', tip: 'Requires tropical climate with high humidity and rainfall.' },
  Mango:      { icon: '🥭', tip: 'Best in tropical/subtropical climate with dry winters.' },
  Grapes:     { icon: '🍇', tip: 'Grows well in warm, dry summers and mild winters.' },
  Apple:      { icon: '🍎', tip: 'Needs cold winters for dormancy and cool summers.' },
  Watermelon: { icon: '🍉', tip: 'Prefers sandy, well-drained soil with warm temperatures.' },
  Muskmelon:  { icon: '🍈', tip: 'Thrives in dry, warm climate with well-drained fertile soil.' },
  Papaya:     { icon: '🍈', tip: 'Grows in tropical climates; sensitive to frost and waterlogging.' },
  Pomegranate:{ icon: '🍎', tip: 'Best in semi-arid conditions with hot dry summers.' },
  Coconut:    { icon: '🥥', tip: 'Thrives in humid, tropical coastal environments.' },
  Chickpea:   { icon: '🫘', tip: 'Suited to cool, dry climates with well-drained soils.' },
  Lentil:     { icon: '🫘', tip: 'Grows well in semi-arid regions with cool temperatures.' },
  Pigeonpeas: { icon: '🫘', tip: 'Drought-tolerant; suits semi-arid tropical climates.' },
  Kidneybeans:{ icon: '🫘', tip: 'Prefers warm temperatures and well-drained fertile soil.' },
  Mothbeans:  { icon: '🫘', tip: 'Hardy, drought-resistant; thrives in arid conditions.' },
  Mungbean:   { icon: '🫘', tip: 'Warm season crop; does well in sandy loam soils.' },
  Blackgram:  { icon: '🫘', tip: 'Grows in humid, warm conditions; tolerates waterlogging.' },
};

function getInfo(crop) {
  if (!crop) return null;
  const key = Object.keys(CROP_INFO).find(
    (k) => k.toLowerCase() === crop.toLowerCase()
  );
  return key ? CROP_INFO[key] : { icon: '🌱', tip: null };
}

export default function CropRecommendation() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const set = (key, val) => {
    setValues((v) => ({ ...v, [key]: val }));
    setErrors((e) => ({ ...e, [key]: null }));
  };

  const validate = () => {
    const errs = {};
    FIELDS.forEach(({ key, label, min, max }) => {
      const v = values[key];
      if (v === '' || v === null) {
        errs[key] = `${label} is required`;
      } else {
        const n = parseFloat(v);
        if (isNaN(n)) errs[key] = 'Must be a number';
        else if (n < min || n > max) errs[key] = `Range: ${min} – ${max}`;
      }
    });
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError(null);
    setResult(null);

    try {
      const payload = Object.fromEntries(
        FIELDS.map(({ key }) => [key, parseFloat(values[key])])
      );
      const res = await getCropRecommendation(payload);
      setResult(res);
    } catch (e) {
      // Demo fallback
      setApiError('Backend unreachable — showing demo result');
      setResult({ crop: 'Wheat', confidence: 0.91 });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setValues(EMPTY);
    setErrors({});
    setResult(null);
    setApiError(null);
  };

  const info = getInfo(result?.crop);
  const confPct = result?.confidence != null
    ? (result.confidence * 100).toFixed(1)
    : null;

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Crop Recommendation</h1>
          <p className="page-subtitle">
            Enter your soil &amp; climate parameters to get a crop recommendation from our trained ML model
          </p>
        </div>
        {result && (
          <button className="btn btn-ghost" onClick={handleReset}>
            <RotateCcw size={13} /> Reset
          </button>
        )}
      </div>

      <div className="cr-layout">
        {/* Input form */}
        <div className="cr-form-panel card">
          <div className="cr-form-title">
            <FlaskConical size={15} />
            Soil &amp; Climate Parameters
          </div>

          <div className="cr-fields">
            {FIELDS.map(({ key, label, unit, placeholder, min, max, step, hint, color }) => (
              <div key={key} className={`cr-field ${errors[key] ? 'has-error' : ''}`}>
                <div className="cr-field-header">
                  <label className="cr-label" htmlFor={key}>{label}</label>
                  <span className={`cr-unit text-${color}`}>{unit}</span>
                </div>
                <input
                  id={key}
                  className="input cr-input"
                  type="number"
                  min={min}
                  max={max}
                  step={step ?? 1}
                  placeholder={placeholder}
                  value={values[key]}
                  onChange={(e) => set(key, e.target.value)}
                />
                {errors[key]
                  ? <span className="cr-error">{errors[key]}</span>
                  : <span className="cr-hint">{hint}</span>
                }
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary cr-submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <><span className="spinner" /> Analysing…</>
              : <><Sprout size={14} /> Get Recommendation <ChevronRight size={14} /></>
            }
          </button>
        </div>

        {/* Result panel */}
        <div className="cr-result-col">
          {!result && !loading && (
            <div className="cr-result-empty card">
              <Sprout size={44} style={{ color: 'var(--border-light)' }} />
              <p>Fill in the parameters and click <strong>Get Recommendation</strong></p>
              <p className="cr-empty-sub">The model will predict the most suitable crop for your conditions</p>
            </div>
          )}

          {loading && (
            <div className="cr-result-empty card">
              <div className="cr-scan">
                <div className="cr-scan-line" />
              </div>
              <p>Running prediction model…</p>
            </div>
          )}

          {result && !loading && (
            <div className="fade-up">
              {apiError && (
                <div className="demo-note cr-demo-note">
                  <AlertCircle size={12} /> {apiError}
                </div>
              )}

              {/* Main result card */}
              <div className="cr-result-card card">
                <div className="cr-result-label">Recommended Crop</div>
                <div className="cr-result-crop">
                  <span className="cr-crop-icon">{info?.icon ?? '🌱'}</span>
                  <span className="cr-crop-name">{result.crop ?? result.prediction ?? '—'}</span>
                </div>

                {confPct && (
                  <div className="cr-conf-section">
                    <div className="cr-conf-header">
                      <span>Model Confidence</span>
                      <span className="cr-conf-value">{confPct}%</span>
                    </div>
                    <div className="conf-bar cr-conf-bar">
                      <div
                        className="conf-fill"
                        style={{ width: `${confPct}%`, transition: 'width 0.9s ease' }}
                      />
                    </div>
                  </div>
                )}

                {info?.tip && (
                  <div className="cr-tip">
                    <span className="cr-tip-label">Growing tip</span>
                    <p>{info.tip}</p>
                  </div>
                )}
              </div>

              {/* Input summary */}
              <div className="cr-summary card">
                <div className="cr-summary-title">Input Summary</div>
                <div className="cr-summary-grid">
                  {FIELDS.map(({ key, label, unit, color }) => (
                    <div key={key} className="cr-summary-item">
                      <span className="cr-summary-label">{label}</span>
                      <span className={`cr-summary-value text-${color}`}>
                        {parseFloat(values[key]).toFixed(key === 'ph' ? 1 : 0)}
                        <span className="cr-summary-unit">{unit}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
