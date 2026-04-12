from database import get_db

def get_recent_averages(limit=10):
    db = get_db()
    rows = db.execute("""
        SELECT temperature, humidity, soil_moisture, rainfall_mm, sunlight_hours, wind_speed_kmh, soil_ph, irrigation_need
        FROM sensor_data
        ORDER BY timestamp DESC
        LIMIT ?
    """,(limit,)).fetchall()

    if not rows:
        return None

    numeric_fields = [
        "temperature",
        "humidity",
        "soil_moisture",
        "rainfall_mm",
        "sunlight_hours",
        "wind_speed_kmh",
        "soil_ph",
    ]

    averages = {}
    for field in numeric_fields:
        values = [r[field] for r in rows if r[field] is not None]
        averages[f"avg_{field}"] = round(sum(values) / len(values), 2) if values else None

    # rows are ordered by latest timestamp first
    averages["latest_irrigation_need"] = rows[0]["irrigation_need"]

    return averages
