# 1. Base Image
FROM python:3.11-slim

# 2. Set working directory
WORKDIR /app

# 3. Install system dependencies (for TensorFlow/Scikit)
RUN apt-get update && apt-get install -y --no-install-recommends gcc libgomp1 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# 4. Copy the Brain and the Code
COPY models/engine_model.pkl /app/models/engine_model.pkl
COPY backend/ /app/backend/

# 5. Install Python Libraries
RUN pip install --no-cache-dir pandas numpy scikit-learn tensorflow flask fastapi uvicorn python-multipart joblib

# 6. Expose the port
EXPOSE 8000

# 7. Start the server
CMD ["python", "backend/main.py"]