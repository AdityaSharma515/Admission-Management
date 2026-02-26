import { apiRequest } from './http';

export function getVerifierStudents(token) {
  return apiRequest('/verifier/students', { token });
}

export function getVerifierStudent(token, studentId) {
  return apiRequest(`/verifier/student/${studentId}`, { token });
}

export function verifyDocument(token, documentId, payload) {
  return apiRequest(`/verifier/document/${documentId}`, {
    method: 'PUT',
    token,
    body: payload
  });
}

export function setFinalDecision(token, studentId, decision) {
  return apiRequest(`/verifier/final-decision/${studentId}`, {
    method: 'PUT',
    token,
    body: { decision }
  });
}

export function approveAllDocuments(token, studentId, remark) {
  return apiRequest(`/verifier/student/${studentId}/approve-all`, {
    method: 'PUT',
    token,
    body: remark ? { remark } : {}
  });
}
