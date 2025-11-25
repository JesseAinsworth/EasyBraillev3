import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import numpy as np
import uuid
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Configuración
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'bmp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Cargar modelo
MODEL_PATH = os.path.join("runs", "train", "braille_v1", "weights", "best.pt")
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = "yolov8n.pt"  # Fallback al modelo base
    print(f"  Usando modelo base: {MODEL_PATH}")
else:
    print(f" Modelo cargado: {MODEL_PATH}")

model = YOLO(MODEL_PATH)

# Mapeo de clases (A-Z)
CLASS_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
               'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "EasyBraille API - Detección de Braille con YOLOv8",
        "version": "1.0",
        "endpoints": {
            "/health": "Verificar estado del servicio",
            "/predict": "POST - Detectar caracteres Braille en imagen"
        }
    }), 200

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "model": MODEL_PATH,
        "classes": len(CLASS_NAMES)
    }), 200

@app.route("/predict", methods=["POST"])
def predict():
    # Validar que se envió una imagen
    if "image" not in request.files:
        return jsonify({"error": "No se envió ninguna imagen"}), 400
    
    file = request.files["image"]
    
    if file.filename == '':
        return jsonify({"error": "Nombre de archivo vacío"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"error": "Formato de archivo no permitido. Use: " + ", ".join(ALLOWED_EXTENSIONS)}), 400
    
    try:
        # Guardar imagen temporalmente
        filename = secure_filename(f"{uuid.uuid4().hex}_{file.filename}")
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Cargar y procesar imagen
        img = Image.open(filepath).convert("RGB")
        img_np = np.array(img)
        
        # Configuración de predicción
        conf_threshold = float(request.form.get('confidence', 0.25))
        
        # Hacer predicción
        results = model.predict(img_np, imgsz=640, conf=conf_threshold, verbose=False)
        
        # Procesar detecciones
        detections = []
        detected_text = []
        
        for r in results:
            boxes = r.boxes
            for box in boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                bbox = box.xyxy[0].tolist()
                
                # Obtener nombre de la clase
                class_name = CLASS_NAMES[class_id] if class_id < len(CLASS_NAMES) else f"Class_{class_id}"
                
                detections.append({
                    "class_id": class_id,
                    "class_name": class_name,
                    "confidence": round(confidence, 3),
                    "bbox": [round(coord, 2) for coord in bbox]
                })
                
                detected_text.append(class_name)
        
        # Limpiar archivo temporal
        if os.path.exists(filepath):
            os.remove(filepath)
        
        return jsonify({
            "success": True,
            "detections_count": len(detections),
            "detections": detections,
            "text": "".join(detected_text),
            "filename": filename
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": f"Error al procesar la imagen: {str(e)}"
        }), 500

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({"error": "Archivo demasiado grande. Máximo 10MB"}), 413

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
