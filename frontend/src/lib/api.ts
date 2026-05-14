import { CrimeCategory, Prediction, CategoryScore } from '@/types/crime';

// Update this to your Railway backend URL after deployment
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface PredictResponse {
  category: CrimeCategory;
  category_label: string;
  confidence: number;
  severity: string;
  severity_score: number;
  explanation: string;
  legal_next_steps: string[];
  detected_language: string;
  translated: boolean;
  all_scores: { category: string; score: number }[];
}

export async function classifyCrimeAPI(narrative: string): Promise<Prediction> {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ narrative }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `Server error: ${res.status}`);
  }

  const data: PredictResponse = await res.json();

  return {
    id: `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    narrative,
    predictedCategory: data.category,
    confidence: data.confidence,
    severity: data.severity as any,
    severityScore: data.severity_score,
    explanation: data.explanation,
    legalNextSteps: data.legal_next_steps,
    detectedLanguage: data.detected_language,
    translated: data.translated,
    allScores: data.all_scores,
  };
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}
