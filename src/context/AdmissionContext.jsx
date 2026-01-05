import React, { createContext, useState, useCallback } from 'react';

export const AdmissionContext = createContext();

export const AdmissionProvider = ({ children }) => {
  const [admissionData, setAdmissionData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAdmissionData = useCallback((admissionId) => {
    if (!admissionId) return;
    try {
      const stored = localStorage.getItem(`admission_${admissionId}`);
      if (stored) {
        setAdmissionData(JSON.parse(stored));
      } else {
        setAdmissionData({ admissionId, personalDetails: {}, documents: [], payment: {} });
      }
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading admission data:', err);
    }
  }, []);

  const submitPersonalDetails = useCallback((admissionId, details) => {
    try {
      const stored = localStorage.getItem(`admission_${admissionId}`) || '{}';
      const data = JSON.parse(stored);
      data.personalDetails = details;
      localStorage.setItem(`admission_${admissionId}`, JSON.stringify(data));
      setAdmissionData(data);
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Error saving details';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const uploadDocument = useCallback((admissionId, documentType, file) => {
    try {
      const stored = localStorage.getItem(`admission_${admissionId}`) || '{}';
      const data = JSON.parse(stored);
      
      if (!data.documents) data.documents = [];
      
      // Read file as base64
      const reader = new FileReader();
      reader.onload = (e) => {
        data.documents = data.documents.filter(d => d.type !== documentType);
        data.documents.push({
          id: 'doc_' + Date.now(),
          type: documentType,
          name: file.name,
          size: file.size,
          data: e.target.result
        });
        localStorage.setItem(`admission_${admissionId}`, JSON.stringify(data));
        setAdmissionData(data);
      };
      reader.readAsDataURL(file);
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Error uploading document';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const deleteDocument = useCallback((admissionId, documentId) => {
    try {
      const stored = localStorage.getItem(`admission_${admissionId}`) || '{}';
      const data = JSON.parse(stored);
      data.documents = data.documents.filter(d => d.id !== documentId);
      localStorage.setItem(`admission_${admissionId}`, JSON.stringify(data));
      setAdmissionData(data);
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Error deleting document';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const generatePaymentLink = useCallback((admissionId) => {
    try {
      const stored = localStorage.getItem(`admission_${admissionId}`) || '{}';
      const data = JSON.parse(stored);
      
      const paymentId = 'PAY_' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const transactionId = 'TXN_' + Date.now();
      
      data.payment = {
        id: paymentId,
        amount: 1000,
        currency: 'INR',
        status: 'pending',
        transactionId: null,
        link: `https://sbi.co.in/payment?ref=${paymentId}`,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem(`admission_${admissionId}`, JSON.stringify(data));
      setAdmissionData(data);
      
      return { success: true, data: data.payment };
    } catch (err) {
      const errorMessage = err.message || 'Error generating payment link';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const confirmPayment = useCallback((admissionId) => {
    try {
      const stored = localStorage.getItem(`admission_${admissionId}`) || '{}';
      const data = JSON.parse(stored);
      
      if (data.payment) {
        data.payment.status = 'completed';
        data.payment.transactionId = 'TXN_' + Date.now();
      }
      
      localStorage.setItem(`admission_${admissionId}`, JSON.stringify(data));
      setAdmissionData(data);
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Error confirming payment';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const submitAdmission = useCallback((admissionId) => {
    try {
      const stored = localStorage.getItem(`admission_${admissionId}`) || '{}';
      const data = JSON.parse(stored);
      
      data.submission = {
        submittedAt: new Date().toISOString(),
        status: 'submitted',
        adminStatus: 'under_review',
        remarks: ''
      };
      
      localStorage.setItem(`admission_${admissionId}`, JSON.stringify(data));
      setAdmissionData(data);
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Error submitting admission';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const value = {
    admissionData,
    loading,
    error,
    loadAdmissionData,
    submitPersonalDetails,
    uploadDocument,
    deleteDocument,
    generatePaymentLink,
    confirmPayment,
    submitAdmission,
  };

  return (
    <AdmissionContext.Provider value={value}>{children}</AdmissionContext.Provider>
  );
};
