import axios from 'axios';
import type { CreateJobDto, Job, JobApplication, ResumeAnalysis, UpdateJobDto } from './types';

const api = axios.create({
  baseURL: 'https://plataforma-rh-ats.fly.dev/',
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token === 'mockAdminToken' && (
    config.url?.startsWith('/jobs/') ||
    config.url?.startsWith('/job-application/')
  )) {
    // Simula Basic Auth com credenciais fixas para o admin
    const credentials = btoa('admin:senha123');
    config.headers.Authorization = `Basic ${credentials}`;
  }
  
  return config;
});

// Funções de API
export const getAllJobs = async (): Promise<Job[]> => {
  const response = await api.get('/jobs/get-job-positions');
  return response.data;
};

export const getJobById = async (id: string): Promise<Job> => {
  const response = await api.get(`/jobs/get-job/${id}`);
  return response.data;
};

export const createJob = async (jobData: CreateJobDto): Promise<Job> => {
  const response = await api.post('/jobs/create-job', jobData);
  return response.data;
};

export const updateJob = async (id: string, jobData: UpdateJobDto): Promise<Job> => {
  const response = await api.put(`/jobs/update-job/${id}`, jobData);
  return response.data;
};

export const deleteJob = async (id: string): Promise<void> => {
  await api.delete(`/jobs/delete-job/${id}`);
};

export const applyToJob = async (formData: FormData): Promise<JobApplication> => {
  const response = await api.post('/job-application', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getResumeAnalysis = async (applicationId: string): Promise<ResumeAnalysis> => {
  const response = await api.get(`/job-application/${applicationId}/resume-analysis`);
  return response.data;
};

export const getResumePdfUrl = (applicationId: string): string => {
  return `${api.defaults.baseURL}/job-application/${applicationId}/resume`;
}; 