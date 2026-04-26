from database import get_db
from flask import Blueprint, request, jsonify
import random

sensor_bp = Blueprint("sensor", __name__)

# ── Existing route (keep as-is) ──────────────────────────────────────────────
@sensor_bp.route("/sensor-data", methods=["POST"])
def receive_sensor_data():
    data = request.json or {}

    temperature = data.get("temperature", data.get("Temperature_C"))
    humidity = data.get("humidity", data.get("Humidity"))

    if temperature is None or humidity is None:
        return jsonify({"error": "temperature and humidity are required"}), 400

    soil_moisture = data.get("soil_moisture", data.get("Soil_Moisture"))
    rainfall_mm = data.get("rainfall_mm", data.get("Rainfall_mm"))
    sunlight_hours = data.get("sunlight_hours", data.get("Sunlight_Hours"))
    wind_speed_kmh = data.get("wind_speed_kmh", data.get("Wind_Speed_kmh"))
    soil_ph = data.get("soil_ph", data.get("Soil_pH"))
    irrigation_need = data.get("irrigation_need", data.get("Irrigation_Need"))

    db = get_db()
    db.execute(
        """
        INSERT INTO sensor_data (
            temperature, humidity, soil_moisture, rainfall_mm,
            sunlight_hours, wind_speed_kmh, soil_ph, irrigation_need
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            float(temperature),
            float(humidity),
            float(soil_moisture) if soil_moisture is not None else None,
            float(rainfall_mm) if rainfall_mm is not None else None,
            float(sunlight_hours) if sunlight_hours is not None else None,
            float(wind_speed_kmh) if wind_speed_kmh is not None else None,
            float(soil_ph) if soil_ph is not None else None,
            irrigation_need,
        )
    )
    db.commit()
    return jsonify({"status": "ok"})


# ── New routes for frontend ───────────────────────────────────────────────────
@sensor_bp.route("/sensor/latest", methods=["GET"])
def latest():
    db = get_db()
    row = db.execute(
        "SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 1"
    ).fetchone()
    if row:
        return jsonify(dict(row))
    # DB is empty — return a simulated reading so dashboard isn't blank
    return jsonify(_make_simulated())

@sensor_bp.route("/sensor/history", methods=["GET"])
def history():
    limit = request.args.get("limit", 50, type=int)
    db = get_db()
    rows = db.execute(
        "SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT ?", (limit,)
    ).fetchall()
    data = [dict(r) for r in rows]
    # Return in chronological order for charts
    data.reverse()
    # Add a 'time' field the chart expects
    for i, row in enumerate(data):
        row["time"] = row.get("timestamp", f"t{i}")
    return jsonify(data)

@sensor_bp.route("/sensor/simulate", methods=["POST"])
def simulate():
    data = _make_simulated()
    db = get_db()
    db.execute(
        """
        INSERT INTO sensor_data (
            temperature, humidity, soil_moisture, rainfall_mm,
            sunlight_hours, wind_speed_kmh, soil_ph
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            data["temperature"], data["humidity"], data["soil_moisture"],
            data["rainfall_mm"], data["sunlight_hours"],
            data["wind_speed_kmh"], data["soil_ph"],
        )
    )
    db.commit()
    return jsonify({"status": "ok", **data})

def _make_simulated():
    return {
        "temperature":    round(random.uniform(20, 38), 1),
        "humidity":       round(random.uniform(40, 90), 1),
        "soil_moisture":  round(random.uniform(20, 70), 1),
        "rainfall_mm":    round(random.uniform(0, 30),  1),
        "sunlight_hours": round(random.uniform(3, 10),  1),
        "wind_speed_kmh": round(random.uniform(5, 25),  1),
        "soil_ph":        round(random.uniform(5.5, 7.5), 1),
    }