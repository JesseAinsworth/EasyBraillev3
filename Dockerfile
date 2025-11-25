FROM python:3.11-slim

# Variables de entorno
ENV PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Directorio de trabajo
WORKDIR /app

# Copiar requirements
COPY requirements.txt .

# Instalar dependencias Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código y modelo
COPY app.py .
COPY runs/ ./runs/

# Crear directorio para uploads
RUN mkdir -p uploads

# Exponer puerto
EXPOSE 5000

# Comando de inicio
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-", "app:app"]
