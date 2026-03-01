export type CrimeCategory = 
  | 'CYBER_CRIME' 
  | 'VIOLENCE' 
  | 'FRAUD' 
  | 'THEFT' 
  | 'HARASSMENT' 
  | 'OTHER';

export interface Prediction {
  id: string;
  timestamp: string;
  narrative: string;
  predictedCategory: CrimeCategory;
  confidence: number;
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
  'CYBER_CRIME',
  'VIOLENCE',
  'FRAUD',
  'THEFT',
  'HARASSMENT',
  'OTHER'
];

export const CRIME_LABELS: Record<CrimeCategory, string> = {
  CYBER_CRIME: 'Cyber Crime',
  VIOLENCE: 'Violence',
  FRAUD: 'Fraud',
  THEFT: 'Theft',
  HARASSMENT: 'Harassment',
  OTHER: 'Other'
};
