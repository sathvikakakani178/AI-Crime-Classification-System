import { Prediction, ContactSubmission, AdminUser, AnalyticsData, CrimeCategory, CRIME_CATEGORIES } from '@/types/crime';

const PREDICTIONS_KEY = 'crime_predictions';
const CONTACTS_KEY = 'contact_submissions';
const AUTH_KEY = 'admin_auth';

// Predictions
export function getPredictions(): Prediction[] {
  const data = localStorage.getItem(PREDICTIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function savePrediction(prediction: Prediction): void {
  const predictions = getPredictions();
  predictions.unshift(prediction);
  localStorage.setItem(PREDICTIONS_KEY, JSON.stringify(predictions));
}

export function deletePrediction(id: string): void {
  const predictions = getPredictions().filter(p => p.id !== id);
  localStorage.setItem(PREDICTIONS_KEY, JSON.stringify(predictions));
}

export function clearAllPredictions(): void {
  localStorage.setItem(PREDICTIONS_KEY, JSON.stringify([]));
}

// Contact submissions
export function getContactSubmissions(): ContactSubmission[] {
  const data = localStorage.getItem(CONTACTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveContactSubmission(submission: ContactSubmission): void {
  const submissions = getContactSubmissions();
  submissions.unshift(submission);
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(submissions));
}

// Authentication
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'crimestats2024';

export function login(username: string, password: string): AdminUser | null {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const user: AdminUser = {
      username,
      token: `jwt_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return user;
  }
  return null;
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function getAuthUser(): AdminUser | null {
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
}

export function isAuthenticated(): boolean {
  return getAuthUser() !== null;
}

// Analytics
export function getAnalytics(dateRange: 'week' | 'month' | 'all' = 'all'): AnalyticsData {
  const predictions = getPredictions();
  
  const now = new Date();
  const filteredPredictions = predictions.filter(p => {
    const predDate = new Date(p.timestamp);
    if (dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return predDate >= weekAgo;
    } else if (dateRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return predDate >= monthAgo;
    }
    return true;
  });

  const categoryDistribution: Record<CrimeCategory, number> = {
    CYBER_CRIME: 0,
    VIOLENCE: 0,
    FRAUD: 0,
    THEFT: 0,
    HARASSMENT: 0,
    OTHER: 0
  };

  filteredPredictions.forEach(p => {
    categoryDistribution[p.predictedCategory]++;
  });

  const mostCommonCrime = filteredPredictions.length > 0
    ? (Object.keys(categoryDistribution) as CrimeCategory[]).reduce((a, b) =>
        categoryDistribution[a] > categoryDistribution[b] ? a : b
      )
    : null;

  const averageConfidence = filteredPredictions.length > 0
    ? Math.round(filteredPredictions.reduce((sum, p) => sum + p.confidence, 0) / filteredPredictions.length * 10) / 10
    : 0;

  // Daily predictions
  const dailyMap = new Map<string, number>();
  const confidenceMap = new Map<string, number[]>();
  
  filteredPredictions.forEach(p => {
    const date = new Date(p.timestamp).toISOString().split('T')[0];
    dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    
    if (!confidenceMap.has(date)) {
      confidenceMap.set(date, []);
    }
    confidenceMap.get(date)!.push(p.confidence);
  });

  const dailyPredictions = Array.from(dailyMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const confidenceTrends = Array.from(confidenceMap.entries())
    .map(([date, confidences]) => ({
      date,
      avgConfidence: Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length * 10) / 10
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Recent activity (last 24 hours)
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recentActivityCount = predictions.filter(p => new Date(p.timestamp) >= dayAgo).length;

  return {
    totalPredictions: filteredPredictions.length,
    mostCommonCrime,
    averageConfidence,
    recentActivityCount,
    categoryDistribution,
    dailyPredictions,
    confidenceTrends
  };
}

// CSV Export
export function exportPredictionsToCSV(): string {
  const predictions = getPredictions();
  const headers = ['ID', 'Timestamp', 'Narrative', 'Predicted Category', 'Confidence'];
  const rows = predictions.map(p => [
    p.id,
    p.timestamp,
    `"${p.narrative.replace(/"/g, '""')}"`,
    p.predictedCategory,
    p.confidence.toString()
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function exportContactsToCSV(): string {
  const contacts = getContactSubmissions();
  const headers = ['ID', 'Timestamp', 'Name', 'Email', 'Subject', 'Message'];
  const rows = contacts.map(c => [
    c.id,
    c.timestamp,
    `"${c.name.replace(/"/g, '""')}"`,
    c.email,
    `"${c.subject.replace(/"/g, '""')}"`,
    `"${c.message.replace(/"/g, '""')}"`
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
