from database import get_db
from flask import Blueprint, jsonify, request
from services.aggregation import get_recent_averages
from services.stress_engine import evaluate_stress, log_alert

analytics_bp = Blueprint("analytics", __name__)

# ── Existing route (keep) ─────────────────────────────────────────────────────
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
        "irrigation_signal": irrigation,
    })


# ── New routes the frontend calls ─────────────────────────────────────────────
@analytics_bp.route("/analytics/summary")
def analytics_summary():
    db = get_db()
    rows = db.execute(
        "SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 100"
    ).fetchall()
    data = [dict(r) for r in rows]
    data.reverse()
    for i, row in enumerate(data):
        row["time"] = row.get("timestamp", f"t{i}")
    return jsonify({"history": data, "count": len(data)})

@analytics_bp.route("/logs")
def get_logs():
    filter_type = request.args.get("filter", "ALL")
    db = get_db()
    rows = db.execute(
        "SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 50"
    ).fetchall()
    logs = [dict(r) for r in rows]
    if filter_type != "ALL":
        logs = [l for l in logs if l.get("severity") == filter_type]
    return jsonify(logs)

@analytics_bp.route("/settings/profile", methods=["GET", "PUT"])
def profile():
    if request.method == "GET":
        return jsonify({"full_name": "", "email": ""})
    data = request.get_json() or {}
    return jsonify({"status": "saved", "full_name": data.get("full_name", ""), "email": data.get("email", "")})

@analytics_bp.route("/settings/model-config", methods=["GET", "PUT"])
def model_config():
    return jsonify({"model": "RandomForest", "version": "1.0", "threshold": 0.5})