from flask import Blueprint, request, jsonify
from ml.predictor import predict_crop

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
