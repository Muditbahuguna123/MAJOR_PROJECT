import styles from "./style.module.css";

export default function Header() {
    const now = new Date().toISOString().split("T")[0];
    return (
        <header className={styles.header}>
            <div className={styles.liveBadge}>
                <span className={styles.dot} />
                Live: Simulated Data
            </div>
            <span className={styles.sync}>Last data sync: {now}</span>
        </header>
    );
}