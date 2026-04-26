from flask import Blueprint, request, jsonify
from ml.predictor import predict_crop, predict_crop_with_confidence
from ml.disease_predictor import predict_disease

ml_bp = Blueprint("ml", __name__)

# ── Existing routes (kept, just renamed slightly) ─────────────────────────────
@ml_bp.route("/predict-crop", methods=["POST"])
def predict_crop_old():
    # Keep this so simulate_data.py still works if it ever calls it
    return _do_crop_prediction()

@ml_bp.route("/disease/detect", methods=["POST"])
def detect_disease_old():
    return _do_disease_detection("file")


# ── New routes the frontend calls ─────────────────────────────────────────────
@ml_bp.route("/ml/crop", methods=["POST"])
def predict_crop_api():
    return _do_crop_prediction()

@ml_bp.route("/ml/irrigation", methods=["POST"])
def predict_irrigation_api():
    data = request.get_json() or {}
    # Derive irrigation from soil moisture + rainfall thresholds
    # (your irrigation model uses the same RandomForest — wire it in here)
    soil_moisture = data.get("soil_moisture", 50)
    rainfall = data.get("rainfall", data.get("rainfall_mm", 0))
    humidity = data.get("humidity", 60)

    # Simple rule fallback if you don't have a separate irrigation .pkl
    needs = soil_moisture < 35 or (rainfall < 5 and humidity < 45)
    confidence = 0.82 if (soil_moisture < 25 or soil_moisture > 55) else 0.65

    return jsonify({
        "irrigation_needed": bool(needs),
        "prediction": "Yes" if needs else "No",
        "confidence": confidence,
    })

@ml_bp.route("/ml/disease", methods=["POST"])
def detect_disease_api():
    return _do_disease_detection("image")  # frontend sends field named 'image'


# ── Shared helpers ─────────────────────────────────────────────────────────────
def _do_crop_prediction():
    data = request.get_json() or {}
    try:
        features = [
            data["N"], data["P"], data["K"],
            data["temperature"], data["humidity"],
            data["ph"], data["rainfall"],
        ]
    except KeyError as e:
        return jsonify({"error": f"Missing field: {e}"}), 400

    crop, confidence = predict_crop_with_confidence(features)
    return jsonify({"crop": crop, "confidence": confidence})

def _do_disease_detection(field_name):
    if field_name not in request.files:
        return jsonify({"error": f"No image provided (expected field '{field_name}')"}), 400
    image_file = request.files[field_name]
    if not image_file.filename:
        return jsonify({"error": "No file selected"}), 400
    if image_file.mimetype and not image_file.mimetype.startswith("image/"):
        return jsonify({"error": "Upload an image file (JPEG, PNG, etc.)"}), 400
    try:
        result = predict_disease(image_file.read())
        return jsonify(result)
    except Exception as exc:
        return jsonify({"error": f"Prediction failed: {str(exc)}"}), 500