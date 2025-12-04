"""
Script para descargar el modelo entrenado desde una URL externa.
Se ejecuta automáticamente en el despliegue de Render.
"""
import os
import urllib.request
import sys

# URL del modelo de Google Drive (descarga directa)
MODEL_URL = "https://drive.google.com/uc?export=download&id=1PbLx9hWWwbjAJ9tZfR2sNBo5VcfuE2dn"

# Ruta destino
MODEL_DIR = os.path.join("runs", "train", "braille_v1", "weights")
MODEL_PATH = os.path.join(MODEL_DIR, "best.pt")

def download_model():
    """Descarga el modelo si no existe localmente"""
    if os.path.exists(MODEL_PATH):
        print(f"✓ Modelo ya existe en: {MODEL_PATH}")
        return True
    
    print(f"⬇ Descargando modelo desde: {MODEL_URL}")
    
    try:
        # Crear directorio si no existe
        os.makedirs(MODEL_DIR, exist_ok=True)
        
        # Descargar modelo
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        
        file_size = os.path.getsize(MODEL_PATH) / (1024 * 1024)  # MB
        print(f"✓ Modelo descargado exitosamente: {file_size:.2f} MB")
        return True
        
    except Exception as e:
        print(f"✗ Error descargando modelo: {e}")
        return False

if __name__ == "__main__":
    success = download_model()
    sys.exit(0 if success else 1)
