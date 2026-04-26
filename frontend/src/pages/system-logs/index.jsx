import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./style.module.css";

export default function SystemLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const logListRef = useRef(null);

    useEffect(() => {
        // Simulating fetching data from your AgroIntel backend
        const fetchLogs = async () => {
            try {
                // Replace with actual: const res = await fetch('/api/v1/system/logs');
                // const data = await res.json();

                const mockData = [
                    { id: "1", type: "INFO", source: "Auth", message: "User session established", timestamp: "10:42:05 AM" },
                    { id: "2", type: "SUCCESS", source: "Inference Engine", message: "Crop image processed successfully (Leaf Blight: 94%)", timestamp: "10:45:12 AM" },
                    { id: "3", type: "WARNING", source: "API Gateway", message: "High latency detected on prediction endpoint", timestamp: "10:46:30 AM" },
                    { id: "4", type: "ERROR", source: "Database", message: "Connection timeout while saving prediction history", timestamp: "10:48:01 AM" },
                    { id: "5", type: "INFO", source: "System", message: "Nightly backup completed", timestamp: "11:00:00 AM" },
                ];

                setTimeout(() => {
                    setLogs(mockData);
                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error("Failed to fetch logs", error);
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    // GSAP Animation triggers whenever loading finishes or filter changes
    useEffect(() => {
        if (!loading && logListRef.current) {
            const elements = logListRef.current.children;
            gsap.fromTo(
                elements,
                { opacity: 0, y: 15 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    stagger: 0.05,
                    ease: "power2.out",
                }
            );
        }
    }, [loading, filter]);

    const filteredLogs = filter === "ALL" ? logs : logs.filter(log => log.type === filter);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>System Logs</h1>
                    <p className={styles.subtitle}>Real-time system events and model inference tracking.</p>
                </div>

                <div className={styles.filters}>
                    {["ALL", "INFO", "SUCCESS", "WARNING", "ERROR"].map((f) => (
                        <button
                            key={f}
                            className={`${styles.filterBtn} ${filter === f ? styles.activeFilter : ""}`}
                            onClick={() => setFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </header>

            <div className={styles.logContainer}>
                {loading ? (
                    <div className={styles.loader}>Fetching system logs...</div>
                ) : (
                    <div className={styles.logList} ref={logListRef}>
                        {filteredLogs.length === 0 ? (
                            <div className={styles.emptyState}>No logs found for this filter.</div>
                        ) : (
                            filteredLogs.map((log) => (
                                <div key={log.id} className={styles.logRow}>
                                    <div className={styles.logTime}>{log.timestamp}</div>
                                    <div className={`${styles.logBadge} ${styles[log.type.toLowerCase()]}`}>
                                        {log.type}
                                    </div>
                                    <div className={styles.logSource}>[{log.source}]</div>
                                    <div className={styles.logMessage}>{log.message}</div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}