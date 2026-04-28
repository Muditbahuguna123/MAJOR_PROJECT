import { useState, useEffect } from 'react';
import { User, Cpu, SlidersHorizontal, Save, CheckCircle2 } from 'lucide-react';
import { getProfile, updateProfile, getModelConfig, updateModelConfig } from '../../api';
import './Settings.css';

const TABS = [
  { id: 'profile', label: 'Profile Information', icon: User },
  { id: 'model', label: 'Model Configuration', icon: Cpu },
  { id: 'system', label: 'System Preferences', icon: SlidersHorizontal },
];

export default function Settings() {
  const [tab, setTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({ full_name: '', email: '', institution: '', location: '' });
  const [modelConfig, setModelConfig] = useState({
    rf_estimators: 100,
    rf_random_state: 42,
    test_split: 0.2,
    confidence_threshold: 0.7,
    disease_model: 'MobileNetV2',
    simulation_interval: 30,
  });
  const [systemPrefs, setSystemPrefs] = useState({
    auto_simulate: true,
    refresh_interval: 30,
    dark_mode: true,
    notifications: true,
  });

  useEffect(() => {
    getProfile().then(d => { if (d) setProfile(d); }).catch(() => {});
    getModelConfig().then(d => { if (d) setModelConfig(d); }).catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      if (tab === 'profile') await updateProfile(profile).catch(() => {});
      if (tab === 'model') await updateModelConfig(modelConfig).catch(() => {});
    } finally {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div className="fade-up settings-page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and AgroIntel system preferences</p>
      </div>

      <div className="settings-layout">
        {/* Sidebar tabs */}
        <aside className="settings-sidebar">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`settings-tab ${tab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </aside>

        {/* Panel */}
        <div className="settings-panel card">
          {tab === 'profile' && (
            <div className="fade-up">
              <h2 className="settings-section-title">Profile Details</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    className="input"
                    value={profile.full_name}
                    onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                    placeholder="Ayush Rawat"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    className="input"
                    type="email"
                    value={profile.email}
                    onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Institution</label>
                  <input
                    className="input"
                    value={profile.institution}
                    onChange={e => setProfile(p => ({ ...p, institution: e.target.value }))}
                    placeholder="Graphic Era Hill University"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    className="input"
                    value={profile.location}
                    onChange={e => setProfile(p => ({ ...p, location: e.target.value }))}
                    placeholder="Dehradun, Uttarakhand"
                  />
                </div>
              </div>

              <div className="project-info">
                <p className="project-info-title">Project Information</p>
                <div className="info-grid">
                  {[
                    { label: 'Project Title', value: 'AgroIntel: A Simulated IoT and ML Based Smart Agriculture System' },
                    { label: 'Group No.', value: '260' },
                    { label: 'Supervisor', value: 'Mr. Mukesh Kumar' },
                    { label: 'Degree', value: 'B.Tech — Computer Science & Engineering' },
                  ].map(({ label, value }) => (
                    <div key={label} className="info-row">
                      <span className="info-label">{label}</span>
                      <span className="info-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'model' && (
            <div className="fade-up">
              <h2 className="settings-section-title">Model Configuration</h2>
              <p className="settings-desc">Adjust parameters for the Random Forest and MobileNetV2 models.</p>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">RF Estimators (n_estimators)</label>
                  <input
                    className="input"
                    type="number"
                    value={modelConfig.rf_estimators}
                    onChange={e => setModelConfig(p => ({ ...p, rf_estimators: +e.target.value }))}
                  />
                  <p className="form-hint">Number of trees in the random forest (default: 100)</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Random State</label>
                  <input
                    className="input"
                    type="number"
                    value={modelConfig.rf_random_state}
                    onChange={e => setModelConfig(p => ({ ...p, rf_random_state: +e.target.value }))}
                  />
                  <p className="form-hint">Seed for reproducibility</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Test Split Ratio</label>
                  <input
                    className="input"
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="0.5"
                    value={modelConfig.test_split}
                    onChange={e => setModelConfig(p => ({ ...p, test_split: +e.target.value }))}
                  />
                  <p className="form-hint">Fraction of data used for testing (e.g., 0.2 = 20%)</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Confidence Threshold</label>
                  <input
                    className="input"
                    type="number"
                    step="0.05"
                    min="0.5"
                    max="1"
                    value={modelConfig.confidence_threshold}
                    onChange={e => setModelConfig(p => ({ ...p, confidence_threshold: +e.target.value }))}
                  />
                  <p className="form-hint">Minimum confidence score to show a prediction</p>
                </div>
              </div>

              <div className="model-info-box">
                <div className="model-tag">
                  <span className="badge badge-green">Active</span>
                  <span className="model-name">Random Forest Classifier</span>
                  <span className="model-file mono">crop_model.pkl / irrigation_model.pkl</span>
                </div>
                <div className="model-tag">
                  <span className="badge badge-blue">Active</span>
                  <span className="model-name">MobileNetV2</span>
                  <span className="model-file mono">disease_model.pth</span>
                </div>
              </div>
            </div>
          )}

          {tab === 'system' && (
            <div className="fade-up">
              <h2 className="settings-section-title">System Preferences</h2>
              <p className="settings-desc">Configure data simulation and UI behaviour.</p>

              <div className="pref-list">
                {[
                  { key: 'auto_simulate', label: 'Auto-simulate sensor data', desc: 'Automatically generate new IoT readings on a schedule' },
                  { key: 'notifications', label: 'Enable system notifications', desc: 'Show alerts for warnings and errors' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="pref-row">
                    <div>
                      <p className="pref-label">{label}</p>
                      <p className="pref-desc">{desc}</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={systemPrefs[key]}
                        onChange={e => setSystemPrefs(p => ({ ...p, [key]: e.target.checked }))}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                ))}

                <div className="pref-row">
                  <div>
                    <p className="pref-label">Simulation Interval</p>
                    <p className="pref-desc">How often (seconds) to auto-generate sensor readings</p>
                  </div>
                  <input
                    className="input"
                    style={{ width: 80 }}
                    type="number"
                    value={systemPrefs.refresh_interval}
                    onChange={e => setSystemPrefs(p => ({ ...p, refresh_interval: +e.target.value }))}
                  />
                </div>
              </div>

              <div className="backend-info">
                <p className="backend-info-title">Backend Connection</p>
                <div className="info-row">
                  <span className="info-label">API Base URL</span>
                  <span className="info-value mono">http://localhost:5000</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Database</span>
                  <span className="info-value mono">farming.db (SQLite)</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Framework</span>
                  <span className="info-value">Python Flask</span>
                </div>
              </div>
            </div>
          )}

          <div className="settings-footer">
            <button className="btn btn-primary" onClick={handleSave}>
              {saved
                ? <><CheckCircle2 size={14} /> Saved!</>
                : <><Save size={14} /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
