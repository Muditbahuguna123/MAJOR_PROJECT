from flask import Blueprint, jsonify
from services.aggregation import get_recent_averages
from services.stress_engine import evaluate_stress, log_alert

analytics_bp = Blueprint("analytics",__name__)

@analytics_bp.route("/layer1-status")
def layer1_status():
    averages = get_recent_averages()

    if not averages:
        return jsonify({"message": "No data"})
    
    stress = evaluate_stress(
        averages["avg_temperature"],
        averages["avg_humidity"]
    )
    
    # im thinking about removing this log_alert since stress can be called using this api, it is calculated above and returned below
    if stress == "High":
        log_alert("HIGH", "Heat stress detected")

    return jsonify({
        "averages": averages,
        "stress_level": stress
    })

