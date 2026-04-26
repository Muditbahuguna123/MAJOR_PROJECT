import joblib
import os

BASE_DIR = os.path.dirname(__file__)

model = joblib.load(os.path.join(BASE_DIR, "crop_model.pkl"))
encoder = joblib.load(os.path.join(BASE_DIR, "label_encoder.pkl"))

def predict_crop(features):
    prediction = model.predict([features])
    crop = encoder.inverse_transform(prediction)
    return crop[0]

def predict_crop_with_confidence(features):
    prediction = model.predict([features])
    crop = encoder.inverse_transform(prediction)[0]
    proba = model.predict_proba([features]).max()
    return crop, round(float(proba), 2)