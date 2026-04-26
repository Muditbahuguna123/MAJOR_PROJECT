import { useState, useEffect } from "react";
import Graph from "../../components/Dashboard/cards/Graph.jsx";
import styles from "./style.module.css";

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await fetch("/api/v1/analytics/predictions");
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return <div className={styles.loader}>Loading Analytics...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Group Insights</h1>
                <p className={styles.subtitle}>Real-time prediction metrics from your backend.</p>
            </header>

            <section className={styles.statsGrid}>
                {data?.stats.map((item, index) => (
                    <div key={index} className={styles.statCard}>
                        <span className={styles.label}>{item.label}</span>
                        <div className={styles.value}>{item.value}</div>
                        <div className={item.trend >= 0 ? styles.trendUp : styles.trendDown}>
                            {item.trend >= 0 ? "↑" : "↓"} {Math.abs(item.trend)}%
                        </div>
                    </div>
                ))}
            </section>

            <section className={styles.graphContainer}>
                <div className={styles.graphInfo}>
                    <h3>Performance Over Time</h3>
                </div>
                <Graph chartData={data?.history} />
            </section>
        </div>
    );
}