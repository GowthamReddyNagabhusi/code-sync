import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { API_BASE_URL } from '../services/api';
import { AuthContext } from './AuthContextInstance';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('token'));
  const [isLoadingAuth, setIsLoadingAuth] = useState(() => Boolean(localStorage.getItem('token')));

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setCurrentUser(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (authToken) {
      fetch(`${API_BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
        .then((response) => {
          if (!isMounted) return null;
          if (response.ok) {
            return response.json();
          }
          logout();
          return null;
        })
        .then((profileData) => {
          if (isMounted && profileData) {
            setCurrentUser(profileData);
          }
        })
        .catch((networkError) => {
          if (isMounted) {
            console.error('Failed to verify user authentication session:', networkError);
            logout();
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoadingAuth(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [authToken, logout]);

  const login = useCallback(async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(errorData.message || 'Login failed');
    }

    const sessionData = await response.json();
    localStorage.setItem('token', sessionData.accessToken);
    setAuthToken(sessionData.accessToken);
    setCurrentUser({
      username: sessionData.username,
      email: sessionData.email,
      avatarUrl: sessionData.avatarUrl,
    });
    return sessionData;
  }, []);

  const register = useCallback(async (username, email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(errorData.message || 'Registration failed');
    }

    const registrationData = await response.json();
    localStorage.setItem('token', registrationData.accessToken);
    setAuthToken(registrationData.accessToken);
    setCurrentUser({
      username: registrationData.username,
      email: registrationData.email,
    });
    return registrationData;
  }, []);

  const authContextValue = {
    user: currentUser,
    token: authToken,
    loading: isLoadingAuth,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
