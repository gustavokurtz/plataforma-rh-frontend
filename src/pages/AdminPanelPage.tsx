import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { JobForm } from '../components/JobForm';
import * as api from '../apiService';
import type { Job, ResumeAnalysis } from '../types';

interface AnalysisMap {
  [applicationId: string]: ResumeAnalysis;
}

export const AdminPanelPage: React.FC = () => {
  const { logout } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [analysisMap, setAnalysisMap] = useState<AnalysisMap>({});
  const [loadingApplicationId, setLoadingApplicationId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setIsLoadingJobs(true);
    try {
      const jobsList = await api.getAllJobs();
      setJobs(jobsList);
    } catch (err) {
      setError('Erro ao carregar vagas');
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const handleCreateJob = async (jobData: any) => {
    try {
      await api.createJob(jobData);
      await loadJobs();
      setShowCreateForm(false);
    } catch (err) {
      setError('Erro ao criar vaga');
    }
  };

  const handleUpdateJob = async (jobData: any) => {
    if (!editingJob) return;
    
    try {
      await api.updateJob(editingJob.id, jobData);
      await loadJobs();
      setEditingJob(null);
    } catch (err) {
      setError('Erro ao atualizar vaga');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta vaga?')) return;
    
    try {
      await api.deleteJob(jobId);
      await loadJobs();
      if (selectedJob?.id === jobId) setSelectedJob(null);
      if (editingJob?.id === jobId) setEditingJob(null);
    } catch (err) {
      setError('Erro ao excluir vaga');
    }
  };

  const handleAnalyzeResume = async (applicationId: string) => {
    setLoadingApplicationId(applicationId);
    setError('');
    
    try {
      const analysis = await api.getResumeAnalysis(applicationId);
      setAnalysisMap(prev => ({
        ...prev,
        [applicationId]: analysis
      }));
    } catch (err) {
      setError('Erro ao analisar currículo');
    } finally {
      setLoadingApplicationId(null);
    }
  };

  const handleDownloadResume = async (applicationId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const headers: HeadersInit = {};
      if (token === 'mockAdminToken') {
        const credentials = btoa('admin:senha123');
        headers.Authorization = `Basic ${credentials}`;
      }

      const response = await fetch(api.getResumePdfUrl(applicationId), {
        headers
      });

      if (!response.ok) {
        throw new Error('Erro ao baixar currículo');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `curriculo_${applicationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Erro ao baixar currículo');
    }
  };

  const handleCopyJobLink = (jobId: string) => {
    const url = `${window.location.origin}/apply/${jobId}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        // Podemos adicionar um feedback visual temporário
        const linkButton = document.getElementById(`copy-link-${jobId}`);
        if (linkButton) {
          const originalText = linkButton.textContent;
          linkButton.textContent = 'Link Copiado!';
          setTimeout(() => {
            linkButton.textContent = originalText;
          }, 2000);
        }
      })
      .catch(() => {
        setError('Erro ao copiar link');
      });
  };

  return (
    <div className="admin-panel">
      <header>
        <h1>Painel Administrativo</h1>
        <button onClick={logout}>Sair</button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="content">
        <div className="jobs-list">
          <div className="jobs-header">
            <h2>Vagas</h2>
            <button onClick={() => setShowCreateForm(true)}>Nova Vaga</button>
          </div>

          {isLoadingJobs ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Carregando vagas...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma vaga cadastrada.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="job-item">
                <div className="job-info">
                  <h3>{job.title}</h3>
                  <span className={`status ${job.isActive ? 'active' : 'inactive'}`}>
                    {job.isActive ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                
                <div className="job-actions">
                  <button onClick={() => setSelectedJob(job)}>Detalhes</button>
                  <button onClick={() => setEditingJob(job)}>Editar</button>
                  <button onClick={() => handleDeleteJob(job.id)}>Excluir</button>
                </div>
              </div>
            ))
          )}
        </div>

        {showCreateForm && (
          <div className="job-form-container">
            <h2>Nova Vaga</h2>
            <JobForm
              onSubmit={handleCreateJob}
              isEditing={false}
            />
            <button onClick={() => setShowCreateForm(false)}>Cancelar</button>
          </div>
        )}

        {editingJob && (
          <div className="job-form-container">
            <h2>Editar Vaga</h2>
            <JobForm
              onSubmit={handleUpdateJob}
              initialData={editingJob}
              isEditing={true}
            />
            <button onClick={() => setEditingJob(null)}>Cancelar</button>
          </div>
        )}

        {selectedJob && (
          <div className="job-details">
            <h2>Detalhes da Vaga</h2>
            <div className="job-info">
              <div className="job-header">
                <h3>{selectedJob.title}</h3>
                <button
                  id={`copy-link-${selectedJob.id}`}
                  onClick={() => handleCopyJobLink(selectedJob.id)}
                  className="copy-link-button"
                  title="Copiar link da vaga"
                >
                  Copiar Link da Vaga
                </button>
              </div>
              <p>{selectedJob.description}</p>
              {selectedJob.salary && <p>Salário: R$ {selectedJob.salary}</p>}
              <p>Localização: {selectedJob.location}</p>
            </div>

            <div className="applications">
              <h3>Candidaturas</h3>
              {selectedJob.applications?.map((application) => (
                <div key={application.id} className="application-item">
                  <div className="candidate-info">
                    <p><strong>{application.candidateName}</strong></p>
                    <p>{application.candidateEmail}</p>
                    {application.candidatePhone && (
                      <p>{application.candidatePhone}</p>
                    )}
                  </div>

                  <div className="application-actions">
                    <button
                      onClick={() => handleDownloadResume(application.id)}
                      className="download-button"
                    >
                      Baixar Currículo
                    </button>
                    <button
                      onClick={() => handleAnalyzeResume(application.id)}
                      disabled={loadingApplicationId === application.id}
                      className="analyze-button"
                    >
                      {loadingApplicationId === application.id ? 'Analisando...' : 'Analisar Currículo (ATS)'}
                    </button>
                  </div>

                  {analysisMap[application.id] && (
                    <div className="analysis-results">
                      <h4>Análise ATS</h4>
                      <div className="analysis-section">
                        <h5>Resumo</h5>
                        <p>{analysisMap[application.id].aiSummary}</p>
                      </div>

                      <div className="analysis-section">
                        <h5>Habilidades Identificadas</h5>
                        <div className="skills-list">
                          <div dangerouslySetInnerHTML={{ __html: analysisMap[application.id].aiIdentifiedSkills }} />
                        </div>
                      </div>

                      <div className="analysis-section">
                        <h5>Cargos Sugeridos</h5>
                        <div className="roles-list">
                          <div dangerouslySetInnerHTML={{ __html: analysisMap[application.id].aiSuggestedRoles }} />
                        </div>
                      </div>

                      {analysisMap[application.id].error && (
                        <p className="error-message">{analysisMap[application.id].error}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button onClick={() => setSelectedJob(null)}>Fechar</button>
          </div>
        )}
      </div>
    </div>
  );
}; 