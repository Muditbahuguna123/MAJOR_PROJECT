export default function StressStatus({ stress, irrigation }) {
  return (
    <div style={{
      marginTop: "20px",
      padding: "20px",
      borderRadius: "8px",
      backgroundColor: "#f5f5f5"
    }}>
      <h2>Climate Stress Level: {stress}</h2>
      <p><strong>Irrigation Advice:</strong> {irrigation}</p>
    </div>
  );
}
