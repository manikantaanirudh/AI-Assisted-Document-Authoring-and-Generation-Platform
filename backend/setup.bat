@echo off
REM Setup script for backend (Windows)

echo Setting up backend...

REM Create virtual environment
python -m venv venv

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo Please edit .env file with your configuration
)

REM Create exports directory
if not exist exports mkdir exports

echo Backend setup complete!
echo Don't forget to:
echo 1. Edit .env file with your database and API keys
echo 2. Run database migrations: alembic upgrade head
echo 3. Start the server: uvicorn app.main:app --reload

