# AI-Assisted Document Authoring and Generation Platform

A full-stack web application that allows authenticated users to generate, refine, and export structured business documents (Word .docx or PowerPoint .pptx) using AI-powered content generation.

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL
- **Authentication**: JWT (OAuth2 password + bearer)
- **LLM**: Configurable adapter (OpenAI/Gemini)
- **Export Libraries**: python-docx, python-pptx

## Project Structure

```
.
├── backend/          # FastAPI backend
├── frontend/         # React frontend
└── README.md         # This file
```

## Prerequisites

- Python 3.11 or higher
- Node.js 18+ and npm/yarn
- PostgreSQL 12+
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AI-Assisted-Document-Authoring-and-Generation-Platform
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration (see Environment Variables section)

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn app.main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`
API documentation (Swagger UI) at `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start the development server
npm start
```

The frontend will be available at `http://localhost:3000`

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/document_platform

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# LLM Configuration (Default: Gemini)
LLM_PROVIDER=gemini  # or 'openai'
LLM_API_KEY=your-gemini-api-key-here
OPENAI_API_KEY=your-openai-key-if-using-openai
GEMINI_API_KEY=your-gemini-key-if-using-gemini  # Preferred if using Gemini

# Application
EXPORT_TMP_DIR=./exports
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# CORS
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)

```env
REACT_APP_API_URL=http://localhost:8000
```

## Database Migrations

```bash
cd backend

# Create a new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1
```

## Running Tests

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Usage Examples

### 1. User Registration and Login

1. Navigate to the frontend at `http://localhost:3000`
2. Click "Register" and create an account
3. Login with your credentials

### 2. Create a Word Document Project

1. From the dashboard, click "Create New Project"
2. Select "Word Document (.docx)"
3. Enter a topic (e.g., "Market analysis of the EV industry in 2025")
4. Add section headers:
   - Click "Add Section"
   - Enter section titles (e.g., "Introduction", "Market Overview", "Key Players", "Conclusion")
   - Reorder sections using drag-and-drop or arrow buttons
5. Click "Save Configuration"

### 3. Create a PowerPoint Project

1. From the dashboard, click "Create New Project"
2. Select "PowerPoint Presentation (.pptx)"
3. Enter a topic
4. Define slides:
   - Specify number of slides
   - Enter a title for each slide
5. Click "Save Configuration"

### 4. Generate Content

1. Open your project
2. For each section/slide, click "Generate Content"
3. The AI will generate context-aware content based on:
   - Project topic
   - Section/slide title
   - Neighboring sections (if available)

### 5. Refine Content

For each section/slide:

1. **AI Refinement**: Enter a prompt (e.g., "Make this more formal", "Convert to bullet points", "Shorten to 100 words")
   - Click "Apply Refinement"
   - The system will generate updated content and store the revision

2. **Feedback**: Click "Like" or "Dislike" to record satisfaction

3. **Comments**: Add notes in the comment box and save

All revisions, feedback, and comments are persisted and viewable in the history.

### 6. Export Document

1. Click "Export" button in the project view
2. Select format (.docx or .pptx)
3. The file will download with:
   - All latest refined content
   - Proper formatting (headings for Word, slide layouts for PPT)
   - Opens correctly in Microsoft Office

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token
- `POST /auth/refresh` - Refresh access token

### Projects
- `GET /projects` - List user's projects
- `POST /projects` - Create new project
- `GET /projects/{id}` - Get project details with sections
- `PUT /projects/{id}` - Update project configuration
- `DELETE /projects/{id}` - Delete project

### Sections
- `POST /projects/{project_id}/sections` - Create section (Word)
- `PUT /projects/{project_id}/sections/{section_id}` - Update section
- `DELETE /projects/{project_id}/sections/{section_id}` - Delete section

### Generation & Refinement
- `POST /generate/section` - Generate content for a section
- `POST /refine/section` - Refine section content with AI
- `POST /feedback` - Submit like/dislike feedback
- `POST /comments` - Add comment to section

### Export
- `GET /export/project/{project_id}?type=docx` - Export as Word document
- `GET /export/project/{project_id}?type=pptx` - Export as PowerPoint

### Optional: AI Template Suggestion
- `POST /ai/suggest-outline` - Get AI-suggested outline/slide titles

Full API documentation available at `http://localhost:8000/docs`

## Development

### Backend Development

```bash
cd backend
uvicorn app.main:app --reload
```

### Frontend Development

```bash
cd frontend
npm start
```

## Production Deployment

1. Set production environment variables
2. Run database migrations
3. Build frontend: `cd frontend && npm run build`
4. Serve frontend with a web server (nginx, etc.)
5. Deploy backend with a production ASGI server (gunicorn + uvicorn workers)

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists: `createdb document_platform`

### LLM API Issues
- Verify API keys are set correctly
- Check rate limits and quotas
- Review logs for error messages

### Export Issues
- Ensure EXPORT_TMP_DIR exists and is writable
- Check file permissions

## License

This project is created for educational/assignment purposes.

## Demo Video

A 5-10 minute demo video should cover:
- User registration & login
- Configuring a Word document
- Configuring a PowerPoint document
- Content generation
- Refinement (AI edits, like/dislike, comments)
- Exporting .docx and .pptx files

