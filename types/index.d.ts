/// <reference types="vite/client" />

export interface ResumeAnalysis {
  id: string;
  userId: string;
  resumeFileName: string;
  resumeFilePath: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  atsScore: number;
  overallFeedback: string;
  categories: AnalysisCategory[];
  tips: string[];
  createdAt: string;
  resumeBase64Image?: string;
  isDemoMode?: boolean;
}

export interface AnalysisCategory {
  name: string;
  score: number;
  feedback: string;
  improvements: string[];
}

export type ScoreLevel = "poor" | "average" | "good" | "great" | "excellent";
