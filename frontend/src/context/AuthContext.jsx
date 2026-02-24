import React, { createContext, useState, useCallback, useEffect } from 'react';
import { loginApi, registerApi } from '../api/auth';
import { getErrorMessage } from '../api/http';
import { decodeJwt, isJwtExpired } from '../utils/jwt';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && !isJwtExpired(storedToken)) {
      setToken(storedToken);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        const payload = decodeJwt(storedToken);
        if (payload?.userId) {
          setUser({ id: payload.userId, role: payload.role || 'STUDENT' });
        }
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }

    setLoading(false);
  }, []);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email, password) => {
    setError(null);

    if (!email || !password) {
      const errorMessage = 'Email and password are required';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    try {
      const { token: receivedToken } = await loginApi({ email, password });
      const payload = decodeJwt(receivedToken);
      const nextUser = {
        id: payload?.userId,
        role: payload?.role,
        email
      };

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(nextUser));

      setToken(receivedToken);
      setUser(nextUser);

      return { success: true };
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

  }, []);

  const register = useCallback(async (email, password, confirmPassword, role) => {
    setError(null);

    if (!email || !password || !confirmPassword) {
      const errorMessage = 'All fields are required';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    if (password !== confirmPassword) {
      const errorMessage = 'Passwords do not match';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    try {
      await registerApi({ email, password, role });
      return await login(email, password);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setError(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
