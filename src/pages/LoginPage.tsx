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
    <div className="login-page-container">
      <div className="login-card">
        <img src="/src/assets/logo-preto.svg" alt="Sankhya Logo" className="login-logo" />
        <h1>Bem-vindo!</h1>
        <p className="login-subtitle">Acesse sua conta para continuar.</p>

        {error && <div className="error-message login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Usuário</label>
            <div className="input-wrapper">
              {/* Replace with actual icon component if available */}
              <span className="input-icon">
                {/* <UserIcon className="h-5 w-5" /> */}
                👤
              </span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Seu usuário"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <div className="input-wrapper">
              {/* Replace with actual icon component if available */}
              <span className="input-icon">
                {/* <LockClosedIcon className="h-5 w-5" /> */}
                🔒
              </span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
              />
            </div>
          </div>

          <button type="submit" className="login-button">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};