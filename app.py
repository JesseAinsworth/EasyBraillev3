import os
import gc
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import numpy as np
import uuid
from werkzeug.utils import secure_filename

# Descargar modelo si no existe
try:
    import download_model
    download_model.download_model()
except Exception as e:
    print(f"Advertencia al descargar modelo: {e}")

app = Flask(__name__)
CORS(app)

# Configuración
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB (reducido)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Cargar modelo con lazy loading
MODEL_PATH = os.path.join("runs", "train", "braille_v1", "weights", "best.pt")
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = "yolov8n.pt"
    print(f"  Usando modelo base: {MODEL_PATH}")
else:
    print(f" Modelo cargado: {MODEL_PATH}")

# Cargar modelo solo una vez
model = None

def get_model():
    global model
    if model is None:
        model = YOLO(MODEL_PATH)
        model.fuse()  # Optimizar modelo
    return model

# Mapeo de clases (A-Z)
CLASS_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
               'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "EasyBraille API - Detección de Braille",
        "version": "1.0",
        "endpoints": {
            "/health": "GET - Estado del servicio",
            "/predict": "POST - Detectar caracteres Braille"
        }
    }), 200

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "model": MODEL_PATH
    }), 200

@app.route("/predict", methods=["POST"])
def predict():
    filepath = None
    try:
        # Validar imagen
        if "image" not in request.files:
            return jsonify({"error": "No se envió imagen"}), 400

        file = request.files["image"]
        if file.filename == '':
            return jsonify({"error": "Nombre de archivo vacío"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Formato no permitido"}), 400

        # Guardar imagen temporalmente
        filename = secure_filename(f"{uuid.uuid4().hex[:8]}.jpg")
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        # Verificar tamaño
        if os.path.getsize(filepath) > MAX_FILE_SIZE:
            return jsonify({"error": "Archivo muy grande (máx 5MB)"}), 413

        # Cargar y redimensionar imagen para ahorrar memoria
        img = Image.open(filepath).convert("RGB")
        
        # Limitar tamaño máximo
        max_size = 1280
        if max(img.size) > max_size:
            img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
        
        img_np = np.array(img)
        
        # Liberar memoria de PIL
        img.close()
        del img

        # Configuración de predicción
        conf_threshold = float(request.form.get('confidence', 0.30))

        # Hacer predicción con el modelo
        m = get_model()
        results = m.predict(
            img_np, 
            imgsz=640, 
            conf=conf_threshold, 
            verbose=False,
            half=False  # No usar half precision para ahorrar memoria
        )

        # Procesar detecciones
        detections = []
        detected_text = []

        for r in results:
            boxes = r.boxes
            for box in boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                bbox = box.xyxy[0].tolist()

                class_name = CLASS_NAMES[class_id] if class_id < len(CLASS_NAMES) else f"Class_{class_id}"

                detections.append({
                    "class_id": class_id,
                    "class_name": class_name,
                    "confidence": round(confidence, 3),
                    "bbox": [round(coord, 2) for coord in bbox]
                })

                detected_text.append(class_name)

        # Limpiar memoria
        del img_np
        del results
        gc.collect()

        response = {
            "success": True,
            "detections_count": len(detections),
            "detections": detections,
            "text": "".join(detected_text)
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    finally:
        # Limpiar archivo temporal
        if filepath and os.path.exists(filepath):
            try:
                os.remove(filepath)
            except:
                pass

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({"error": "Archivo demasiado grande (máx 5MB)"}), 413

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
