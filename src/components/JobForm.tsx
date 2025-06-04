import React, { useState, useEffect } from 'react';
import type { CreateJobDto, UpdateJobDto } from '../types';

interface JobFormProps {
  onSubmit: (data: CreateJobDto | UpdateJobDto) => Promise<void>;
  initialData?: CreateJobDto & { isActive?: boolean };
  isEditing?: boolean;
}

export const JobForm: React.FC<JobFormProps> = ({
  onSubmit,
  initialData,
  isEditing = false,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [salary, setSalary] = useState<string>('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('CLT');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setSalary(initialData.salary?.toString() || '');
      setLocation(initialData.location);
      setType(initialData.type || 'CLT');
      setIsActive(initialData.isActive ?? true);
    } else {
      // Reset form for new job creation
      setTitle('');
      setDescription('');
      setSalary('');
      setLocation('');
      setType('CLT');
      setIsActive(true);
    }
  }, [initialData, isEditing]); // Depend on isEditing to reset if switching from edit to new

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const jobData: CreateJobDto | UpdateJobDto = {
      title,
      description,
      location,
      type,
      ...(salary ? { salary: Number(salary) } : {}),
      ...(isEditing ? { isActive } : {}),
    };

    await onSubmit(jobData);
    if (!isEditing) { // Reset form only after creating a new job
        setTitle('');
        setDescription('');
        setSalary('');
        setLocation('');
        setType('CLT');
        setIsActive(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="job-form">
      <div>
        <label htmlFor="title-job-form">Título da Vaga *</label>
        <input
          id="title-job-form"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="description-job-form">Descrição *</label>
        <textarea
          id="description-job-form"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={5}
        />
      </div>

      <div>
        <label htmlFor="type-job-form">Tipo de Contratação *</label>
        <select
          id="type-job-form"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        >
          <option value="CLT">CLT</option>
          <option value="PJ">PJ</option>
          <option value="Temporário">Temporário</option>
          <option value="Estágio">Estágio</option>
        </select>
      </div>

      <div>
        <label htmlFor="salary-job-form">Salário</label>
        <input
          id="salary-job-form"
          type="number"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          min="0"
          step="100"
        />
      </div>

      <div>
        <label htmlFor="location-job-form">Localização *</label>
        <input
          id="location-job-form"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </div>

      {isEditing && (
        <div className="custom-checkbox-container">
          <input
            id="isActive-job-form"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label htmlFor="isActive-job-form">Vaga Ativa</label>
        </div>
      )}

      <button type="submit" className="success form-submit-button">
        {isEditing ? 'Atualizar Vaga' : 'Criar Vaga'}
      </button>
    </form>
  );
};