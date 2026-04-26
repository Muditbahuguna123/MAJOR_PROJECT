import styles from "./sensor.module.css";

export default function SensorCard({ label, unit, icon, value, className }) {
  return (
    <div className={`${styles.card} ${className ?? ""}`}>
      <div className={styles.iconWrap}>
        <span className={styles.icon}>{icon}</span>
      </div>
      <div className={styles.body}>
        <p className={styles.label}>{label}</p>
        <p className={styles.value}>
          {value ?? "--"}
          {unit && <span className={styles.unit}>{unit}</span>}
        </p>
      </div>
      <div className={styles.shimmer} />
    </div>
  );
}
