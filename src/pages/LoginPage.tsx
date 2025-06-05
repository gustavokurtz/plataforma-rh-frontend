// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
// Suggestion: If you have an SVG icon library like Heroicons, import them here
// import { UserIcon, LockClosedIcon } from '@heroicons/react/24/outline'; // Example

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(username, password);
      navigate('/admin');
    } catch (err) {
      // It's good practice to check the error type if it's a custom error
      if (err instanceof Error) {
        setError(err.message || 'Usuário ou senha inválidos');
      } else {
        setError('Usuário ou senha inválidos');
      }
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit}>
        <div className="login-header">
        <img src="/src/assets/LogoCarreiras.png" alt="Nt Logo" className="login-logo" />
          <h2>Acesso ao Painel</h2>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="username">Usuário</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />
        </div>

        <button type="submit" className="success">Entrar</button>
      </form>
    </div>
  );
};