import styles from "./stress.module.css";

function getStressInfo(level) {
  if (level < 0.33) return { label: "Low Stress",    color: "#4ade80", text: "Crop is healthy and thriving"           };
  if (level < 0.66) return { label: "Moderate Stress", color: "#fbbf24", text: "Monitor conditions closely"            };
  return              { label: "High Stress",   color: "#f87171", text: "Immediate attention may be required"  };
}

export default function StressCard({ level = 0.5, className }) {
  const pct = Math.round(level * 100);
  const info = getStressInfo(level);

  return (
    <div className={`${styles.card} ${className ?? ""}`}>
      <div className={styles.tag}>Crop Stress Index</div>

      <div className={styles.main}>
        <div className={styles.ring} style={{ "--pct": pct, "--clr": info.color }}>
          <svg viewBox="0 0 80 80" className={styles.svg}>
            <circle cx="40" cy="40" r="32" className={styles.track} />
            <circle cx="40" cy="40" r="32" className={styles.prog}
              style={{
                stroke: info.color,
                strokeDashoffset: `calc(201 - (201 * ${pct} / 100))`,
                filter: `drop-shadow(0 0 4px ${info.color}88)`,
              }}
            />
          </svg>
          <span className={styles.pct} style={{ color: info.color }}>{pct}%</span>
        </div>

        <div className={styles.info}>
          <p className={styles.stressLabel} style={{ color: info.color }}>{info.label}</p>
          <p className={styles.stressText}>{info.text}</p>
        </div>
      </div>
    </div>
  );
}
