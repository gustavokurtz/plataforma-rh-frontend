export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  salary?: number;
  isActive: boolean;
  applications?: JobApplication[];
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
  type: string;
  salary?: number;
}

export interface UpdateJobDto extends CreateJobDto {
  isActive: boolean;
} 