import { apiRequest } from './http';

export function getAdminDashboard(token) {
  return apiRequest('/admin/dashboard', { token });
}

export function getAllStudents(token) {
  return apiRequest('/admin/students', { token });
}

export function listAssignments(token) {
  return apiRequest('/admin/assignments', { token });
}

export function assignVerifier(token, { studentId, verifierId }) {
  return apiRequest('/admin/assign-verifier', {
    method: 'POST',
    token,
    body: { studentId, verifierId }
  });
}

export function getStudentDetails(token, studentId) {
  return apiRequest(`/admin/students/${studentId}`, { token });
}

export function createVerifier(token, { email, password }) {
  return apiRequest('/admin/create-verifier', {
    method: 'POST',
    token,
    body: { email, ...(password ? { password } : {}) }
  });
}
