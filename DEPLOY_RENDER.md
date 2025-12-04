# 🚀 Guía de Despliegue en Render - EasyBraille

## 📋 Pasos Previos

### 1. Subir el Modelo Entrenado

El archivo `best.pt` (6 MB) debe subirse a un servicio de almacenamiento:

**Opción A: Google Drive**
1. Sube `best.pt` a Google Drive
2. Haz clic derecho → Compartir → "Cualquiera con el enlace"
3. Copia el ID del archivo de la URL: `https://drive.google.com/file/d/FILE_ID/view`
4. Usa este enlace directo:
   ```
   https://drive.google.com/uc?export=download&id=FILE_ID
   ```

**Opción B: Dropbox**
1. Sube `best.pt` a Dropbox
2. Obtén el enlace de compartir
3. Cambia `dl=0` por `dl=1` al final del enlace

**Opción C: GitHub Release**
1. Ve a tu repo → Releases → Create new release
2. Sube `best.pt` como asset
3. Usa la URL directa del asset

### 2. Configurar la URL del Modelo

Edita `download_model.py` y actualiza la línea:
```python
MODEL_URL = "TU_URL_AQUI"  # Pega aquí la URL de descarga directa
```

## 🔧 Despliegue en Render

### Método 1: Desde el Dashboard (Recomendado)

1. **Crear Nuevo Web Service**
   - Ve a https://dashboard.render.com/
   - Click en "New +" → "Web Service"

2. **Conectar Repositorio**
   - Selecciona tu repositorio de GitHub
   - Rama: `ai` o `main`

3. **Configuración del Servicio**
   ```
   Name: easybraille-api
   Region: Oregon (US West)
   Branch: ai
   Root Directory: (dejar vacío)
   Environment: Python 3
   Build Command: pip install -r requirements.txt && python download_model.py
   Start Command: gunicorn app:app
   Plan: Free
   ```

4. **Variables de Entorno**
   - Click en "Advanced" → "Add Environment Variable"
   - Agrega:
     ```
     PORT = 10000
     PYTHON_VERSION = 3.11.0
     ```

5. **Desplegar**
   - Click en "Create Web Service"
   - Espera 5-10 minutos

### Método 2: Con render.yaml (Automático)

Si ya existe `render.yaml` en tu repo:

1. Ve a https://dashboard.render.com/
2. Click en "New +" → "Blueprint"
3. Conecta tu repositorio
4. Render detectará automáticamente `render.yaml`
5. Click en "Apply"

## ✅ Verificación

Una vez desplegado:

1. **Verifica el Health Check**
   ```bash
   curl https://tu-app.onrender.com/health
   ```
   
   Respuesta esperada:
   ```json
   {
     "status": "healthy",
     "model": "runs/train/braille_v1/weights/best.pt"
   }
   ```

2. **Prueba la API**
   ```bash
   curl -X POST https://tu-app.onrender.com/predict \
     -F "image=@ruta/a/tu/imagen.jpg" \
     -F "confidence=0.3"
   ```

## 🔍 Logs y Debugging

Ver logs en Render:
- Dashboard → Tu servicio → "Logs"
- Busca: "✓ Modelo descargado exitosamente"

## 📝 Archivos Necesarios

Asegúrate de tener estos archivos en tu repositorio:

- ✅ `app.py` - API Flask
- ✅ `download_model.py` - Script de descarga del modelo
- ✅ `requirements.txt` - Dependencias
- ✅ `render.yaml` - Configuración de Render
- ✅ `README.md` - Documentación

**NO incluyas:**
- ❌ `best.pt` (se descarga automáticamente)
- ❌ `runs/` (directorio generado dinámicamente)
- ❌ `uploads/` (temporal)

## 🐛 Troubleshooting

**Error: Modelo no descarga**
- Verifica que la URL sea de descarga directa
- Comprueba los logs: debe aparecer "✓ Modelo descargado"

**Error: Out of Memory**
- El plan Free de Render tiene 512 MB RAM
- Si falla, considera Render Paid Plan ($7/mes con 2 GB RAM)

**Error: Build Failed**
- Verifica que `requirements.txt` tenga todas las dependencias
- Revisa los logs de build en Render

## 📚 Recursos

- [Documentación de Render](https://render.com/docs)
- [Render Free Tier](https://render.com/docs/free)
