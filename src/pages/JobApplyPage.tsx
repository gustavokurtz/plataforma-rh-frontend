import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../apiService';
import type { Job } from '../types';

export const JobApplyPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!jobId) {
      navigate('/');
      return;
    }

    loadJob();
  }, [jobId, navigate]);

  const loadJob = async () => {
    try {
      const jobData = await api.getJobById(jobId!);
      if (!jobData.isActive) {
        setError('Esta vaga não está mais disponível para candidaturas.');
        return;
      }
      setJob(jobData);
    } catch (err) {
      setError('Erro ao carregar informações da vaga');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId || !resumeFile) return;

    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('jobId', jobId);
    formData.append('candidateName', candidateName);
    formData.append('candidateEmail', candidateEmail);
    if (candidatePhone) {
      formData.append('candidatePhone', candidatePhone);
    }
    formData.append('resumeFile', resumeFile);

    try {
      await api.applyToJob(formData);
      setSuccess(true);
    } catch (err) {
      setError('Erro ao enviar candidatura. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      window.location.href = '/';
    }
  };

  if (success) {
    return (
      <div className="apply-page success">
        <h2>Candidatura Enviada com Sucesso!</h2>
        <p>Obrigado por se candidatar. Entraremos em contato em breve.</p>
        <button onClick={handleBack} className="secondary">Voltar</button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="apply-page error">
        <h2>Erro</h2>
        <p>{error}</p>
        <button onClick={handleBack} className="secondary">Voltar</button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="apply-page loading">
        <div className="loading-spinner"></div>
        <p>Carregando informações da vaga...</p>
      </div>
    );
  }

  return (
    <div className="apply-page">
      <div className="apply-header">
        <img src="/src/assets/logo-preto.svg" alt="Sankhya Logo" className="apply-logo" />
      </div>

      <div className="job-info">
        <h1>{job.title}</h1>
        <p>{job.description}</p>
        {job.salary && <p><strong>Salário:</strong> R$ {job.salary}</p>}
        <p><strong>Localização:</strong> {job.location}</p>
      </div>

      <div className="application-form">
        <h2>Candidatar-se</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Nome Completo *</label>
            <input
              id="name"
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="email">E-mail *</label>
            <input
              id="email"
              type="email"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="phone">Telefone</label>
            <input
              id="phone"
              type="tel"
              value={candidatePhone}
              onChange={(e) => setCandidatePhone(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="resume">Currículo (PDF) *</label>
            <input
              id="resume"
              type="file"
              accept=".pdf"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleBack} className="secondary">Voltar</button>
            <button type="submit" disabled={isLoading} className="success">
              {isLoading ? 'Enviando...' : 'Enviar Candidatura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 