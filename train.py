from ultralytics import YOLO

# Ruta al archivo YAML
DATA_PATH = "dataset/data.yaml"

# Crear modelo YOLOv8n (puedes cambiar a 'yolov8s', 'yolov8m', etc.)
model = YOLO("yolov8n.pt")

# Entrenamiento
model.train(
    data=DATA_PATH,
    epochs=50,       # Número de épocas
    imgsz=640,       # Tamaño de imagen
    batch=8,         # Tamaño de lote
    name="braille_model"
)

print("✅ Entrenamiento finalizado. Modelo guardado en runs/train/braille_model")
