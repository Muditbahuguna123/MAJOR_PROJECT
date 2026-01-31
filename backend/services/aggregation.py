from database import get_db

def get_recent_averages(limit=10):
    db = get_db()
    rows = db.execute("""
        SELECT temperature, humidity
        FROM sensor_data
        ORDER BY timestamp DESC
        LIMIT ?
    """,(limit,)).fetchall()

    if not rows:
        return None
    
    avg_temp = sum(r["temperature"] for r in rows)/len(rows)
    avg_hum = sum(r["humidity"] for r in rows)/len(rows)

    return{
        "avg_temperature" : round(avg_temp,2),
        "avg_humidity" : round(avg_hum,2)
    }
