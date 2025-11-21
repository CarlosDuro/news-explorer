// src/services/api.js (o la ruta que uses)
const API_BASE = import.meta.env.VITE_API_BASE || 'https://news-explorer-backend-bo7e.onrender.com';

export async function api(path, opts = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };

  const token = localStorage.getItem('token');
  if (token) headers.Authorization = 'Bearer ' + token;

  const res = await fetch(API_BASE + path, {
    ...opts,
    headers,
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw Object.assign(new Error(data.message || 'Request error'), {
      status: res.status,
      data,
    });
  }

  return data;
}
