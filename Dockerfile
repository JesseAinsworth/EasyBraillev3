FROM python:3.11-slim

# Variables de entorno para optimización de memoria
ENV PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Instalar dependencias del sistema (mínimas)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    libgl1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Directorio de trabajo
WORKDIR /app

# Copiar requirements
COPY requirements.txt .

# Instalar dependencias Python (sin cache)
RUN pip install --no-cache-dir -r requirements.txt && \
    rm -rf ~/.cache/pip

# Copiar código y modelo
COPY app.py .
COPY runs/ ./runs/

# Crear directorio para uploads
RUN mkdir -p uploads

# Exponer puerto
EXPOSE 5000

# Comando de inicio con 1 worker y timeout largo
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--threads", "2", "--timeout", "120", "--worker-class", "sync", "--max-requests", "100", "--max-requests-jitter", "10", "--access-logfile", "-", "--error-logfile", "-", "app:app"]
