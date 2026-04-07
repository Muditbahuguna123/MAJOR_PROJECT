from database import get_db
from flask import Blueprint, request, jsonify

sensor_bp = Blueprint("sensor", __name__)

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
