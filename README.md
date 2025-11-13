# EasyBraille - AI/ML

Modelos y scripts de IA para detección y reconocimiento de Braille usando **YOLOv8**.

## 🚀 Inicio Rápido

### Requisitos
- Python 3.8+
- pip
- GPU recomendada (CUDA)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/JesseAinsworth/EasyBraille-AI.git
cd EasyBraille-AI

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

## 📁 Estructura del Proyecto

```
.
├── dataset/                 # Dataset de entrenamiento
│   ├── train/              # Imágenes de entrenamiento
│   ├── valid/              # Imágenes de validación
│   ├── test/               # Imágenes de prueba
│   └── data.yaml           # Configuración del dataset
├── yolov8_model/           # Modelo entrenado
│   ├── best.pt             # Pesos del mejor modelo
│   ├── __init__.py
│   └── detect.py           # Script de detección
├── YOLOv8/                 # Diferentes versiones de modelos
│   ├── yolov8n/
│   ├── yolov8n2/
│   └── yolov8n3/
├── train.py                # Script de entrenamiento
├── braille_detector.py     # Detector de Braille
├── requirements.txt        # Dependencias
└── README.md              # Este archivo
```

## 🎯 Uso

### Entrenar un Modelo

```bash
python train.py
```

Este script:
- Cargará el dataset desde `dataset/data.yaml`
- Entrenará un modelo YOLOv8
- Guardará los pesos en `yolov8_model/best.pt`

### Realizar Detección

```python
from yolov8_model.detect import BrailleDetector

detector = BrailleDetector(model_path='yolov8_model/best.pt')
results = detector.detect('path/to/image.jpg')
```

### Usar Detector de Braille

```python
from braille_detector import BrailleDetector

detector = BrailleDetector()
characters = detector.detect_and_translate('path/to/image.jpg')
print(characters)  # Output: caracteres Braille detectados
```

## 📊 Dataset

El dataset debe estar estructurado en formato YOLO:

```
dataset/
├── train/
│   ├── images/
│   │   └── *.jpg
│   └── labels/
│       └── *.txt
├── valid/
│   ├── images/
│   └── labels/
└── data.yaml
```

### Archivo `data.yaml`

```yaml
path: ./dataset
train: train/images
val: valid/images
test: test/images

nc: 64  # Número de clases (caracteres Braille)
names: ['char_0', 'char_1', ...]  # Nombres de clases
```

## 🧠 Modelos Disponibles

- **YOLOv8 Nano** (yolov8n.pt): Ligero, rápido
- **YOLOv8 Small** (yolov8s.pt): Balanceado
- **YOLOv8 Medium** (yolov8m.pt): Mayor precisión
- **YOLOv8 Large** (yolov8l.pt): Alta precisión

## 📚 Tecnologías Principales

- **IA/ML**: YOLOv8 (Ultralytics)
- **Lenguaje**: Python 3
- **Procesamiento de Imagen**: OpenCV, Pillow
- **Arrays Numéricos**: NumPy
- **Configuración**: PyYAML

## 🔧 Configuración de Entrenamiento

En `train.py`, puedes ajustar:

```python
model.train(
    data='dataset/data.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    device=0,  # GPU ID, o 'cpu'
    patience=20,
    save=True,
    val=True,
)
```

## 📊 Evaluar Modelo

```bash
python -c "
from ultralytics import YOLO
model = YOLO('yolov8_model/best.pt')
metrics = model.val()
print(metrics)
"
```

## 🎨 Visualizar Resultados

```python
from ultralytics import YOLO
import cv2

model = YOLO('yolov8_model/best.pt')
results = model.predict('image.jpg', conf=0.5)

for result in results:
    im_array = result.plot()
    cv2.imshow('YOLO Results', im_array)
    cv2.waitKey(0)
```

## 🐳 Docker

```bash
# Construir imagen
docker build -t easybraille-ai .

# Ejecutar contenedor
docker run --gpus all -v $(pwd):/workspace easybraille-ai python train.py
```

## 📖 Documentación Adicional

- [YOLOv8 Documentation](https://docs.ultralytics.com/)
- [YOLOv8 GitHub](https://github.com/ultralytics/ultralytics)
- [OpenCV Docs](https://docs.opencv.org/)

## 📝 Licencia

Este proyecto es parte de EasyBraille.

## 👥 Contribuir

Las contribuciones son bienvenidas. Por favor, crea un fork, realiza tus cambios y envía un pull request.
