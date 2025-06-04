export interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  salary?: number;
  isActive: boolean;
  applications?: JobApplication[];
  createdAt: Date;
  updatedAt: Date;
}

export interface JobApplication {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  resumeDownloadUrl: string;
}

export interface ResumeAnalysis {
  applicationId: string;
  candidateName: string;
  aiSummary: string;
  aiIdentifiedSkills: string;
  aiSuggestedRoles: string;
  originalExtractedText: string;
  error?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface CreateJobDto {
  title: string;
  description: string;
  location: string;
  salary?: number;
}

export interface UpdateJobDto {
  title: string;
  description: string;
  location: string;
  salary?: number;
  isActive: boolean;
} 