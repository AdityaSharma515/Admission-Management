import { apiRequest } from './http';

export function registerApi({ email, password, role }) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: {
      email,
      password,
      ...(role ? { role } : {})
    }
  });
}

export function loginApi({ email, password }) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password }
  });
}
