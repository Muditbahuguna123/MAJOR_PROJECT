import './StatCard.css';

export default function StatCard({ icon: Icon, label, value, unit, color = 'green', trend }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-top">
        <div className={`stat-icon stat-icon--${color}`}>
          {Icon && <Icon size={15} />}
        </div>
        {trend !== undefined && (
          <span className={`stat-trend ${trend >= 0 ? 'up' : 'down'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="stat-value">
        {value ?? <span className="stat-skeleton" />}
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
