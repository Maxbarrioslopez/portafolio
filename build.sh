#!/bin/bash
set -e

echo "=== Building Portfolio App ==="

# Install Python dependencies
echo "Installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r backend/requirements.txt || exit 1

# Build frontend
echo "Building frontend..."
cd frontend
npm ci || exit 1
npm run build || exit 1
cd ..

# Django migrations & data loading
echo "Running Django migrations..."
cd backend
python manage.py migrate --noinput || exit 1
python manage.py loaddata api/fixtures/initial_data.json || exit 1
cd ..

echo "✅ Build complete!"
