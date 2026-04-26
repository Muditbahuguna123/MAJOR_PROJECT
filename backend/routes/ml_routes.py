from flask import Blueprint, request, jsonify
from ml.predictor import predict_crop
from ml.disease_predictor import predict_disease
from ml.irrigation_predictor import predict_irrigation

ml_bp = Blueprint("ml", __name__)


def _to_float(value, field_name):
    try:
        return float(value)
    except (TypeError, ValueError):
        raise ValueError(f"Invalid numeric value for '{field_name}'")

@ml_bp.route("/predict-crop", methods=["POST"])
def predict_crop_api():
    data = request.json

    features = [
        data["N"],
        data["P"],
        data["K"],
        data["temperature"],
        data["humidity"],
        data["ph"],
        data["rainfall"]
    ]

    crop = predict_crop(features)

    return jsonify({
        "recommended_crop": crop
    })


@ml_bp.route("/ml/crop", methods=["POST"])
def predict_crop_frontend_api():
    data = request.json or {}

    try:
        features = [
            _to_float(data.get("N"), "N"),
            _to_float(data.get("P"), "P"),
            _to_float(data.get("K"), "K"),
            _to_float(data.get("temperature"), "temperature"),
            _to_float(data.get("humidity"), "humidity"),
            _to_float(data.get("ph"), "ph"),
            _to_float(data.get("rainfall"), "rainfall"),
        ]
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    crop = predict_crop(features)
    return jsonify({"crop": crop, "recommended_crop": crop})


@ml_bp.route("/ml/irrigation", methods=["POST"])
def predict_irrigation_frontend_api():
    data = request.json or {}

    try:
        features = [
            _to_float(data.get("temperature"), "temperature"),
            _to_float(data.get("humidity"), "humidity"),
            _to_float(data.get("soil_moisture"), "soil_moisture"),
            _to_float(data.get("rainfall_mm", data.get("rainfall")), "rainfall_mm"),
            _to_float(data.get("sunlight_hours"), "sunlight_hours"),
            _to_float(data.get("wind_speed_kmh"), "wind_speed_kmh"),
            _to_float(data.get("soil_ph"), "soil_ph"),
        ]
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    try:
        result = predict_irrigation(features)
        return jsonify(result)
    except Exception as exc:
        return jsonify({"error": f"Irrigation prediction failed: {str(exc)}"}), 500


@ml_bp.route("/disease/detect", methods=["POST"])
def detect_disease_api():
    if "file" not in request.files and "image" not in request.files:
        return jsonify({"error": "No image file provided."}), 400

    image_file = request.files.get("file") or request.files.get("image")

    if not image_file.filename:
        return jsonify({"error": "No image file selected."}), 400

    if image_file.mimetype and not image_file.mimetype.startswith("image/"):
        return jsonify({"error": "Upload an image file (JPEG, PNG, etc.)."}), 400

    try:
        image_bytes = image_file.read()
        result = predict_disease(image_bytes)
        return jsonify(result)
    except Exception as exc:
        return jsonify({"error": f"Prediction failed: {str(exc)}"}), 500


@ml_bp.route("/ml/disease", methods=["POST"])
def detect_disease_frontend_api():
    return detect_disease_api()
