import { apiRequest } from './http';

export function registerApi({ email, password }) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: { email, password }
  });
}

export function loginApi({ email, password }) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password }
  });
}
