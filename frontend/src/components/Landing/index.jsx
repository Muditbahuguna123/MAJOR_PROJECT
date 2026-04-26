import { Outlet } from 'react-router-dom';
import styles from "./style.module.css";
import Sidebar from "../Sidebar/index.jsx";
import Header from "../Header/index.jsx";

export default function Landing() {
    return (
        <div className={styles.shell}>
            <Sidebar />
            <div className={styles.main}>
                <Header />
                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}