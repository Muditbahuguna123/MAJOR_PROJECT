import os
import joblib

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "irrigation_model.pkl")

_model = None


def _load_model():
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Irrigation model not found at '{MODEL_PATH}'."
            )
        _model = joblib.load(MODEL_PATH)
    return _model


def predict_irrigation(features):
    """
    Expected feature order:
    [temperature, humidity, soil_moisture, rainfall_mm, sunlight_hours, wind_speed_kmh, soil_ph]
    """
    model = _load_model()
    prediction = model.predict([features])[0]

    if isinstance(prediction, str):
        pred_text = prediction.strip()
        norm = pred_text.lower()
        irrigation_needed = norm in {"yes", "true", "1", "high", "medium"}
    else:
        irrigation_needed = bool(prediction)
        pred_text = "Yes" if irrigation_needed else "No"

    confidence = None
    if hasattr(model, "predict_proba"):
        try:
            probs = model.predict_proba([features])[0]
            confidence = float(max(probs))
        except Exception:
            confidence = None

    result = {
        "prediction": pred_text,
        "irrigation_needed": irrigation_needed,
    }
    if isinstance(prediction, str):
        result["irrigation_level"] = pred_text
    if confidence is not None:
        result["confidence"] = round(confidence, 4)

    return result
