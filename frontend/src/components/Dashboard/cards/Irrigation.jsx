import styles from "./irrigation.module.css";

const config = {
  needs:  { label: "Needs Irrigation",  icon: "💧", color: "#60a5fa", cls: "needs"  },
  good:   { label: "Moisture Good",     icon: "✅", color: "#4ade80", cls: "good"   },
  excess: { label: "Excess Water",      icon: "⚠️", color: "#fbbf24", cls: "excess" },
};

export default function IrrigationCard({ status = "good", className }) {
  const c = config[status] ?? config.good;
  return (
    <div className={`${styles.card} ${styles[c.cls]} ${className ?? ""}`}>
      <div className={styles.tag}>Irrigation Status</div>
      <div className={styles.main}>
        <span className={styles.icon}>{c.icon}</span>
        <p className={styles.label}>{c.label}</p>
      </div>
      <p className={styles.sub}>
        {status === "needs"  && "Soil moisture below optimal threshold"}
        {status === "good"   && "Moisture levels are within ideal range"}
        {status === "excess" && "Consider pausing irrigation schedule"}
      </p>
      <div className={styles.badge} style={{ color: c.color, borderColor: c.color + "33", background: c.color + "11" }}>
        {status.toUpperCase()}
      </div>
    </div>
  );
}
