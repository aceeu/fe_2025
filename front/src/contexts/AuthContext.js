import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:8088/user', {
        credentials: 'include' // Important for session cookies
      });
      const data = await response.json();

      if (data.res && data.name) {
        setUser({ name: data.name });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      // Step 1: Get authentication token
      const tokenResponse = await fetch('http://localhost:8088/authtoken', {
        credentials: 'include'
      });
      const tokenData = await tokenResponse.json();

      if (!tokenData.res || !tokenData.token) {
        throw new Error('Failed to get authentication token');
      }

      // Step 2: Hash password with token using SHA-256
      const jsSHA = require('jssha');
      const shaObj = new jsSHA('SHA-256', 'TEXT');
      shaObj.update(password + tokenData.token);
      const hash = shaObj.getHash('HEX');

      // Step 3: Send login request
      const authResponse = await fetch('http://localhost:8088/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          user: username,
          hash: hash
        })
      });

      const authData = await authResponse.json();

      if (authData.res && authData.name) {
        setUser({ name: authData.name });
        return { success: true };
      } else {
        throw new Error(authData.text || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:8088/logout', {
        credentials: 'include'
      });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuthStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
