from database import get_db
from flask import Blueprint, jsonify
from services.aggregation import get_recent_averages
from services.stress_engine import evaluate_stress, log_alert

analytics_bp = Blueprint("analytics",__name__)

@analytics_bp.route("/layer1-status")

def layer1_status():
    averages = get_recent_averages()

    if not averages:
        return jsonify({"message": "No data"})
    
    stress, irrigation = evaluate_stress(
        averages["avg_temperature"],
        averages["avg_humidity"]
    )
    
    if stress == "High":
        log_alert("HIGH", "Heat stress detected")

    return jsonify({
        "averages": averages,
        "stress_level": stress,
        "irrigation_signal": irrigation
    })
