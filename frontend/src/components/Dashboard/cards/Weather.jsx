import { useState, useEffect } from "react";
import styles from "../style.module.css";

// Helper to convert WMO weather codes into text
const getWeatherCondition = (code) => {
    if (code === 0) return "Clear";
    if (code === 1 || code === 2 || code === 3) return "Cloudy";
    if (code >= 45 && code <= 48) return "Fog";
    if (code >= 51 && code <= 67) return "Rain";
    if (code >= 71 && code <= 77) return "Snow";
    if (code >= 95) return "Storms";
    return "Unknown";
};

export default function WeatherCard({ className }) {
    const [weather, setWeather] = useState({ current: null, forecast: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Added 'daily' parameters for max/min temp and weather code, and set timezone
                const res = await fetch(
                    "https://api.open-meteo.com/v1/forecast?latitude=27.18&longitude=78.02&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto"
                );
                const data = await res.json();

                // Extract the next 4 days (skipping index 0, which is today)
                const upcomingDays = data.daily.time.slice(1, 5).map((dateStr, index) => {
                    const i = index + 1;
                    const dateObj = new Date(dateStr);
                    return {
                        day: dateObj.toLocaleDateString("en-US", { weekday: "short" }),
                        max: Math.round(data.daily.temperature_2m_max[i]),
                        min: Math.round(data.daily.temperature_2m_min[i]),
                        condition: getWeatherCondition(data.daily.weather_code[i]),
                    };
                });

                setWeather({
                    current: {
                        temp: Math.round(data.current.temperature_2m),
                        condition: getWeatherCondition(data.current.weather_code),
                    },
                    forecast: upcomingDays,
                });
            } catch (err) {
                console.error("Failed to fetch weather", err);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, []);

    return (
        <div className={`${styles.cardBase} ${className}`}>
            <div className={styles.cardHeader}>
                <div className={`${styles.cardIconWrap} ${styles.blue}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2a70c0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
                    </svg>
                </div>
                <div>
                    <p className={styles.cardMicroLabel}>Live & Forecast</p>
                    <h3 className={styles.cardTitle}>
                        {loading ? "..." : `${weather.current?.temp}°C`}
                    </h3>
                </div>
            </div>

            <div className={styles.confRow} style={{ marginBottom: 0 }}>
                <span className={styles.confLabel}>Currently</span>
                <span className={styles.confVal} style={{ color: "var(--accent-blue)" }}>
          {loading ? "Fetching..." : weather.current?.condition}
        </span>
            </div>

            {/* Forecast List */}
            {!loading && weather.forecast.length > 0 && (
                <div className={styles.forecastList}>
                    {weather.forecast.map((dayData) => (
                        <div key={dayData.day} className={styles.forecastRow}>
                            <span className={styles.forecastDay}>{dayData.day}</span>
                            <span className={styles.forecastCond}>{dayData.condition}</span>
                            <div className={styles.forecastTemp}>
                                {dayData.max}° <span className={styles.forecastMin}>{dayData.min}°</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}