import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './UserInfo.css';

const UserInfo = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="user-info">
      <div className="user-details">
        <span className="welcome-text">Добро пожаловать, <strong>{user.name}</strong></span>
      </div>
      <button className="logout-button" onClick={logout}>
        Выход
      </button>
    </div>
  );
};

export default UserInfo;
