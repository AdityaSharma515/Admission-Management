import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AdmissionContext } from '../context/AdmissionContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const useAdmission = () => {
  const context = useContext(AdmissionContext);
  if (!context) {
    throw new Error('useAdmission must be used within AdmissionProvider');
  }
  return context;
};
