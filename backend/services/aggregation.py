from database import get_db

def get_recent_averages(limit=10):
    db = get_db()

    row = db.execute("""
        SELECT 
            ROUND(AVG(temperature), 2) AS avg_temperature,
            ROUND(AVG(humidity), 2) AS avg_humidity,
            ROUND(AVG(soil_moisture), 2) AS avg_soil_moisture,
            ROUND(AVG(rainfall_mm), 2) AS avg_rainfall_mm,
            ROUND(AVG(sunlight_hours), 2) AS avg_sunlight_hours,
            ROUND(AVG(wind_speed_kmh), 2) AS avg_wind_speed_kmh,
            ROUND(AVG(soil_ph), 2) AS avg_soil_ph
        FROM (
            SELECT *
            FROM sensor_data
            ORDER BY timestamp DESC
            LIMIT ?
        )
    """, (limit,)).fetchone()

    return dict(row) if row else None