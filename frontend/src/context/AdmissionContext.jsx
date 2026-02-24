import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  confirmStudentPayment,
  createStudentProfile,
  deleteStudentDocument,
  generateStudentPaymentLink,
  getStudentPayment,
  getStudentProfile,
  submitStudentApplication,
  updateStudentProfile,
  uploadStudentDocument
} from '../api/student';
import { getErrorMessage, isNotFound } from '../api/http';
import { AuthContext } from './AuthContext';

export const AdmissionContext = createContext();

export const AdmissionProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [admissionData, setAdmissionData] = useState({
    profile: null,
    documents: [],
    payment: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setAdmissionData({ profile: null, documents: [], payment: null });
      setError(null);
    }
  }, [token]);

  const loadAdmissionData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const profile = await getStudentProfile(token);
      let payment = null;

      try {
        payment = await getStudentPayment(token);
      } catch (err) {
        // Payment endpoints are not present in backend yet; ignore 404.
        if (!isNotFound(err)) {
          throw err;
        }
      }

      setAdmissionData({
        profile,
        documents: profile?.documents || [],
        payment
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  const submitPersonalDetails = useCallback(
    async (_admissionId, details) => {
      if (!token) {
        const errorMessage = 'Not authenticated';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      setLoading(true);
      setError(null);

      try {
        if (admissionData.profile?.id) {
          await updateStudentProfile(token, details);
        } else {
          await createStudentProfile(token, details);
        }

        await loadAdmissionData();
        return { success: true };
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [token, admissionData.profile?.id, loadAdmissionData]
  );

  const uploadDocument = useCallback(
    async (_admissionId, documentType, file) => {
      if (!token) {
        const errorMessage = 'Not authenticated';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      setLoading(true);
      setError(null);

      try {
        await uploadStudentDocument(token, { type: documentType, file });
        await loadAdmissionData();
        return { success: true };
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [token, loadAdmissionData]
  );

  const deleteDocument = useCallback(
    async (_admissionId, documentId) => {
      if (!token) {
        const errorMessage = 'Not authenticated';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      setLoading(true);
      setError(null);

      try {
        await deleteStudentDocument(token, documentId);
        await loadAdmissionData();
        return { success: true };
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [token, loadAdmissionData]
  );

  const generatePaymentLink = useCallback(
    async (_admissionId) => {
      if (!token) {
        const errorMessage = 'Not authenticated';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      setLoading(true);
      setError(null);

      try {
        const payment = await generateStudentPaymentLink(token);
        setAdmissionData((prev) => ({ ...prev, payment }));
        return { success: true, data: payment };
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const confirmPayment = useCallback(
    async (_admissionId) => {
      if (!token) {
        const errorMessage = 'Not authenticated';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      setLoading(true);
      setError(null);

      try {
        const payment = await confirmStudentPayment(token);
        setAdmissionData((prev) => ({ ...prev, payment }));
        return { success: true };
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const submitAdmission = useCallback(
    async (_admissionId) => {
      if (!token) {
        const errorMessage = 'Not authenticated';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      setLoading(true);
      setError(null);

      try {
        await submitStudentApplication(token);
        await loadAdmissionData();
        return { success: true };
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [token, loadAdmissionData]
  );

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
