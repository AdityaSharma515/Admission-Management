const DEFAULT_API_BASE_URL = 'http://localhost:5000/api';

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || DEFAULT_API_BASE_URL;

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const isFormData = (value) =>
  typeof FormData !== 'undefined' && value instanceof FormData;

export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    token,
    body,
    headers: customHeaders,
    signal
  } = options;

  const headers = {
    ...(customHeaders || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let requestBody = body;

  if (body != null && !isFormData(body)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    if (headers['Content-Type'].includes('application/json')) {
      requestBody = JSON.stringify(body);
    }
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : requestBody,
    signal
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  let data;
  try {
    data = isJson ? await res.json() : await res.text();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && data.message) ||
      `Request failed (${res.status})`;
    throw new ApiError(message, { status: res.status, data });
  }

  return data;
}

export function getErrorMessage(err) {
  if (!err) return 'Unknown error';
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'Unknown error';
}

export function isNotFound(err) {
  return Boolean(err && typeof err === 'object' && err.status === 404);
}
