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
      await api.updateJob(editingJob.id.toString(), jobData);
      await loadJobs();
      setEditingJob(null);
    } catch (err) {
      setError('Erro ao atualizar vaga');
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta vaga?')) return;
    
    try {
      await api.deleteJob(jobId.toString());
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

  const handleCopyJobLink = (jobId: number) => {
    const url = `${window.location.origin}/apply/${jobId}`;
    navigator.clipboard.writeText(url)
      .then(() => {
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
        <div className="header-title-logo">
          <img src="https://i.ibb.co/ZRZSVhJK/Logo-Carreiras.png" alt="Nt Logo" /> 
          
        </div>
        <button onClick={logout} className="neutral small">Sair</button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="content">
        <div className="jobs-list">
          <div className="jobs-header">
            <h2>Vagas</h2>
            <button onClick={() => setShowCreateForm(true)} className="success">Nova Vaga</button>
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
                  <button 
                    onClick={() => setSelectedJob(job)} 
                    className="neutral small"
                    disabled={!!editingJob}
                  >
                    Detalhes
                  </button>
                  <button 
                    onClick={() => setEditingJob(job)} 
                    className="neutral small"
                    disabled={!!selectedJob}
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDeleteJob(job.id)} 
                    className="danger small"
                    disabled={!!editingJob || !!selectedJob}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {showCreateForm && (
          <div className="job-form-container">
            <h2>Nova Vaga</h2>
            <div className="form-actions-wrapper">
              <JobForm
                onSubmit={handleCreateJob}
                isEditing={false}
              />
              <button onClick={() => setShowCreateForm(false)} className="secondary form-cancel-button">Cancelar</button>
            </div>
          </div>
        )}

        {editingJob && (
          <div className="job-form-container">
            <h2>Editar Vaga</h2>
             <div className="form-actions-wrapper">
              <JobForm
                onSubmit={handleUpdateJob}
                initialData={editingJob}
                isEditing={true}
              />
              <button onClick={() => setEditingJob(null)} className="secondary form-cancel-button">Cancelar</button>
            </div>
          </div>
        )}

        {selectedJob && (
          <div className="job-details">
            <div className="job-details-header">
              <h2>Detalhes da Vaga</h2>
              <div className="actions">
                <button
                  id={`copy-link-${selectedJob.id}`}
                  onClick={() => handleCopyJobLink(selectedJob.id)}
                  className="neutral small"
                  title="Copiar link da vaga"
                >
                  Copiar Link
                </button>
                <button onClick={() => setSelectedJob(null)} className="neutral small">Fechar</button>
              </div>
            </div>
            <div className="job-info">
              <h3>{selectedJob.title}</h3>
              <p>{selectedJob.description}</p>
              {selectedJob.salary && <p><strong>Salário:</strong> R$ {selectedJob.salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>}
              <p><strong>Localização:</strong> {selectedJob.location}</p>
            </div>

            <div className="applications">
              <h3>Candidaturas</h3>
              {selectedJob.applications?.length === 0 || !selectedJob.applications ? (
                 <div className="empty-state small">
                    <p>Nenhuma candidatura para esta vaga ainda.</p>
                 </div>
              ) : selectedJob.applications?.map((application) => (
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
                      className="neutral small"
                    >
                      Baixar Currículo
                    </button>
                    <button
                      onClick={() => handleAnalyzeResume(application.id)}
                      disabled={loadingApplicationId === application.id}
                      className="neutral small"
                    >
                      {loadingApplicationId === application.id ? 'Analisando...' : 'Analisar (ATS)'}
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
          </div>
        )}
      </div>
    </div>
  );
};