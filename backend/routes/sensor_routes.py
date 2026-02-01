from database import get_db
from flask import Blueprint, request, jsonify

sensro_bp = Blueprint("sensor", __name__)

@sensro_bp.route("/sensor-data", methods=["POST"])

def receive_sensor_data():
    data = request.json
    db = get_db
    db.execute(
        "INSERT INTO sensor_data (temperature, humidity) VALUES (?,?)"
        ,(data["temperature"], data["humidity"])
    )
    db.commit()
    return jsonify({"status": "ok"})
