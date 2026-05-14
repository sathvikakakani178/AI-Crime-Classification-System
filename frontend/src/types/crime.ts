export type CrimeCategory =
  | 'CYBER_CRIME'
  | 'VIOLENCE'
  | 'FRAUD'
  | 'THEFT'
  | 'HARASSMENT'
  | 'DRUG_OFFENSE'
  | 'PROPERTY_CRIME'
  | 'OTHER';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CategoryScore {
  category: string;
  score: number;
}

export interface Prediction {
  id: string;
  timestamp: string;
  narrative: string;
  predictedCategory: CrimeCategory;
  confidence: number;
  severity: Severity;
  severityScore: number;
  explanation: string;
  legalNextSteps: string[];
  detectedLanguage: string;
  translated: boolean;
  allScores: CategoryScore[];
}

export interface ContactSubmission {
  id: string;
  timestamp: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface AdminUser {
  username: string;
  token: string;
  loginTime: string;
}

export interface AnalyticsData {
  totalPredictions: number;
  mostCommonCrime: CrimeCategory | null;
  averageConfidence: number;
  recentActivityCount: number;
  categoryDistribution: Record<CrimeCategory, number>;
  dailyPredictions: { date: string; count: number }[];
  confidenceTrends: { date: string; avgConfidence: number }[];
}

export const CRIME_CATEGORIES: CrimeCategory[] = [
  'CYBER_CRIME', 'VIOLENCE', 'FRAUD', 'THEFT',
  'HARASSMENT', 'DRUG_OFFENSE', 'PROPERTY_CRIME', 'OTHER',
];

export const CRIME_LABELS: Record<CrimeCategory, string> = {
  CYBER_CRIME:    'Cyber Crime',
  VIOLENCE:       'Violence & Assault',
  FRAUD:          'Fraud & Financial Crime',
  THEFT:          'Theft & Robbery',
  HARASSMENT:     'Harassment & Stalking',
  DRUG_OFFENSE:   'Drug Offense',
  PROPERTY_CRIME: 'Property Crime',
  OTHER:          'Other / Unclassified',
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  LOW:      'text-green-400 bg-green-400/10 border-green-400/30',
  MEDIUM:   'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  HIGH:     'text-orange-400 bg-orange-400/10 border-orange-400/30',
  CRITICAL: 'text-red-400 bg-red-400/10 border-red-400/30',
};
