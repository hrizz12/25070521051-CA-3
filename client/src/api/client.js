// All communication with the Express API goes through this file.
// "credentials: 'include'" makes the browser send the HttpOnly login cookie with every request.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// AuthContext registers a function here so that any 401 response signs the user out in the UI.
let unauthorizedHandler = null;
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
}

async function request(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw new Error('Cannot reach the server. Is the backend running on port 5000?');
  }

  // Some responses might not contain JSON, so parse carefully.
  let data = {};
  try {
    data = await response.json();
  } catch (e) {
    data = {};
  }

  if (!response.ok) {
    // /auth/me and login/register are allowed to return 401 without forcing a sign-out
    if (response.status === 401 && unauthorizedHandler && !path.startsWith('/auth/')) {
      unauthorizedHandler();
    }
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    throw error;
  }

  return data;
}

// Turns { status: 'Planned', sort: 'scene' } into "?status=Planned&sort=scene" (skips empty values)
function toQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),

  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Projects
  getProjects: (params) => request(`/projects${toQuery(params)}`),
  getProject: (id) => request(`/projects/${id}`),
  createProject: (body) => request('/projects', { method: 'POST', body }),
  updateProject: (id, body) => request(`/projects/${id}`, { method: 'PUT', body }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

  // Shots
  getShots: (projectId, params) => request(`/projects/${projectId}/shots${toQuery(params)}`),
  createShot: (projectId, body) => request(`/projects/${projectId}/shots`, { method: 'POST', body }),
  updateShot: (id, body) => request(`/shots/${id}`, { method: 'PUT', body }),
  updateShotStatus: (id, status) => request(`/shots/${id}/status`, { method: 'PATCH', body: { status } }),
  deleteShot: (id) => request(`/shots/${id}`, { method: 'DELETE' }),
};
