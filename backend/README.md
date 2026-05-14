# CrimeClassify AI — FastAPI Backend

## Features
- ML crime classification (GradientBoosting + TF-IDF)
- 8 crime categories with severity scoring (1–10)
- AI-generated explanations per category
- Indian legal next steps (IPC sections, helplines)
- Multi-language support (20+ languages via auto-detection + Google Translate)

## Setup

```bash
pip install -r requirements.txt
python main.py
```

API runs at http://localhost:8000
Docs at http://localhost:8000/docs

## Deploy to Railway

1. Push this folder to a GitHub repo
2. Create a new Railway project → Deploy from GitHub
3. Railway auto-detects Python via Procfile
4. Set env vars if needed (none required by default)
5. Copy the Railway URL → set as VITE_API_URL in your frontend .env

## Endpoints

- GET  /          → API info
- GET  /health    → Health check
- POST /predict   → Classify a crime narrative
- GET  /categories → List all categories
- GET  /stats     → Model stats
