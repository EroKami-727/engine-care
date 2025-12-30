# MATCH HOST: Use Python 3.13 to match your Arch Linux environment
FROM python:3.13-slim

WORKDIR /app

# 1. Install system utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 2. Upgrade pip (Critical for finding TF 2.20+ wheels)
RUN pip install --upgrade pip

# 3. Install Libraries
# We explicitly install keras to ensure Keras 3+ is used
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    "tensorflow>=2.16" \
    "keras>=3.0" \
    pandas \
    numpy \
    scikit-learn \
    joblib

# 4. Copy source code
COPY . /app

# 5. Expose port
EXPOSE 8000

# 6. Run
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]