import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import numpy as np
import uuid

app = Flask(__name__)
CORS(app)

# Ruta del modelo YOLOv8
MODEL_PATH = os.path.join("yolov8_model", "best.pt")

# Cargar el modelo
model = YOLO(MODEL_PATH)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "EasyBraille YOLOv8 API funcionando"}), 200


@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No se envió ninguna imagen"}), 400

    file = request.files["image"]
    
    # Guardar imagen temporalmente
    filename = f"{uuid.uuid4().hex}.jpg"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # Cargar imagen
    img = Image.open(filepath).convert("RGB")
    img_np = np.array(img)

    # Hacer predicción
    results = model.predict(img_np, imgsz=640, conf=0.40)

    detections = []
    for r in results:
        for box in r.boxes:
            detections.append({
                "class": int(box.cls),
                "confidence": float(box.conf),
                "bbox": box.xyxy.tolist()[0]
            })

    return jsonify({
        "filename": filename,
        "detections": detections
    })

if __name__ == "__main__":
    # Producción NO usa debug/host=*, solo en pruebas
    app.run(host="0.0.0.0", port=5000)
