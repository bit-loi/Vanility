# Stage 1: Build dependencies
FROM python:3.12-slim AS builder

WORKDIR /app

# Install build dependencies if needed (e.g. for C-extensions)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install dependencies to a target prefix folder
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Final lightweight runtime stage
FROM python:3.12-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Copy only the installed python modules from the builder stage
COPY --from=builder /install /usr/local

# Clean up tests, unittest suites, and cache folders under site-packages to save space
RUN find /usr/local -depth \
    \( \
        -name '__pycache__' -o \
        -name 'tests' -o \
        -name 'test' -o \
        -name 'unittest' \
    \) -exec rm -rf {} +

# Copy the rest of the application files
COPY . .

# Expose port (FastAPI default)
EXPOSE 8000

# Start Uvicorn, dynamically binding to the PORT environment variable injected by Railway
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
