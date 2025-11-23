#!/bin/bash
# Setup script for backend

echo "Setting up backend..."

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please edit .env file with your configuration"
fi

# Create exports directory
mkdir -p exports

echo "Backend setup complete!"
echo "Don't forget to:"
echo "1. Edit .env file with your database and API keys"
echo "2. Run database migrations: alembic upgrade head"
echo "3. Start the server: uvicorn app.main:app --reload"

