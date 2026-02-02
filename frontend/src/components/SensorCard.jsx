export default function SensorCard({ title, value }) {
  return (
    <div style={{
      border: "1px solid #ccc",
      padding: "16px",
      borderRadius: "8px",
      minWidth: "200px"
    }}>
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
}
