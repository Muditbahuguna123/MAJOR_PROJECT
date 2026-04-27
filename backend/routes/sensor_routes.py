from database import get_db
from flask import Blueprint, request, jsonify
import random

sensor_bp = Blueprint("sensor", __name__)


def _row_to_dict(row):
    return {
        "id": row["id"],
        "temperature": row["temperature"],
        "humidity": row["humidity"],
        "soil_moisture": row["soil_moisture"],
        "rainfall_mm": row["rainfall_mm"],
        "sunlight_hours": row["sunlight_hours"],
        "wind_speed_kmh": row["wind_speed_kmh"],
        "soil_ph": row["soil_ph"],
        "irrigation_need": row["irrigation_need"],
        "timestamp": row["timestamp"],
    }

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
            temperature,
            humidity,
            soil_moisture,
            rainfall_mm,
            sunlight_hours,
            wind_speed_kmh,
            soil_ph,
            irrigation_need
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


@sensor_bp.route("/sensor/latest", methods=["GET"])
def get_latest_sensor_data():
    db = get_db()
    row = db.execute(
        """
        SELECT id, temperature, humidity, soil_moisture, rainfall_mm,
               sunlight_hours, wind_speed_kmh, soil_ph, irrigation_need, timestamp
        FROM sensor_data
        ORDER BY timestamp DESC, id DESC
        LIMIT 1
        """
    ).fetchone()

    if row is None:
        return jsonify({"error": "No sensor data available"}), 404

    return jsonify(_row_to_dict(row))


@sensor_bp.route("/sensor/history", methods=["GET"])
def get_sensor_history():
    limit = request.args.get("limit", default=50, type=int)
    if limit is None or limit < 1:
        limit = 50
    limit = min(limit, 500)

    db = get_db()
    rows = db.execute(
        """
        SELECT id, temperature, humidity, soil_moisture, rainfall_mm,
               sunlight_hours, wind_speed_kmh, soil_ph, irrigation_need, timestamp
        FROM sensor_data
        ORDER BY timestamp DESC, id DESC
        LIMIT ?
        """,
        (limit,),
    ).fetchall()

    # Return oldest -> newest for charts.
    history = [_row_to_dict(row) for row in reversed(rows)]
    return jsonify(history)


'''@sensor_bp.route("/sensor/simulate", methods=["POST"])
def simulate_sensor_data():
    payload = {
        "temperature": round(random.uniform(20.0, 40.0), 2),
        "humidity": round(random.uniform(30.0, 90.0), 2),
        "soil_moisture": round(random.uniform(15.0, 70.0), 2),
        "rainfall_mm": round(random.uniform(0.0, 30.0), 2),
        "sunlight_hours": round(random.uniform(2.0, 10.0), 2),
        "wind_speed_kmh": round(random.uniform(1.0, 25.0), 2),
        "soil_ph": round(random.uniform(5.5, 8.0), 2),
    }
    payload["irrigation_need"] = "Yes" if payload["soil_moisture"] < 35 else "No"

    db = get_db()
    db.execute(
        """
        INSERT INTO sensor_data (
            temperature,
            humidity,
            soil_moisture,
            rainfall_mm,
            sunlight_hours,
            wind_speed_kmh,
            soil_ph,
            irrigation_need
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payload["temperature"],
            payload["humidity"],
            payload["soil_moisture"],
            payload["rainfall_mm"],
            payload["sunlight_hours"],
            payload["wind_speed_kmh"],
            payload["soil_ph"],
            payload["irrigation_need"],
        ),
    )
    db.commit()

    row = db.execute(
        """
        SELECT id, temperature, humidity, soil_moisture, rainfall_mm,
               sunlight_hours, wind_speed_kmh, soil_ph, irrigation_need, timestamp
        FROM sensor_data
        ORDER BY id DESC
        LIMIT 1
        """
    ).fetchone()
    return jsonify(_row_to_dict(row)), 201'''
