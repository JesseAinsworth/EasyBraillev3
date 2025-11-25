# EasyBraille API - Guía de Despliegue en Render

##  Despliegue en Render (Gratis)

### Paso 1: Preparar el Repositorio

1. Crea un nuevo repositorio en GitHub
2. Sube estos archivos:
   - `app.py`
   - `requirements.txt`
   - `Dockerfile`
   - `runs/train/braille_v1/weights/best.pt`

```bash
git init
git add app.py requirements.txt Dockerfile .dockerignore
git add runs/train/braille_v1/weights/best.pt
git commit -m "Initial commit: EasyBraille API"
git remote add origin https://github.com/TU_USUARIO/easybraille-api.git
git push -u origin main
```

### Paso 2: Configurar en Render

1. Ve a [render.com](https://render.com) y crea una cuenta
2. Click en "New +"  "Web Service"
3. Conecta tu repositorio de GitHub
4. Configuración:
   - **Name**: `easybraille-api`
   - **Environment**: `Docker`
   - **Region**: Elige la más cercana
   - **Branch**: `main`
   - **Plan**: `Free`

5. Click en "Create Web Service"

### Paso 3: Esperar el Despliegue

Render automáticamente:
- Construirá la imagen Docker
- Instalará todas las dependencias
- Desplegará tu API

Tiempo estimado: 5-10 minutos

### Paso 4: Probar la API

Una vez desplegado, tu API estará en:
```
https://easybraille-api.onrender.com
```

**Endpoints:**
- `GET /` - Información de la API
- `GET /health` - Estado del servicio
- `POST /predict` - Detectar Braille (enviar imagen)

### Ejemplo de Uso

```bash
# Prueba básica
curl https://easybraille-api.onrender.com/health

# Detectar Braille en imagen
curl -X POST \
  https://easybraille-api.onrender.com/predict \
  -F "image=@imagen_braille.jpg" \
  -F "confidence=0.3"
```

##  Alternativas de Despliegue Gratis

### Railway.app
- 500 horas gratis/mes
- Despliegue automático desde Git
- Similar a Render

### Fly.io
- 3 VMs gratis
- Soporte para Docker
- Buen performance

### Google Cloud Run
- 2 millones de requests gratis/mes
- Serverless
- Excelente escalabilidad

##  Limitaciones del Plan Gratuito en Render

- La instancia se "duerme" después de 15 min de inactividad
- Primera petición después del "sleep" toma ~30-60s
- 750 horas gratis/mes
- Sin soporte para GPU (solo CPU)

##  Optimizaciones

Para mejor rendimiento:
1. Usar el modelo más ligero (yolov8n.pt)  Ya configurado
2. Reducir tamaño de imagen en predicción
3. Implementar cache para respuestas frecuentes
4. Considerar upgrade a plan pagado ($7/mes) para evitar "sleep"

##  Soporte

Si tienes problemas:
1. Revisa los logs en Render Dashboard
2. Verifica que el modelo `best.pt` esté incluido en el repo
3. Asegúrate de que `requirements.txt` tenga todas las dependencias
