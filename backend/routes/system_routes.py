import json
from flask import Blueprint, request, jsonify
from database import get_db

system_bp = Blueprint("system", __name__)

DEFAULT_PROFILE = {
    "full_name": "",
    "email": "",
    "institution": "",
    "location": "",
}

DEFAULT_MODEL_CONFIG = {
    "rf_estimators": 100,
    "rf_random_state": 42,
    "test_split": 0.2,
    "confidence_threshold": 0.7,
    "disease_model": "MobileNetV2",
    "simulation_interval": 30,
}


def _ensure_settings_table(db):
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS app_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    db.commit()


def _get_setting(db, key, default_value):
    row = db.execute("SELECT value FROM app_settings WHERE key = ?", (key,)).fetchone()
    if row is None:
        return default_value

    try:
        return json.loads(row["value"])
    except (TypeError, json.JSONDecodeError):
        return default_value


def _save_setting(db, key, value):
    payload = json.dumps(value)
    db.execute(
        """
        INSERT INTO app_settings (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET
            value = excluded.value,
            updated_at = CURRENT_TIMESTAMP
        """,
        (key, payload),
    )
    db.commit()


@system_bp.route("/logs", methods=["GET"])
def get_logs():
    level_filter = (request.args.get("filter") or "ALL").upper()

    db = get_db()
    rows = db.execute(
        """
        SELECT id, severity, message, timestamp
        FROM alerts
        ORDER BY id DESC
        LIMIT 200
        """
    ).fetchall()

    logs = []
    for row in rows:
        level = (row["severity"] or "INFO").upper()
        entry = {
            "id": row["id"],
            "time": row["timestamp"],
            "level": level,
            "module": "Analytics",
            "message": row["message"],
        }
        if level_filter == "ALL" or entry["level"] == level_filter:
            logs.append(entry)

    return jsonify({"logs": logs})


@system_bp.route("/settings/profile", methods=["GET"])
def get_profile():
    db = get_db()
    _ensure_settings_table(db)
    profile = _get_setting(db, "profile", DEFAULT_PROFILE)
    return jsonify(profile)


@system_bp.route("/settings/profile", methods=["PUT"])
def update_profile():
    data = request.json or {}
    profile = {
        "full_name": data.get("full_name", ""),
        "email": data.get("email", ""),
        "institution": data.get("institution", ""),
        "location": data.get("location", ""),
    }

    db = get_db()
    _ensure_settings_table(db)
    _save_setting(db, "profile", profile)
    return jsonify(profile)


@system_bp.route("/settings/model-config", methods=["GET"])
def get_model_config():
    db = get_db()
    _ensure_settings_table(db)
    config = _get_setting(db, "model_config", DEFAULT_MODEL_CONFIG)
    return jsonify(config)


@system_bp.route("/settings/model-config", methods=["PUT"])
def update_model_config():
    data = request.json or {}

    config = {
        "rf_estimators": data.get("rf_estimators", DEFAULT_MODEL_CONFIG["rf_estimators"]),
        "rf_random_state": data.get("rf_random_state", DEFAULT_MODEL_CONFIG["rf_random_state"]),
        "test_split": data.get("test_split", DEFAULT_MODEL_CONFIG["test_split"]),
        "confidence_threshold": data.get("confidence_threshold", DEFAULT_MODEL_CONFIG["confidence_threshold"]),
        "disease_model": data.get("disease_model", DEFAULT_MODEL_CONFIG["disease_model"]),
        "simulation_interval": data.get("simulation_interval", DEFAULT_MODEL_CONFIG["simulation_interval"]),
    }

    db = get_db()
    _ensure_settings_table(db)
    _save_setting(db, "model_config", config)
    return jsonify(config)
