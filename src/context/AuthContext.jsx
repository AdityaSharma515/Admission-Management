import React, { createContext, useState, useCallback, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admissionId, setAdmissionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(() => {
    const storedUser = localStorage.getItem('user');
    const storedAdmissionId = localStorage.getItem('admissionId');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setAdmissionId(storedAdmissionId);
    }
    setLoading(false);
  }, []);

  const register = useCallback((email, password, confirmPassword) => {
    setError(null);
    
    // Validate inputs
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

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
      const errorMessage = 'Email already registered';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    // Create new user
    const userId = 'user_' + Date.now();
    const admissionId = 'adm_' + Date.now();
    const newUser = { userId, email };
    
    users.push({ userId, email, password, admissionId });
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('admissionId', admissionId);
    
    setUser(newUser);
    setAdmissionId(admissionId);
    return { success: true };
  }, []);

  const login = useCallback((email, password) => {
    setError(null);
    
    if (!email || !password) {
      const errorMessage = 'Email and password are required';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (!foundUser) {
      const errorMessage = 'Invalid email or password';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    const user = { userId: foundUser.userId, email: foundUser.email };
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('admissionId', foundUser.admissionId);
    
    setUser(user);
    setAdmissionId(foundUser.admissionId);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('admissionId');
    setUser(null);
    setAdmissionId(null);
    setError(null);
  }, []);

  const value = {
    user,
    admissionId,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
