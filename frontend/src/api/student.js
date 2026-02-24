import { apiRequest } from './http';

export function getStudentProfile(token) {
  return apiRequest('/student/profile', { token });
}

export function createStudentProfile(token, payload) {
  return apiRequest('/student/profile', {
    method: 'POST',
    token,
    body: payload
  });
}

export function updateStudentProfile(token, payload) {
  return apiRequest('/student/profile', {
    method: 'PUT',
    token,
    body: payload
  });
}

export function submitStudentApplication(token) {
  return apiRequest('/student/submit', {
    method: 'PUT',
    token
  });
}

export function uploadStudentDocument(token, { type, file }) {
  const form = new FormData();
  form.append('type', type);
  form.append('file', file);

  return apiRequest('/student/upload-document', {
    method: 'POST',
    token,
    body: form
  });
}

// Assumed endpoints (not currently present in backend)
export function deleteStudentDocument(token, documentId) {
  return apiRequest(`/student/document/${documentId}`, {
    method: 'DELETE',
    token
  });
}

// Assumed endpoints (not currently present in backend)
export function getStudentPayment(token) {
  return apiRequest('/student/payment', { token });
}

export function generateStudentPaymentLink(token) {
  return apiRequest('/student/payment/generate', {
    method: 'POST',
    token
  });
}

export function confirmStudentPayment(token) {
  return apiRequest('/student/payment/confirm', {
    method: 'POST',
    token
  });
}
