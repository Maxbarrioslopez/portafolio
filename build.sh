#!/bin/bash
set -e

echo "=== Building Portfolio App ==="

# Frontend build
echo "Building frontend..."
cd frontend
npm ci
npm run build
cd ..

# Backend migrations
echo "Running Django migrations..."
cd backend
python manage.py migrate
python manage.py loaddata api/fixtures/initial_data.json
cd ..

echo "✅ Build complete!"
