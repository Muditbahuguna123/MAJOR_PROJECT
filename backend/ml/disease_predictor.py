import io
import json
import os

import torch
from PIL import Image
from torchvision import transforms
from torchvision.models import mobilenet_v2

BASE_DIR = os.path.dirname(__file__)

# Expected HuggingFace/PyTorch checkpoint path. Override with env var if needed.
MODEL_PATH = os.environ.get(
    "DISEASE_MODEL_PATH",
    os.path.join(BASE_DIR, "plant_disease_mobilenetv2.pth"),
)

# Optional class file path (JSON array or plain text one class per line).
CLASS_NAMES_PATH = os.environ.get(
    "DISEASE_CLASS_NAMES_PATH",
    os.path.join(BASE_DIR, "plant_disease_classes.json"),
)

DEFAULT_DISEASE_CLASS_NAMES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
]

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

_model = None
_class_names = None
_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def _load_class_names():
    if not os.path.exists(CLASS_NAMES_PATH):
        return DEFAULT_DISEASE_CLASS_NAMES

    _, ext = os.path.splitext(CLASS_NAMES_PATH)
    if ext.lower() == ".json":
        with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, list) and data:
            return [str(item) for item in data]
        raise ValueError("Class JSON must be a non-empty array.")

    with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]
    if not lines:
        raise ValueError("Class text file is empty.")
    return lines


def _build_model(num_classes):
    model = mobilenet_v2(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier[1] = torch.nn.Linear(in_features, num_classes)
    return model


def _load_checkpoint(model):
    checkpoint = torch.load(MODEL_PATH, map_location=_device)

    if isinstance(checkpoint, dict) and "state_dict" in checkpoint:
        state_dict = checkpoint["state_dict"]
    elif isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        state_dict = checkpoint["model_state_dict"]
    elif isinstance(checkpoint, dict):
        state_dict = checkpoint
    else:
        raise ValueError("Unsupported checkpoint format.")

    cleaned_state_dict = {}
    for key, value in state_dict.items():
        normalized_key = key.replace("module.", "", 1)

        normalized_key = normalized_key.replace("classifier.1.1.", "classifier.1.")
        cleaned_state_dict[normalized_key] = value
    model.load_state_dict(cleaned_state_dict, strict=True)


def load_model():
    global _model, _class_names
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found at '{MODEL_PATH}'. Place your .pth there or set DISEASE_MODEL_PATH."
            )

        _class_names = _load_class_names()
        _model = _build_model(len(_class_names))
        _load_checkpoint(_model)
        _model.to(_device)
        _model.eval()
    return _model


def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    transform = transforms.Compose(
        [
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
        ]
    )
    return transform(img).unsqueeze(0)


def _format_label(label):
    return label.replace("___", " - ").replace("_", " ")


def predict_disease(image_bytes):
    model = load_model()
    x_input = preprocess_image(image_bytes).to(_device)

    with torch.no_grad():
        logits = model(x_input)
        probs = torch.softmax(logits, dim=1)[0]

    idx = int(torch.argmax(probs).item())
    confidence = float(probs[idx].item())

    class_names = _class_names or DEFAULT_DISEASE_CLASS_NAMES
    disease_name = class_names[idx] if idx < len(class_names) else f"Class_{idx}"

    top_k = min(3, len(class_names))
    top_probs, top_indices = torch.topk(probs, k=top_k)
    top_predictions = []
    for prob, class_idx in zip(top_probs.tolist(), top_indices.tolist()):
        raw_label = class_names[class_idx] if class_idx < len(class_names) else f"Class_{class_idx}"
        top_predictions.append(
            {
                "class": raw_label,
                "label": _format_label(raw_label),
                "confidence": float(prob),
            }
        )

    return {
        "disease": disease_name,
        "label": _format_label(disease_name),
        "confidence": confidence,
        "model": "mobilenetv2-plantvillage-pytorch",
        "top_predictions": top_predictions,
    }
