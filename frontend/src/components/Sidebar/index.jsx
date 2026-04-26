import { NavLink } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import styles from "./style.module.css";

const DashIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
);
const DiseaseIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
        <path d="M11 8v6M8 11h6"/>
    </svg>
);
const AnalyticsIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
    </svg>
);
const LogsIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
        <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>
    </svg>
);
const SettingsIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
);

const links = [
    { to: "/",           label: "Dashboard",        Icon: DashIcon    },
    { to: "/detection",  label: "Disease Detection", Icon: DiseaseIcon },
    { to: "/analytics",  label: "Analytics",         Icon: AnalyticsIcon },
    { to: "/system-logs",label: "System Logs",       Icon: LogsIcon    },
    { to: "/settings",   label: "Settings",          Icon: SettingsIcon },
];

export default function Sidebar() {
    const ref = useRef();

    useGSAP(() => {
        gsap.from(ref.current.querySelectorAll("a"), {
            x: -16,
            opacity: 0,
            stagger: 0.07,
            duration: 0.45,
            ease: "power2.out",
        });
    }, { scope: ref });

    return (
        <aside className={styles.sidebar} ref={ref}>
            <div className={styles.logo}>
                <div className={styles.logoMark}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5a9a2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22V12"/><path d="M5 12c0-3.87 3.13-7 7-7s7 3.13 7 7"/>
                        <path d="M5 12c2-1.5 4.5-2 7-2"/><path d="M19 12c-2-1.5-4.5-2-7-2"/>
                    </svg>
                </div>
                <span className={styles.logoText}>AgroIntel</span>
            </div>

            <p className={styles.navGroup}>Main</p>
            <nav>
                {links.slice(0, 3).map(({ to, label, Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === "/"}
                        className={({ isActive }) =>
                            `${styles.navItem} ${isActive ? styles.active : ""}`
                        }
                    >
                        <span className={styles.navIcon}><Icon /></span>
                        <span className={styles.navLabel}>{label}</span>
                    </NavLink>
                ))}
            </nav>

            <p className={styles.navGroup}>System</p>
            <nav>
                {links.slice(3).map(({ to, label, Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `${styles.navItem} ${isActive ? styles.active : ""}`
                        }
                    >
                        <span className={styles.navIcon}><Icon /></span>
                        <span className={styles.navLabel}>{label}</span>
                    </NavLink>
                ))}
            </nav>

        </aside>
    );
}