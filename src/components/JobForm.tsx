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
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setSalary(initialData.salary?.toString() || '');
      setLocation(initialData.location);
      setIsActive(initialData.isActive ?? true);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const jobData: CreateJobDto | UpdateJobDto = {
      title,
      description,
      location,
      ...(salary ? { salary: Number(salary) } : {}),
      ...(isEditing ? { isActive } : {}),
    };

    await onSubmit(jobData);
  };

  return (
    <form onSubmit={handleSubmit} className="job-form">
      <div>
        <label htmlFor="title">Título da Vaga *</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="description">Descrição *</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={5}
        />
      </div>

      <div>
        <label htmlFor="salary">Salário</label>
        <input
          id="salary"
          type="number"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          min="0"
          step="100"
        />
      </div>

      <div>
        <label htmlFor="location">Localização *</label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </div>

      {isEditing && (
        <div>
          <label>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Vaga Ativa
          </label>
        </div>
      )}

      <button type="submit">
        {isEditing ? 'Atualizar Vaga' : 'Criar Vaga'}
      </button>
    </form>
  );
}; 