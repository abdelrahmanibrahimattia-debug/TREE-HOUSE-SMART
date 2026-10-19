import { api } from '../api/client.js';

export async function apiGet(endpoint) {
  try {
    const res = await api.get(endpoint);
    return { ok: true, data: res.data !== undefined ? res.data : res };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function apiPost(endpoint, body) {
  try {
    const res = await api.post(endpoint, body);
    return { ok: true, data: res.data !== undefined ? res.data : res };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function apiPut(endpoint, body) {
  try {
    const res = await api.put(endpoint, body);
    return { ok: true, data: res.data !== undefined ? res.data : res };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function apiDelete(endpoint) {
  try {
    const res = await api.delete(endpoint);
    return { ok: true, data: res.data !== undefined ? res.data : res };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
