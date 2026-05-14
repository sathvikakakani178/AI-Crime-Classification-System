from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

from classifier import CrimeClassifier
from translator import detect_and_translate

app = FastAPI(
    title="CrimeClassify AI API",
    description="AI-powered crime classification with severity scoring, legal guidance, and multi-language support",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

classifier = CrimeClassifier()

# ── Request / Response Models ──────────────────────────────────────────────────

class PredictRequest(BaseModel):
    narrative: str
    language: Optional[str] = None  # optional override; auto-detected otherwise

class CategoryScore(BaseModel):
    category: str
    score: float

class PredictResponse(BaseModel):
    category: str
    category_label: str
    confidence: float
    severity: str                  # LOW / MEDIUM / HIGH / CRITICAL
    severity_score: int            # 1-10
    explanation: str
    legal_next_steps: list[str]
    detected_language: str
    translated: bool
    all_scores: list[CategoryScore]

# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "message": "CrimeClassify AI API v2.0"}

@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": classifier.is_trained}

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if len(req.narrative.strip()) < 10:
        raise HTTPException(status_code=400, detail="Narrative too short. Please provide at least 10 characters.")

    # Translate if needed
    translation = detect_and_translate(req.narrative)
    text_for_classification = translation["translated_text"]

    # Classify
    result = classifier.predict(text_for_classification)

    return PredictResponse(
        category=result["category"],
        category_label=result["category_label"],
        confidence=result["confidence"],
        severity=result["severity"],
        severity_score=result["severity_score"],
        explanation=result["explanation"],
        legal_next_steps=result["legal_next_steps"],
        detected_language=translation["detected_language"],
        translated=translation["was_translated"],
        all_scores=[
            CategoryScore(category=k, score=v)
            for k, v in result["all_scores"].items()
        ]
    )

@app.get("/categories")
def categories():
    return classifier.get_categories()

@app.get("/stats")
def stats():
    return classifier.get_model_stats()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
