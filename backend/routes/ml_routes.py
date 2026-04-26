from flask import Blueprint, request, jsonify
from ml.predictor import predict_crop
from ml.disease_predictor import predict_disease

ml_bp = Blueprint("ml", __name__)

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


@ml_bp.route("/disease/detect", methods=["POST"])
def detect_disease_api():
    if "file" not in request.files:
        return jsonify({"error": "No image file provided."}), 400

    image_file = request.files["file"]

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
