import { apiRequest } from './http';

export function getAdminDashboard(token) {
  return apiRequest('/admin/dashboard', { token });
}

export function getAllStudents(token) {
  return apiRequest('/admin/students', { token });
}
