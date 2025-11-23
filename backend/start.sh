#!/bin/bash
# Render start script for backend

cd backend
echo "Starting FastAPI server..."
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
