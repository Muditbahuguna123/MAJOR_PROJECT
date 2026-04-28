import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Leaf, BarChart2, Sprout, Settings, CloudRain
} from 'lucide-react';
import './Layout.css';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/weather', icon: CloudRain, label: 'Weather Forecast' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/crop-recommendation', icon: Sprout, label: 'Crop Recommendation' },
  { to: '/detection', icon: Leaf, label: 'Disease Detection' },
];

export default function Layout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Sprout size={18} />
          </div>
          <span className="brand-name">AgroIntel</span>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-section-label">Main</p>
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <p className="nav-section-label">System</p>
          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Settings size={16} />
            <span>Settings</span>
          </NavLink>

          <div className="sidebar-status">
            <span className="pulse-dot" />
            <span className="status-text">Backend connected</span>
          </div>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
