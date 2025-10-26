import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './LoginForm.css';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password) {
      setError('Пожалуйста, введите имя пользователя и пароль');
      setIsLoading(false);
      return;
    }

    const result = await login(username, password);

    if (!result.success) {
      setError(result.error || 'Ошибка входа. Проверьте свои учетные данные.');
    }

    setIsLoading(false);
  };

  return (
    <div className="login-form-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Вход</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="username">Имя пользователя:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Введите имя пользователя"
            disabled={isLoading}
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Пароль:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            disabled={isLoading}
            autoComplete="current-password"
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
