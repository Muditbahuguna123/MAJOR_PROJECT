import styles from "./crop.module.css";

const cropEmoji = {
  Wheat: "🌾", Rice: "🍚", Corn: "🌽", Cotton: "🌿",
  Sugarcane: "🎋", Barley: "🌿", Soybean: "🫘",
};

export default function CropCard({ crop = "Wheat", confidence = 88, className }) {
  return (
    <div className={`${styles.card} ${className ?? ""}`}>
      <div className={styles.tag}>Recommended Crop</div>

      <div className={styles.main}>
        <span className={styles.emoji}>{cropEmoji[crop] ?? "🌾"}</span>
        <h2 className={styles.crop}>{crop}</h2>
      </div>

      <div className={styles.footer}>
        <span className={styles.confLabel}>Model Confidence</span>
        <span className={styles.confValue}>{confidence}%</span>
      </div>

      <div className={styles.bar}>
        <div className={styles.fill} style={{ width: `${confidence}%` }} />
      </div>
    </div>
  );
}
