import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./style.module.css";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");
    const contentRef = useRef(null);

    const tabs = [
        { id: "profile", label: "Profile Information" },
        { id: "model", label: "Model Configuration" },
        { id: "preferences", label: "System Preferences" },
    ];

    // GSAP Animation for tab switching
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                contentRef.current.children,
                { opacity: 0, y: 15 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    stagger: 0.1,
                    ease: "power2.out",
                }
            );
        });

        return () => ctx.revert(); // Cleanup on unmount or tab change
    }, [activeTab]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Settings</h1>
                <p className={styles.subtitle}>Manage your account and AgroIntel system preferences.</p>
            </header>

            <div className={styles.layout}>
                {/* Sidebar Navigation */}
                <aside className={styles.sidebar}>
                    <nav className={styles.nav}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`${styles.navItem} ${activeTab === tab.id ? styles.activeNavItem : ""}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className={styles.content} ref={contentRef}>
                    {activeTab === "profile" && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Profile Details</h2>
                            <div className={styles.formGroup}>
                                <label>Full Name</label>
                                <input type="text" defaultValue="Saurabh Thapliyal" className={styles.input} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email Address</label>
                                <input type="email" defaultValue="admin@agrointel.com" className={styles.input} />
                            </div>
                            <button className={styles.saveBtn}>Save Changes</button>
                        </div>
                    )}

                    {activeTab === "model" && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Detection Engine</h2>
                            <div className={styles.formGroup}>
                                <label>Active Model Version</label>
                                <select className={styles.input}>
                                    <option>AgroIntel-Vision-v2.1 (Stable)</option>
                                    <option>AgroIntel-Vision-v3.0-beta (Experimental)</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>
                                    Minimum Confidence Threshold
                                    <span className={styles.hint}>(Predictions below this are flagged as uncertain)</span>
                                </label>
                                <div className={styles.sliderContainer}>
                                    <input type="range" min="50" max="99" defaultValue="85" className={styles.slider} />
                                    <span className={styles.sliderValue}>85%</span>
                                </div>
                            </div>
                            <button className={styles.saveBtn}>Update Model</button>
                        </div>
                    )}

                    {activeTab === "preferences" && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Notifications & UI</h2>
                            <div className={styles.toggleGroup}>
                                <div>
                                    <label className={styles.toggleLabel}>Email Alerts</label>
                                    <span className={styles.hint}>Receive daily summaries of system logs.</span>
                                </div>
                                <label className={styles.switch}>
                                    <input type="checkbox" defaultChecked />
                                    <span className={styles.sliderRound}></span>
                                </label>
                            </div>
                            <div className={styles.toggleGroup}>
                                <div>
                                    <label className={styles.toggleLabel}>Dark Mode</label>
                                    <span className={styles.hint}>Switch to a darker theme for the dashboard.</span>
                                </div>
                                <label className={styles.switch}>
                                    <input type="checkbox" />
                                    <span className={styles.sliderRound}></span>
                                </label>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}