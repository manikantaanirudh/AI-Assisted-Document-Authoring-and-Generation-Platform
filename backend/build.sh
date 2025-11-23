#!/bin/bash
# Render build script for backend

echo "Installing Python dependencies..."
pip install -r backend/requirements.txt

echo "Running database migrations..."
cd backend
alembic upgrade head

echo "Build complete!"
