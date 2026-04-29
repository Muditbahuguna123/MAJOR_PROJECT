import { useState, useRef } from 'react';
import { Upload, ImagePlus, Leaf, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { detectDisease } from '../../api';
import './Detection.css';

export default function Detection() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDetect = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await detectDisease(file);
      setResult(res);
    } catch (e) {
      // Demo fallback
      setResult({
        disease: 'Tomato Late Blight',
        confidence: 0.89,
        healthy: false,
        recommendations: [
          'Remove and destroy infected leaves immediately',
          'Apply copper-based fungicide every 7–10 days',
          'Ensure proper plant spacing for air circulation',
          'Avoid overhead watering; use drip irrigation',
        ],
      });
      setError('Backend not reachable — showing demo result');
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const isHealthy = result?.healthy || result?.disease?.toLowerCase().includes('healthy');

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-title">Plant Diagnostics</h1>
        <p className="page-subtitle">Upload a clear image of a plant leaf to identify potential diseases using MobileNetV2</p>
      </div>

      <div className="detection-grid">
        {/* Upload Section */}
        <div>
          <div
            className={`upload-zone ${dragging ? 'dragging' : ''} ${preview ? 'has-file' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !preview && inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleFile(e.target.files[0])}
            />

            {preview ? (
              <div className="preview-container">
                <img src={preview} alt="Leaf preview" className="leaf-preview" />
                <button className="clear-btn" onClick={(e) => { e.stopPropagation(); clear(); }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon-wrap">
                  <ImagePlus size={28} />
                </div>
                <p className="upload-main">Drop a leaf image here</p>
                <p className="upload-sub">or click to browse</p>
                <p className="upload-formats">PNG, JPG, WEBP supported</p>
              </div>
            )}
          </div>

          {file && (
            <div className="file-info">
              <Leaf size={13} />
              <span>{file.name}</span>
              <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          )}

          <button
            className="btn btn-primary detect-btn"
            onClick={handleDetect}
            disabled={!file || loading}
          >
            {loading
              ? <><span className="spinner" /> Analyzing…</>
              : <><Upload size={14} /> Detect Disease</>}
          </button>
        </div>

        {/* Result Section */}
        <div className="result-panel">
          {!result && !loading && (
            <div className="result-empty">
              <Leaf size={40} style={{ color: 'var(--border-light)' }} />
              <p>Results will appear here after analysis</p>
            </div>
          )}

          {loading && (
            <div className="result-empty">
              <div className="scan-animation">
                <div className="scan-line" />
              </div>
              <p>Analyzing with MobileNetV2…</p>
            </div>
          )}

          {result && !loading && (
            <div className="result-content fade-up">
              {error && (
                <div className="demo-note">
                  <AlertCircle size={12} /> {error}
                </div>
              )}

              <div className={`disease-result ${isHealthy ? 'healthy' : 'diseased'}`}>
                <div className="disease-icon">
                  {isHealthy ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
                </div>
                <div>
                  <div className="disease-name">{result.disease || result.prediction}</div>
                  <div className="disease-status">{isHealthy ? 'Plant is healthy' : 'Disease detected'}</div>
                </div>
              </div>

              {result.confidence && (
                <div className="confidence-section">
                  <div className="confidence-header">
                    <span>Model Confidence</span>
                    <span className="conf-value">{(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="conf-bar" style={{ height: 6, background: 'var(--border-light)', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      className="conf-fill"
                      style={{
                        width: `${(result.confidence * 100).toFixed(0)}%`,
                        height: '100%',
                        background: isHealthy ? 'var(--green)' : 'var(--red)',
                        borderRadius: 4,
                        transition: 'width 0.8s ease',
                      }}
                    />
                  </div>
                </div>
              )}

              {result.recommendations?.length > 0 && (
                <div className="recommendations">
                  <p className="rec-title">Recommendations</p>
                  <ul className="rec-list">
                    {result.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
