/**
 * Tree House API Client (Unified Fetch Wrapper)
 * Handles auto-bearer token injection, error sanitization, and 401/403 handling.
 */

const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('th_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('th_token');
        localStorage.removeItem('th_user');
        window.dispatchEvent(new Event('th_auth_expired'));
      }
      throw new Error(data.message || `خطأ في الخادم (${res.status})`);
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  get: (endpoint, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return apiRequest(url, { method: 'GET' });
  },
  post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};
